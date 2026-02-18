# 2026-02-18 Agent runtime tuning/tools hot apply

## 背景 / 问题

- 已支持 `providers.*`、`channels.*`、`agents.defaults.model` 等热应用，但以下项仍落在重启边界：
  - `agents.defaults.maxTokens`
  - `agents.defaults.temperature`
  - `tools.*`
- 这些配置与 agent 运行参数/工具运行参数高度相关，重启体验不一致。

## 决策

- 将 `maxTokens`、`temperature`、`tools.*` 归入 `reload-agent` 路径，不引入新 reloader。
- 保持边界清晰：`plugins.*` 仍为 restart-required（插件生命周期/注册解绑复杂度高）。
- 以可维护性优先：通过 `AgentLoop.applyRuntimeConfig` 单点收敛运行时更新。

## 变更内容

- 用户可见变化：
  - 运行中的网关在修改 `agents.defaults.maxTokens` / `agents.defaults.temperature` 后会立即生效，无需重启。
  - 运行中的网关在修改 `tools.web.search.*`、`tools.exec.*`、`tools.restrictToWorkspace` 后会立即生效，无需重启。
- 关键实现点：
  - `packages/nextclaw-core/src/config/reload.ts`
    - 将 `agents.defaults.maxTokens`、`agents.defaults.temperature`、`tools` 从 `restart-required` 调整为 `reload-agent`。
  - `packages/nextclaw-core/src/agent/loop.ts`
    - `applyRuntimeConfig` 增加 `maxTokens/temperature` 运行时更新。
    - 新增 `refreshRuntimeTools()`，在 tools 配置更新后重建默认工具与扩展工具注册。
    - 主 agent 的 provider `chat(...)` 请求增加 `maxTokens/temperature` 透传。
  - `packages/nextclaw-core/src/agent/subagent.ts`
    - 子代理运行时选项增加 `maxTokens/temperature`。
    - 子代理 provider `chat(...)` 请求增加 `maxTokens/temperature` 透传。
  - `packages/nextclaw/src/cli/runtime.ts`
    - 创建 `AgentLoop` 时补齐 `model/maxIterations/maxTokens/temperature` 初始化参数。
    - `config set/unset` 改为按 `diffConfigPaths + buildReloadPlan` 判定，仅在命中 `restart-required` 时才触发重启。

## 验证（怎么确认符合预期）

```bash
# Node 环境
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use default

# 静态验证
pnpm -C packages/nextclaw-core build
pnpm -C packages/nextclaw-core lint
pnpm -C packages/nextclaw-core tsc
pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc
```

建议冒烟（隔离目录）：

```bash
export NEXTCLAW_HOME="$(mktemp -d /tmp/nextclaw-smoke-XXXXXX)"
node packages/nextclaw/dist/cli/index.js init --force
node packages/nextclaw/dist/cli/index.js start --ui-host 127.0.0.1 --ui-port 19891

# 通过 UI 或 config set 修改：
# 1) agents.defaults.maxTokens
# 2) agents.defaults.temperature
# 3) tools.web.search.apiKey / tools.exec.timeout / tools.restrictToWorkspace
# 观察日志出现：Config reload: agent defaults applied.

node packages/nextclaw/dist/cli/index.js stop
```

验收点：

- 修改上述配置后，不触发“需要重启”提示。
- 新请求可按最新 `maxTokens/temperature/tools` 行为执行。
- `plugins.*` 变更仍走自动重启/手动重启路径（边界保持不变）。

## 发布 / 部署

- 如随 npm 包发布，按 `docs/workflows/npm-release-process.md` 执行：
  - `pnpm changeset`
  - `pnpm release:check`
  - `pnpm release:version`
  - `pnpm release`

## 影响范围 / 风险

- Breaking change? 否。
- 风险点：tools 运行时更新通过重建工具注册表实现，若未来新增“有内部状态”的工具，需评估重建时状态迁移策略。
