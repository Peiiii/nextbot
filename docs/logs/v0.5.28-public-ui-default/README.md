# 2026-02-18 Force public UI exposure by default

## 背景 / 问题

- 现有行为允许 `--public`/`--ui-host` 在公网与本地回环之间切换。
- 产品定位要求“默认且始终公网可访问”，不再支持暴露策略切换，避免重启后行为不一致。

## 决策

- 对 `start/restart/serve/ui/gateway` 的 UI 启动路径强制使用 `0.0.0.0`。
- 移除 CLI 中与暴露策略切换相关的参数（`--public`、`--ui-host`、`--host`）。
- 配置变更触发的后台重启也强制回到 `0.0.0.0`，保证策略一致。
- `nextclaw start` 发现现有后台服务不是 `0.0.0.0` 绑定时，会自动重启并收敛到公网绑定。

## 变更内容

- 用户可见变化：
  - `nextclaw start` 直接公网暴露（UI 仍打印本机访问地址 + 公网探测地址）。
  - `nextclaw restart` 不再需要 `--public`，默认保持公网暴露。
  - `nextclaw gateway/ui/serve` 命令帮助中不再出现 `--public`/`--ui-host`/`--host`。
- 关键实现点：
  - `packages/nextclaw/src/cli/runtime.ts` 引入 `FORCED_PUBLIC_UI_HOST = "0.0.0.0"` 并在相关启动路径统一覆盖。
  - `packages/nextclaw/src/cli/runtime.ts` 的 `restartBackgroundService` 改为固定使用 `0.0.0.0`。
  - `packages/nextclaw/src/cli/index.ts` 删除相关 CLI 选项。
  - `README.md`、`docs/USAGE.md` 同步文档说明。

## 验证（怎么确认符合预期）

```bash
pnpm -C packages/nextclaw tsc
pnpm -C packages/nextclaw lint
pnpm -C packages/nextclaw exec tsx src/cli/index.ts start --help
pnpm -C packages/nextclaw exec tsx src/cli/index.ts gateway --help
NEXTCLAW_HOME=/tmp/nextclaw-public-default-smoke pnpm -C packages/nextclaw exec tsx src/cli/index.ts start --ui-port 19101
```

验收点：

- `start --help` 不再包含 `--public` / `--ui-host`。
- `gateway --help` 不再包含 `--public` / `--ui-host`。
- `run/service.json` 中 `uiHost` 为 `0.0.0.0`。
- 重启后 `uiHost` 仍为 `0.0.0.0`。
- `start` 遇到旧状态（`uiHost=127.0.0.1`）时会自动触发一次 stop/start，最终状态收敛为 `0.0.0.0`。

## 发布 / 部署

- 本次未执行 npm 发布。
- 如需发布，按 `docs/workflows/npm-release-process.md` 执行 changeset/version/publish。

## 影响范围 / 风险

- Breaking change? 是（CLI 参数收敛，移除 `--public` / `--ui-host` / `--host`）。
- 风险：依赖旧参数脚本会失败；需改为直接使用 `--ui-port`（如需自定义端口）。
