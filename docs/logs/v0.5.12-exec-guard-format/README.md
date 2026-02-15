# 2026-02-15 修复 exec guard 误拦截 curl

## 背景 / 问题

- `curl ...?format=...` 会触发 `format` 关键字拦截
- 导致合法命令被判定为危险命令

## 决策

- 将 `format/mkfs/diskpart` 拦截从“正则全局匹配”调整为“命令级别判断”
- 仅当命令本身是 `format`/`diskpart` 或 `mkfs*` 时才拦截

## 变更内容

- `packages/nextclaw-core/src/agent/tools/shell.ts`
  - 从 denyPatterns 移除 `format|mkfs|diskpart`
  - 新增命令级别检测（支持管道/&&/; 与 sudo）

## 验证（怎么确认符合预期）

```bash
# build / lint / tsc
pnpm build
pnpm lint
pnpm tsc

# smoke-check（非仓库目录）
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" \
  /Users/peiwang/Projects/nextbot/packages/nextclaw-core/node_modules/.bin/tsx -e \
  "import { ExecTool } from '/Users/peiwang/Projects/nextbot/packages/nextclaw-core/src/agent/tools/shell.ts';\n(async () => {\n  const tool = new ExecTool({ timeout: 5 });\n  const ok1 = await tool.execute({ command: 'echo format=ok' });\n  const ok2 = await tool.execute({ command: 'format' });\n  const pass = !ok1.includes('dangerous pattern') && ok2.includes('dangerous pattern');\n  console.log(pass ? 'smoke-ok' : 'smoke-fail');\n})();"
```

验收点：

- build/tsc 通过
- lint 通过（若存在 max-lines 警告，记录即可）
- `echo format=ok` 不被拦截；`format` 被拦截

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

- `nextclaw@0.4.4`
- `nextclaw-core@0.4.4`

线上冒烟（npm）：

```bash
cd /tmp
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm view nextclaw@0.4.4 version
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm install -g nextclaw@0.4.4
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" nextclaw --version
```

观察点：

- `npm view` 输出 `0.4.4`
- `nextclaw --version` 输出 `0.4.4`

## 影响范围 / 风险

- Breaking change：否
- 回滚方式：回退本次提交
