# v0.5.18-config-schema-hints-align

## 做了什么
- 引入 OpenClaw 风格的 `config schema + uiHints` 机制（基于 zod + zod-to-json-schema）。
- 新增 config redaction 基础能力：按 `uiHints`/路径敏感规则对配置快照做脱敏。
- Gateway `config.schema` 返回真实 JSON Schema + hints，并用于 config.apply/patch 返回值脱敏。
- UI Server 新增 `/api/config/schema` 输出 schema + hints（机制对齐，前端展示不变）。
- `getPackageVersion` 下沉到 core，CLI 统一复用，避免重复实现。

## 验证
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm build`
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm lint`
  - 仅警告：`packages/nextclaw-core/src/channels/mochat.ts`、`packages/nextclaw/src/cli/runtime.ts` 超过行数限制
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm tsc`
- 冒烟（非仓库目录）：
  - `node --input-type=module -e "import('file:///Users/peiwang/Projects/nextbot/packages/nextclaw-core/dist/index.js').then(m=>{const res=m.buildConfigSchema();console.log(res.schema && res.uiHints ? 'schema_ok' : 'schema_missing');})"`
  - 预期：输出 `schema_ok`

## 发布/部署
- 如需发布 npm：按 `docs/workflows/npm-release-process.md` 走完整流程。
