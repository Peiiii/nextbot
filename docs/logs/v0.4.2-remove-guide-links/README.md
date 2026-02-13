# 2026-02-13 Remove channel guide links

## 背景 / 问题

- 当前还没有稳定的渠道教程文档
- 需要保留 guide 能力，但去掉具体链接

## 决策

- API meta 保留 `tutorialUrl` 字段能力，但不再提供具体链接
- 移除尚不成熟的 `docs/channels/README.md`

## 变更内容

- `buildConfigMeta` 不再填充 `tutorialUrl`
- 删除 `docs/channels/README.md`

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc

# smoke-check
NEXTCLAW_HOME=/tmp/nextclaw-remove-guides pnpm -C packages/nextclaw dev start --ui-port 18816 --frontend-port 5177
```

验收点：

- UI 渠道列表不再出现 Guide 链接
- API meta 返回的 channel 不包含有效 `tutorialUrl`

## 发布 / 部署

- 影响 npm 包发布，按 `docs/workflows/npm-release-process.md` 执行

## 影响范围 / 风险

- Breaking change? 否
- 回滚方式：恢复教程文档与 `tutorialUrl` 生成逻辑
