# OpenClaw Plugin Compatibility Guide

This document describes how NextClaw currently supports OpenClaw plugins, what is intentionally unsupported, and how to operate this capability safely in production.

---

## Why this exists

NextClaw chooses a dual strategy:

- keep the core runtime small and maintainable;
- stay compatible with OpenClaw's plugin ecosystem to avoid fragmentation.

To enforce this, OpenClaw compatibility is isolated in `@nextclaw/openclaw-compat` instead of being embedded into `@nextclaw/core`.

---

## Architecture boundaries

- `@nextclaw/core`: generic extension/runtime primitives only, no OpenClaw-specific loading/install logic.
- `@nextclaw/openclaw-compat`: plugin discovery, manifest loading, config schema validation, install/uninstall, runtime adapter, diagnostics.
- `nextclaw` CLI: user-facing commands (`plugins ...`, `config ...`) that call the compat package.

This separation is the main guardrail that keeps compatibility work from polluting the core.

---

## Compatibility matrix (current)

| Area | Status | Notes |
| --- | --- | --- |
| Discovery paths | Supported | Supports `plugins.load.paths`, workspace `.openclaw/extensions`, `${NEXTCLAW_HOME:-~/.nextclaw}/extensions`, and `~/.openclaw/extensions` |
| Manifest loading | Supported | Parses `openclaw.plugin.json` and validates plugin identity |
| Install from path/archive/npm | Supported | `plugins install <path-or-spec>` supports directory, `.zip/.tgz/.tar`, and npm registry spec |
| Linked local plugin | Supported | `plugins install <path> --link` stores load path without copying files |
| Enable/disable/info/list/doctor/uninstall | Supported | CLI behavior aligned to OpenClaw-style plugin management |
| Config schema validation | Supported | `configSchema` is validated before plugin activation |
| UI hints merge | Supported | `uiHints` merged into `plugins.entries.<id>.config` schema hints |
| `registerTool` | Supported | Name collision checks + diagnostics |
| `registerProvider` | Supported | Registered via compat adapter |
| `registerChannel` | Supported | Includes channel config schema/uiHints merge |
| Channel `agentPrompt.messageToolHints` | Supported | Injected into runtime prompt guidance |
| `registerHook`/`registerGatewayMethod`/`registerCli`/`registerService`/`registerCommand`/`registerHttpHandler`/`registerHttpRoute` | Not supported (explicit) | Ignored with diagnostics warning, never silently emulated |

---

## Install path and load precedence

### Default install location

By default, copied plugin packages are installed to:

- `${NEXTCLAW_HOME:-~/.nextclaw}/extensions/<pluginId>`

If `NEXTCLAW_HOME` is set, NextClaw uses that location instead of `~/.nextclaw`.

### Discovery precedence

Candidate scan order is:

1. `plugins.load.paths` from config
2. `<workspace>/.openclaw/extensions`
3. `${NEXTCLAW_HOME:-~/.nextclaw}/extensions`
4. `~/.openclaw/extensions`

If duplicate plugin IDs are found, first winner keeps ownership; later duplicates are marked overridden in diagnostics.

---

## Operator workflow

### 1) Install

```bash
nextclaw plugins install ./my-plugin
nextclaw plugins install ./my-plugin.tgz
nextclaw plugins install @scope/openclaw-plugin
nextclaw plugins install ./my-plugin --link
```

### 2) Inspect

```bash
nextclaw plugins list
nextclaw plugins info my-plugin
nextclaw plugins doctor
```

### 3) Enable/disable

```bash
nextclaw plugins disable my-plugin
nextclaw plugins enable my-plugin
```

### 4) Read or edit plugin config

```bash
nextclaw config get plugins.entries.my-plugin.config --json
nextclaw config set plugins.entries.my-plugin.config '{"key":"value"}' --json
nextclaw config unset plugins.entries.my-plugin.config
```

### 5) Uninstall

```bash
nextclaw plugins uninstall my-plugin --dry-run
nextclaw plugins uninstall my-plugin --force
nextclaw plugins uninstall my-plugin --keep-files --force
```

After install/uninstall/enable/disable, restart gateway to apply changes.

---

## Config lifecycle and safety notes

- Runtime plugin config is stored at `plugins.entries.<id>.config`.
- `plugins install` does not overwrite that config payload by design.
- `plugins uninstall` removes plugin entry/install metadata by default, and may remove installed files unless `--keep-files` is used.
- For upgrade safety in production, export plugin config before destructive operations.

---

## Plugin author checklist

To maximize compatibility with NextClaw:

- include `openclaw.extensions` in `package.json`;
- include valid `openclaw.plugin.json` with stable `id` and `configSchema`;
- export `register` or `activate` synchronously (async registration promises are currently ignored with warning);
- avoid unsupported registration APIs listed above.

---

## Troubleshooting quick map

- Plugin not found after install: run `nextclaw plugins list --verbose` and check source path.
- Plugin loaded but behavior missing: run `nextclaw plugins doctor` for unsupported capability warnings.
- Config appears missing: use `nextclaw config get plugins.entries.<id>.config --json`.
- Install conflicts: check duplicate IDs or reserved tool/channel/provider names in diagnostics.

---

## Related docs

- `docs/USAGE.md`
- `docs/designs/openclaw-plugin-compat.plan.md`
