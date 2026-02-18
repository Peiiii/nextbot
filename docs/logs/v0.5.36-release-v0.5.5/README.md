# 2026-02-18 Release v0.5.5

## 迭代完成说明

- 按项目发布流程完成 NPM 发布闭环（changeset → version → publish）。
- 本次实际发布包：
  - `nextclaw@0.5.5`
  - `@nextclaw/core@0.5.3`
  - `@nextclaw/openclaw-compat@0.1.4`
- 未发布包（版本已存在于 npm）：
  - `@nextclaw/server@0.3.7`
  - `@nextclaw/ui@0.3.8`

## 测试 / 验证 / 验收

### 发布前校验

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm release:check
```

结果：通过（仅现有 lint warning，无 error）。

### 冒烟测试（隔离目录，不写仓库）

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
NEXTCLAW_HOME=/tmp/nextclaw-release-smoke-home-xxxx node packages/nextclaw/dist/cli/index.js plugins list --json
```

验收点：默认插件加载为禁用（`pluginCount = 0`）。

### 线上发布验收

```bash
npm view nextclaw@0.5.5 version
npm view @nextclaw/core@0.5.3 version
npm view @nextclaw/openclaw-compat@0.1.4 version
```

结果：均返回对应版本号，验证发布成功。

## 发布 / 部署方式

- 已执行：
  1. `pnpm release:version`
  2. `pnpm release:publish`
- 自动创建 git tag：
  - `nextclaw@0.5.5`
  - `@nextclaw/core@0.5.3`
  - `@nextclaw/openclaw-compat@0.1.4`
- 本次仅 NPM 发布，不涉及后端/数据库变更：
  - 远程 migration：不适用
  - 服务部署：不适用
