# 2026-02-19 v0.6.28-release-channel-runtime-typing-class-fix

## 迭代完成说明

- 目标：完成“typing 生命周期 class 化修复”的正式发布，解决 AI 不回复时 Discord/Telegram typing 可能悬挂的问题。
- 本次完成：
  - 引入 `ChannelTypingController` class 并接入 Discord / Telegram。
  - 统一 typing 生命周期：启动、心跳、自动超时回收、按 channel stop/stopAll 清理。
  - 发布 `@nextclaw/channel-runtime@0.1.2`。

## 测试 / 验证 / 验收方式

### 发布前验证

```bash
pnpm build
pnpm lint
pnpm tsc
```

结果：通过（仅仓内既有 warning，无新增 error）。

### 发布后冒烟（隔离目录）

```bash
TMP_HOME=$(mktemp -d /tmp/nextclaw-post-release-typing.XXXXXX)
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js channels status
NEXTCLAW_HOME="$TMP_HOME" node packages/nextclaw/dist/cli/index.js plugins list --enabled
rm -rf "$TMP_HOME"
```

验收点：
- 渠道插件加载与绑定正常。
- 渠道运行链路未因 typing controller 改造出现回归。

### 发布结果验收

```bash
curl -fsSL https://registry.npmjs.org/@nextclaw%2Fchannel-runtime | jq -r '."dist-tags".latest'
npm view @nextclaw/channel-runtime version
```

验收点：
- 两条命令均返回 `0.1.2`。

## 发布 / 部署方式

执行流程：

```bash
pnpm release:version
pnpm release:publish
```

本次实际发布：
- `@nextclaw/channel-runtime@0.1.2` ✅

闭环说明：
- 远程 migration：不适用（无后端/数据库变更）。
- 服务部署：不适用（npm 包发布）。
- 线上 API 冒烟：不适用（无后端 API 发布）。
