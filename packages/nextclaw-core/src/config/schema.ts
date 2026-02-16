import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { findProviderByName, PROVIDERS } from "../providers/registry.js";
import { DEFAULT_WORKSPACE_PATH } from "./brand.js";
import { expandHome, getPackageVersion } from "../utils/helpers.js";
import { applySensitiveHints, buildBaseHints, mapSensitivePaths, type ConfigUiHints } from "./schema.hints.js";

const allowFrom = z.array(z.string()).default([]);

export const WhatsAppConfigSchema = z.object({
  enabled: z.boolean().default(false),
  bridgeUrl: z.string().default("ws://localhost:3001"),
  allowFrom: allowFrom
});

export const TelegramConfigSchema = z.object({
  enabled: z.boolean().default(false),
  token: z.string().default(""),
  allowFrom: allowFrom,
  proxy: z.string().nullable().default(null)
});

export const FeishuConfigSchema = z.object({
  enabled: z.boolean().default(false),
  appId: z.string().default(""),
  appSecret: z.string().default(""),
  encryptKey: z.string().default(""),
  verificationToken: z.string().default(""),
  allowFrom: allowFrom
});

export const DingTalkConfigSchema = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().default(""),
  clientSecret: z.string().default(""),
  allowFrom: allowFrom
});

export const DiscordConfigSchema = z.object({
  enabled: z.boolean().default(false),
  token: z.string().default(""),
  allowFrom: allowFrom,
  gatewayUrl: z.string().default("wss://gateway.discord.gg/?v=10&encoding=json"),
  intents: z.number().int().default(37377)
});

export const EmailConfigSchema = z.object({
  enabled: z.boolean().default(false),
  consentGranted: z.boolean().default(false),
  imapHost: z.string().default(""),
  imapPort: z.number().int().default(993),
  imapUsername: z.string().default(""),
  imapPassword: z.string().default(""),
  imapMailbox: z.string().default("INBOX"),
  imapUseSsl: z.boolean().default(true),
  smtpHost: z.string().default(""),
  smtpPort: z.number().int().default(587),
  smtpUsername: z.string().default(""),
  smtpPassword: z.string().default(""),
  smtpUseTls: z.boolean().default(true),
  smtpUseSsl: z.boolean().default(false),
  fromAddress: z.string().default(""),
  autoReplyEnabled: z.boolean().default(true),
  pollIntervalSeconds: z.number().int().default(30),
  markSeen: z.boolean().default(true),
  maxBodyChars: z.number().int().default(12000),
  subjectPrefix: z.string().default("Re: "),
  allowFrom: allowFrom
});

export const MochatMentionSchema = z.object({
  requireInGroups: z.boolean().default(false)
});

export const MochatGroupRuleSchema = z.object({
  requireMention: z.boolean().default(false)
});

export const MochatConfigSchema = z.object({
  enabled: z.boolean().default(false),
  baseUrl: z.string().default("https://mochat.io"),
  socketUrl: z.string().default(""),
  socketPath: z.string().default("/socket.io"),
  socketDisableMsgpack: z.boolean().default(false),
  socketReconnectDelayMs: z.number().int().default(1000),
  socketMaxReconnectDelayMs: z.number().int().default(10000),
  socketConnectTimeoutMs: z.number().int().default(10000),
  refreshIntervalMs: z.number().int().default(30000),
  watchTimeoutMs: z.number().int().default(25000),
  watchLimit: z.number().int().default(100),
  retryDelayMs: z.number().int().default(500),
  maxRetryAttempts: z.number().int().default(0),
  clawToken: z.string().default(""),
  agentUserId: z.string().default(""),
  sessions: z.array(z.string()).default([]),
  panels: z.array(z.string()).default([]),
  allowFrom: allowFrom,
  mention: MochatMentionSchema.default({}),
  groups: z.record(MochatGroupRuleSchema).default({}),
  replyDelayMode: z.string().default("non-mention"),
  replyDelayMs: z.number().int().default(120000)
});

export const SlackDMSchema = z.object({
  enabled: z.boolean().default(true),
  policy: z.string().default("open"),
  allowFrom: allowFrom
});

export const SlackConfigSchema = z.object({
  enabled: z.boolean().default(false),
  mode: z.string().default("socket"),
  webhookPath: z.string().default("/slack/events"),
  botToken: z.string().default(""),
  appToken: z.string().default(""),
  userTokenReadOnly: z.boolean().default(true),
  groupPolicy: z.string().default("mention"),
  groupAllowFrom: allowFrom,
  dm: SlackDMSchema.default({})
});

export const QQConfigSchema = z.object({
  enabled: z.boolean().default(false),
  appId: z.string().default(""),
  secret: z.string().default(""),
  markdownSupport: z.boolean().default(false),
  allowFrom: allowFrom
});

export const ChannelsConfigSchema = z.object({
  whatsapp: WhatsAppConfigSchema.default({}),
  telegram: TelegramConfigSchema.default({}),
  discord: DiscordConfigSchema.default({}),
  feishu: FeishuConfigSchema.default({}),
  mochat: MochatConfigSchema.default({}),
  dingtalk: DingTalkConfigSchema.default({}),
  email: EmailConfigSchema.default({}),
  slack: SlackConfigSchema.default({}),
  qq: QQConfigSchema.default({})
});

export const AgentDefaultsSchema = z.object({
  workspace: z.string().default(DEFAULT_WORKSPACE_PATH),
  model: z.string().default("anthropic/claude-opus-4-5"),
  maxTokens: z.number().int().default(8192),
  temperature: z.number().default(0.7),
  maxToolIterations: z.number().int().default(20)
});

export const ContextBootstrapSchema = z.object({
  files: z
    .array(z.string())
    .default([
      "AGENTS.md",
      "SOUL.md",
      "USER.md",
      "IDENTITY.md",
      "TOOLS.md",
      "BOOT.md",
      "BOOTSTRAP.md",
      "HEARTBEAT.md"
    ]),
  minimalFiles: z.array(z.string()).default(["AGENTS.md", "SOUL.md", "TOOLS.md", "IDENTITY.md"]),
  heartbeatFiles: z.array(z.string()).default(["HEARTBEAT.md"]),
  perFileChars: z.number().int().default(4000),
  totalChars: z.number().int().default(12000)
});

export const ContextMemorySchema = z.object({
  enabled: z.boolean().default(true),
  maxChars: z.number().int().default(8000)
});

export const ContextConfigSchema = z.object({
  bootstrap: ContextBootstrapSchema.default({}),
  memory: ContextMemorySchema.default({})
});

export const AgentsConfigSchema = z.object({
  defaults: AgentDefaultsSchema.default({}),
  context: ContextConfigSchema.default({})
});

export const ProviderConfigSchema = z.object({
  apiKey: z.string().default(""),
  apiBase: z.string().nullable().default(null),
  extraHeaders: z.record(z.string()).nullable().default(null),
  wireApi: z.enum(["auto", "chat", "responses"]).default("auto")
});

export const ProvidersConfigSchema = z.object({
  anthropic: ProviderConfigSchema.default({}),
  openai: ProviderConfigSchema.default({}),
  openrouter: ProviderConfigSchema.default({}),
  deepseek: ProviderConfigSchema.default({}),
  groq: ProviderConfigSchema.default({}),
  zhipu: ProviderConfigSchema.default({}),
  dashscope: ProviderConfigSchema.default({}),
  vllm: ProviderConfigSchema.default({}),
  gemini: ProviderConfigSchema.default({}),
  moonshot: ProviderConfigSchema.default({}),
  minimax: ProviderConfigSchema.default({}),
  aihubmix: ProviderConfigSchema.default({})
});

export const PluginEntrySchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional()
});

export const PluginsLoadSchema = z.object({
  paths: z.array(z.string()).optional()
});

export const PluginInstallRecordSchema = z.object({
  source: z.enum(["npm", "archive", "path"]),
  spec: z.string().optional(),
  sourcePath: z.string().optional(),
  installPath: z.string().optional(),
  version: z.string().optional(),
  installedAt: z.string().optional()
});

export const PluginsConfigSchema = z.object({
  enabled: z.boolean().optional(),
  allow: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  load: PluginsLoadSchema.optional(),
  entries: z.record(PluginEntrySchema).optional(),
  installs: z.record(PluginInstallRecordSchema).optional()
});

export const GatewayConfigSchema = z.object({
  host: z.string().default("0.0.0.0"),
  port: z.number().int().default(18790)
});

export const UiConfigSchema = z.object({
  enabled: z.boolean().default(false),
  host: z.string().default("127.0.0.1"),
  port: z.number().int().default(18791),
  open: z.boolean().default(false)
});

export const WebSearchConfigSchema = z.object({
  apiKey: z.string().default(""),
  maxResults: z.number().int().default(5)
});

export const WebToolsConfigSchema = z.object({
  search: WebSearchConfigSchema.default({})
});

export const ExecToolConfigSchema = z.object({
  timeout: z.number().int().default(60)
});

export const ToolsConfigSchema = z.object({
  web: WebToolsConfigSchema.default({}),
  exec: ExecToolConfigSchema.default({}),
  restrictToWorkspace: z.boolean().default(false)
});

export const ConfigSchema = z.object({
  agents: AgentsConfigSchema.default({}),
  channels: ChannelsConfigSchema.default({}),
  providers: ProvidersConfigSchema.default({}),
  plugins: PluginsConfigSchema.default({}),
  gateway: GatewayConfigSchema.default({}),
  ui: UiConfigSchema.default({}),
  tools: ToolsConfigSchema.default({})
});

export type ConfigSchemaJson = Record<string, unknown>;

export type ConfigSchemaResponse = {
  schema: ConfigSchemaJson;
  uiHints: ConfigUiHints;
  version: string;
  generatedAt: string;
};

export type Config = z.infer<typeof ConfigSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export type PluginUiMetadata = {
  id: string;
  configSchema?: Record<string, unknown>;
  configUiHints?: Record<
    string,
    {
      label?: string;
      help?: string;
      advanced?: boolean;
      sensitive?: boolean;
      placeholder?: string;
    }
  >;
};


type JsonSchemaNode = Record<string, unknown>;

type JsonSchemaObject = JsonSchemaNode & {
  type?: string | string[];
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: JsonSchemaObject | boolean;
};

function cloneSchema<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function asSchemaObject(value: unknown): JsonSchemaObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonSchemaObject;
}



function resolveSchemaRoot(schema: ConfigSchemaJson): JsonSchemaObject | null {
  const root = asSchemaObject(schema);
  if (!root) {
    return null;
  }
  if (root.properties) {
    return root;
  }
  const ref = (root as Record<string, unknown>).$ref;
  if (typeof ref === "string" && ref.startsWith("#/definitions/")) {
    const definitionName = ref.slice("#/definitions/".length);
    const definitions = (root as Record<string, unknown>).definitions as Record<string, unknown> | undefined;
    if (definitions && definitionName in definitions) {
      return asSchemaObject(definitions[definitionName]);
    }
  }
  return root;
}
function isObjectSchema(schema: JsonSchemaObject): boolean {
  const type = schema.type;
  if (type === "object") {
    return true;
  }
  if (Array.isArray(type) && type.includes("object")) {
    return true;
  }
  return Boolean(schema.properties || schema.additionalProperties);
}

function mergeObjectSchema(base: JsonSchemaObject, extension: JsonSchemaObject): JsonSchemaObject {
  const mergedRequired = new Set<string>([...(base.required ?? []), ...(extension.required ?? [])]);
  const merged: JsonSchemaObject = {
    ...base,
    ...extension,
    properties: {
      ...base.properties,
      ...extension.properties
    }
  };
  if (mergedRequired.size > 0) {
    merged.required = Array.from(mergedRequired);
  }
  const additional = extension.additionalProperties ?? base.additionalProperties;
  if (additional !== undefined) {
    merged.additionalProperties = additional;
  }
  return merged;
}

function applyPluginHints(hints: ConfigUiHints, plugins: PluginUiMetadata[]): ConfigUiHints {
  const next: ConfigUiHints = { ...hints };
  for (const plugin of plugins) {
    const id = plugin.id.trim();
    if (!id) {
      continue;
    }
    const name = id;
    const basePath = `plugins.entries.${id}`;

    next[basePath] = {
      ...next[basePath],
      label: name,
      help: `Plugin entry for ${id}.`
    };
    next[`${basePath}.enabled`] = {
      ...next[`${basePath}.enabled`],
      label: `Enable ${name}`
    };
    next[`${basePath}.config`] = {
      ...next[`${basePath}.config`],
      label: `${name} Config`,
      help: `Plugin-defined config payload for ${id}.`
    };

    const uiHints = plugin.configUiHints ?? {};
    for (const [relPathRaw, hint] of Object.entries(uiHints)) {
      const relPath = relPathRaw.trim().replace(/^\./, "");
      if (!relPath) {
        continue;
      }
      const key = `${basePath}.config.${relPath}`;
      next[key] = {
        ...next[key],
        ...hint
      };
    }
  }
  return next;
}

function applyPluginSchemas(schema: ConfigSchemaJson, plugins: PluginUiMetadata[]): ConfigSchemaJson {
  const next = cloneSchema(schema);
  const root = resolveSchemaRoot(next);
  const pluginsNode = asSchemaObject(root?.properties?.plugins);
  const entriesNode = asSchemaObject(pluginsNode?.properties?.entries);
  if (!entriesNode) {
    return next;
  }

  const entryBase = asSchemaObject(entriesNode.additionalProperties);
  const entryProps = entriesNode.properties ?? {};
  entriesNode.properties = entryProps;

  for (const plugin of plugins) {
    if (!plugin.configSchema) {
      continue;
    }

    const entrySchema = entryBase ? cloneSchema(entryBase) : ({ type: "object" } as JsonSchemaObject);
    const entryObject = asSchemaObject(entrySchema) ?? ({ type: "object" } as JsonSchemaObject);
    const baseConfig = asSchemaObject(entryObject.properties?.config);
    const pluginConfig = asSchemaObject(plugin.configSchema);
    const nextConfig =
      baseConfig && pluginConfig && isObjectSchema(baseConfig) && isObjectSchema(pluginConfig)
        ? mergeObjectSchema(baseConfig, pluginConfig)
        : cloneSchema(plugin.configSchema);

    entryObject.properties = {
      ...entryObject.properties,
      config: nextConfig
    };

    entryProps[plugin.id] = entryObject;
  }

  return next;
}
export function getWorkspacePathFromConfig(config: Config): string {
  return expandHome(config.agents.defaults.workspace);
}

export function matchProvider(config: Config, model?: string): { provider: ProviderConfig | null; name: string | null } {
  const modelLower = (model ?? config.agents.defaults.model).toLowerCase();
  for (const spec of PROVIDERS) {
    const provider = (config.providers as Record<string, ProviderConfig>)[spec.name];
    if (provider && provider.apiKey && spec.keywords.some((kw) => modelLower.includes(kw))) {
      return { provider, name: spec.name };
    }
  }
  for (const spec of PROVIDERS) {
    const provider = (config.providers as Record<string, ProviderConfig>)[spec.name];
    if (provider && provider.apiKey) {
      return { provider, name: spec.name };
    }
  }
  return { provider: null, name: null };
}

export function getProvider(config: Config, model?: string): ProviderConfig | null {
  return matchProvider(config, model).provider;
}

export function getProviderName(config: Config, model?: string): string | null {
  return matchProvider(config, model).name;
}

export function getApiKey(config: Config, model?: string): string | null {
  const provider = getProvider(config, model);
  return provider?.apiKey ?? null;
}

export function getApiBase(config: Config, model?: string): string | null {
  const { provider, name } = matchProvider(config, model);
  if (provider?.apiBase) {
    return provider.apiBase;
  }
  if (name) {
    const spec = findProviderByName(name);
    if (spec?.isGateway && spec.defaultApiBase) {
      return spec.defaultApiBase;
    }
  }
  return null;
}

export function buildConfigSchema(options?: { version?: string; plugins?: PluginUiMetadata[] }): ConfigSchemaResponse {
  const baseSchema = zodToJsonSchema(ConfigSchema, {
    name: "NextClawConfig",
    target: "jsonSchema7"
  }) as ConfigSchemaJson;
  if (baseSchema && typeof baseSchema === "object") {
    baseSchema.title = "NextClawConfig";
  }

  const plugins = options?.plugins ?? [];
  const baseHints = mapSensitivePaths(ConfigSchema, "", buildBaseHints());
  const mergedHints = applySensitiveHints(applyPluginHints(baseHints, plugins));
  const mergedSchema = applyPluginSchemas(baseSchema, plugins);

  return {
    schema: mergedSchema,
    uiHints: mergedHints,
    version: options?.version ?? getPackageVersion(),
    generatedAt: new Date().toISOString()
  };
}
