# 2026-02-12 README docs section cleanup

## 背景 / 问题

- README 中不应包含迭代日志链接

## 决策

- 从 README 的 Docs 区域移除迭代日志链接

## 变更内容

- 更新根目录 `README.md`

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-readme-docs-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev start --ui-port 18811 > /tmp/nextclaw-readme-docs-smoke.log 2>&1
sleep 2
curl -s http://127.0.0.1:18811/api/health
NEXTCLAW_HOME=/tmp/nextclaw-readme-docs-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev stop
```

验收点：

- build/lint/tsc 全部通过
- `/api/health` 返回 ok

## 发布 / 部署

- 本次未发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
