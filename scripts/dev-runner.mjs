#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createNetServer, Socket } from "node:net";

const command = process.argv[2] ?? "start";

if (command !== "start") {
  console.error("Unsupported dev command. Use: pnpm dev start");
  process.exit(1);
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = resolve(rootDir, "packages/nextclaw");
const frontendDir = resolve(rootDir, "packages/nextclaw-ui");

const DEFAULT_BACKEND_PORT = 18792;
const DEFAULT_FRONTEND_PORT = 5174;
const PORT_SCAN_LIMIT = 20;

const binName = process.platform === "win32" ? (name) => `${name}.cmd` : (name) => name;
const backendBin = resolve(backendDir, "node_modules/.bin", binName("tsx"));
const frontendBin = resolve(frontendDir, "node_modules/.bin", binName("vite"));

if (!existsSync(backendBin) || !existsSync(frontendBin)) {
  console.error("Missing local dev binaries. Run `pnpm install` at repo root first.");
  process.exit(1);
}

function toPort(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isPortAvailable(port, host) {
  return new Promise((resolveAvailable) => {
    const server = createNetServer();
    server.unref();
    server.once("error", () => resolveAvailable(false));
    server.listen(port, host, () => {
      server.close(() => resolveAvailable(true));
    });
  });
}

function isPortOccupied(port, host) {
  return new Promise((resolveOccupied) => {
    const socket = new Socket();
    let settled = false;

    const finalize = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolveOccupied(value);
    };

    socket.setTimeout(250, () => finalize(false));
    socket.once("connect", () => finalize(true));
    socket.once("error", (error) => {
      const code = typeof error?.code === "string" ? error.code : "";
      if (code === "ECONNREFUSED" || code === "EHOSTUNREACH" || code === "ENETUNREACH") {
        finalize(false);
        return;
      }
      finalize(true);
    });

    socket.connect(port, host);
  });
}

async function resolveFreePort(startPort, host) {
  let current = startPort;
  for (let index = 0; index < PORT_SCAN_LIMIT; index += 1) {
    const occupied = await isPortOccupied(current, "127.0.0.1");
    if (!occupied && (await isPortAvailable(current, host))) {
      return current;
    }
    current += 1;
  }
  throw new Error(`Unable to find a free port from ${startPort} (${host})`);
}

const preferredBackendPort = toPort(process.env.NEXTCLAW_DEV_BACKEND_PORT, DEFAULT_BACKEND_PORT);
const preferredFrontendPort = toPort(process.env.NEXTCLAW_DEV_FRONTEND_PORT, DEFAULT_FRONTEND_PORT);

const backendPort = await resolveFreePort(preferredBackendPort, "0.0.0.0");
const frontendPort = await resolveFreePort(preferredFrontendPort, "127.0.0.1");

if (backendPort !== preferredBackendPort) {
  console.warn(`[dev] Backend UI port ${preferredBackendPort} in use, fallback to ${backendPort}.`);
}
if (frontendPort !== preferredFrontendPort) {
  console.warn(`[dev] Frontend port ${preferredFrontendPort} in use, fallback to ${frontendPort}.`);
}

console.log(`[dev] API base: http://127.0.0.1:${backendPort}`);
console.log(`[dev] Frontend: http://127.0.0.1:${frontendPort}`);

const children = [];
let shuttingDown = false;
let requestedStop = false;
let exitCode = 0;

const spawnProcess = (label, cmd, args, cwd, extraEnv = {}) => {
  const child = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv }
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (requestedStop || shuttingDown) {
      return;
    }

    shuttingDown = true;
    if (typeof code === "number") {
      exitCode = code;
    } else if (signal) {
      exitCode = 1;
      console.error(`[dev:${label}] exited with signal ${signal}`);
    }

    for (const proc of children) {
      if (proc !== child && proc.exitCode === null && !proc.killed) {
        proc.kill("SIGTERM");
      }
    }
  });
};

spawnProcess(
  "backend",
  backendBin,
  [
    "watch",
    "--tsconfig",
    "tsconfig.json",
    "src/cli/index.ts",
    "serve",
    "--ui-port",
    String(backendPort)
  ],
  backendDir
);

spawnProcess(
  "frontend",
  frontendBin,
  ["--host", "127.0.0.1", "--port", String(frontendPort), "--strictPort"],
  frontendDir,
  { VITE_API_BASE: `http://127.0.0.1:${backendPort}` }
);

const stopAll = (signal) => {
  if (shuttingDown) {
    return;
  }
  requestedStop = true;
  shuttingDown = true;
  exitCode = 0;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) {
      child.kill(signal);
    }
  }
};

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => stopAll(signal));
}

const waitForExit = setInterval(() => {
  const allExited = children.length > 0 && children.every((child) => child.exitCode !== null || child.killed);
  if (!allExited) {
    return;
  }
  clearInterval(waitForExit);
  process.exit(exitCode);
}, 100);

setTimeout(() => {
  if (shuttingDown) {
    process.exit(exitCode);
  }
}, 3000);
