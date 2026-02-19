# 2026-02-19 README live LOC badge via workflow-backed snapshot

## 背景 / 问题

- `nanobot` README 中有“实时代码量”表达，但本质是 README 文字 + 本地脚本校验，不是仓库级自动回写。
- NextClaw 已有 LOC 统计 workflow，但之前仅产物上传，不会把快照持续同步到主分支，因此 README 无法稳定展示“最新值”。

## 决策

- 将 LOC 展示升级为真正闭环：
  - README 使用 dynamic badge 读取仓库内 `latest.json`。
  - CI 在主分支自动回写 `latest.json/history.jsonl`。
- 采用 `[skip ci]` 提交信息避免 workflow 自触发循环。

## 变更内容

- `README.md`
  - 新增 LOC 动态徽章（`shields.io` + raw JSON query）。
- `.github/workflows/code-volume-metrics.yml`
  - push 触发分支扩展为 `master/main`。
  - 增加 `contents: write` 权限。
  - 增加自动提交步骤：回写 `docs/metrics/code-volume/latest.json` 与 `history.jsonl`。
- `docs/workflows/code-volume-monitoring.md`
  - 补充主分支自动回写机制与 README 实时展示说明。

## 验证（怎么确认符合预期）

```bash
pnpm metrics:loc -- --append-history
pnpm build
pnpm lint
pnpm tsc
```

验收点：

- 本地执行后 `docs/metrics/code-volume/latest.json` 正常更新。
- workflow 文件包含自动提交快照步骤与 write 权限。
- README 徽章 query 指向 `$.totals.codeLines`。
- `build/lint` 通过；`tsc` 若失败需确认是否为既有非本次改动问题。

## 发布 / 部署

- 本次仅为工程自动化与文档改进，不涉及数据库迁移。
- 若需发布 npm 包，仍按 `docs/workflows/npm-release-process.md`。

## 影响范围 / 风险

- 无运行时业务行为变更。
- 风险：若默认分支未来切换，需同步调整 README 徽章中的分支路径。
