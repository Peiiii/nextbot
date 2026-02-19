# 2026-02-20 v0.6.33-typing-stop-on-noreply-release

## 迭代完成说明（改了什么）

- 目标：修复“AI 判定不回复（如 `<noreply/>`）后 typing 指示仍持续较久”的问题。
- 根因：
  - `DiscordChannel` / `TelegramChannel` 的 typing 主要在 `send()` 时停止；
  - 当最终回复被静默策略丢弃（无 outbound）时，只能等待 `autoStopMs=45000` 自动停止，导致用户体感延迟。
- 修复：
  - 将 `handleIncoming` 中 typing 生命周期改为 `try ... finally`：
    - 无论处理成功、失败、还是 no-reply，都在处理结束后立即执行 `stopTyping`。
  - 修改文件：
    - `packages/extensions/nextclaw-channel-runtime/src/channels/discord.ts`
    - `packages/extensions/nextclaw-channel-runtime/src/channels/telegram.ts`

## 测试 / 验证 / 验收方式

### 工程级验证（发布前）

```bash
pnpm build
pnpm lint
pnpm tsc
```

结果：通过（仅既有 lint warning，无新增 error）。

### 冒烟验证（隔离目录，不写仓库）

1) 无回复路径 typing 清理冒烟（源码级）

```bash
cd /tmp && pnpm dlx tsx /tmp/smoke-typing-stop.ts
```

观察点：
- 输出 `DISCORD_TYPING_STOP_OK`
- 输出 `TELEGRAM_TYPING_STOP_OK`

2) 发布后 npm 安装冒烟

```bash
TMP_DIR=$(mktemp -d /tmp/nextclaw-noreply-release-smoke.XXXXXX)
cd "$TMP_DIR"
npm init -y
npm install nextclaw@0.6.21
npx --yes nextclaw --version
rm -rf "$TMP_DIR"
```

观察点：
- 输出版本 `0.6.21`

## 发布 / 部署方式

执行流程：

```bash
pnpm release:version
pnpm release:publish
```

本次联动发布结果：
- `@nextclaw/channel-runtime@0.1.6`
- `@nextclaw/openclaw-compat@0.1.13`
- `nextclaw@0.6.21`

远端校验：

```bash
npm view @nextclaw/channel-runtime version
npm view @nextclaw/openclaw-compat version
npm view nextclaw version
npm view nextclaw dist-tags --json
```

结果：均为最新联动版本，`nextclaw.latest = 0.6.21`。

## 文档影响检查

- `docs/USAGE.md`：不适用（无 CLI 命令/参数语义变更）。
- 本次行为修复与发布闭环已记录在本日志。
