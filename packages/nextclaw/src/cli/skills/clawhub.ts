import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export type ClawHubInstallOptions = {
  slug: string;
  version?: string;
  registry?: string;
  workdir: string;
  dir?: string;
  force?: boolean;
};

export async function installClawHubSkill(options: ClawHubInstallOptions): Promise<{
  slug: string;
  version?: string;
  registry?: string;
  destinationDir: string;
  alreadyInstalled?: boolean;
}> {
  const slug = options.slug.trim();
  if (!slug) {
    throw new Error("Skill slug is required.");
  }

  const workdir = resolve(options.workdir);
  if (!existsSync(workdir)) {
    throw new Error(`Workdir does not exist: ${workdir}`);
  }

  const dirName = options.dir?.trim() || "skills";
  const destinationDir = isAbsolute(dirName) ? resolve(dirName, slug) : resolve(workdir, dirName, slug);
  const skillFile = join(destinationDir, "SKILL.md");

  if (!options.force && existsSync(destinationDir)) {
    if (existsSync(skillFile)) {
      return {
        slug,
        version: options.version,
        registry: options.registry,
        destinationDir,
        alreadyInstalled: true
      };
    }
    throw new Error(`Skill directory already exists: ${destinationDir} (use --force)`);
  }

  const args = buildClawHubArgs(slug, options);
  const result = spawnSync("npx", args, {
    cwd: workdir,
    stdio: "pipe",
    env: process.env
  });

  if (result.error) {
    throw new Error(`Failed to run npx clawhub: ${String(result.error)}`);
  }

  if (result.status !== 0) {
    const stdout = result.stdout ? String(result.stdout).trim() : "";
    const stderr = result.stderr ? String(result.stderr).trim() : "";
    const details = [stderr, stdout].filter(Boolean).join("\n");
    throw new Error(details || `clawhub install failed with code ${result.status ?? 1}`);
  }

  return {
    slug,
    version: options.version,
    registry: options.registry,
    destinationDir
  };
}

function buildClawHubArgs(slug: string, options: ClawHubInstallOptions): string[] {
  const args = ["--yes", "clawhub", "install", slug];
  if (options.version) {
    args.push("--version", options.version);
  }
  if (options.registry) {
    args.push("--registry", options.registry);
  }
  if (options.workdir) {
    args.push("--workdir", options.workdir);
  }
  if (options.dir) {
    args.push("--dir", options.dir);
  }
  if (options.force) {
    args.push("--force");
  }
  return args;
}
