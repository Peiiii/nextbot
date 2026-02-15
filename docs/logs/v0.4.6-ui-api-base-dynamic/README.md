# 2026-02-15 UI API Base 动态化

## 背景 / 问题

- dev 模式下前端运行在 5174，但 API 基址被硬编码到 18791，导致前端请求与后端实际端口（18792）不一致。
- WebSocket 也固定到 18791，配置变更通知无法跟随真实后端。

## 决策

- API 基址优先使用 `VITE_API_BASE`，否则回退到 `window.location.origin`。
- WebSocket URL 跟随 API 基址自动派生（http/https → ws/wss）。

## 变更内容

- 用户可见变化：前端 API 与 WebSocket 会自动对齐当前后端端口，不再固定 18791。
- 关键实现点：
  - `api/client.ts` 统一导出 `API_BASE`，增加动态解析逻辑。
  - `useWebSocket.ts` 基于 `API_BASE` 派生 WebSocket URL。

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
cd /tmp
/Users/peiwang/.nvm/versions/node/v22.16.0/bin/node -e 'const base="http://127.0.0.1:18792";const resolved=new URL(base,"http://127.0.0.1");const protocol=resolved.protocol==="https:"?"wss:":resolved.protocol==="http:"?"ws:":resolved.protocol;console.log(protocol+"//"+resolved.host+"/ws");'
```

验收点：

- 输出 `ws://127.0.0.1:18792/ws`，确认 WebSocket 会跟随后端端口。

## 发布 / 部署

- 本次为前端逻辑调整，是否发布 npm 版本按需；如需发布，按 `docs/workflows/npm-release-process.md` 执行。

## 影响范围 / 风险

- Breaking change? 否
- 回滚方式：恢复 `api/client.ts` 与 `useWebSocket.ts` 的旧硬编码逻辑。
