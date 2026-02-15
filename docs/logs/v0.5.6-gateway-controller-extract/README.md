# 2026-02-15 Gateway Controller 抽离

## 背景 / 问题

- startGateway 仍包含大量 gateway controller 实现细节，过长且职责混杂

## 决策

- 把 gateway controller 的实现与辅助函数抽到独立模块
- startGateway 只负责编排与挂载 controller，行为保持不变

## 变更内容

- 新增 `packages/nextclaw/src/cli/gateway/controller.ts`：以 class 形式封装 controller 逻辑
- startGateway 使用 `createGatewayController(...)` 挂载 controller，实现与编排解耦

## 验证（怎么确认符合预期）

```bash
# build / lint / tsc
pnpm build
pnpm lint
pnpm tsc

# smoke-check（非仓库目录）
cd /tmp
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" \
  /Users/peiwang/Projects/nextbot/packages/nextclaw-core/node_modules/.bin/tsx -e \
  "import { SessionsListTool } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/agent/tools/sessions.ts';\nimport { SessionManager } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/session/manager.ts';\nconst manager = new SessionManager('/tmp/nextclaw-smoke');\nconst session = manager.getOrCreate('cli:direct');\nmanager.save(session);\nconst tool = new SessionsListTool(manager);\ntool.execute({ limit: 1 }).then((out) => {\n  const ok = out.includes('sessions');\n  console.log(ok ? 'smoke-ok' : 'smoke-fail');\n});"
```

验收点：

- build/lint/tsc 全部通过
- 冒烟输出包含 `smoke-ok`

## 发布 / 部署

- 本次为结构重构，不做发布；如需发布按 `docs/workflows/npm-release-process.md`

## 影响范围 / 风险

- Breaking change：否（行为保持不变）
- 回滚方式：回退本次提交
