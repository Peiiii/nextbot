# 2026-02-21 v0.6.38-release-v0.6.22

## 迭代完成说明（改了什么）

- 执行了本次版本发布闭环（changeset version + publish + tag）。
- 覆盖并发布了与本轮变更相关的组件：
  - `@nextclaw/core@0.6.21`
  - `@nextclaw/channel-runtime@0.1.7`
  - `@nextclaw/openclaw-compat@0.1.14`
  - `@nextclaw/server@0.4.6`
  - `@nextclaw/ui@0.3.11`
  - `nextclaw@0.6.22`
  - `@nextclaw/channel-plugin-telegram@0.1.2`
  - `@nextclaw/channel-plugin-whatsapp@0.1.2`
  - `@nextclaw/channel-plugin-discord@0.1.2`
  - `@nextclaw/channel-plugin-feishu@0.1.2`
  - `@nextclaw/channel-plugin-mochat@0.1.2`
  - `@nextclaw/channel-plugin-dingtalk@0.1.2`
  - `@nextclaw/channel-plugin-email@0.1.2`
  - `@nextclaw/channel-plugin-slack@0.1.2`
  - `@nextclaw/channel-plugin-qq@0.1.2`
  - `@nextclaw/channel-plugin-wecom@0.1.2`（首次发布）

## 测试 / 验证 / 验收方式

### 发布前校验（自动执行）

```bash
pnpm release:check
# 等价包含：pnpm build && pnpm lint && pnpm tsc
```

结果：通过（lint 仅有仓库既有 warning，无新增 error）。

### 发布执行

```bash
pnpm release:publish
```

结果：发布成功，changeset 输出 `packages published successfully`，并创建对应 git tags。

## 发布 / 部署方式

- 本次按项目标准流程执行：
  1. `pnpm release:version`
  2. `pnpm release:publish`
- 本次发布为 NPM 包发布，不涉及后端数据库 migration（不适用）。
