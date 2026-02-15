import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import {
  ConfigSchema,
  type Config,
  type GatewayController,
  type CronService,
  type ChannelManager
} from "nextclaw-core";
import { getPackageVersion, which } from "../utils.js";

type ConfigReloaderLike = {
  getChannels: () => ChannelManager;
  reloadConfig: (reason?: string) => Promise<string>;
};

type ControllerDeps = {
  reloader: ConfigReloaderLike;
  cron: CronService;
  getConfigPath: () => string;
  saveConfig: (config: Config) => void;
};

const hashRaw = (raw: string): string => createHash("sha256").update(raw).digest("hex");

const redactConfig = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactConfig(entry));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const entries = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(entries)) {
    if (/apiKey|token|secret|password|appId|clientSecret|accessKey/i.test(key)) {
      output[key] = val ? "***" : val;
      continue;
    }
    output[key] = redactConfig(val);
  }
  return output;
};

const readConfigSnapshot = (getConfigPath: () => string): {
  raw: string | null;
  hash: string | null;
  config: Config;
  redacted: Record<string, unknown>;
  valid: boolean;
} => {
  const path = getConfigPath();
  let raw = "";
  let parsed: Record<string, unknown> = {};
  if (existsSync(path)) {
    raw = readFileSync(path, "utf-8");
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }
  let config: Config;
  let valid = true;
  try {
    config = ConfigSchema.parse(parsed);
  } catch {
    config = ConfigSchema.parse({});
    valid = false;
  }
  if (!raw) {
    raw = JSON.stringify(config, null, 2);
  }
  const hash = hashRaw(raw);
  const redacted = redactConfig(config) as Record<string, unknown>;
  return { raw: valid ? JSON.stringify(redacted, null, 2) : null, hash: valid ? hash : null, config, redacted, valid };
};

const mergeDeep = (base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const baseVal = base[key];
      if (baseVal && typeof baseVal === "object" && !Array.isArray(baseVal)) {
        next[key] = mergeDeep(baseVal as Record<string, unknown>, value as Record<string, unknown>);
      } else {
        next[key] = mergeDeep({}, value as Record<string, unknown>);
      }
    } else {
      next[key] = value;
    }
  }
  return next;
};

const buildSchemaFromValue = (value: unknown): Record<string, unknown> => {
  if (Array.isArray(value)) {
    const item = value.length ? buildSchemaFromValue(value[0]) : { type: "string" };
    return { type: "array", items: item };
  }
  if (value && typeof value === "object") {
    const props: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      props[key] = buildSchemaFromValue(val);
    }
    return { type: "object", properties: props };
  }
  if (typeof value === "number") {
    return { type: "number" };
  }
  if (typeof value === "boolean") {
    return { type: "boolean" };
  }
  if (value === null) {
    return { type: ["null", "string"] };
  }
  return { type: "string" };
};

const scheduleRestart = (delayMs?: number, reason?: string): void => {
  const delay = typeof delayMs === "number" && Number.isFinite(delayMs) ? Math.max(0, delayMs) : 100;
  console.log(`Gateway restart requested via tool${reason ? ` (${reason})` : ""}.`);
  setTimeout(() => {
    process.exit(0);
  }, delay);
};

export class GatewayControllerImpl implements GatewayController {
  constructor(private deps: ControllerDeps) {}

  status(): Record<string, unknown> {
    return {
      channels: this.deps.reloader.getChannels().enabledChannels,
      cron: this.deps.cron.status(),
      configPath: this.deps.getConfigPath()
    };
  }

  async reloadConfig(reason?: string): Promise<string> {
    return this.deps.reloader.reloadConfig(reason);
  }

  async restart(options?: { delayMs?: number; reason?: string }): Promise<string> {
    scheduleRestart(options?.delayMs, options?.reason);
    return "Restart scheduled";
  }

  async getConfig(): Promise<Record<string, unknown>> {
    const snapshot = readConfigSnapshot(this.deps.getConfigPath);
    return {
      raw: snapshot.raw,
      hash: snapshot.hash,
      path: this.deps.getConfigPath(),
      config: snapshot.redacted,
      parsed: snapshot.redacted,
      resolved: snapshot.redacted,
      valid: snapshot.valid
    };
  }

  async getConfigSchema(): Promise<Record<string, unknown>> {
    const base = ConfigSchema.parse({});
    return {
      schema: {
        ...buildSchemaFromValue(base),
        title: "NextClawConfig",
        description: "NextClaw config schema (simplified)"
      },
      uiHints: {},
      version: getPackageVersion(),
      generatedAt: new Date().toISOString()
    };
  }

  async applyConfig(params: {
    raw: string;
    baseHash?: string;
    note?: string;
    restartDelayMs?: number;
    sessionKey?: string;
  }): Promise<Record<string, unknown>> {
    const snapshot = readConfigSnapshot(this.deps.getConfigPath);
    if (!params.baseHash) {
      return { ok: false, error: "config base hash required; re-run config.get and retry" };
    }
    if (!snapshot.valid || !snapshot.hash) {
      return { ok: false, error: "config base hash unavailable; re-run config.get and retry" };
    }
    if (params.baseHash !== snapshot.hash) {
      return { ok: false, error: "config changed since last load; re-run config.get and retry" };
    }
    let parsedRaw: Record<string, unknown>;
    try {
      parsedRaw = JSON.parse(params.raw) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "invalid JSON in raw config" };
    }
    let validated: Config;
    try {
      validated = ConfigSchema.parse(parsedRaw);
    } catch (err) {
      return { ok: false, error: `invalid config: ${String(err)}` };
    }
    this.deps.saveConfig(validated);
    const delayMs = params.restartDelayMs ?? 0;
    scheduleRestart(delayMs, "config.apply");
    return {
      ok: true,
      note: params.note ?? null,
      path: this.deps.getConfigPath(),
      config: redactConfig(validated),
      restart: { scheduled: true, delayMs }
    };
  }

  async patchConfig(params: {
    raw: string;
    baseHash?: string;
    note?: string;
    restartDelayMs?: number;
    sessionKey?: string;
  }): Promise<Record<string, unknown>> {
    const snapshot = readConfigSnapshot(this.deps.getConfigPath);
    if (!params.baseHash) {
      return { ok: false, error: "config base hash required; re-run config.get and retry" };
    }
    if (!snapshot.valid || !snapshot.hash) {
      return { ok: false, error: "config base hash unavailable; re-run config.get and retry" };
    }
    if (params.baseHash !== snapshot.hash) {
      return { ok: false, error: "config changed since last load; re-run config.get and retry" };
    }
    let patch: Record<string, unknown>;
    try {
      patch = JSON.parse(params.raw) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "invalid JSON in raw config" };
    }
    const merged = mergeDeep(snapshot.config as Record<string, unknown>, patch);
    let validated: Config;
    try {
      validated = ConfigSchema.parse(merged);
    } catch (err) {
      return { ok: false, error: `invalid config: ${String(err)}` };
    }
    this.deps.saveConfig(validated);
    const delayMs = params.restartDelayMs ?? 0;
    scheduleRestart(delayMs, "config.patch");
    return {
      ok: true,
      note: params.note ?? null,
      path: this.deps.getConfigPath(),
      config: redactConfig(validated),
      restart: { scheduled: true, delayMs }
    };
  }

  async updateRun(params: {
    note?: string;
    restartDelayMs?: number;
    timeoutMs?: number;
    sessionKey?: string;
  }): Promise<Record<string, unknown>> {
    const timeoutMs = params.timeoutMs ?? 20 * 60_000;
    const gatewayDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
    const cliDir = resolve(gatewayDir, "..");
    const pkgRoot = resolve(cliDir, "..", "..");
    const repoRoot = existsSync(join(pkgRoot, ".git")) ? pkgRoot : resolve(pkgRoot, "..", "..");
    const steps: Array<Record<string, unknown>> = [];

    const runStep = (cmd: string, args: string[], cwd: string): { ok: boolean; code: number | null } => {
      const result = spawnSync(cmd, args, {
        cwd,
        encoding: "utf-8",
        timeout: timeoutMs,
        stdio: "pipe"
      });
      const step = {
        cmd,
        args,
        cwd,
        code: result.status,
        stdout: (result.stdout ?? "").toString().slice(0, 4000),
        stderr: (result.stderr ?? "").toString().slice(0, 4000)
      };
      steps.push(step);
      return { ok: result.status === 0, code: result.status };
    };

    const updateCommand = process.env.NEXTCLAW_UPDATE_COMMAND?.trim();
    if (updateCommand) {
      const ok = runStep("sh", ["-c", updateCommand], process.cwd());
      if (!ok.ok) {
        return { ok: false, error: "update command failed", steps };
      }
    } else if (existsSync(join(repoRoot, ".git"))) {
      if (!which("git")) {
        return { ok: false, error: "git not found for repo update", steps };
      }
      const ok = runStep("git", ["-C", repoRoot, "pull", "--rebase"], repoRoot);
      if (!ok.ok) {
        return { ok: false, error: "git pull failed", steps };
      }
      if (existsSync(join(repoRoot, "pnpm-lock.yaml")) && which("pnpm")) {
        const installOk = runStep("pnpm", ["install"], repoRoot);
        if (!installOk.ok) {
          return { ok: false, error: "pnpm install failed", steps };
        }
      } else if (existsSync(join(repoRoot, "package.json")) && which("npm")) {
        const installOk = runStep("npm", ["install"], repoRoot);
        if (!installOk.ok) {
          return { ok: false, error: "npm install failed", steps };
        }
      }
    } else if (which("npm")) {
      const ok = runStep("npm", ["i", "-g", "nextclaw"], process.cwd());
      if (!ok.ok) {
        return { ok: false, error: "npm install -g nextclaw failed", steps };
      }
    } else {
      return { ok: false, error: "no update strategy available", steps };
    }

    const delayMs = params.restartDelayMs ?? 0;
    scheduleRestart(delayMs, "update.run");
    return {
      ok: true,
      note: params.note ?? null,
      restart: { scheduled: true, delayMs },
      steps
    };
  }
}
