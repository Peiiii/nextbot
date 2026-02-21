# 2026-02-21 v0.6.37-dev-runner-port-fallback

## 迭代完成说明（改了什么）

- 修复 `pnpm dev start` 在端口冲突场景下“前端可启动但 API 指向错误/不可访问”的问题。
- 在 `scripts/dev-runner.mjs` 中新增端口探测与自动回退机制：
  - 后端 UI/API 端口默认 `18792`，占用时向上寻找可用端口。
  - 前端 Vite 端口默认 `5174`，占用时向上寻找可用端口。
  - 额外增加“端口占用探测（socket connect）+ 绑定校验”双保险，避免某些系统下同端口被多进程复用监听时误判可用。
  - `VITE_API_BASE` 自动绑定到回退后的后端端口，避免打到其他进程。
- 启动时输出实际端口：
  - `API base: http://127.0.0.1:<port>`
  - `Frontend: http://127.0.0.1:<port>`

## 测试 / 验证 / 验收方式

### 1) 冲突场景复现验证（冒烟）

```bash
node scripts/dev-runner.mjs start
```

观察点：
- 当 `18792` 或 `5174` 被占用时，不再直接失败。
- 日志会打印 fallback 提示和最终可用端口。
- `GET /api/health` 返回 200。

### 2) 本次实际执行结果（2026-02-21）

- 在本机存在端口冲突（`5174` 已被占用，`18792` 存在其他服务监听）条件下执行。
- 实际回退结果：
  - Backend `18792 -> 18793`
  - Frontend `5174 -> 5175`
- 实测接口：
  - `curl http://127.0.0.1:18793/api/health` 返回 `200` 且 `{"ok":true,"data":{"status":"ok"}}`。
  - `curl http://127.0.0.1:18793/api/config` 返回 `200` 且 `ok=true`。

### 3) 工程级验证

```bash
pnpm build
pnpm lint
pnpm tsc
```

验收点：
- 构建、静态检查、类型检查通过（允许仓库既有 warning，不新增 error）。

本次实际结果（2026-02-21）：
- `pnpm build`：通过。
- `pnpm lint`：通过（仅仓库既有 warning，无新增 error）。
- `pnpm tsc`：通过。

## 发布 / 部署方式

- 本次为开发期脚本修复，不涉及独立部署步骤。
- 随常规版本发布流程进入正式版本：`build/lint/tsc -> changeset version -> changeset publish`。
