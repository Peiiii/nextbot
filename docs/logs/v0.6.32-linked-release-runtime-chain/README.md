# 2026-02-20 v0.6.32-linked-release-runtime-chain

## 迭代完成说明（改了什么）

- 目标：补齐 `@nextclaw/channel-runtime@0.1.5` 之后的下游联动发布，确保最终用户默认安装链路稳定拿到 Discord 分片修复。
- 本次联动发布：
  - `@nextclaw/openclaw-compat@0.1.12`
  - `nextclaw@0.6.20`
- 依赖链调整：
  - `packages/nextclaw-openclaw-compat/package.json` 中 `@nextclaw/channel-runtime` 依赖从 `^0.1.4` 提升为 `^0.1.5`
  - `packages/nextclaw/package.json` 中 `@nextclaw/openclaw-compat` 依赖随联动版本升级为 `^0.1.12`
- 本轮没有采用 `changeset fixed` 强绑定版本组：
  - 原因：`fixed` 会强制组内包统一版本号，导致 `openclaw-compat` 被不合理抬升到 `0.6.x`。
  - 改为显式多包 changeset 联动（更符合当前版本结构）。

## 测试 / 验证 / 验收方式

### 发布前验证（release:check）

```bash
pnpm build
pnpm lint
pnpm tsc
```

结果：通过（仅仓内既有 lint warning，无新增 error）。

### 发布结果核验

```bash
npm view @nextclaw/openclaw-compat version
npm view nextclaw@0.6.20 version
npm view nextclaw dist-tags --json
npm view @nextclaw/openclaw-compat dist-tags --json
git tag --list 'nextclaw@0.6.20' '@nextclaw/openclaw-compat@0.1.12'
```

验收点：
- `@nextclaw/openclaw-compat` 最新版本为 `0.1.12`
- `nextclaw@0.6.20` 可查询
- dist-tag：`nextclaw.latest = 0.6.20`，`@nextclaw/openclaw-compat.latest = 0.1.12`
- 本地存在对应 tag。

### 发布后冒烟（隔离目录）

```bash
TMP_DIR=$(mktemp -d /tmp/nextclaw-release-smoke.XXXXXX)
cd "$TMP_DIR"
npm init -y
npm install nextclaw@0.6.20
npx --yes nextclaw --version
rm -rf "$TMP_DIR"
```

观察点：
- 输出 `0.6.20`，说明 npm 安装与 CLI 启动链路正常。

## 发布 / 部署方式

执行流程：

```bash
pnpm release:version
pnpm release:publish
```

本次发布结果：
- `@nextclaw/openclaw-compat@0.1.12` ✅
- `nextclaw@0.6.20` ✅

闭环说明：
- 远程 migration：不适用（无后端/数据库变更）。
- 服务部署：不适用（npm 包发布）。
- 线上 API 冒烟：不适用（无后端 API 发布）。

## 文档影响检查

- `docs/USAGE.md`：不适用（无 CLI 命令/参数语义变更）。
- 发布与联动策略说明已记录在本迭代日志。
