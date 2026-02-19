# 2026-02-19 Release v0.6.2

## 迭代完成说明

- 按项目发布流程执行 `changeset -> version -> publish -> tag`。
- 本次实际发布包：
  - `nextclaw@0.6.2`
  - `@nextclaw/core@0.6.2`
  - `@nextclaw/openclaw-compat@0.1.5`
- 未发布包：
  - `@nextclaw/server@0.4.1`（npm 已有同版本）
  - `@nextclaw/ui@0.3.8`（npm 已有同版本）
- 发布内容覆盖：
  - 恢复 OpenClaw 兼容插件系统（CLI/运行时/配置链路）。
  - 插件发现策略改为仅 NextClaw 目录（不扫描 `.openclaw` 目录）。

## 测试 / 验证 / 验收

### 发布前校验

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm release:check
```

结果：通过（仅仓库既有 lint warning：`max-lines` / `max-lines-per-function`）。

### 冒烟测试（隔离目录）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
TMP_HOME=$(mktemp -d /tmp/nextclaw-smoke-install.XXXXXX)

# 1) plugins --help
# 2) plugins install <local-path>
# 3) plugins list --json
# 4) plugins info <id>
# 5) plugins uninstall <id> --force
# 6) 验证仅扫描 .nextclaw/extensions，不扫描 .openclaw/extensions

rm -rf "$TMP_HOME"
```

观察点：

- `plugins --help` 包含 `list/install/uninstall/enable/disable/doctor`。
- 安装后插件可发现且 `status=loaded`。
- 卸载后插件不再出现。
- 目录策略验证通过：仅发现 `.nextclaw/extensions` 下插件。

### 发布后验收

```bash
npm view nextclaw@0.6.2 version
npm view @nextclaw/core@0.6.2 version
npm view @nextclaw/openclaw-compat@0.1.5 version

npm view nextclaw dist-tags --json
npm view @nextclaw/core dist-tags --json
npm view @nextclaw/openclaw-compat dist-tags --json
```

结果：

- 版本可查：`0.6.2 / 0.6.2 / 0.1.5`。
- `dist-tags.latest` 分别为：`nextclaw=0.6.2`、`@nextclaw/core=0.6.2`、`@nextclaw/openclaw-compat=0.1.5`。

## 发布 / 部署方式

- 已执行：
  1. `pnpm release:version`
  2. `pnpm release:publish`
- 自动创建 tag：
  - `nextclaw@0.6.2`
  - `@nextclaw/core@0.6.2`
  - `@nextclaw/openclaw-compat@0.1.5`
- 本次仅 NPM 包发布：
  - 远程 migration：不适用（无数据库变更）
  - 服务部署：不适用（无线上服务部署动作）

## 发布后文档检查

- 已完成文档影响检查：
  - `docs/USAGE.md`
  - `packages/nextclaw/templates/USAGE.md`
  - `docs/logs/v0.6.2-restore-openclaw-plugin-compat/README.md`
- 结论：插件恢复与目录策略变更对应文档已同步。
