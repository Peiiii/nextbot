# 2026-02-11 开发态 CLI 快捷入口

## 背景 / 问题

- 开发阶段需要更接近 openclaw 的体验：`pnpm <命令>` 直接跑 CLI

## 决策

- 在仓库根新增 `pnpm nextbot` 脚本，直接透传到 `packages/nextbot` 的 dev CLI

## 变更内容

- 用户可见变化
  - 使用 `pnpm nextbot -- <subcommand>` 启动 CLI（开发态，免 build）
- 关键实现点
  - 根 `package.json` 增加脚本透传

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextbot tsc
pnpm -C packages/nextbot lint
pnpm -C packages/nextbot build

# smoke-check（非仓库目录）
NEXTBOT_HOME=/tmp/nextbot-smoke pnpm -C /Users/peiwang/Projects/nextbot nextbot -- onboard
```

验收点：

- `pnpm nextbot -- onboard` 正常生成 config/workspace

## 发布 / 部署

- 本次未执行发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
