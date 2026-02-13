# 2026-02-12 Channel tutorial links

## 背景 / 问题

- 前端渠道配置缺少官方/项目教程入口

## 决策

- 新增渠道教程文档
- API meta 为每个渠道提供 tutorialUrl
- 前端显示并支持跳转

## 变更内容

- 新增 `docs/channels/README.md`
- `GET /api/config/meta` 返回 `tutorialUrl`
- UI 渠道列表新增 Guide 入口

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-channel-guide-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev start --ui-port 18815 > /tmp/nextclaw-channel-guide-smoke.log 2>&1
sleep 2
curl -s http://127.0.0.1:18815/api/health
NEXTCLAW_HOME=/tmp/nextclaw-channel-guide-smoke pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev stop
```

验收点：

- build/lint/tsc 全部通过
- `/api/health` 返回 ok

## 发布 / 部署

- 本次未发布

## 影响范围 / 风险

- Breaking change：否
- 风险：无
