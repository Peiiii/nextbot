---
name: nextclaw-self-manage
description: Self-manage NextClaw runtime via CLI guide. For install/start/status/doctor/channels/config/cron operations.
metadata: {"nextclaw":{"always":true,"emoji":"🛠️"}}
---

# NextClaw Self-Management

Use this skill whenever the user asks to manage NextClaw itself (service status, diagnostics, channels, config, cron, update).

## Source of Truth

Always use `USAGE.md` as the operation guide.

1. First try `${workspace}/USAGE.md`.
2. If missing, try repo docs path (for dev runs): `docs/USAGE.md`.
3. If both are missing, use `nextclaw --help` and `nextclaw <subcommand> --help` as fallback and tell the user that guide file is missing.

## Execution Rules

- Prefer machine-readable output: use `--json` when available.
- Prefer diagnostic closure after mutating operations:
  - run `nextclaw status --json`
  - and if needed `nextclaw doctor --json`
- For config changes that require restart, clearly state whether restart was auto-applied or still needed.
- Do not invent commands; only use commands listed in `USAGE.md` or CLI help.

## Minimal Self-Management Flow

1. Understand user intent and map to one concrete CLI action.
2. Execute command with safe parameters.
3. Verify with status/doctor.
4. Report outcome + next action (if any).

## Update Flow

When user explicitly asks to update NextClaw:

1. Trigger `gateway(action="update.run")` (or CLI `nextclaw update` when gateway tool is unavailable).
2. Expect a short restart window while service relaunches.
3. Expect NextClaw to auto-ping the last active session after restart.
4. Verify recovery with `nextclaw status --json` and `nextclaw doctor --json` when needed.
5. If auto-ping fails, explain fallback and ask user to send one retry message.

## High-frequency Intents

- Service health: `nextclaw status --json` / `nextclaw doctor --json`
- Lifecycle: `nextclaw start|restart|stop`
- Channels: `nextclaw channels status|login`
- Config: `nextclaw config get|set|unset`
- Automation: `nextclaw cron list|add|remove|enable|run`
