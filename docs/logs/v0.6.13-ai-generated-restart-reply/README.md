# 2026-02-19 AI-generated Restart Reply

## 目标

- 将“重启完成通知”从固定模板消息改为 **唤醒 AI 后由 AI 生成回复**。
- 保持实现简洁：不再走固定文案直发路径。

## 变更

1. 在 `wakeFromRestartSentinel` 中，不再直接发送固定文本。
2. 读取重启哨兵后，改为向总线发布 `system` 入站消息，唤醒 `AgentLoop`。
3. 由 AI 生成“我已重启完成”类回复并发回原会话。

## 关键文件

- `packages/nextclaw/src/cli/commands/service.ts`

## 验证

### 1) 构建链

```bash
pnpm build
pnpm lint
pnpm tsc
```

### 2) /tmp 隔离冒烟

```bash
pnpm -C packages/nextclaw exec tsx /tmp/nextclaw-restart-ai-wake-smoke.ts
```

### 3) 本机真实 Discord E2E

- 触发重启后，`sessions/*.jsonl` 新增一条 `[System: restart-sentinel] ...` 的系统输入。
- 随后新增一条由模型生成的 assistant 回复（非固定模板直发）。
- 本次实测回复示例：`网关重启成功！我在线了 ✅`。
