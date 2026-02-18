# 2026-02-18 runtime.ts God Class refactor

## 做了什么

- 将 `packages/nextclaw/src/cli/runtime.ts` 从单体 God Class 拆分为编排层 + 职责模块。
- 新增模块：
  - `packages/nextclaw/src/cli/types.ts`
  - `packages/nextclaw/src/cli/config-path.ts`
  - `packages/nextclaw/src/cli/config-reloader.ts`
  - `packages/nextclaw/src/cli/missing-provider.ts`
  - `packages/nextclaw/src/cli/workspace.ts`
  - `packages/nextclaw/src/cli/commands/config.ts`
  - `packages/nextclaw/src/cli/commands/plugins.ts`
  - `packages/nextclaw/src/cli/commands/channels.ts`
  - `packages/nextclaw/src/cli/commands/cron.ts`
  - `packages/nextclaw/src/cli/commands/diagnostics.ts`
  - `packages/nextclaw/src/cli/commands/service.ts`
- `runtime.ts` 仅保留：构造器、重启协调、顶层命令入口与委托调用。
- 重构原则：保持命令语义、日志输出和副作用行为不变（结构性调整）。

## 怎么验证

### 构建/静态检查

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm build
pnpm lint
pnpm tsc
```

结果：通过（lint 仅保留仓库已有 warning，无 error）。

### 冒烟验证（隔离目录）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
TMP_HOME=$(mktemp -d /tmp/nextclaw-refactor-smoke.XXXXXX)

NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js init
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config set 'agents.defaults.model' '"openai/gpt-4o-mini"' --json
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config get 'agents.defaults.model'
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js plugins list --json
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js status --json

rm -rf "$TMP_HOME"
```

观察点：
- `config get` 返回写入值 `openai/gpt-4o-mini`。
- `plugins list --json` 正常返回，默认 `plugins` 为空数组。
- `status --json` 正常输出结构化状态（`level/exitCode` 字段存在）。

## 怎么发布/部署

- 本次为结构重构，不涉及数据库/后端迁移。
- 若需要发包，按 `docs/workflows/npm-release-process.md` 执行：
  1. `pnpm changeset`
  2. `pnpm release:version`
  3. `pnpm release:publish`
