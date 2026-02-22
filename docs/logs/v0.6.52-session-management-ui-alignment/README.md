# v0.6.52-session-management-ui-alignment

## 迭代完成说明（改了什么）

本次补齐 NextClaw 前端会话管理能力，目标是对齐并增强 OpenClaw 的会话运维体验：

- 新增 Sessions 页签与会话管理界面（筛选、历史查看、元信息修改、清空、删除）
  - [`packages/nextclaw-ui/src/components/config/SessionsConfig.tsx`](../../../packages/nextclaw-ui/src/components/config/SessionsConfig.tsx)
  - [`packages/nextclaw-ui/src/App.tsx`](../../../packages/nextclaw-ui/src/App.tsx)
  - [`packages/nextclaw-ui/src/components/layout/Sidebar.tsx`](../../../packages/nextclaw-ui/src/components/layout/Sidebar.tsx)
  - [`packages/nextclaw-ui/src/stores/ui.store.ts`](../../../packages/nextclaw-ui/src/stores/ui.store.ts)
- 新增 UI 会话 API：
  - `GET /api/sessions`
  - `GET /api/sessions/:key/history`
  - `PUT /api/sessions/:key`
  - `DELETE /api/sessions/:key`
  - [`packages/nextclaw-server/src/ui/router.ts`](../../../packages/nextclaw-server/src/ui/router.ts)
  - [`packages/nextclaw-server/src/ui/config.ts`](../../../packages/nextclaw-server/src/ui/config.ts)
- 补齐前后端会话类型定义与前端 hooks：
  - [`packages/nextclaw-server/src/ui/types.ts`](../../../packages/nextclaw-server/src/ui/types.ts)
  - [`packages/nextclaw-ui/src/api/types.ts`](../../../packages/nextclaw-ui/src/api/types.ts)
  - [`packages/nextclaw-ui/src/api/config.ts`](../../../packages/nextclaw-ui/src/api/config.ts)
  - [`packages/nextclaw-ui/src/hooks/useConfig.ts`](../../../packages/nextclaw-ui/src/hooks/useConfig.ts)
- 更新使用文档（新增 Session management 说明）：
  - [`docs/USAGE.md`](../../../docs/USAGE.md)

## 测试 / 验证 / 验收方式

- 工程验证：
  - `pnpm -C packages/nextclaw-server tsc`
  - `pnpm -C packages/nextclaw-ui tsc`
  - `pnpm -C packages/nextclaw-server lint`
  - `pnpm -C packages/nextclaw-ui lint`
- 冒烟验证（非仓库目录）：
  - `NEXTCLAW_HOME=/tmp/... pnpm -C packages/nextclaw-server exec tsx -e "...listSessions/getSessionHistory/patchSession/deleteSession..."`
  - 观察点：
    - `listTotal` 返回 > 0
    - `patchedLabel`/`patchedModel` 更新成功
    - `deleted` 为 `true`
  - 本次实测输出：`{"listTotal":1,"firstLabel":"old","histCount":2,"patchedLabel":"new-label","patchedModel":"openai/gpt-5.2-codex","deleted":true}`

### 用户/产品视角验收步骤

1. 打开 UI，确认左侧出现 `Sessions` 页签并可进入。
2. 在 Sessions 页可按关键字/活跃分钟筛选会话，列表可显示会话关键信息。
3. 选择会话查看历史消息，确认能看到最近消息窗口。
4. 修改会话标签与 preferred model 后保存，刷新后应保留。
5. 执行“清空历史”后再查看历史，消息应被清空。
6. 执行“删除会话”后会话应从列表消失。
7. 验收标准：会话运维可在 UI 独立完成，不需手改文件。

## 发布 / 部署方式

- 发布流程文档：[`docs/workflows/npm-release-process.md`](../../../docs/workflows/npm-release-process.md)
- 发布命令：
  1. `pnpm release:version`
  2. `pnpm release:publish`
- 本次已发布：
  - `nextclaw@0.6.29`
  - `@nextclaw/server@0.4.12`
  - `@nextclaw/ui@0.3.14`
- 线上核验：
  - `npm view nextclaw version` → `0.6.29`
  - `npm view @nextclaw/server version` → `0.4.12`
  - `npm view @nextclaw/ui version` → `0.3.14`
- 远程 migration：不适用（本次仅 UI/API 与运行时会话管理能力增强）。
