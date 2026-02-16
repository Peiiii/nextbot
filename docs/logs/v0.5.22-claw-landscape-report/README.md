# 2026-02-16 Claw 生态用户视角对比报告

## 任务 / 范围

- 目标：对 OpenClaw / Moltis / IronClaw / ZeroClaw / NanoClaw / PicoClaw / ZeptoClaw / nextclaw 做用户视角功能对比与完善度评估。
- 视角：以“普通用户能否快速上手、功能是否完整、日常使用是否顺滑”为核心，不做开发者代码审计式解读。
- 资料来源：各项目公开仓库 README / 文档；本地已拉取仓库位于 `/Users/peiwang/Projects/claw-repos`。

## 仓库获取情况

- ✅ OpenClaw（`openclaw/openclaw`）
- ✅ Moltis（`moltis-org/moltis`）
- ✅ ZeroClaw（`openagen/zeroclaw`）
- ✅ NanoClaw（`qwibitai/nanoclaw`）
- ✅ PicoClaw（`sipeed/picoclaw`）
- ✅ ZeptoClaw（`qhkm/zeptoclaw`）
- ⚠️ IronClaw：暂未找到公开仓库（如有官方地址请补充）
- ✅ nextclaw：本仓库（`/Users/peiwang/Projects/nextbot`）

## 总览结论（用户视角）

- **功能完整度最高：OpenClaw。** 渠道、工具、端侧、自动化、可视化都很全，但部署/资源成本高、心智负担重。
- **Rust 系（Moltis / ZeptoClaw）是“功能+安全”的平衡派。** 功能比 Nano/Pico/Zero 全，资源比 OpenClaw 轻，但渠道覆盖与生态体量仍不如 OpenClaw。
- **极致轻量派（ZeroClaw / PicoClaw / NanoClaw）更适合极简或边缘设备。** 适合轻量部署，但功能广度或生态支持有限。
- **nextclaw 的差异点清晰：** UI-first + 一键启动 + 多通道多模型，极适合“快试 / 快搭 / 辅助机”。核心挑战是“让用户相信功能足够”与“安全/隔离成熟度”的信任感。

## 功能矩阵（粗略用户感知版）

符号：✅ 完整覆盖 / 🟡 部分覆盖 / ⚪ 轻量或基础能力

| 项目 | 上手体验 | UI/可视化 | 多通道 | 多模型 | 自动化 | 记忆/存储 | 工具/执行 | 安全隔离 | 典型用户画像 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenClaw | 🟡 向导完整但流程重 | ✅ Web + 多端 + Canvas | ✅ 超多 | ✅ 完整 | ✅ Cron + 复杂路由 | ✅ | ✅ Browser/Canvas/Nodes | 🟡 主要是应用层 | 全能型重度用户 |
| Moltis | 🟡 向导+零配置 | ✅ 内置 Web UI | 🟡 目前 Telegram | ✅ 多 Provider | ✅ Cron | ✅ 嵌入式长期记忆 | ✅ Web/工具/语音 | ✅ 容器隔离 | 想要“安全+功能”的个人用户 |
| ZeroClaw | ✅ CLI 快速 | ⚪ 无明显 UI | 🟡 8 通道 | ✅ 多 Provider | ✅ Cron | ✅ SQLite+向量 | ✅ 工具齐 | ✅ 严格安全策略 | 极致轻量/边缘设备 |
| NanoClaw | ✅ Claude Code 上手 | ⚪ 无 UI | ⚪ 仅 WhatsApp | 🟡 主要 Claude | ✅ 定时任务 | 🟡 组内记忆 | 🟡 基本工具 | ✅ 容器隔离 | 只想用一个渠道的极简用户 |
| PicoClaw | ✅ 快速 | 🟡 基础 Web/CLI | 🟡 Telegram/Discord/LINE/DingTalk | ✅ 多 Provider | ✅ Cron | ✅ 记忆/任务 | ✅ web/exec | 🟡 安全提示仍在早期 | 轻量硬件玩家 |
| ZeptoClaw | ✅ 一键安装 | ⚪ 未强调 UI | 🟡 5 通道 | ✅ 多 Provider | ✅ Cron/Heartbeat | ✅ 记忆/历史 | ✅ 17 工具 + 插件 | ✅ 容器 + 多层安全 | 想要安全可控的高级用户 |
| nextclaw | ✅ 一键启动 | ✅ 内置配置 UI | ✅ 多通道 | ✅ 多 Provider | ✅ Cron + Heartbeat | 🟡 基础持久化 | ✅ Web+Exec | 🟡 主要为配置级隔离 | 追求“快、轻、UI”的用户 |

## 逐项目评估（用户视角）

### OpenClaw

**定位**：全能型个人 AI 平台，覆盖“渠道 + 工具 + 端侧 + 可视化”。

**用户可见功能**
- 超多渠道（WhatsApp/Telegram/Slack/Discord/Google Chat/Signal/iMessage/Teams/Matrix/Zalo/WebChat 等）
- 本地 Gateway + 控制台 UI + 多端节点（macOS/iOS/Android）
- Voice Wake / Talk Mode / Live Canvas / A2UI
- 工具生态（browser、canvas、nodes、cron、skills）

**用户体验亮点**
- 功能多、集成深，适合“一个助手跑所有事”。

**明显缺口 / 风险**
- 资源与复杂度高；用户要理解“通道、路由、节点、会话”等概念。

### Moltis

**定位**：Rust 单二进制个人 AI 网关，功能覆盖面大且带 UI。

**用户可见功能**
- 内置 Web UI（配置、hooks、MCP 管理）
- 多 Provider + 语音 + Web 浏览
- Telegram 频道（其他可扩展）
- Cron、长期记忆、工具并发、MCP
- Docker/Apple Container 沙箱

**用户体验亮点**
- “安全+功能”的平衡感强，且 UI 能降低配置门槛。

**明显缺口 / 风险**
- 频道覆盖目前偏少；生态规模未知。

### IronClaw

**定位**：暂无法确认（未找到公开仓库或文档）。

**用户风险**
- 无法判断功能完整度与可用性。

### ZeroClaw

**定位**：极致轻量的 Rust 网关（多通道、多 Provider、安全优先）。

**用户可见功能**
- 多通道（CLI/Telegram/Discord/Slack/iMessage/Matrix/WhatsApp/Webhook）
- 多 Provider（OpenAI/Anthropic/OpenRouter 等）
- Cron + Memory + Web 工具
- 安全策略覆盖（配对、allowlist、沙箱）

**用户体验亮点**
- 低资源 + 安全感强，适合边缘设备或低配环境。

**明显缺口 / 风险**
- UI 体验弱，主要 CLI 配置。

### NanoClaw

**定位**：极简、单用户、以 Claude Code 为核心的 WhatsApp 助手。

**用户可见功能**
- WhatsApp 入口
- 组隔离、容器隔离
- 定时任务 + Web
- Agent Swarms

**用户体验亮点**
- 代码小、可解释性强；安全边界清晰。

**明显缺口 / 风险**
- 功能集中在“一个渠道 + 一类用户”，泛用性不足。

### PicoClaw

**定位**：Go 实现的超轻量网关，强调 $10 设备可运行。

**用户可见功能**
- Telegram / Discord / DingTalk / LINE
- Cron + Memory + Web Search
- Docker / CLI 运行

**用户体验亮点**
- 轻量、部署快、成本低。

**明显缺口 / 风险**
- 仍处早期，安全提示明确“勿生产使用”；功能完整度偏基础。

### ZeptoClaw

**定位**：Rust 超轻量 + 生产级安全。

**用户可见功能**
- 5 通道（Telegram/Slack/Discord/Webhook/CLI）
- 17 工具 + 插件系统
- 模板、批处理、Agent Swarms
- 容器隔离 + 多层安全防护

**用户体验亮点**
- 安全策略非常明确；功能与资源占用相对平衡。

**明显缺口 / 风险**
- UI 不突出；新用户上手仍需 CLI/配置。

### nextclaw（你的项目）

**定位**：UI-first 的轻量 AI Gateway。强调“一条命令启动 + 浏览器配置”。

**用户可见功能**
- 一键 `nextclaw start`，自动起 UI + Gateway
- UI 里配置 provider / model / channel
- 多通道（Telegram/Discord/WhatsApp/Feishu/DingTalk/Slack/Email/QQ/Mochat）
- 多 Provider（OpenRouter/OpenAI/MiniMax/Moonshot/Gemini/DeepSeek 等）
- Cron + Heartbeat
- Web Search + Exec

**用户体验亮点**
- “最快上手 + UI 配置”这点极强，轻量但功能广。

**明显缺口 / 风险**
- 安全隔离/沙箱/权限模型说明不足（相较 Rust 系的安全叙事）。
- 高级能力（语音/端侧/多租户/插件市场）不明显。

## 对 nextclaw 的建议（产品角度）

1. **强化“极速上手 + UI”叙事**：相较 OpenClaw 的重平台化，这就是最清晰差异点。
2. **补齐安全信任感**：最少做到默认 allowlist、安全警告与“执行命令范围”提示；文档强化“安全模型”。
3. **明确“功能范围边界”**：告诉用户 nextclaw 目前就是“多通道、多模型、轻量化 gateway”，避免被期待成 OpenClaw 全家桶。
4. **增加 1-2 个高感知度功能**：如“模板库/常用任务一键启用”或“低门槛插件安装”。
5. **生态定位**：让用户知道 nextclaw 是“轻量但不玩具”，而不是“简化版 OpenClaw”。

## 风险 / 待确认

- IronClaw 未找到官方仓库或可验证资料，需要补充。
- ZeroClaw/ZeptoClaw/Moltis 的宣称性能或安全数据未做实测，仅依据 README。

## 验证（怎么确认符合预期）

本次仅新增研究报告，无代码改动：

- build / lint / tsc：不适用
- 冒烟测试：不适用

## 发布 / 部署

- 本次为文档研究报告，不涉及发布流程。
