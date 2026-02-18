# 2026-02-18 Runtime status + doctor command

## 背景 / 问题

- 用户期望 `nextclaw status` 能直接反映进程运行状态，而不仅是配置摘要。
- 线上排障时需要机器可读输出、脏状态修复能力、以及额外诊断入口。

## 决策

- 将 `nextclaw status` 升级为“运行态真相”命令：进程、健康检查、状态一致性、建议动作。
- 增加 `nextclaw doctor` 做结构化诊断（状态一致性、端口可用性、provider 就绪度）。
- 保持低复杂度：复用现有 `service.json` + `/api/health`，避免引入新守护机制。

## 变更内容

- `packages/nextclaw/src/cli/index.ts`
  - `status` 新增选项：`--json`、`--verbose`、`--fix`。
  - 新增 `doctor` 命令：支持 `--json`、`--verbose`、`--fix`。
- `packages/nextclaw/src/cli/runtime.ts`
  - `status` 改为异步，输出运行态：
    - managed process 状态（running/stale/stopped）
    - health（managed + configured endpoint）
    - config/workspace/provider 概览
    - issues/recommendations
  - 新增 `--fix`：在 PID 已失效时自动清理 stale service state。
  - 新增退出码语义：`0` healthy，`1` degraded，`2` stopped。
  - 新增 `doctor`：
    - config/workspace/service-state/service-health/ui-port/provider-config 检查
    - 文本与 JSON 两种输出
- `README.md`、`docs/USAGE.md`
  - 命令说明更新为 runtime-status + doctor 能力。

## 验证（怎么确认符合预期）

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use default

pnpm -C packages/nextclaw build
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw tsc
```

命令级冒烟：

```bash
# stopped 场景
nextclaw status --json
# 期望 exit code: 2

nextclaw doctor --json
# 期望输出 checks，并按告警/失败返回非零

# running 场景
nextclaw start --ui-port 19997
nextclaw status --verbose
# 期望显示 running + managed health ok

# stale 修复场景
nextclaw status --fix --json
# stale state 被清理
```

## 发布 / 部署

- 如随 npm 包发布，按 `docs/workflows/npm-release-process.md` 执行：
  - `pnpm changeset`
  - `pnpm release:version`
  - `pnpm release:publish`

## 影响范围 / 风险

- Breaking change? 否（命令新增能力，不破坏已有命令名）。
- 风险：`doctor` 对“无 provider key”会给 warn，属于预期诊断，不是运行错误。
