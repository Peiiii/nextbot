# 2026-02-18 Start service readiness guard + stale-state prevention

## 背景 / 问题

- VPS 上执行 `nextclaw start` 后无法访问 UI；执行 `nextclaw stop` 提示：`Service is not running. Cleaning up state.`
- 远程日志显示两类问题：
  - 后台启动参数仍使用 `--ui-host`，但当前 CLI 已移除该参数，导致子进程直接退出。
  - 主进程未验证子进程是否真正就绪，就写入 `service.json`，产生“假启动 + 脏状态”。

## 决策

- 修复后台启动参数构造，移除已废弃 `--ui-host`。
- 引入后台启动就绪探测：只有 `/api/health` 响应结构正确且目标 PID 稳定存活时，才写入 `service.json`。
- 启动失败时主动清理状态并输出日志路径，避免“stop 说没运行”与“start 说成功”的矛盾体验。

## 变更内容

- `packages/nextclaw/src/cli/utils.ts`
  - `buildServeArgs` 改为只传 `--ui-port`。
- `packages/nextclaw/src/cli/runtime.ts`
  - `startService` 增加 `waitForBackgroundServiceReady` 探测。
  - 探测通过条件：
    - 子进程 PID 持续存活。
    - `GET /api/health` 返回 `{ ok: true, data: { status: "ok" } }`。
    - 健康后再做一次短延迟存活确认，防止端口被其他进程占用时误判。
  - 探测失败：终止子进程（若仍存活）、清理状态、明确报错并提示日志路径。

## 验证（怎么确认符合预期）

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use default

pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc
```

冒烟 1（正常路径）：

```bash
export NEXTCLAW_HOME="$(mktemp -d /tmp/nextclaw-startfix-XXXXXX)"
node packages/nextclaw/dist/cli/index.js init --force
node packages/nextclaw/dist/cli/index.js start --ui-port 19995
curl http://127.0.0.1:19995/api/health
node packages/nextclaw/dist/cli/index.js stop
```

验收点：
- 健康检查返回 `{"ok":true,...}`。
- stop 后 `run/service.json` 被清理。

冒烟 2（失败路径，端口冲突）：

```bash
# 先占用端口 19996
node -e "require('http').createServer((req,res)=>res.end('busy')).listen(19996,'127.0.0.1'); setInterval(()=>{},1000);"

export NEXTCLAW_HOME="$(mktemp -d /tmp/nextclaw-startfix-fail-XXXXXX)"
node packages/nextclaw/dist/cli/index.js init --force
node packages/nextclaw/dist/cli/index.js start --ui-port 19996
```

验收点：
- 启动失败时不写 `run/service.json`（无脏状态）。

## 发布 / 部署

- 如随 npm 包发布，按 `docs/workflows/npm-release-process.md` 执行：
  - `pnpm changeset`
  - `pnpm release:version`
  - `pnpm release:publish`

## 影响范围 / 风险

- Breaking change? 否。
- 风险：启动等待会增加最多 ~8s 的启动确认时间；但换来一致性与可诊断性，符合可维护性优先原则。
