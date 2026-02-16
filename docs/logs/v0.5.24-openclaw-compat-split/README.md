# 2026-02-16 OpenClaw 兼容层独立包拆分（长期架构一次到位）

## 背景 / 问题

- 之前 OpenClaw 插件兼容逻辑直接位于 `@nextclaw/core`，会持续增加 core 的职责与依赖体积。
- 项目目标是长期可维护，核心层应保持稳定与轻量；兼容层应可独立演进与发布。

## 决策

- 新增独立包 `@nextclaw/openclaw-compat` 承载 OpenClaw 兼容能力（发现、加载、安装、卸载、manifest/schema/hints 合并等）。
- `@nextclaw/core` 仅保留通用扩展 SPI：`ExtensionRegistry`、`ExtensionToolAdapter`、`ExtensionChannelAdapter`。
- CLI/UI 都改为依赖 compat 包实现插件能力；core 不再直接依赖 OpenClaw 专有实现。

## 变更内容

- 架构拆分：
  - 新增 `packages/nextclaw-openclaw-compat`（含 `src/plugins/*`、`src/plugin-sdk/*`、独立 build/lint/tsc）。
  - 移除 core 内 OpenClaw 专有目录，新增 core 通用扩展层：
    - `packages/nextclaw-core/src/extensions/types.ts`
    - `packages/nextclaw-core/src/extensions/tool-adapter.ts`
    - `packages/nextclaw-core/src/channels/extension_channel.ts`
- 运行时接线：
  - `AgentLoop` 从 `pluginRegistry` 切换为 `extensionRegistry`。
  - `ChannelManager` 从 plugin channels 切换为 extension channels。
- CLI 能力：
  - 保持/补齐 `plugins list/info/install/enable/disable/uninstall/doctor`，行为对齐 OpenClaw 用户体验。
- UI 配置：
  - schema/hints 元数据来源切换到 compat 包。
- 依赖与脚本：
  - 根 workspace `build/lint/tsc` 纳入新包。
  - compat 相关依赖（`ajv/jiti/jszip/tar`）迁移到新包；core 依赖减重。

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm tsc

# smoke: path plugin
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-split/home \
  node packages/nextclaw/dist/cli/index.js plugins install /tmp/nextclaw-smoke-openclaw-compat-split/demo-plugin
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-split/home \
  node packages/nextclaw/dist/cli/index.js plugins info demo-plugin
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-split/home \
  node packages/nextclaw/dist/cli/index.js plugins uninstall demo-plugin --dry-run
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-split/home \
  node packages/nextclaw/dist/cli/index.js plugins uninstall demo-plugin --force

# smoke: archive plugin
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-archive-split/home \
  node packages/nextclaw/dist/cli/index.js plugins install /tmp/nextclaw-smoke-openclaw-compat-archive-split/src/demo-plugin/*.tgz
NEXTCLAW_HOME=/tmp/nextclaw-smoke-openclaw-compat-archive-split/home \
  node packages/nextclaw/dist/cli/index.js plugins uninstall demo-plugin-archive --force
```

验收点：

- `build/lint/tsc` 全通过（允许既有 warning，无新增 error）。
- 插件安装、查询、启停、卸载链路在 path 与 archive 两种来源都可用。
- 卸载 `--dry-run` 不落盘，`--force` 可直接执行。
- 插件配置仍位于 `plugins.entries.<id>.config`，UI hints 可被读取。

## 发布 / 部署

- 本次涉及包结构与依赖变化，发布时需要至少覆盖：
  - `@nextclaw/core`
  - `@nextclaw/openclaw-compat`（新包）
  - `@nextclaw/server`
  - `nextclaw`
- 按 `docs/workflows/npm-release-process.md` 执行 changeset/version/publish；确保 consumer 包依赖指向已发布版本。

## 影响范围 / 风险

- Breaking change：**无用户命令级 breaking change**（CLI 用法保持兼容）。
- 风险：发布顺序错误会导致依赖版本不可解析。
- 回滚方式：回退到拆分前 tag 或在紧急情况下临时将 consumer 包依赖锁回旧版本并重新发布。
