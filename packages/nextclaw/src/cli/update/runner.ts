import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { which } from "../utils.js";

const DEFAULT_TIMEOUT_MS = 20 * 60_000;

export type UpdateStep = {
  cmd: string;
  args: string[];
  cwd: string;
  code: number | null;
  stdout: string;
  stderr: string;
};

export type SelfUpdateResult = {
  ok: boolean;
  error?: string;
  strategy: "command" | "git" | "npm" | "none";
  steps: UpdateStep[];
};

export type SelfUpdateOptions = {
  timeoutMs?: number;
  cwd?: string;
  updateCommand?: string;
  packageName?: string;
};

export function runSelfUpdate(options: SelfUpdateOptions = {}): SelfUpdateResult {
  const steps: UpdateStep[] = [];
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const updateCommand = options.updateCommand ?? process.env.NEXTCLAW_UPDATE_COMMAND?.trim();
  const packageName = options.packageName ?? "nextclaw";

  const runStep = (cmd: string, args: string[], cwd: string): { ok: boolean; code: number | null } => {
    const result = spawnSync(cmd, args, {
      cwd,
      encoding: "utf-8",
      timeout: timeoutMs,
      stdio: "pipe"
    });
    steps.push({
      cmd,
      args,
      cwd,
      code: result.status,
      stdout: (result.stdout ?? "").toString().slice(0, 4000),
      stderr: (result.stderr ?? "").toString().slice(0, 4000)
    });
    return { ok: result.status === 0, code: result.status };
  };

  const updateRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
  const cliDir = resolve(updateRoot, "..");
  const pkgRoot = resolve(cliDir, "..", "..");
  const repoRoot = existsSync(join(pkgRoot, ".git")) ? pkgRoot : resolve(pkgRoot, "..", "..");

  if (updateCommand) {
    const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
    const ok = runStep("sh", ["-c", updateCommand], cwd);
    if (!ok.ok) {
      return { ok: false, error: "update command failed", strategy: "command", steps };
    }
    return { ok: true, strategy: "command", steps };
  }

  if (existsSync(join(repoRoot, ".git"))) {
    if (!which("git")) {
      return { ok: false, error: "git not found for repo update", strategy: "git", steps };
    }
    const ok = runStep("git", ["-C", repoRoot, "pull", "--rebase"], repoRoot);
    if (!ok.ok) {
      return { ok: false, error: "git pull failed", strategy: "git", steps };
    }
    if (existsSync(join(repoRoot, "pnpm-lock.yaml")) && which("pnpm")) {
      const installOk = runStep("pnpm", ["install"], repoRoot);
      if (!installOk.ok) {
        return { ok: false, error: "pnpm install failed", strategy: "git", steps };
      }
    } else if (existsSync(join(repoRoot, "package.json")) && which("npm")) {
      const installOk = runStep("npm", ["install"], repoRoot);
      if (!installOk.ok) {
        return { ok: false, error: "npm install failed", strategy: "git", steps };
      }
    }
    return { ok: true, strategy: "git", steps };
  }

  if (which("npm")) {
    const ok = runStep("npm", ["i", "-g", packageName], process.cwd());
    if (!ok.ok) {
      return { ok: false, error: `npm install -g ${packageName} failed`, strategy: "npm", steps };
    }
    return { ok: true, strategy: "npm", steps };
  }

  return { ok: false, error: "no update strategy available", strategy: "none", steps };
}
