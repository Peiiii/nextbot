# 协议同构，内核异构：执行清单（NextClaw × OpenClaw）

目标：对齐生态兼容层（协议），保留 NextClaw 内部实现独立性（内核）。

## P0（必须完全对齐）

- [x] 消息/附件契约统一为结构化附件（`attachments[]`）
  - [x] 总线层引入 `InboundAttachment`（`path/url/mime/status/errorCode`）
  - [x] 入站消息改为 `InboundMessage.attachments`
  - [x] Agent 上下文注入改为消费 `attachments[]`
- [x] 错误语义统一（附件入站）
  - [x] 统一错误码：`too_large` / `download_failed` / `http_error` / `invalid_payload`
  - [x] 错误写入 metadata 诊断，不再污染用户正文
  - [x] 下载失败保留远端 URL 回退（`remote-only`）
- [x] 配置语义统一（Discord 媒体链路）
  - [x] `channels.discord.mediaMaxMb`
  - [x] `channels.discord.proxy`
  - [x] schema + label + help + USAGE 文档同步
- [x] Provider 输入语义统一（Responses 图片块）
  - [x] `image_url` → `input_image` 规范映射
  - [x] `text` → `input_text` 规范映射

## P1（接口同构，按需补齐）

- [x] OpenClaw 插件 API 入口保持同构（`openclaw/plugin-sdk` 兼容层）
- [ ] OpenClaw 全能力接口（hook/http/cli/service）运行时能力 1:1（当前保留兼容层约束）

## P2（可选增强）

- [ ] 复用 OpenClaw 的媒体理解能力层（image/audio/video）
- [ ] 多模态策略中心化（按 provider/model 能力动态决策）

## 本次落地原则

- 协议同构：契约、错误码、配置键、输入块语义对齐。
- 内核异构：不复制 OpenClaw 内部调度与模块组织，保持 NextClaw 代码最小复杂度。
