# 2026-02-15 端口占用判断修复

## 背景 / 问题

- 开发模式下 UI 端口被占用时，仍可能被判定为可用，导致 UI API 启动失败，前端请求命中其他服务（如 openclaw）。

## 决策

- 端口可用性只检测目标 host 本身，避免 IPv4/IPv6 交叉导致“误判可用”。

## 变更内容

- 用户可见变化：`pnpm nextclaw start` 在端口被占用时会正确切换到可用端口。
- 关键实现点：
  - 修复 `isPortAvailable`，移除对另一个 host 的“或”判断。

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
env PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm -C /Users/peiwang/Projects/nextbot build
env PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm -C /Users/peiwang/Projects/nextbot lint
env PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm -C /Users/peiwang/Projects/nextbot tsc

# smoke-check（非仓库目录）
cd /tmp
/Users/peiwang/.nvm/versions/node/v22.16.0/bin/node -e 'const { createServer } = require("node:net");const { spawn } = require("node:child_process");const server=createServer();server.listen({host:"127.0.0.1",port:19001},()=>{const child=spawn(process.execPath,["/Users/peiwang/Projects/nextbot/packages/nextclaw/dist/cli/index.js","serve","--ui-port","19001"],{env:{...process.env,NEXTCLAW_DEV:"1"}});let out="";const done=(ok)=>{child.kill("SIGTERM");server.close();process.exit(ok?0:1);};child.stdout.on("data",d=>{out+=d.toString();if(out.includes("switched to")){console.log(out);done(true);}});child.stderr.on("data",d=>{out+=d.toString();if(out.includes("switched to")){console.log(out);done(true);}});setTimeout(()=>{console.error(out||"timeout");done(false);},5000);});'
```

验收点：

- 输出包含 `switched to`，确认端口占用时会自动切换到可用端口。

## 发布 / 部署

- 本次为 CLI 行为修复，是否发布 npm 版本按需；如需发布，按 `docs/workflows/npm-release-process.md` 执行。

## 影响范围 / 风险

- Breaking change? 否
- 回滚方式：恢复 `isPortAvailable` 的旧实现。
