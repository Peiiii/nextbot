# 2026-02-18 Remove OpenClaw plugin system (permanent)

## 背景 / 问题

- 用户明确要求：永远不加载 OpenClaw plugins，并彻底删除相关代码。
- 现状存在 OpenClaw 插件兼容层、CLI 插件命令、运行时插件桥接与插件配置节点，导致维护面过大。

## 决策

- 做什么：
  - 完整移除 OpenClaw 插件系统（命令入口、运行时加载、server schema 注入、依赖包与文档入口）。
  - 保留内置渠道 / 工具 / cron / skills 主链路。
- 不做什么：
  - 不改历史日志与历史 changelog 记录（仅新增本次迭代日志）。

## 变更内容

- CLI 层：
  - 删除 `plugins` 命令组。
  - 删除 `channels add --channel ...`（该命令原为插件渠道配置入口）。
- 运行时：
  - `ServiceCommands` 不再加载任何 OpenClaw 插件注册表，不再注入插件 tool/channel/provider。
  - `CliRuntime agent` 不再注入插件扩展注册表与 messageToolHints 解析器。
- 配置与 schema：
  - `@nextclaw/core` 配置 schema 移除 `plugins` 节点与相关 hints/labels/help/reload 规则。
  - `@nextclaw/server` 配置 schema 接口移除插件元数据注入逻辑。
- 依赖与包：
  - 删除 `packages/nextclaw-openclaw-compat`。
  - `nextclaw` / `@nextclaw/server` 移除 `@nextclaw/openclaw-compat` 依赖。
  - root `build/lint/tsc` 脚本移除 compat 包构建链路。
- 文档：
  - 移除 `docs/openclaw-plugin-compat.md`。
  - 更新 `README.md`、`docs/USAGE.md`、`docs/prd/current-feature-overview.md`、`docs/prd/current-feature-list.md`、`nextclaw-self-manage` skill。

## 验证（怎么确认符合预期）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm build
pnpm lint
pnpm tsc

# smoke（隔离目录）
TMP_HOME=$(mktemp -d /tmp/nextclaw-smoke-no-openclaw.XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js --help
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels --help
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js plugins
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels add --channel test
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js init
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js status --json
```

验收点：

- `build/lint/tsc` 全部通过（`lint` 仅仓库既有 warning，无新增 error）。
- `channels --help` 仅保留 `status/login`。
- `plugins` 命令返回 `unknown command`（确认入口已删除）。
- `channels add` 返回 `unknown command 'add'`（确认插件渠道入口已删除）。
- `status --json` 正常输出（确认核心主链路可用）。

## 发布 / 部署

- 若需要发布 npm：按 `docs/workflows/npm-release-process.md` 执行 changeset → version → publish。
- 本次改动仅涉及 CLI / core / server 代码与文档，不涉及数据库迁移。

## 影响范围 / 风险

- Breaking change：是（删除 `nextclaw plugins *` 与 `channels add` 命令；移除 `plugins.*` 配置语义）。
- 回滚方式：回退到本次提交前版本（恢复 compat 包与对应 CLI/运行时链路）。
