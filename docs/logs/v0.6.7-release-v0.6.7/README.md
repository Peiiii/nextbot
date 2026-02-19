# 2026-02-19 Release v0.6.7

## 发布目标

- 发布 OpenClaw no-reply 对齐能力：`NO_REPLY` 与空最终回复均静默。
- 同步 CLI/模板文档，保证行为可发现、可维护。

## 发布范围

- `nextclaw@0.6.7`
- `@nextclaw/core@0.6.6`

未发布（版本未变更）：
- `@nextclaw/openclaw-compat@0.1.5`
- `@nextclaw/server@0.4.2`
- `@nextclaw/ui@0.3.9`

## 执行记录

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm release:version
pnpm release:publish
```

`release:publish` 内已执行：
- `pnpm build`
- `pnpm lint`
- `pnpm tsc`
- `pnpm changeset publish`
- `pnpm changeset tag`

## 验证结果

- 本地校验通过：`build/lint/tsc`（仅仓库既有 lint warning，无新增 error）。
- npm 发布成功：
  - `nextclaw@0.6.7`
  - `@nextclaw/core@0.6.6`
- tag 创建成功：
  - `nextclaw@0.6.7`
  - `@nextclaw/core@0.6.6`
- 冒烟（隔离 `/tmp`）验证 no-reply 行为：
  - empty -> `""`
  - `NO_REPLY` -> `""`
  - normal text -> 正常下发

## 文档复盘

- 本次已同步：
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`
  - 迭代日志与发布日志索引
- 不涉及数据库/后端 migration（不适用）。
