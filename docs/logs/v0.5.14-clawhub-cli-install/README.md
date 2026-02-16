# v0.5.14-clawhub-cli-install

## 做了什么
- `nextclaw skills install` / `nextclaw clawhub install` 改为内部直接调用 `npx clawhub` 执行安装。
- 保留 `--version/--registry/--workdir/--dir/--force` 参数透传，安装路径与 ClawHub CLI 行为一致。
- 移除内置 API 下载与 ZIP 解压实现，避免依赖 ClawHub 内部接口。
- 明确依赖 `npx` 可用（Node/npm 环境）。
- 已安装技能再次执行安装会提示“已安装”，不再抛错（除非需要强制覆盖）。

## 验证
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm build`
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm lint`
  - 仅警告：`packages/nextclaw-core/src/channels/mochat.ts`、`packages/nextclaw/src/cli/runtime.ts` 超过行数限制
- `PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm tsc`
- 冒烟（非仓库目录）：
  - `NEXTCLAW_HOME=/tmp/nextclaw-smoke-$$ node /Users/peiwang/Projects/nextbot/packages/nextclaw/dist/cli/index.js skills install bird`
  - 预期：提示已安装，不报错

## 发布/部署
- 已按 `docs/workflows/npm-release-process.md` 发布 npm：
  - `pnpm changeset`（手工创建 changeset）
  - `pnpm release:version`
  - `pnpm release:publish`
  - 发布结果：`nextclaw@0.4.5`（其余包版本未变，跳过发布）
