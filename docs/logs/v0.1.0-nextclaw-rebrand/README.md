# 2026-02-12 nextclaw 重命名与发布

## 背景 / 问题

- 项目需要更名为 nextclaw，并完成 npm 发布与文档适配

## 决策

- 项目名统一更改为 nextclaw
- 默认数据目录改为 `~/.nextclaw`，兼容 `NEXTBOT_HOME` 与旧目录 `~/.nextbot`
- npm 包发布为 `nextclaw`，CLI 命令为 `nextclaw`

## 变更内容

- 用户可见变化
  - CLI 名称与提示文案改为 nextclaw
  - 默认配置路径改为 `~/.nextclaw/config.json`
  - 默认工作区改为 `~/.nextclaw/workspace`
- 关键实现点
  - `packages/nextbot` 迁移到 `packages/nextclaw`
  - 兼容旧环境变量与旧目录
  - bridge/skills/文档同步更新
  - 增加 changeset 与 release 脚本

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-smoke-2 pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev onboard
```

验收点：

- build/lint/tsc 全部通过
- `onboard` 正常生成 config/workspace，并提示 nextclaw 后续步骤

## 发布 / 部署

```bash
pnpm -C /Users/peiwang/Projects/nextbot release:version
pnpm -C /Users/peiwang/Projects/nextbot release:publish
npm view nextclaw version
```

发布结果：

- `nextclaw@0.1.0` 已发布至 npm

## 影响范围 / 风险

- Breaking change：可能（默认数据目录切换为 `~/.nextclaw`）
- 兼容策略：仍支持 `NEXTBOT_HOME` 与 `~/.nextbot` 旧目录
