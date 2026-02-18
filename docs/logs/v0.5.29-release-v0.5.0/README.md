# 2026-02-18 Release v0.5.0 / core v0.5.0

## 背景 / 目标

- 用户要求“现发布”，并要求发布闭环可验证。
- 本次发布覆盖最近两组关键变更：
  - UI 对外绑定默认化（public-by-default）
  - 配置热应用边界扩展（`maxTokens`/`temperature`/`tools.*`）与重启边界收敛

## 发布范围

- `nextclaw@0.5.0`
- `@nextclaw/core@0.5.0`
- `@nextclaw/openclaw-compat@0.1.3`（依赖联动升版）
- `@nextclaw/server@0.3.6`（依赖联动升版）
- `@nextclaw/ui@0.3.7`（未重发，registry 已存在同版本）

## 执行过程

```bash
# 1) 版本变更
pnpm release:version

# 2) 发布（含发布前校验）
pnpm release:publish
```

`release:publish` 内已自动执行：

- `pnpm build`
- `pnpm lint`
- `pnpm tsc`
- `pnpm changeset publish`
- `pnpm changeset tag`

## 验证 / 验收

发布后验证命令：

```bash
npm view nextclaw version
npm view @nextclaw/core version
npm view @nextclaw/openclaw-compat version
npm view @nextclaw/server version
```

验收结果：

- `nextclaw` → `0.5.0`
- `@nextclaw/core` → `0.5.0`
- `@nextclaw/openclaw-compat` → `0.1.3`
- `@nextclaw/server` → `0.3.6`
- 本地 tags 已创建：
  - `nextclaw@0.5.0`
  - `@nextclaw/core@0.5.0`
  - `@nextclaw/openclaw-compat@0.1.3`
  - `@nextclaw/server@0.3.6`

## 发布 / 部署闭环说明

- 变更类型：NPM 包发布。
- 远程 migration：不适用（无后端数据库 schema 变更）。
- 线上关键 API 冒烟：不适用（本次为包发布，不是托管服务部署）。

## 风险与回滚

- 风险：CLI 选项边界调整 + 热应用范围变化可能影响旧脚本行为。
- 回滚：发布侧通过回退到前版本依赖（`nextclaw@0.4.17` / `@nextclaw/core@0.4.14`）临时止损，代码侧按提交回退。
