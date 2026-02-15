# 2026-02-15 Gateway 启动流程与重载逻辑重构

## 背景 / 问题

- startGateway 过长，职责混杂，UI 启动逻辑重复，配置热重载难以理解与测试

## 决策

- 抽出 UI 启动为统一方法，消除重复
- 把配置热重载收拢为 ConfigReloader 组件，保持行为不变

## 变更内容

- 新增 `startUiIfEnabled` 私有方法，复用 UI 启动逻辑
- 新增 `ConfigReloader` 类，封装热重载状态与调度，startGateway 只保留编排逻辑

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
