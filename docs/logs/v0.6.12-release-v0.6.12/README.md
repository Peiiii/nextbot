# 2026-02-19 Release v0.6.12

## 发布目标

- 修复 AI 自触发重启后“无回执”问题，确保 Discord 场景可稳定回执。
- 对齐 OpenClaw 在重启回执链路的鲁棒性体验（保持低复杂度实现）。

## 发布范围

- `nextclaw@0.6.12`
- `@nextclaw/core@0.6.10`

未发布（版本未变更）：
- `@nextclaw/openclaw-compat@0.1.5`
- `@nextclaw/server@0.4.2`
- `@nextclaw/ui@0.3.9`

## 执行记录

```bash
pnpm release:version
pnpm release:publish
```

`release:publish` 内已执行：
- `pnpm build`
- `pnpm lint`
- `pnpm tsc`
- `pnpm changeset publish`
- `pnpm changeset tag`

## 验证结果

- 本地校验通过：`build/lint/tsc`（仅仓库既有 warning，无新增 error）。
- `/tmp` 隔离冒烟通过：
  - `pnpm -C packages/nextclaw exec tsx /tmp/nextclaw-restart-path-fix-smoke.ts`
  - `pnpm dlx tsx /tmp/nextclaw-restart-e2e-guard-smoke.ts`
  - `pnpm dlx tsx /tmp/nextclaw-restart-notify-smoke.ts`
- 本机真实 Discord E2E 通过：
  - 重启前后 PID 发生变化；
  - 频道命中回执 `Gateway restart complete (cli.restart).`。

## 文档复盘

- 本次已同步：
  - `docs/logs/v0.6.12-restart-self-reply-fix/README.md`
  - `docs/logs/v0.6.12-release-v0.6.12/README.md`
  - 发布日志索引
- 不涉及数据库/后端 migration（不适用）。
