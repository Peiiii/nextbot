# 2026-02-19 v0.6.29-silent-reply-policy-centralization

## 迭代完成说明

- 目标：将 `NO_REPLY` 语义从“分散判断”收敛为统一策略，并保持能力不受限（不新增协作限制/路由限制）。
- 本次完成：
  - 新增统一静默回复策略模块：
    - `packages/nextclaw-core/src/agent/silent-reply-policy.ts`
  - Agent 输出收敛到统一策略（两条主链路）：
    - `packages/nextclaw-core/src/agent/loop.ts`
  - 渠道发送前再做统一策略兜底（执行层）：
    - `packages/nextclaw-core/src/channels/manager.ts`
- 设计要点：
  - 不改变能力边界，不增加“只允许 mention/只允许 reply”类限制。
  - 仅统一 `NO_REPLY` 与空消息判定逻辑，减少重复实现造成的行为漂移。

## 测试 / 验证 / 验收方式

### 构建与静态验证

```bash
pnpm build
pnpm lint
pnpm tsc
```

验收点：
- 全仓构建、lint、类型检查通过。
- 无因本次改动新增的 error。

### 冒烟验证（隔离目录）

```bash
TMP_HOME=$(mktemp -d /tmp/nextclaw-no-reply-policy.XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels status
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js plugins list --enabled
rm -rf "$TMP_HOME"
```

验收点：
- 运行链路正常，渠道插件与命令面无回归。

## 发布 / 部署方式

执行流程：

```bash
pnpm release:version
pnpm release:publish
```

闭环说明：
- 远程 migration：不适用（无后端/数据库变更）。
- 服务部署：不适用（npm 包发布流程）。
- 线上 API 冒烟：不适用（无后端 API 发布）。
