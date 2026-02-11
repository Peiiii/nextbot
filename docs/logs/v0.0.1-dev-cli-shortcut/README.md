# 2026-02-11 开发态 CLI 快捷入口

## 背景 / 问题

- 开发阶段需要更接近 openclaw 的体验：`pnpm <命令>` 直接跑 CLI

## 决策

- 在仓库根新增 `pnpm nextclaw` 脚本，直接透传到 `packages/nextclaw` 的 dev CLI

## 变更内容

- 用户可见变化
  - 使用 `pnpm nextclaw -- <subcommand>` 启动 CLI（开发态，免 build）
- 关键实现点
  - 根 `package.json` 增加脚本透传

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextclaw tsc
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw build

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-smoke pnpm -C /Users/peiwang/Projects/nextclaw nextclaw -- onboard
```

验收点：

- `pnpm nextclaw -- onboard` 正常生成 config/workspace

## 发布 / 部署

- 本次未执行发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
