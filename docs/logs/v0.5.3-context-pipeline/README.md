# 2026-02-15 Context Pipeline Alignment

## 背景 / 问题

- NextClaw 当前上下文加载仅包含少量 bootstrap 文件且缺乏截断策略
- Cron/Heartbeat 等非主对话场景使用同样上下文，容易冗余
- MEMORY.md 模板存在但未纳入统一机制，容易产生“文件存在但不生效”的体验

## 决策

- 对齐 openclaw 的“分层上下文 + 受控加载”机制，但不直接搬代码
- 引入 context 配置（bootstrap 列表、最小集、限额、memory 控制）
- 维持现有 MemoryStore + SkillsLoader 结构，仅增强读取策略与限额

## 变更内容

- 可配置的上下文装配：bootstrap 文件列表、最小集、心跳补充文件、per-file 与 total 截断
- System prompt 结构补齐 Tooling / Messaging / Memory Recall / Reply Tags 等章节
- Memory 读取同时支持根目录 MEMORY.md 与 memory/MEMORY.md
- 新增 memory_search / memory_get（记忆检索）
- 新增 sessions_list / sessions_history / sessions_send（会话工具）
- 新增 subagents 控制面（list/cancel）与 gateway 控制（status/reload_config）
- Reply tags 解析，支持 [[reply_to_current]] / [[reply_to:<id>]]
- 增加 NO_REPLY 机制（静默回复）并完善系统提示规则
- subagents 支持 steer/kill（软控制）
- message 工具支持 action/send、replyTo、silent
- gateway 增加 restart（进程退出触发重启）
- Cron/Heartbeat 会话使用最小 bootstrap 组合，减少无关上下文
- Workspace 模板初始化新增 memory/MEMORY.md

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm tsc

# smoke-check（非仓库目录）
cd /tmp
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" \\
  /Users/peiwang/Projects/nextbot/packages/nextclaw-core/node_modules/.bin/tsx -e \\
  "import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';\nimport { tmpdir } from 'node:os';\nimport { join } from 'node:path';\nimport { MemorySearchTool } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/agent/tools/memory.ts';\n(async () => {\n  const workspace = mkdtempSync(join(tmpdir(), 'nextclaw-'));\n  mkdirSync(join(workspace, 'memory'), { recursive: true });\n  writeFileSync(join(workspace, 'MEMORY.md'), 'foo');\n  writeFileSync(join(workspace, 'memory', '2026-02-15.md'), 'bar foo');\n  const tool = new MemorySearchTool(workspace);\n  const out = await tool.execute({ query: 'foo', limit: 2 });\n  console.log(out.includes('MEMORY.md') ? 'smoke-ok' : 'smoke-fail');\n})();"
```

验收点：

- build/lint/typecheck 均通过
- smoke-ok 输出出现
- memory_search 能检索到 MEMORY.md

## 发布 / 部署

- 如需发布 npm 包：按 `docs/workflows/npm-release-process.md` 执行

## 影响范围 / 风险

- Breaking change? 否
- 风险：上下文长度控制不当可能截断关键内容；可通过 config.agents.context 调整
