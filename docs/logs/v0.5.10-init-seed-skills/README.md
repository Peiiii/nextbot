# 2026-02-15 init 初始化内置 Skills

## 背景 / 问题

- init 只创建 `workspace/skills` 目录但不填充内容
- 新用户看到 skills 目录为空，误以为没有任何技能

## 决策

- init 时自动把内置 skills 种子复制到 `workspace/skills`
- 若目录已有内容且未传 `--force`，则不覆盖

## 变更内容

- `packages/nextclaw/src/cli/runtime.ts`
  - init 时创建 `workspace/skills` 后自动 seed 内置 skills
  - 仅在目录为空或 `--force` 时覆盖
  - 兼容 dev（src）与包发布（dist/skills）两种来源（通过模块入口定位包根目录）

## 验证（怎么确认符合预期）

```bash
# build / lint / tsc
pnpm build
pnpm lint
pnpm tsc

# smoke-check（非仓库目录）
export NEXTCLAW_HOME=/tmp/nextclaw-init-smoke
rm -rf "$NEXTCLAW_HOME"
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" node /Users/peiwang/Projects/nextbot/packages/nextclaw/dist/cli/index.js init --force
ls -1 "$NEXTCLAW_HOME/workspace/skills" | head -n 5
```

验收点：

- build/tsc 通过
- lint 通过（若存在 max-lines 警告，记录即可）
- `workspace/skills` 非空（能看到多个技能目录）

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

- `nextclaw@0.4.2`
- `nextclaw-core@0.4.2`

线上冒烟（npm）：

```bash
cd /tmp
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm view nextclaw@0.4.2 version
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" npm install -g nextclaw@0.4.2
export NEXTCLAW_HOME=/tmp/nextclaw-init-smoke-release
rm -rf "$NEXTCLAW_HOME"
PATH="/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH" nextclaw init --force
ls -1 "$NEXTCLAW_HOME/workspace/skills" | head -n 5
```

观察点：

- `npm view` 输出 `0.4.2`
- `nextclaw init --force` 输出 `seeded`，且 `workspace/skills` 非空

## 影响范围 / 风险

- Breaking change：否
- 回滚方式：回退本次提交
