# 2026-02-18 Release nextclaw v0.5.3

## 背景

- 本次发布落地运行态诊断能力：
  - `nextclaw status` 从“配置摘要”升级为“运行态真相”。
  - 新增 `nextclaw doctor` 用于运维诊断。

## 发布范围

- `nextclaw@0.5.3`

## 发布流程

```bash
pnpm release:version
pnpm release:publish
```

## 发布前校验

`release:publish` 自动执行：

- `pnpm build`
- `pnpm lint`
- `pnpm tsc`

## 发布后验收

```bash
npm view nextclaw version
# 期望: 0.5.3
```

VPS 回归（8.219.57.52）：

- `nextclaw --version` => `0.5.3`
- `nextclaw status --json` => 运行态 JSON 输出（含 process/health/issues/recommendations）
- `nextclaw doctor --json` => 诊断 checks 输出
- `nextclaw start --ui-port 18791` 后：
  - `nextclaw status --verbose` 显示 `Level: healthy`
  - `curl http://127.0.0.1:18791/api/health` 返回 `{"ok":true,...}`

## 备注

- 本次为 npm 包发布，不涉及数据库 migration。
