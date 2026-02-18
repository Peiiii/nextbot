# runtime.ts God Class 分解（增强版执行文档）

## 目标

将 `packages/nextclaw/src/cli/runtime.ts` 从单文件超大类拆解为可维护模块，保持 **零行为变更**（CLI 命令语义、返回、日志、副作用一致）。

## 现状问题

- `runtime.ts` 体量过大（~3k 行），`CliRuntime` 承担过多职责。
- 命令组（plugins/channels/cron/config/status/service）高耦合并集中在一个类。
- lint 告警集中在 `max-lines` 与 `max-lines-per-function`。

## 增强版策略

### P0. 保护栏（先行）

- 每阶段都执行：`pnpm build && pnpm lint && pnpm tsc`。
- 每阶段补最小 CLI 冒烟（使用 `NEXTCLAW_HOME=/tmp/...`，不污染仓库）。
- 输出一致性：保持已有错误文案与 exit 行为。

### P1. 底层可复用模块

- 提取 `config-path.ts`：
  - `isIndexSegment`
  - `parseConfigPath`
  - `parseRequiredConfigPath`
  - `parseConfigSetValue`
  - `getAtConfigPath`
  - `setAtConfigPath`
  - `unsetAtConfigPath`
- 提取 `missing-provider.ts`。
- 提取 `config-reloader.ts`。
- 提取 `types.ts`（CLI options 与诊断类型）。

### P2. 命令域拆分

- `commands/config.ts`
- `commands/plugins.ts`
- `commands/channels.ts`
- `commands/cron.ts`
- `commands/diagnostics.ts`
- `commands/service.ts`

以“依赖注入对象”连接共享能力（如 `requestRestart`、`getBridgeDir`、`makeProvider`），避免跨模块循环依赖。

### P3. 工作区与模板域拆分

- 提取 `workspace.ts`：
  - `createWorkspaceTemplates`
  - `seedBuiltinSkills`
  - `resolveBuiltinSkillsDir`
  - `resolveTemplateDir`
  - `getBridgeDir`

### P4. runtime.ts 瘦身

`runtime.ts` 仅保留：

- 构造器与生命周期协调（`RestartCoordinator`、`selfRelaunchArmed`）。
- 顶层命令入口（`init/start/stop/restart/serve/gateway/ui/agent/update`）。
- 对拆分模块的委托调用。

## 验收标准

- 行为验收：CLI 子命令输出与退出行为不回归。
- 工程验收：`build/lint/tsc` 通过（允许仓库已有 warning，不新增 error）。
- 结构验收：`runtime.ts` 体量显著下降，模块职责边界清晰。

## 风险与应对

- 风险：大规模搬移导致隐式依赖遗漏。
- 应对：
  - 严格按职责域迁移，不做业务逻辑改动。
  - 每迁移一个域立即编译验证。
  - 对高耦合路径（plugins+gateway）保持原有调用顺序不变。
