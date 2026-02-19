# 2026-02-19 Release v0.6.9

## 发布目标

- 发布 OpenClaw 体验对齐能力：gateway 触发自升级/重启后自动回执“我已重启完成”。
- 在自动回执不可立即送达时，保证会话级“系统事件”可恢复，不丢失重启状态记忆。

## 发布范围

- `nextclaw@0.6.9`
- `@nextclaw/core@0.6.8`

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
- `/tmp` 隔离冒烟通过（用户可见行为）：
  - 重启哨兵可写入并在网关拉起后被消费。
  - 自动回执可回到原会话（含 Slack thread 元数据）。
  - 无法立即投递时，事件写入 `pending_system_events` 并在下一条消息注入 `[System Message]`。
- npm 发布成功：
  - `nextclaw@0.6.9`
  - `@nextclaw/core@0.6.8`
- npm 线上版本校验：
  - `npm view nextclaw version` -> `0.6.9`
  - `npm view @nextclaw/core version` -> `0.6.8`
- tag 创建成功：
  - `nextclaw@0.6.9`
  - `@nextclaw/core@0.6.8`

## 文档复盘

- 本次已同步：
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`
  - `packages/nextclaw-core/src/agent/skills/nextclaw-self-manage/SKILL.md`
  - `docs/logs/v0.6.9-restart-sentinel-auto-ping/README.md`
  - 发布日志索引
- 不涉及数据库/后端 migration（不适用）。
