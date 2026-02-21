# 2026-02-21 v0.6.36-wecom-channel-support

## 迭代完成说明（改了什么）

- 新增企业微信（WeCom）内置渠道支持，贯通 `core schema -> channel runtime -> OpenClaw compat plugin loader -> UI 配置` 全链路。
- 新增 `@nextclaw/channel-plugin-wecom` 扩展包，采用与其他内置渠道一致的 OpenClaw-compatible 插件结构。
- 新增 `WeComChannel`：
  - 支持回调 URL 验证（`GET` 签名校验 + `echostr` 回显）
  - 支持接收入站消息（`POST` 签名校验、消息去重、发布入站总线）
  - 支持通过企业微信应用 API 发送文本消息（含 access_token 缓存）
- 更新配置与文案：
  - `channels.wecom` schema 字段（`corpId/agentId/secret/token/callbackPort/callbackPath/allowFrom`）
  - UI 配置表单字段、i18n 文案、logo 映射
  - README / USAGE 渠道文档增加 WeCom 配置示例

## 测试 / 验证 / 验收方式

### 1) 工程级验证（必跑）

```bash
pnpm build
pnpm lint
pnpm tsc
```

验收点：
- `nextclaw-core`、`channel-runtime`、`openclaw-compat`、`nextclaw-ui`、`nextclaw` 均通过构建/静态检查/类型检查。
- 新增 `wecom` 字段和渠道 ID 在编译链路中无类型错误。

### 2) CLI 冒烟（用户可见行为）

```bash
# 使用临时 HOME，避免写入仓库目录
TMP_HOME="$(mktemp -d /tmp/nextclaw-wecom-smoke.XXXXXX)"
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels status
rm -rf "$TMP_HOME"
```

观察点：
- 输出中包含 `WeCom` 渠道状态行。
- 测试数据写入临时目录，不污染仓库。

### 3) 本次实际执行结果（2026-02-21）

- 已执行 `pnpm build`：通过。
- 已执行 `pnpm lint`：通过（仅存在仓库既有 warning，未新增 error）。
- 已执行 `pnpm tsc`：通过。
- 已执行临时目录冒烟命令：通过，`channels status` 与 `Plugin Channels` 中均出现 `WeCom/wecom`。

## 发布 / 部署方式

- 本次为功能开发迭代，未执行 NPM 正式发布。
- 进入发布时按项目流程执行：
  1. `pnpm build && pnpm lint && pnpm tsc`
  2. `changeset version`
  3. `changeset publish`
- 本次变更仅新增渠道能力，不涉及后端数据库/远程 migration。
