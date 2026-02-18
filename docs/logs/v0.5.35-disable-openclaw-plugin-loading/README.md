# 2026-02-18 Disable OpenClaw plugin loading by default

## 迭代完成说明

- 目标：去掉运行时对 OpenClaw 插件的自动加载行为。
- 改动：在 `packages/nextclaw-openclaw-compat/src/plugins/loader.ts` 的 `loadOpenClawPlugins` 增加默认短路逻辑。
- 结果：默认情况下（未设置 `NEXTCLAW_ENABLE_OPENCLAW_PLUGINS=1`）直接返回空插件注册表，不再发现/加载任何 OpenClaw 插件。
- 兼容：保留显式开关 `NEXTCLAW_ENABLE_OPENCLAW_PLUGINS=1`，便于临时回归验证。

## 测试 / 验证 / 验收

### 构建与静态校验

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm build
pnpm lint
pnpm tsc
```

结果：均通过（`lint` 仅有仓库已有 warning，无新增 error）。

### 冒烟测试（隔离目录，不写仓库）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
TMP_HOME=$(mktemp -d /tmp/nextclaw-smoke-home.XXXXXX)
TMP_PLUGIN=$(mktemp -d /tmp/nextclaw-smoke-plugin.XXXXXX)

# 构造临时插件并写入 plugins.load.paths[0]
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js init
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config set 'plugins.load.paths[0]' "$TMP_PLUGIN"

# 对比：显式开启 vs 默认禁用
NEXTCLAW_HOME="$TMP_HOME" NEXTCLAW_ENABLE_OPENCLAW_PLUGINS=1 node packages/nextclaw/dist/cli/index.js plugins list --json
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js plugins list --json
```

验收点：
- 开启时可发现插件（示例计数 `enabledPluginCount=2`）。
- 默认禁用时插件计数为 `0`（示例 `disabledPluginCount=0`）。

## 发布 / 部署方式

- 代码合并后按既有 NPM 发布流程执行（changeset/version/publish）。
- 本次仅改变插件加载默认行为，无数据库或后端迁移步骤。
