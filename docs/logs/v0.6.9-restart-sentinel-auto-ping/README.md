# 2026-02-19 Restart Sentinel Auto-Ping (OpenClaw parity)

## 背景

- 现状：NextClaw 在 `gateway(action="update.run")` 后可自重启，但重启后不会自动通知用户会话；失败场景下也缺少可恢复“系统事件”记忆。
- 目标：对齐 OpenClaw 的“重启哨兵 + 启动后自动回执 + 失败回退”机制，且保持最小复杂度。

## 设计要点

1. 重启前持久化 `restart-sentinel`（包含 `sessionKey`、投递上下文、note）。
2. 网关启动后消费哨兵并自动回执到最后活跃会话。
3. 回执失败时，将事件写入会话 `pending_system_events`，在下一次用户消息时注入为 `[System Message]`。
4. `gateway` 工具自动继承当前会话 `sessionKey`，避免模型遗漏参数。

## 关键改动

- `packages/nextclaw/src/cli/restart-sentinel.ts`
  - 新增哨兵读写/消费、消息格式化、会话系统事件入队。
- `packages/nextclaw/src/cli/gateway/controller.ts`
  - `config.apply` / `config.patch` / `update.run` 在触发重启前写入哨兵。
  - 从 `SessionManager` 解析投递上下文（channel/chatId/replyTo/accountId/metadata）。
- `packages/nextclaw/src/cli/commands/service.ts`
  - 网关启动后消费哨兵并自动发送回执。
  - 发送失败回退为会话 `pending_system_events`。
- `packages/nextclaw-core/src/agent/tools/gateway.ts`
  - 新增会话上下文注入，默认携带当前 `sessionKey`。
- `packages/nextclaw-core/src/agent/loop.ts`
  - 记录 `last_delivery_context`。
  - 消费并注入 `pending_system_events` 为 `[System Message]`。
- 文档与提示词
  - `packages/nextclaw-core/src/agent/context.ts`
  - `packages/nextclaw-core/src/agent/skills/nextclaw-self-manage/SKILL.md`
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`

## 验证计划

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm build
pnpm lint
pnpm tsc
```

并补充 `/tmp` 隔离冒烟：
- 哨兵写入 + 启动消费后自动产出回执消息
- 回退系统事件可在下一次消息注入为 `[System Message]`

## 发布计划

- 采用 changeset patch：`@nextclaw/core` + `nextclaw`
- 执行 `pnpm release:version && pnpm release:publish`
