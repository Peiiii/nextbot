# 2026-02-18 UI host read-only semantics

## 背景 / 问题

- 产品策略已明确：NextClaw UI 必须默认并持续公网可访问。
- 目前文档/Schema 说明中 `ui.host` 仍容易被理解为可调项，导致用户误解。

## 决策

- 将 `ui.host` 在配置说明层面收口为“只读语义”。
- 统一默认示例和占位值为 `0.0.0.0`，与运行时行为一致。

## 变更内容

- `packages/nextclaw-core/src/config/schema.help.ts`
  - `ui.host` 帮助文案改为：运行时托管 + 只读语义。
- `packages/nextclaw-core/src/config/schema.labels.ts`
  - 标签改为 `UI Host (Read-only)`。
- `packages/nextclaw-core/src/config/schema.hints.ts`
  - `ConfigUiHint` 增加 `readOnly?: boolean`。
  - `ui.host` placeholder 改为 `0.0.0.0`。
  - 新增 `READ_ONLY_FIELDS`，将 `ui.host` 标记为 `readOnly: true`。
- `packages/nextclaw-core/src/config/schema.ts`
  - `UiConfigSchema.host` 默认值改为 `0.0.0.0`。
- `packages/nextclaw-server/src/ui/types.ts`
  - `ConfigUiHint` 补充 `readOnly?: boolean` 类型定义。
- `packages/nextclaw-ui/src/api/types.ts`
  - `ConfigUiHint` 补充 `readOnly?: boolean` 类型定义。
- `docs/USAGE.md`
  - UI 配置说明明确 `ui.host` 在实践中按只读对待。

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextclaw-core tsc
pnpm -C packages/nextclaw-server tsc
pnpm -C packages/nextclaw-ui tsc
pnpm -C packages/nextclaw tsc
pnpm release:check
```

验收点：

- Config schema hints 中 `ui.host.readOnly === true`。
- UI/Server 类型定义可识别 `readOnly` 字段。
- 文档不再暗示 `ui.host` 是推荐调节项。

## 发布 / 部署

- 已按 `docs/workflows/npm-release-process.md` 执行：
  - `pnpm release:version`
  - `pnpm release:publish`
- 发布结果：
  - `nextclaw@0.5.1`
  - `@nextclaw/core@0.5.1`
  - `@nextclaw/server@0.3.7`
  - `@nextclaw/ui@0.3.8`
- 新增 tags：
  - `nextclaw@0.5.1`
  - `@nextclaw/core@0.5.1`
  - `@nextclaw/server@0.3.7`
  - `@nextclaw/ui@0.3.8`
