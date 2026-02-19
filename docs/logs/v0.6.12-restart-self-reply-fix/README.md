# 2026-02-19 Restart Self-Reply Fix

## 问题

- 用户本地 Discord 实测：让 AI “重启一下自己” 后，长时间无回执。
- 现象表现为：重启发生了，但用户通道没有收到“我已重启完成”的自动通知。

## 根因

1. `gateway.restart` 分支未透传 `sessionKey`，且未写重启哨兵。
2. AI 走 `exec` 执行 `nextclaw restart` 时，原实现不携带会话上下文。
3. 因缺失会话定位信息，重启后通知无法准确路由到原会话。

## 修复

1. `gateway.restart` 透传会话键并写哨兵。
2. `exec` 工具增加会话上下文透传（`NEXTCLAW_RUNTIME_SESSION_KEY/CHANNEL/CHAT_ID`）。
3. CLI `restart` 在 exec 场景下写入重启哨兵（`strategy=exec-tool`）。

## 关键文件

- `packages/nextclaw-core/src/agent/tools/gateway.ts`
- `packages/nextclaw/src/cli/gateway/controller.ts`
- `packages/nextclaw-core/src/agent/tools/shell.ts`
- `packages/nextclaw-core/src/agent/loop.ts`
- `packages/nextclaw/src/cli/runtime.ts`

## 验证

### 1) 构建链

```bash
pnpm build
pnpm lint
pnpm tsc
```

### 2) /tmp 隔离冒烟

```bash
pnpm -C packages/nextclaw exec tsx /tmp/nextclaw-restart-path-fix-smoke.ts
pnpm dlx tsx /tmp/nextclaw-restart-e2e-guard-smoke.ts
pnpm dlx tsx /tmp/nextclaw-restart-notify-smoke.ts
```

### 3) 本机真实 Discord E2E

- 在 exec 同款环境变量下触发：`NEXTCLAW_RUNTIME_SESSION_KEY=discord:<channelId> nextclaw restart`
- 观察：PID 变化、服务拉起成功、Discord 实际收到 `Gateway restart complete (cli.restart).`
