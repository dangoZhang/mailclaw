# MailClaw

<p align="center">
  面向耐久化、可审计、多智能体协作的邮件原生运行时。
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a> ·
  <a href="./README.fr.md">Français</a>
</p>

MailClaw 把邮件线程变成具备显式状态、可回放记录、审批链路、局部检索和受治理外发能力的持久化房间。它起步于 [OpenClaw](https://github.com/openclaw/openclaw)，但目标是邮件原生运行时，而不是薄薄的传输插件。

MailClaw 不绑定 QQ Mail，也不默认要求某一家邮箱。推荐接入方式是：输入你本来就在用的邮箱地址，让 MailClaw 推荐 provider 路径，再连接这个账号。当前内建支持 Gmail、Outlook、QQ、iCloud、Yahoo、163/126，以及通用 IMAP/SMTP 邮箱。

## 安装（推荐）

运行时要求：Node.js 22+。

```bash
./install.sh
```

## 快速开始（TL;DR）

1. `MAILCLAW_FEATURE_MAIL_INGEST=true pnpm mailclaw`
2. 新开一个终端，运行 `pnpm mailclaw onboard you@example.com`
3. 运行 `pnpm mailclaw login`
4. 用另一个邮箱给刚接入的地址发一封测试邮件
5. 运行 `pnpm mailclaw dashboard`

这就是推荐的首轮路径：启动 MailClaw、登录一个邮箱、发一封真实邮件，然后直接在 workbench 里读会话。`mailclaw dashboard` 会打开完整的 `/workbench/mail`。`/workbench/mail/tab` 会以嵌入模式复用同一套 Mail tab UI，供上层 OpenClaw/Gateway workbench 挂载。

如果你不确定该选哪个 provider，直接运行 `pnpm mailclaw login` 即可。交互向导会先问你的邮箱地址，识别到常见域名时会自动带出常用主机配置；识别不到时就走通用 IMAP/SMTP 提示。

## 一键 Demo

如果你想先看一个不依赖真实邮箱登录的本地演示：

1. `pnpm install`
2. `pnpm demo:mail`
3. 打开 `http://127.0.0.1:3020/workbench/mail`

这个 demo 会使用独立的 `.demo/` 状态目录，并自动准备好：

- 一个等待审批的 room
- 一个带 internal researcher/reviewer 邮件链的 room
- 一个已经转人工 handoff 的 room

对应 deep link 也会写入 `.demo/output/manifest.json`。

## MailClaw 是什么

当前阶段，MailClaw 的定位是“后端 runtime + 浏览器/CLI workbench 观察面”。核心目标是线程级连续性、基于虚拟邮件的内部协作、可回放运维链路，以及审批闸门下的真实外发治理。

## 与 OpenClaw 的关系

MailClaw 复用 OpenClaw 生态入口（Gateway、runtime substrate、agent packaging），并保持 Gateway 兼容。MailClaw 负责定义 room 真相层、虚拟邮件协作语义、approval/outbox 治理，以及 replay/recovery 的运维模型。

## 今天已经可用

- 基于 SQLite 的线程优先 room kernel
- 基于回复头与 provider 线程线索的确定性 room/session 身份
- 回放、恢复、隔离区、死信、重发、批准、拒绝等耐久治理流程
- 面向内部 orchestrator/worker 协作的 virtual mail 平面与耐久 projection 状态
- 内建 IMAP 抓取、IMAP/Gmail watcher 控制、Gmail history recovery/watch 接入、SMTP/Gmail 外发
- account 级 SMTP 外发配置（适用于非 Gmail 账户）
- `POST /api/inbound/raw` 的 forward/raw RFC822 入站能力
- 通过 `mailctl` 与 `/api/auth/:provider/*` 提供 Gmail/Outlook OAuth 邮箱登录
- 通过 `mailctl connect providers` 与 `GET /api/connect/providers` 提供 provider/setup 目录，覆盖 Gmail、Outlook、QQ、iCloud、Yahoo、163/126、通用 IMAP，以及 forward/raw MIME 回退路径
- Gateway 绑定的 room 现在会对 `final_ready` 一类结果自动留下 outcome projection 记录，并可在 replay、API 和 Mail workbench 中查看
- 覆盖 room、approval、provider state、inbox projection、mailbox console/feed、gateway projection trace 的 HTTP/CLI 观察面
- 浏览器 dashboard 入口在 `/workbench/mail`，同一套 Mail tab shell 也会复用在 `/workbench/mail/tab`；`/dashboard`、`/mail` 与 `/console/*` 保留为兼容别名，可统一查看 accounts、rooms、approvals、mailboxes 与 gateway trace
- `GET /api/console/workbench-host` 现会暴露 mail tab 的 host/workbench 集成元数据，便于后续被 Gateway/OpenClaw workbench 作为嵌入标签页发现与挂载

## 3 分钟首封邮件路径

如果你习惯普通邮箱客户端，可以把 MailClaw 当成“登录账号 -> 发一封邮件 -> 看会话”：

1. 启动 runtime：`pnpm mailclaw`
2. 先让 MailClaw 推荐最省事的接入路径：`pnpm mailclaw onboard you@example.com`
3. 登录邮箱账号：`pnpm mailclaw login`
4. 用另一个邮箱给该邮箱发一封测试邮件
5. 打开 `http://127.0.0.1:3000/workbench/mail`
6. 在浏览器里进入已连接账号页面并查看会话

如果你还想用 CLI 确认状态：

- `pnpm mailclaw accounts`
- `pnpm mailclaw rooms`
- `pnpm mailclaw inboxes <accountId>`
- `pnpm mailclaw replay <roomKey>`

同样的推荐流程也暴露在 `GET /api/connect/onboarding?emailAddress=you@example.com`。

如果你已经在用 OpenClaw，建议先从 bridge 模式进入，再观察 MailClaw 的 room truth，而不是继续把 session transcript 当真相：

- `MAILCLAW_FEATURE_OPENCLAW_BRIDGE=true MAILCLAW_FEATURE_MAIL_INGEST=true pnpm dev`
- `pnpm mailctl observe runtime`
- `pnpm mailctl observe workbench <accountId>`

查看某个 room 的内部智能体协作邮件：

- `pnpm mailctl observe mailbox-view <roomKey> <mailboxId> virtual_internal`
- `pnpm mailctl observe mailbox-feed <accountId> <mailboxId> 50 virtual_internal`

## 当前边界

- 已有 `/workbench/mail` 浏览器 Mail workbench 入口，而且 `/console/*` 现在也会落到同一套 OpenClaw 风格 shell，而不是另一套旧控制台。
- 当前这一层仍是 Mail workbench，不是完整可写的 Outlook 风格邮箱客户端。
- Gateway outcome trace 现已可在 room 绑定 Gateway 后自动留下，但完整的上游 Gateway ingress / Workbench 自动接线仍未完成。
- 连接引导已提供 CLI/API 目录，但 MailClaw 仍不会替你自动配置 provider 侧的 DNS、Pub/Sub topic、转发规则或邮箱策略。
- OpenClaw embedded runtime/session-manager 的一等接入与完整 backend enforcement 收口仍在 residual closeout（`plan12`）里。

## OpenClaw 配置继承

当 MailClaw 与 OpenClaw 一起部署时，如果没有显式设置 MailClaw 对应项，现在会自动继承一小组兼容环境变量：

- `OPENCLAW_PUBLIC_BASE_URL -> MAILCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_BASE_URL -> MAILCLAW_OPENCLAW_BASE_URL`
- `OPENCLAW_GATEWAY_TOKEN -> MAILCLAW_OPENCLAW_GATEWAY_TOKEN`
- `OPENCLAW_AGENT_ID -> MAILCLAW_OPENCLAW_AGENT_ID`
- `OPENCLAW_SESSION_PREFIX -> MAILCLAW_OPENCLAW_SESSION_PREFIX`

这样至少能把 workbench 链接和 bridge 基础接线先对齐，不需要在两套 env 里重复抄一遍。

## 文档入口

- [文档索引（中文）](./docs/index.zh-CN.md)
- [快速开始（中文）](./docs/getting-started.zh-CN.md)
- [Mail Workbench（中文）](./docs/operator-console.zh-CN.md)
- [运维指南（中文）](./docs/operators-guide.zh-CN.md)
- [集成指南（中文）](./docs/integrations.zh-CN.md)
- [发布素材（中文）](./docs/release-assets.zh-CN.md)

英文和法文文档可通过每页顶部语言链接切换。

本地启动文档网站：

```bash
pnpm docs:dev
```

构建静态文档站：

```bash
pnpm docs:build
```

## 快速启动

安装依赖：

```bash
pnpm install
```

用 OpenClaw bridge 模式启动：

```bash
MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON='{"toolPolicies":["mail-orchestrator","mail-attachment-reader","mail-researcher","mail-drafter","mail-reviewer","mail-guard"],"sandboxPolicies":["mail-room-orchestrator","mail-room-worker"],"networkAccess":"allowlisted","filesystemAccess":"workspace-read","outboundMode":"approval_required"}' \
MAILCLAW_FEATURE_MAIL_INGEST=true \
MAILCLAW_FEATURE_OPENCLAW_BRIDGE=true \
MAILCLAW_OPENCLAW_GATEWAY_TOKEN=dev-token \
pnpm dev
```

然后进入[快速开始文档](./docs/getting-started.zh-CN.md)，完成账号接入和最小闭环演示。

默认本地模式直接用：

```bash
MAILCLAW_FEATURE_MAIL_INGEST=true pnpm mailclaw
pnpm mailclaw onboard you@example.com
pnpm mailclaw login
pnpm mailclaw open
```

推荐的邮箱接入顺序：

```bash
pnpm mailclaw onboard you@example.com
pnpm mailclaw login
pnpm mailclaw accounts
```

无浏览器环境下的 OAuth 登录：

```bash
pnpm mailctl connect login oauth gmail <accountId> [displayName] --no-browser
pnpm mailctl connect login oauth outlook <accountId> [displayName] --no-browser
```

## 发布验收

发版前建议至少执行：

```bash
pnpm build
pnpm test:workflow
pnpm test:security
pnpm docs:build
```

可选的真实 provider smoke：

```bash
pnpm test:live-providers
```

## 许可

MailClaw 使用 [MIT 许可](./LICENSE)，与 [OpenClaw](https://github.com/openclaw/openclaw) 保持一致。
