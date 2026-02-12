# 2026-02-12 commands 文档清理

## 背景 / 问题

- `commands/commands.md` 是开发指令清单，不应记录产品 CLI 命令

## 决策

- 移除 `nextclaw start/stop` 的产品命令条目

## 变更内容

- 更新 `commands/commands.md`

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc
```

验收点：

- build/lint/tsc 全部通过

## 发布 / 部署

- 本次未发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
