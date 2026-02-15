# 2026-02-15 Provider 热加载

## 背景 / 问题

- 修改 provider 配置（如 wire_api）需要重启进程，影响体验与迭代效率。

## 决策

- 只在运行时引入 provider 热替换机制，不改存储层与会话结构。
- 保持其他 provider 逻辑不变，仅在 config 热更新时替换 provider 实例。

## 变更内容

- 用户可见变化：更新 providers 配置后无需重启即可生效（运行中的请求不受影响，后续请求使用新 provider）。
- 关键实现点：
  - 新增 ProviderManager 作为可替换容器（core）。
  - AgentLoop / Subagent 运行时动态获取 provider。
  - config reload 规则将 providers 标记为热加载，并在 CLI 中触发 provider 重建。

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
pnpm -C /Users/peiwang/Projects/nextbot build
pnpm -C /Users/peiwang/Projects/nextbot lint
pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
/Users/peiwang/.nvm/versions/node/v22.16.0/bin/node /tmp/nextclaw-provider-hot-swap.mjs
```

验收点：

- 冒烟脚本输出 `{"first":"A","second":"B"}`，表示 provider 已在运行时切换生效。

## 发布 / 部署

- 如需发布 npm 版本，按 `docs/workflows/npm-release-process.md` 执行。

## 影响范围 / 风险

- Breaking change? 否
- 回滚方式：回退此变更或恢复 providers 变更需重启的旧逻辑。
