import { buildReloadPlan, diffConfigPaths, loadConfig, saveConfig, type Config } from "@nextclaw/core";
import {
  getAtConfigPath,
  parseConfigSetValue,
  parseRequiredConfigPath,
  setAtConfigPath,
  unsetAtConfigPath
} from "../config-path.js";
import type { ConfigGetOptions, ConfigSetOptions, RequestRestartParams } from "../types.js";

export class ConfigCommands {
  constructor(
    private deps: {
      requestRestart: (params: RequestRestartParams) => Promise<void>;
    }
  ) {}

  configGet(pathExpr: string, opts: ConfigGetOptions = {}): void {
    const config = loadConfig() as unknown as Record<string, unknown>;

    let parsedPath: string[];
    try {
      parsedPath = parseRequiredConfigPath(pathExpr);
    } catch (error) {
      console.error(String(error));
      process.exit(1);
      return;
    }

    const result = getAtConfigPath(config, parsedPath);
    if (!result.found) {
      console.error(`Config path not found: ${pathExpr}`);
      process.exit(1);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(result.value ?? null, null, 2));
      return;
    }

    if (
      typeof result.value === "string" ||
      typeof result.value === "number" ||
      typeof result.value === "boolean"
    ) {
      console.log(String(result.value));
      return;
    }

    console.log(JSON.stringify(result.value ?? null, null, 2));
  }

  async configSet(pathExpr: string, value: string, opts: ConfigSetOptions = {}): Promise<void> {
    let parsedPath: string[];
    try {
      parsedPath = parseRequiredConfigPath(pathExpr);
    } catch (error) {
      console.error(String(error));
      process.exit(1);
      return;
    }

    let parsedValue: unknown;
    try {
      parsedValue = parseConfigSetValue(value, opts);
    } catch (error) {
      console.error(`Failed to parse config value: ${String(error)}`);
      process.exit(1);
      return;
    }

    const prevConfig = loadConfig();
    const nextConfig = structuredClone(prevConfig) as unknown as Record<string, unknown>;
    try {
      setAtConfigPath(nextConfig, parsedPath, parsedValue);
    } catch (error) {
      console.error(String(error));
      process.exit(1);
      return;
    }

    saveConfig(nextConfig as Config);
    await this.requestRestartForConfigDiff({
      prevConfig,
      nextConfig: nextConfig as Config,
      reason: `config.set ${pathExpr}`,
      manualMessage: `Updated ${pathExpr}. Restart the gateway to apply.`
    });
  }

  async configUnset(pathExpr: string): Promise<void> {
    let parsedPath: string[];
    try {
      parsedPath = parseRequiredConfigPath(pathExpr);
    } catch (error) {
      console.error(String(error));
      process.exit(1);
      return;
    }

    const prevConfig = loadConfig();
    const nextConfig = structuredClone(prevConfig) as unknown as Record<string, unknown>;
    const removed = unsetAtConfigPath(nextConfig, parsedPath);
    if (!removed) {
      console.error(`Config path not found: ${pathExpr}`);
      process.exit(1);
      return;
    }

    saveConfig(nextConfig as Config);
    await this.requestRestartForConfigDiff({
      prevConfig,
      nextConfig: nextConfig as Config,
      reason: `config.unset ${pathExpr}`,
      manualMessage: `Removed ${pathExpr}. Restart the gateway to apply.`
    });
  }

  private async requestRestartForConfigDiff(params: {
    prevConfig: Config;
    nextConfig: Config;
    reason: string;
    manualMessage: string;
  }): Promise<void> {
    const changedPaths = diffConfigPaths(params.prevConfig, params.nextConfig);
    if (!changedPaths.length) {
      return;
    }
    const plan = buildReloadPlan(changedPaths);
    if (plan.restartRequired.length === 0) {
      return;
    }
    await this.deps.requestRestart({
      reason: `${params.reason} (${plan.restartRequired.join(", ")})`,
      manualMessage: params.manualMessage
    });
  }
}
