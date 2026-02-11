# 2026-02-12 去除兼容逻辑 + 品牌配置集中

## 背景 / 问题

- 需要移除 nextbot 兼容逻辑
- 代码中的产品名和路径希望集中配置，避免硬编码散落

## 决策

- 统一品牌配置到 `packages/nextclaw/src/config/brand.ts`
- 移除 `NEXTBOT_HOME` 与 `~/.nextbot` 的兼容回退
- bridge 侧引入同名品牌配置，避免硬编码

## 变更内容

- 用户可见变化
  - 仅支持 `NEXTCLAW_HOME` 与 `~/.nextclaw`
- 关键实现点
  - 新增 brand 常量并替换 CLI/渠道/工具内的硬编码名称
  - 移除 tmux skill、bridge、helpers 的兼容回退

## 验证（怎么确认符合预期）

```bash
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
NEXTCLAW_HOME=/tmp/nextclaw-smoke-3 pnpm -C /Users/peiwang/Projects/nextbot/packages/nextclaw dev onboard
```

验收点：

- build/lint/tsc 全部通过
- `onboard` 正常生成 config/workspace，输出不包含 nextbot 兼容提示

## 发布 / 部署

```bash
pnpm -C /Users/peiwang/Projects/nextbot release:version
pnpm -C /Users/peiwang/Projects/nextbot release:publish
npm view nextclaw version
```

发布结果：

- `nextclaw@0.2.0` 已发布至 npm

## 影响范围 / 风险

- Breaking change：是（移除 NEXTBOT_HOME 与旧目录回退）
- 回滚方式：恢复上一个支持兼容回退的版本
