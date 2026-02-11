# 2026-02-11 移除 legacy 目录与命名关联

## 背景 / 问题

- 需要彻底移除 legacy 目录与命名的关联，避免默认路径或技能元信息混用

## 决策

- 仅保留 `~/.nextbot` 作为默认数据目录
- 内置技能与 bridge 文案统一改为 nextbot 命名

## 变更内容

- 用户可见变化
  - 默认数据目录仅 `~/.nextbot`（不再回退 `~/.nanobot`）
  - WhatsApp bridge 文案与默认 auth 目录改为 `~/.nextbot/whatsapp-auth`
  - 内置技能元信息与示例统一为 nextbot
- 关键实现点
  - `getDataPath` 去除 legacy 回退逻辑
  - skills metadata key 改为 `nextbot`

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextbot tsc
pnpm -C packages/nextbot lint
pnpm -C packages/nextbot build

# smoke-check（非仓库目录）
NEXTBOT_HOME=/tmp/nextbot-smoke pnpm -C /Users/peiwang/Projects/nextbot nextbot -- onboard
```

验收点：

- `onboard` 在 `/tmp/nextbot-smoke` 生成 config/workspace

## 发布 / 部署

- 本次未执行发布

## 影响范围 / 风险

- Breaking change：是（不再自动读取 `~/.nanobot`）
- 回滚方式：恢复 `getDataPath` 的 legacy 回退逻辑
