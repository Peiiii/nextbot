# 2026-02-19 Release v0.6.8

## 发布目标

- 按“协议同构，内核异构”落地消息/附件契约对齐。
- 修复 Responses 链路下图片上下文易丢失问题（`image_url -> input_image`）。
- 让 Discord 附件链路具备可恢复性：本地下载失败时回退远端 URL，不再污染用户正文。

## 发布范围

- `nextclaw@0.6.8`
- `@nextclaw/core@0.6.7`

未发布（版本未变更）：
- `@nextclaw/openclaw-compat@0.1.5`
- `@nextclaw/server@0.4.2`
- `@nextclaw/ui@0.3.9`

## 执行记录

```bash
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
- 配置语义冒烟（隔离 `/tmp`）通过：
  - `config set channels.discord.mediaMaxMb 12` 可生效。
  - `config set channels.discord.proxy http://127.0.0.1:7890` 可生效。
- 多模态注入链路冒烟通过：
  - Context 层 `attachments[]` 能产出 `image_url` 块。
  - Responses 映射层能产出 `input_image` 块。
- npm 发布成功：
  - `nextclaw@0.6.8`
  - `@nextclaw/core@0.6.7`
- npm 线上版本校验：
  - `npm view nextclaw version` -> `0.6.8`
  - `npm view @nextclaw/core version` -> `0.6.7`
- 发布后安装路径冒烟（隔离 `/tmp`）通过：
  - `NEXTCLAW_HOME=/tmp/... npx -y nextclaw@0.6.8 --help` 正常输出命令列表。
- tag 创建成功：
  - `nextclaw@0.6.8`
  - `@nextclaw/core@0.6.7`

## 文档复盘

- 本次已同步：
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`
  - `docs/designs/protocol-isomorphic-kernel-heterogeneous-checklist.md`
  - 发布日志索引
- 不涉及数据库/后端 migration（不适用）。
