# nextclaw

nextclaw 是一个面向个人与小团队的轻量 AI 助手，提供 CLI、网关模式、多模型路由与多渠道接入，并内置可视化配置界面。

## 亮点

- 一键启动：`nextclaw start` 同时启动网关 + UI 后端 + UI 前端
- 多模型路由：兼容 OpenAI API 规范（OpenRouter / OpenAI / MiniMax 等）
- 多渠道集成：Telegram / Discord / WhatsApp / Feishu / Mochat / DingTalk / Slack / Email / QQ
- 自动化：Cron 定时任务 + Heartbeat 周期任务
- 本地工具：Web 搜索 + 本地命令执行

## 快速开始（推荐）

要求：Node.js >= 18

1) 安装

```bash
npm i -g nextclaw
```

2) 一键启动

```bash
nextclaw start
```

3) 打开浏览器

默认 UI 地址：

```
http://127.0.0.1:18791
```

首次启动会生成配置文件：`~/.nextclaw/config.json`。你可以在 UI 中配置模型与渠道。

## 基础配置示例

OpenRouter（推荐，全球可用）：

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

MiniMax（国内）：

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

## 常用命令

- `nextclaw start`：一键启动（网关 + UI 后端 + UI 前端）
- `nextclaw ui`：启动 UI 后端 + 网关
- `nextclaw gateway`：仅启动网关（用于渠道接入）
- `nextclaw agent -m "hello"`：CLI 直接对话
- `nextclaw status`：查看配置与模型状态
- `nextclaw channels status`：查看渠道启用状态
- `nextclaw channels login`：部分渠道扫码登录（桥接）

## 本地模型（vLLM）

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

## 渠道接入

启用渠道后，运行网关：

```bash
nextclaw gateway
```

详细配置请查看：`docs/USAGE.md`。

## 从源码开发

```bash
git clone https://github.com/Peiiii/nextclaw.git
cd nextclaw
pnpm install

# 一键启动（开发态）
pnpm -C packages/nextclaw dev start
```

## 文档

- `docs/USAGE.md`：配置、渠道、定时任务、排障
- `docs/logs/`：迭代记录

## License

MIT
