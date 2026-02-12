# 2026-02-12 Service manager (start/stop)

## 背景 / 问题

- `nextclaw start` 需要后台运行并输出引导链接
- 需要 `nextclaw stop` 关闭后台服务

## 决策

- `start` 改为后台服务管理器，新增 `serve` 前台运行
- 引入服务状态文件 + 日志文件

## 变更内容

- 新增服务管理逻辑（start/stop）
- 文档与命令清单更新

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-service-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev start --ui-port 18810 &
sleep 2
curl -s http://127.0.0.1:18810/api/health
NEXTCLAW_HOME=/tmp/nextclaw-service-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev stop
lsof -nP -iTCP:18810 -sTCP:LISTEN || true
```

验收点：

- build/lint/tsc 全部通过
- `/api/health` 返回 ok
- stop 后端口不再监听

## 发布 / 部署

- 本次需发布 npm 包

## 影响范围 / 风险

- Breaking change：start 由前台改为后台
- 风险：需要通过 stop 释放后台进程
