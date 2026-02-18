# 2026-02-18 Release v0.6.1

## 迭代完成说明

- 按项目发布流程执行 `changeset -> version -> publish -> tag`。
- 本次实际发布包：
  - `nextclaw@0.6.1`
  - `@nextclaw/core@0.6.1`
  - `@nextclaw/server@0.4.1`
- 未发布包：
  - `@nextclaw/ui@0.3.8`（无版本变化，changeset 自动跳过）。
- 本轮改动重点：
  - 对齐 OpenClaw 的 bot 消息机制：新增 `channels.discord.allowBots`、`channels.slack.allowBots`（默认 `false`）。
  - Telegram 入站新增 `channel_post` 处理，支持频道场景下的 bot-to-bot 链路。
  - 同步 `docs/USAGE.md` 与 `packages/nextclaw/templates/USAGE.md` 的配置说明。

## 测试 / 验证 / 验收

### 发布前校验

```bash
export PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH"
pnpm release:check
```

结果：通过（仅保留仓库既有 lint warning：`packages/nextclaw-core/src/channels/mochat.ts` 行数告警）。

### 冒烟测试（隔离目录）

```bash
export PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH"
TMP_HOME=$(mktemp -d /tmp/nextclaw-release-botflow-smoke.XXXXXX)

NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config get channels.discord.allowBots
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config get channels.slack.allowBots
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels status

rm -rf "$TMP_HOME"
```

观察点：

- 默认值输出：`channels.discord.allowBots=false`、`channels.slack.allowBots=false`。
- CLI `channels status` 可正常返回各通道状态。

### 发布后验收

```bash
export PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH"

npm view nextclaw version
npm view @nextclaw/core version
npm view @nextclaw/server version

npm view nextclaw dist-tags --json
npm view @nextclaw/core dist-tags --json
npm view @nextclaw/server dist-tags --json
```

结果：

- 版本可查：`0.6.1 / 0.6.1 / 0.4.1`。
- `dist-tags.latest` 分别为：`nextclaw=0.6.1`、`@nextclaw/core=0.6.1`、`@nextclaw/server=0.4.1`。

## 发布 / 部署方式

- 已执行：
  1. `pnpm release:version`
  2. `pnpm release:publish`
- 自动创建 tag：
  - `nextclaw@0.6.1`
  - `@nextclaw/core@0.6.1`
  - `@nextclaw/server@0.4.1`

发布闭环（按规则）说明：

- 远程 migration：不适用（本次无后端/数据库 schema 变更）。
- 服务部署：不适用（本次仅 npm 包发布）。
- 线上验收：已通过 npm registry 版本与 dist-tag 验证。

## 发布后文档检查

- 已检查并同步：
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`
  - `docs/logs/README.md`
- 结论：本次功能与发布路径对应文档已补齐。
