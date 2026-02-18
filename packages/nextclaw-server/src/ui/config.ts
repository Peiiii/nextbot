import {
  loadConfig,
  saveConfig,
  ConfigSchema,
  type Config,
  type ConfigUiHint,
  type ConfigUiHints,
  type ProviderConfig,
  PROVIDERS,
  buildConfigSchema,
  findProviderByName,
  getPackageVersion,
  isSensitiveConfigPath,
  type ProviderSpec
} from "@nextclaw/core";
import type {
  ConfigMetaView,
  ConfigSchemaResponse,
  ConfigView,
  ProviderConfigUpdate,
  ProviderConfigView
} from "./types.js";

const MASK_MIN_LENGTH = 8;
const EXTRA_SENSITIVE_PATH_PATTERNS = [/authorization/i, /cookie/i, /session/i, /bearer/i];

function matchesExtraSensitivePath(path: string): boolean {
  return EXTRA_SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function matchHint(path: string, hints: ConfigUiHints): ConfigUiHint | undefined {
  const direct = hints[path];
  if (direct) {
    return direct;
  }
  const segments = path.split(".");
  for (const [hintKey, hint] of Object.entries(hints)) {
    if (!hintKey.includes("*")) {
      continue;
    }
    const hintSegments = hintKey.split(".");
    if (hintSegments.length !== segments.length) {
      continue;
    }
    let match = true;
    for (let index = 0; index < segments.length; index += 1) {
      if (hintSegments[index] !== "*" && hintSegments[index] !== segments[index]) {
        match = false;
        break;
      }
    }
    if (match) {
      return hint;
    }
  }
  return undefined;
}

function isSensitivePath(path: string, hints?: ConfigUiHints): boolean {
  if (hints) {
    const hint = matchHint(path, hints);
    if (hint?.sensitive !== undefined) {
      return Boolean(hint.sensitive);
    }
  }
  return isSensitiveConfigPath(path) || matchesExtraSensitivePath(path);
}

function sanitizePublicConfigValue<T>(value: T, prefix: string, hints?: ConfigUiHints): T {
  if (Array.isArray(value)) {
    const nextPath = prefix ? `${prefix}[]` : "[]";
    return value.map((entry) => sanitizePublicConfigValue(entry, nextPath, hints)) as T;
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (isSensitivePath(nextPath, hints)) {
      continue;
    }
    output[key] = sanitizePublicConfigValue(val, nextPath, hints);
  }
  return output as T;
}

function buildUiHints(config: Config): ConfigUiHints {
  return buildConfigSchemaView(config).uiHints;
}

function maskApiKey(value: string): { apiKeySet: boolean; apiKeyMasked?: string } {
  if (!value) {
    return { apiKeySet: false };
  }
  if (value.length < MASK_MIN_LENGTH) {
    return { apiKeySet: true, apiKeyMasked: "****" };
  }
  return {
    apiKeySet: true,
    apiKeyMasked: `${value.slice(0, 2)}****${value.slice(-4)}`
  };
}

function toProviderView(
  provider: ProviderConfig,
  providerName: string,
  uiHints: ConfigUiHints,
  spec?: ProviderSpec
): ProviderConfigView {
  const masked = maskApiKey(provider.apiKey);
  const extraHeaders =
    provider.extraHeaders && Object.keys(provider.extraHeaders).length > 0
      ? (sanitizePublicConfigValue(
          provider.extraHeaders,
          `providers.${providerName}.extraHeaders`,
          uiHints
        ) as Record<string, string>)
      : null;
  const view: ProviderConfigView = {
    apiKeySet: masked.apiKeySet,
    apiKeyMasked: masked.apiKeyMasked,
    apiBase: provider.apiBase ?? null,
    extraHeaders: extraHeaders && Object.keys(extraHeaders).length > 0 ? extraHeaders : null
  };
  if (spec?.supportsWireApi) {
    view.wireApi = provider.wireApi ?? spec.defaultWireApi ?? "auto";
  }
  return view;
}

export function buildConfigView(config: Config): ConfigView {
  const uiHints = buildUiHints(config);
  const providers: Record<string, ProviderConfigView> = {};
  for (const [name, provider] of Object.entries(config.providers)) {
    const spec = findProviderByName(name);
    providers[name] = toProviderView(provider as ProviderConfig, name, uiHints, spec);
  }
  return {
    agents: config.agents,
    providers,
    channels: sanitizePublicConfigValue(
      config.channels as Record<string, Record<string, unknown>>,
      "channels",
      uiHints
    ),
    tools: sanitizePublicConfigValue(config.tools, "tools", uiHints),
    gateway: sanitizePublicConfigValue(config.gateway, "gateway", uiHints),
    ui: sanitizePublicConfigValue(config.ui, "ui", uiHints)
  };
}

export function buildConfigMeta(config: Config): ConfigMetaView {
  const providers = PROVIDERS.map((spec) => ({
    name: spec.name,
    displayName: spec.displayName,
    keywords: spec.keywords,
    envKey: spec.envKey,
    isGateway: spec.isGateway,
    isLocal: spec.isLocal,
    defaultApiBase: spec.defaultApiBase,
    supportsWireApi: spec.supportsWireApi,
    wireApiOptions: spec.wireApiOptions,
    defaultWireApi: spec.defaultWireApi
  }));
  const channels = Object.keys(config.channels).map((name) => ({
    name,
    displayName: name,
    enabled: Boolean((config.channels as Record<string, { enabled?: boolean }>)[name]?.enabled)
  }));
  return { providers, channels };
}

export function buildConfigSchemaView(_config: Config): ConfigSchemaResponse {
  return buildConfigSchema({ version: getPackageVersion() });
}

export function loadConfigOrDefault(configPath: string): Config {
  return loadConfig(configPath);
}

export function updateModel(configPath: string, model: string): ConfigView {
  const config = loadConfigOrDefault(configPath);
  config.agents.defaults.model = model;
  const next = ConfigSchema.parse(config);
  saveConfig(next, configPath);
  return buildConfigView(next);
}

export function updateProvider(
  configPath: string,
  providerName: string,
  patch: ProviderConfigUpdate
): ProviderConfigView | null {
  const config = loadConfigOrDefault(configPath);
  const provider = (config.providers as Record<string, ProviderConfig>)[providerName];
  if (!provider) {
    return null;
  }
  const spec = findProviderByName(providerName);
  if (Object.prototype.hasOwnProperty.call(patch, "apiKey")) {
    provider.apiKey = patch.apiKey ?? "";
  }
  if (Object.prototype.hasOwnProperty.call(patch, "apiBase")) {
    provider.apiBase = patch.apiBase ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "extraHeaders")) {
    provider.extraHeaders = patch.extraHeaders ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "wireApi") && spec?.supportsWireApi) {
    provider.wireApi = patch.wireApi ?? spec.defaultWireApi ?? "auto";
  }
  const next = ConfigSchema.parse(config);
  saveConfig(next, configPath);
  const uiHints = buildUiHints(next);
  const updated = (next.providers as Record<string, ProviderConfig>)[providerName];
  return toProviderView(updated, providerName, uiHints, spec ?? undefined);
}

export function updateChannel(
  configPath: string,
  channelName: string,
  patch: Record<string, unknown>
): Record<string, unknown> | null {
  const config = loadConfigOrDefault(configPath);
  const channel = (config.channels as Record<string, Record<string, unknown>>)[channelName];
  if (!channel) {
    return null;
  }
  (config.channels as Record<string, Record<string, unknown>>)[channelName] = { ...channel, ...patch };
  const next = ConfigSchema.parse(config);
  saveConfig(next, configPath);
  const uiHints = buildUiHints(next);
  return sanitizePublicConfigValue(
    (next.channels as Record<string, Record<string, unknown>>)[channelName],
    `channels.${channelName}`,
    uiHints
  );
}
