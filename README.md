<div align="center">
  <h1>nextclaw</h1>
  <p>
    An easy-to-install, UI-first, OpenClaw-inspired agent runtime.
  </p>
  <p>
    <a href="https://www.npmjs.com/package/nextclaw"><img src="https://img.shields.io/npm/v/nextclaw" alt="npm"></a>
    <img src="https://img.shields.io/badge/node-\u226518-blue" alt="Node.js">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </p>
</div>

nextclaw focuses on the best possible installation and usage experience for an OpenClaw-style assistant.
It ships with a single-command startup flow, a built-in configuration UI, and a clean CLI for
multi-provider routing, channel integrations, and scheduled automation.

## Highlights

- One command to start everything: `nextclaw start` (gateway + UI backend + UI frontend)
- Built-in configuration UI (no extra setup required after npm install)
- OpenAI-compatible provider routing (OpenRouter, OpenAI, MiniMax, etc.)
- Channel integrations: Telegram, Discord, WhatsApp, Feishu, Mochat, DingTalk, Slack, Email, QQ
- Scheduled automation with Cron + Heartbeat
- Local tools: web search and command execution

## Install

```bash
npm i -g nextclaw
```

## Quick Start

1) Start everything

```bash
nextclaw start
```

2) Open the UI

```
http://127.0.0.1:18791
```

3) Configure your provider and model in the UI

The config file is stored at:

```
~/.nextclaw/config.json
```

## Provider Examples

OpenRouter (recommended for global users):

```json
{
  "providers": {
    "openrouter": { "apiKey": "sk-or-v1-xxx" }
  },
  "agents": {
    "defaults": { "model": "anthropic/claude-opus-4-5" }
  }
}
```

MiniMax (Mainland China):

```json
{
  "providers": {
    "minimax": {
      "apiKey": "sk-api-xxx",
      "apiBase": "https://api.minimaxi.com/v1"
    }
  },
  "agents": {
    "defaults": { "model": "minimax/MiniMax-M2.1" }
  }
}
```

Local vLLM:

```json
{
  "providers": {
    "vllm": {
      "apiKey": "dummy",
      "apiBase": "http://localhost:8000/v1"
    }
  },
  "agents": {
    "defaults": { "model": "meta-llama/Llama-3.1-8B-Instruct" }
  }
}
```

## Commands

- `nextclaw start` - start gateway + UI backend + UI frontend
- `nextclaw ui` - start UI backend + gateway
- `nextclaw gateway` - start gateway only (for channels)
- `nextclaw agent -m "hello"` - chat in CLI
- `nextclaw status` - show config + provider status
- `nextclaw channels status` - show enabled channels
- `nextclaw channels login` - QR login for supported channels

## Channels

| Channel | Setup |
|---------|-------|
| Telegram | Easy (bot token) |
| Discord | Easy (bot token + intents) |
| WhatsApp | Medium (QR login) |
| Feishu | Medium (app credentials) |
| Mochat | Medium (claw token + websocket) |
| DingTalk | Medium (app credentials) |
| Slack | Medium (bot + app tokens) |
| Email | Medium (IMAP/SMTP) |
| QQ | Easy (app credentials) |

## Docs

- `docs/USAGE.md` - configuration, providers, channels, cron, troubleshooting
- `docs/logs/` - iteration logs

## From Source

```bash
git clone https://github.com/Peiiii/nextclaw.git
cd nextclaw
pnpm install

# start all (dev)
# use --frontend to run the Vite dev server
pnpm -C packages/nextclaw dev start --frontend
```

## License

MIT
