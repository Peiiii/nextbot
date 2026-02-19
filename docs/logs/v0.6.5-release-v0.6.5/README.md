# 2026-02-19 Release v0.6.5

## 本次迭代完成内容

- 引入 Action Schema v1（配置 schema 返回 `actions` 元数据）。
- 新增统一动作执行接口：`POST /api/config/actions/:actionId/execute`。
- 将 Feishu 验证流程迁移为通用动作协议执行（去除前端 Feishu 专属调用路径）。
- 渠道配置表单补充 `channels.discord.allowBots`、`channels.slack.allowBots` 开关。
- 新增 RFC 文档并加入 README 文档入口：`docs/rfcs/action-schema-v1.md`。

## 验证与验收

### 1) 发布前全量校验

```bash
pnpm release:check
```

观察点：

- `build` / `lint` / `tsc` 全部通过。
- lint 仅有既有 max-lines 警告（非本次引入）。

### 2) 本地功能冒烟（隔离目录）

```bash
TMP_HOME=$(mktemp -d /tmp/nextclaw-action-smoke-XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js init --force
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js config get channels.discord.allowBots
node --input-type=module -e "import { buildConfigSchema } from './packages/nextclaw-core/dist/index.js'; console.log(buildConfigSchema().actions.map(a=>a.id));"
node --input-type=module -e "import { executeConfigAction } from './packages/nextclaw-server/dist/index.js'; const home=process.argv[1]; const res=await executeConfigAction(home + '/config.json','channels.feishu.verifyConnection',{scope:'channels.feishu'}); console.log(JSON.stringify(res));" "$TMP_HOME"
```

观察点：

- `channels.discord.allowBots` 默认值为 `false`。
- schema 中包含动作 `channels.feishu.verifyConnection`。
- 缺少凭证时返回 `ACTION_PRECONDITION_FAILED`。

### 3) 发布后线上冒烟（已发布包）

```bash
TMP_HOME=$(mktemp -d /tmp/nextclaw-release-smoke-XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" npx -y nextclaw@0.6.5 --version
NEXTCLAW_HOME="$TMP_HOME" npx -y nextclaw@0.6.5 init --force
NEXTCLAW_HOME="$TMP_HOME" npx -y nextclaw@0.6.5 config get channels.discord.allowBots
```

观察点：

- `nextclaw --version` 输出 `0.6.5`。
- 已发布包可正常初始化并读取新增配置项。

## 发布与部署

按 `docs/workflows/npm-release-process.md` 执行：

```bash
pnpm release:version
pnpm release:publish
```

发布结果：

- `nextclaw@0.6.5`
- `@nextclaw/core@0.6.5`
- `@nextclaw/server@0.4.2`
- `@nextclaw/ui@0.3.9`

发布验证：

```bash
npm view nextclaw version
npm view @nextclaw/core version
npm view @nextclaw/server version
npm view @nextclaw/ui version
```

输出版本分别为：`0.6.5`、`0.6.5`、`0.4.2`、`0.3.9`。

## 闭环说明

- 远程 migration：不适用（本次无后端数据库 schema 变更）。
- 线上关键能力冒烟：已执行（npm 已发布包安装/版本/配置读取）。
- 文档影响检查：已更新 `README.md`、`docs/nextclaw-ui-design-brief.md`、`docs/prd/nextclaw-ui-prd.md`、`docs/rfcs/action-schema-v1.md`。

