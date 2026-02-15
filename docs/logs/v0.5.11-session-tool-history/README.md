# 2026-02-15 会话记录工具调用

## 背景 / 问题

- 工具调用/输出不会持久化到 session
- 用户回问“你执行了什么命令”时，AI 没有上下文可引用

## 决策

- 会话持久化工具调用与工具结果
- `getHistory` 返回包含 tool_calls / tool_call_id 的消息，保证后续对话可回忆

## 变更内容

- `packages/nextclaw-core/src/agent/loop.ts`
  - 在 session 中记录 tool_calls 与 tool 输出
  - 用户消息提前写入 session，避免顺序错乱
- `packages/nextclaw-core/src/session/manager.ts`
  - `getHistory()` 返回完整消息字段（role/content/tool_calls/tool_call_id/name）

## 验证（怎么确认符合预期）

```bash
# build / lint / tsc
pnpm build
pnpm lint
pnpm tsc

# smoke-check（非仓库目录）
export NEXTCLAW_HOME=/tmp/nextclaw-tool-history
rm -rf "$NEXTCLAW_HOME"
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" \
  /Users/peiwang/Projects/nextbot/packages/nextclaw-core/node_modules/.bin/tsx -e \
  "import { MessageBus } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/bus/queue.ts';\nimport { ProviderManager } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/providers/provider_manager.ts';\nimport { AgentLoop } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/agent/loop.ts';\nimport { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nclass FakeProvider {\n  calls = 0;\n  getDefaultModel(){ return 'fake'; }\n  async chat(){\n    this.calls += 1;\n    if (this.calls === 1) {\n      return { content: '', toolCalls: [{ id: 'call-1', name: 'exec', arguments: { command: 'echo tool-ok' } }], finishReason: 'tool_calls', usage: {} };\n    }\n    return { content: 'done', toolCalls: [], finishReason: 'stop', usage: {} };\n  }\n}\n(async () => {\n  const bus = new MessageBus();\n  const provider = new FakeProvider();\n  const loop = new AgentLoop({\n    bus,\n    providerManager: new ProviderManager(provider),\n    workspace: '/tmp/nextclaw-tool-history/workspace'\n  });\n  const out = await loop.processDirect({ content: 'run tool', sessionKey: 'cli:direct' });\n  const sessionsPath = join(process.env.NEXTCLAW_HOME, 'sessions', 'cli_direct.jsonl');\n  const data = readFileSync(sessionsPath, 'utf-8');\n  const ok = data.includes('\\"role\\":\\"tool\\"') && data.includes('\\"tool_call_id\\":\\"call-1\\"');\n  console.log(ok ? 'smoke-ok' : 'smoke-fail', out);\n})();"
```

验收点：

- build/tsc 通过
- lint 通过（若存在 max-lines 警告，记录即可）
- session 文件包含 tool 记录

## 发布 / 部署

迁移：

- 无后端/数据库变更，migration N/A

发布（按 `docs/workflows/npm-release-process.md`）：

```bash
pnpm changeset
pnpm release:version
pnpm release:publish
```

发布结果：

- `nextclaw@0.4.3`
- `nextclaw-core@0.4.3`

线上冒烟（npm）：

```bash
cd /tmp
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm view nextclaw@0.4.3 version
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm install -g nextclaw@0.4.3
export NEXTCLAW_HOME=/tmp/nextclaw-tool-history-release
rm -rf "$NEXTCLAW_HOME"
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" nextclaw init --force
ls -1 "$NEXTCLAW_HOME/workspace/skills" | head -n 5
```

观察点：

- `npm view` 输出 `0.4.3`
- `nextclaw init --force` 输出 `seeded`，且 `workspace/skills` 非空

## 影响范围 / 风险

- Breaking change：否
- 回滚方式：回退本次提交
