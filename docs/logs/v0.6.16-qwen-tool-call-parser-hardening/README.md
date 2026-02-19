# 2026-02-19 v0.6.16-qwen-tool-call-parser-hardening

## 迭代完成说明

- 排查 `openrouter/qwen/qwen3.5-plus-02-15` 在工具调用阶段的异常回复风险。
- 在 `@nextclaw/core` 的 OpenAI 兼容 provider 中增强工具调用参数解析鲁棒性：
  - 支持 `tool_calls[].function.arguments` 为 object（不再强制当字符串 JSON 解析）。
  - 支持 `arguments` 为 fenced JSON（```json ... ```）。
  - 支持从半结构化字符串中抽取前导 JSON 对象。
  - 增加对 legacy `message.function_call` 的兼容解析。
- 保持现有 `wireApi` 策略语义不变，仅增强解析兼容层。

## 测试 / 验证 / 验收

### 真实模型复现验证（本机）

模型：`openrouter/qwen/qwen3.5-plus-02-15`

命令（示例）：

```bash
pnpm -C packages/nextclaw dev:build agent \
  -s cli:qwen-final-1 \
  -m "请调用 list_dir 工具读取 /Users/peiwang/.nextclaw/workspace，然后只回复 OK" \
  --model openrouter/qwen/qwen3.5-plus-02-15
```

观察点：
- 连续 3 轮返回 `OK`。
- 会话落盘中存在 `assistant.tool_calls` 与 `tool` 消息，确认工具调用执行链路正常。

### 稳定性样本

- 工具调用批量样本（10 轮）全部命中 `tool_calls + tool result`。
- 额外直连 OpenRouter API 样本（15/24 轮）未出现 `function_call`/参数 JSON 失配，但保留兼容分支用于上游形态波动。

### 开发校验

```bash
pnpm -C packages/nextclaw-core build
pnpm -C packages/nextclaw-core lint
pnpm -C packages/nextclaw-core tsc
```

结果：通过（仅仓库既有 lint warning，无新增 error）。

## 发布 / 部署方式

- 本次为本地修复与验证，未执行 npm 发布。
- 若需发布：按 `docs/workflows/npm-release-process.md` 执行 changeset/version/publish。

## 对 openclaw 的参考结论

- `openclaw` 侧存在对“工具调用被降级为文本”的用户可见清洗逻辑（如 `stripDowngradedToolCallText`、`stripMinimaxToolCallXml`），可用于减少异常文本泄露。
- 本次 NextClaw 采用的是更前置的“解析兼容增强”（在 provider 入口解析参数），优先保证工具调用链路可执行。
