# 2026-02-12 用户视角 README 更新

## 背景 / 问题

- 需要面向用户的安装与使用说明，强调一键启动与 UI

## 决策

- README 改为用户视角，突出 npm 安装与 `nextclaw start`
- 保留基础配置示例与常用命令

## 变更内容

- 更新根目录 `README.md` 的结构与文案

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-readme-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev start --no-frontend --no-open --ui-port 18807 &
sleep 2
curl -s http://127.0.0.1:18807/api/health
pkill -f "nextclaw.*start" || true
```

验收点：

- build/lint/tsc 全部通过
- `/api/health` 返回 ok

## 发布 / 部署

- 本次未发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
