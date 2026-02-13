# 2026-02-13 Dev start uses dev ports

## 背景 / 问题

- 开发态执行 `pnpm nextclaw start` 时，前后端与应用态端口冲突风险高
- 需要确保 dev mode 明确使用独立端口，并以开发态方式启动前后端

## 决策

- dev runtime 下的 `start` 改为前台模式
- dev mode 默认端口：UI `18792`，frontend `5174`
- 端口冲突时自动递增选择可用端口并提示（含 IPv4/IPv6 loopback 检测）
- 当 UI 前端 dev server 正常启动时，UI API 不再挂载静态 UI

## 变更内容

- `start` 在 dev runtime 自动走前台模式，并默认启动 UI 前端 dev server
- `serve` 在 dev runtime 默认使用 dev 端口，避免与应用态冲突
- UI API 在 dev 前端启用时不再输出静态 UI
- UI API CORS 允许本地任意端口访问（便于 dev 端口自动切换）
- 文档更新 dev 运行说明与端口默认值

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc

# smoke-check
NEXTCLAW_HOME=/tmp/nextclaw-dev-start pnpm -C packages/nextclaw dev start
# 看到 UI API 输出为 18792，UI frontend 输出为 5174
curl -s http://127.0.0.1:18792/api/health
```

验收点：

- `dev start` 打印 UI API `18792` 与 UI frontend `5174`
- 前端 dev server 运行且可访问
- UI API `/api/health` 返回 ok

## 发布 / 部署

- 影响 npm 包发布，按 `docs/workflows/npm-release-process.md` 执行

## 影响范围 / 风险

- Breaking change? 否
- 回滚方式：恢复 `start` 的 dev 分支逻辑与端口默认值
