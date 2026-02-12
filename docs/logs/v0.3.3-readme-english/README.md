# 2026-02-12 English README (user-facing)

## 背景 / 问题

- 需要面向用户的英文 README
- 目标定位为“更易安装、更易用的 OpenClaw 风格助手”

## 决策

- README 改为英文用户视角
- 排版风格对齐 nanobot 的视觉结构（居中标题 + 徽章）

## 变更内容

- 更新根目录 `README.md` 文案与结构

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-readme-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev start --no-frontend --no-open --ui-port 18808 &
sleep 2
curl -s http://127.0.0.1:18808/api/health
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
