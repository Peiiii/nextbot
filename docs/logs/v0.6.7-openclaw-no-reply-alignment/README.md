# 2026-02-19 OpenClaw no-reply mechanism alignment

## 背景 / 问题

- 用户期望：收到消息时应支持“选择不回复”，并与 OpenClaw 机制对齐。
- 调研发现：
  - OpenClaw 使用 `NO_REPLY` 作为静默 token，并在回复归一化/投递前过滤（`parseReplyDirectives` + payload 过滤）。
  - NextClaw 已支持 `NO_REPLY`，但当模型返回空字符串时会被兜底成默认文案，导致“本应静默却仍回复”。

## 决策

- 采用最小复杂度对齐：
  - 保留现有 `NO_REPLY` 机制；
  - 移除空响应兜底文案，将“空最终回复”视为静默不回复；
  - 同步系统提示词，明确“低价值入站消息优先 `NO_REPLY`”。
- 不引入额外状态机/复杂策略引擎，避免维护负担上升。

## 变更内容

- `packages/nextclaw-core/src/agent/loop.ts`
  - `processMessage`：删除空回复兜底文案；当最终回复为空或 `NO_REPLY` 时直接 `return null`。
  - `processSystemMessage`：同样按“空回复或 `NO_REPLY` => 静默”处理。
- `packages/nextclaw-core/src/agent/context.ts`
  - Silent Replies 指令补充：入站渠道消息若无需有价值动作，优先 `NO_REPLY`。
  - 修正文案残留：`status/doctor/plugins/channels/...` → `status/doctor/channels/...`。
- `docs/USAGE.md`
  - 新增“Silent reply behavior”说明：`NO_REPLY` 或空最终回复将不会下发到渠道。

## 验证（怎么确认符合预期）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm build
pnpm lint
pnpm tsc

# 隔离冒烟（不写仓库）
TMP_HOME=$(mktemp -d /tmp/nextclaw-smoke-no-reply.XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js init
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js status --json
```

验收点：

- `build/lint/tsc` 全通过（`lint` 仅仓库既有 warning）。
- `AgentLoop` 代码路径不再生成“空回复默认文案”。
- 文档明确了静默不回复行为。

## 发布 / 部署

- 若需要发布 npm 包，按 `docs/workflows/npm-release-process.md` 执行。
- 本次仅为回复行为与文案对齐，不涉及数据库迁移。

## 影响范围 / 风险

- 行为变更：当模型返回空最终回复时，将静默而非发送默认文案。
- 风险较低：仅收敛输出，不影响工具调用与会话持久化主流程。
