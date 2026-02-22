# v0.6.50-ui-context-tokens-adaptation

## 迭代完成说明（改了什么）

本次补齐了 `contextTokens` 的前端配置能力，做到“默认预算 + 每个 Agent 覆盖”都可在 UI 完成。

- Runtime 页面新增默认输入预算编辑：`agents.defaults.contextTokens`
  - [`packages/nextclaw-ui/src/components/config/RuntimeConfig.tsx`](../../../packages/nextclaw-ui/src/components/config/RuntimeConfig.tsx)
- Runtime 页面 Agent 卡片新增每 Agent 输入预算编辑：`agents.list[*].contextTokens`
  - [`packages/nextclaw-ui/src/components/config/RuntimeConfig.tsx`](../../../packages/nextclaw-ui/src/components/config/RuntimeConfig.tsx)
- 前后端 UI 类型补齐 `contextTokens` 字段，避免类型层丢失
  - [`packages/nextclaw-ui/src/api/types.ts`](../../../packages/nextclaw-ui/src/api/types.ts)
  - [`packages/nextclaw-server/src/ui/types.ts`](../../../packages/nextclaw-server/src/ui/types.ts)
- Runtime API 支持更新 `agents.defaults.contextTokens` 并发布对应更新事件
  - [`packages/nextclaw-server/src/ui/config.ts`](../../../packages/nextclaw-server/src/ui/config.ts)
  - [`packages/nextclaw-server/src/ui/router.ts`](../../../packages/nextclaw-server/src/ui/router.ts)

## 测试 / 验证 / 验收方式

- 工程验证：
  - `pnpm build`
  - `pnpm lint`
  - `pnpm tsc`
- UI 行为验收：
  1. 打开 `Routing & Runtime` 页面，设置 Default Context Tokens 并保存。
  2. 在某个 Agent 行设置 Context Tokens Override 并保存。
  3. 刷新页面后确认值回显一致。
  4. 查看 `~/.nextclaw/config.json`，确认 `agents.defaults.contextTokens` 与 `agents.list[*].contextTokens` 已落盘。

### 用户/产品视角验收步骤

1. 用户在 UI 中只通过点击和输入完成 contextTokens 配置，不需要手改 JSON。
2. 用户为不同角色设置不同预算后，配置可稳定保存并回显。
3. 当默认预算调整时，新增/未覆盖角色自动继承默认值。
4. 验收通过标准：配置入口可发现、保存后结果一致、无类型或保存错误提示。

## 发布 / 部署方式

- 本次为前端与 UI API 适配迭代，按常规代码提交流程交付。
- 若需发版，按 [`docs/workflows/npm-release-process.md`](../../../docs/workflows/npm-release-process.md) 执行 changeset/version/publish。
- 远程 migration：不适用（无后端数据库结构变更）。
