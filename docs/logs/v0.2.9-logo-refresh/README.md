# 2026-02-14 UI Logo Refresh + NPM Release

## 背景 / 问题

- 前端渠道/Provider Logo 需要替换为真实官方来源，且避免空白/不可见

## 决策

- 统一在 UI 中为 provider/channel 使用 logo 显示，缺失时回退首字母
- 采用官网 favicon/官方站点资源，无法获取时使用公开图标库兜底

## 变更内容

- 更新 provider/channel logo 资源，补齐 Gemini/Kimi/Groq/AiHubMix/DeepSeek 等
- 调整 LogoBadge，避免 PNG/SVG 拉伸变形
- 更新 UI logo 映射表，并同步到 nextclaw 的 ui-dist

## 验证（怎么确认符合预期）

```bash
# build / lint / typecheck
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm -C /Users/peiwang/Projects/nextbot release:check

# smoke (non-repo dir)
mkdir -p /tmp/nextclaw-pack /tmp/nextclaw-smoke
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH npm pack /Users/peiwang/Projects/nextbot/packages/nextclaw --pack-destination /tmp/nextclaw-pack
cd /tmp/nextclaw-smoke
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH npm init -y
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH npm install /tmp/nextclaw-pack/nextclaw-0.2.9.tgz
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH node -e "const fs=require('fs');const paths=['node_modules/nextclaw/ui-dist/logos/deepseek.png','node_modules/nextclaw/ui-dist/logos/aihubmix.png','node_modules/nextclaw/ui-dist/logos/moonshot.png','node_modules/nextclaw/ui-dist/logos/gemini.svg','node_modules/nextclaw/ui-dist/logos/groq.svg'];const missing=paths.filter(p=>!fs.existsSync(p));console.log(missing.length?('missing:'+missing.join(',')):'smoke-ok');"
rm -rf /tmp/nextclaw-pack /tmp/nextclaw-smoke
```

验收点：

- build/lint/tsc 全部通过
- smoke 输出 `smoke-ok`

## 发布 / 部署

- 参考 `docs/workflows/npm-release-process.md`
- 本次变更仅影响前端资源与 npm 包，无后端/数据库变更，migration N/A
- 已执行发布并完成线上冒烟验证

```bash
# 发布
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH pnpm -C /Users/peiwang/Projects/nextbot release:publish

# 线上冒烟（从 npm 安装）
mkdir -p /tmp/nextclaw-online-smoke
cd /tmp/nextclaw-online-smoke
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH npm init -y
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH npm install nextclaw@0.2.9
PATH=/Users/peiwang/.nvm/versions/node/v22.16.0/bin:$PATH node -e "const fs=require('fs');const paths=['node_modules/nextclaw/ui-dist/logos/deepseek.png','node_modules/nextclaw/ui-dist/logos/aihubmix.png','node_modules/nextclaw/ui-dist/logos/moonshot.png','node_modules/nextclaw/ui-dist/logos/gemini.svg','node_modules/nextclaw/ui-dist/logos/groq.svg'];const missing=paths.filter(p=>!fs.existsSync(p));console.log(missing.length?('missing:'+missing.join(',')):'online-smoke-ok');"
rm -rf /tmp/nextclaw-online-smoke
```

验收点：

- npm 成功发布：`nextclaw@0.2.9`、`@nextclaw/ui@0.2.5`
- 线上冒烟输出 `online-smoke-ok`

## 影响范围 / 风险

- Breaking change: 否
- 回滚：npm 回退到上一版本
