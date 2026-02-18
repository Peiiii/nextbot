# 2026-02-18 Gateway update self-relaunch fix

## 背景 / 问题

- 用户在本地 `nextclaw start` 场景下让 AI 执行更新后，服务可能退出但未自动恢复，导致“长时间无回复”。
- 根因：当重启请求来自“当前托管服务进程自身”时，原逻辑仅 `process.exit`，缺少自拉起接力。
- 追加根因：helper 继承 `process.execArgv` 时，在 `tsx/eval/loader` 运行模式会把启动参数污染到 `nextclaw start`，导致接力启动失败。

## 方案

- 在 `CliRuntime.requestRestart` 中，当策略为 `background-service-or-exit` / `exit-process` 且当前进程就是 `service.json` 记录的 PID 时：
  - 先 arm 一个 detached helper（等待当前 PID 退出）。
  - 当前进程退出后，helper 自动执行 `nextclaw start --ui-port <current-port>` 拉起新服务。
- helper 启动命令改为仅使用 `node <cli> start ...`，不再继承上游 `process.execArgv`，避免 dev/tsx 场景参数串扰。
- 该机制对外效果接近“操作系统重启”：先停再自动起，无需用户手工 `start`。

## 代码变更

- `packages/nextclaw/src/cli/runtime.ts`
  - 新增 `selfRelaunchArmed` 防重复触发。
  - 新增 `armManagedServiceRelaunch(...)`。
  - 在 `requestRestart(...)` 中接入自拉起逻辑。
  - helper 启动由 `spawnSync(nodePath, [...execArgv, ...startArgs])` 调整为 `spawnSync(nodePath, startArgs)`。
  - 新增 `NEXTCLAW_SELF_RELAUNCH_CLI`（可选）用于测试/调试覆盖重启命令入口。
- `packages/nextclaw-core/src/agent/context.ts`
  - 修正 Self-Update 提示语，去掉“自动 ping 上个会话”的不准确承诺，改为“自动自拉起 + 需短暂恢复窗口”。
- `docs/USAGE.md`
  - Self-update 行为说明新增“agent 触发 update.run 时自动自拉起”。
- `packages/nextclaw-core/src/agent/skills/nextclaw-self-manage/SKILL.md`
  - 新增 `Update Flow`：更新后状态验收与恢复期提示。

## 验证

```bash
source ~/.nvm/nvm.sh
pnpm -C packages/nextclaw-core build
pnpm -C packages/nextclaw-core lint
pnpm -C packages/nextclaw-core tsc
pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc
```

专项冒烟（进程内触发重启模拟）：
- 使用 `tsx` 启动一个模拟“被 service.json 托管的当前进程”，调用 `requestRestart(strategy=background-service-or-exit)`。
- 观察点：日志出现 `Gateway self-restart armed (...)` + `Restart scheduled (...)`。
- 验证结果：`nextclaw status --json` 返回 `exitCode: 0`、`process.running: true`、`level: "healthy"`（端口 `19001`）。
- 额外清理：执行 `nextclaw stop` 后 `service.json` 清除，状态回到 stopped（预期行为）。

## 风险 / 兼容性

- 风险低：仅影响“当前进程即托管服务 PID 且请求 exit/restart”路径。
- 不改变外部 CLI 命令语义；仅补齐 previously-missing 自动拉起。
