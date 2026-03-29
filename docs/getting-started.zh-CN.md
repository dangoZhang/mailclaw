# 快速开始

<p align="center">
  <a href="./getting-started.md">English</a> ·
  <a href="./getting-started.zh-CN.md"><strong>简体中文</strong></a> ·
  <a href="./getting-started.fr.md">Français</a>
</p>

本指南先走普通邮箱用户路径：安装、登录一个邮箱、发一封测试邮件、在浏览器里看会话。更深的运维和开发者路径放在后面。

MailClaw 不默认假设你用的是 QQ Mail 或任何单一 provider。直接从你已经在用的邮箱地址开始即可。当前内建支持 Gmail、Outlook、QQ、iCloud、Yahoo、163/126，以及通用 IMAP/SMTP 邮箱。

## 前置条件

- Node.js 与 `pnpm`
- 本仓库代码
- 可选：真实邮箱凭据（用于 live provider 测试）

最快的本地安装方式：

```bash
./install.sh
```

或者从源码安装依赖：

```bash
pnpm install
```

## 1. 启动 MailClaw

默认本地模式：

```bash
MAILCLAW_FEATURE_MAIL_INGEST=true \
pnpm mailclaw
```

启动后先打开浏览器 dashboard：

```text
http://127.0.0.1:3000/workbench/mail
```

`mailclaw` 是面向普通用户的入口。它默认启动本地 runtime，同时提供 `mailclaw onboard`、`mailclaw login`、`mailclaw dashboard`、`mailclaw status`、`mailclaw doctor` 这些更短的引导命令。`mailclaw dashboard` 会打开完整的 `/workbench/mail`。`/workbench/mail/tab` 会以嵌入模式复用同一套 Mail tab UI，供上层 OpenClaw/Gateway workbench 挂载；`/console/*` 则保留为指向同一工作台的兼容别名。

Bridge 模式（兼容 OpenClaw）：

```bash
MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON='{"toolPolicies":["mail-orchestrator","mail-attachment-reader","mail-researcher","mail-drafter","mail-reviewer","mail-guard"],"sandboxPolicies":["mail-room-orchestrator","mail-room-worker"],"networkAccess":"allowlisted","filesystemAccess":"workspace-read","outboundMode":"approval_required"}' \
MAILCLAW_FEATURE_MAIL_INGEST=true \
MAILCLAW_FEATURE_OPENCLAW_BRIDGE=true \
MAILCLAW_OPENCLAW_GATEWAY_TOKEN=dev-token \
pnpm dev
```

Command 模式（本地 runtime 命令）：

```bash
MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON='{"toolPolicies":["mail-orchestrator","mail-attachment-reader","mail-researcher","mail-drafter","mail-reviewer","mail-guard"],"sandboxPolicies":["mail-room-orchestrator","mail-room-worker"],"networkAccess":"allowlisted","filesystemAccess":"workspace-read","outboundMode":"approval_required"}' \
MAILCLAW_RUNTIME_MODE=command \
MAILCLAW_RUNTIME_COMMAND='mail-runtime --stdio' \
MAILCLAW_FEATURE_MAIL_INGEST=true \
pnpm dev
```

只要 runtime turn 含有 `executionPolicy` 元数据，就必须提供 `MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON`。

## 2. 接入账号

可选路径：

- 先查看 provider/setup 目录：`pnpm mailclaw providers [provider]`
- 先让系统按邮箱地址推荐路径：`pnpm mailclaw onboard you@example.com`
- 终端交互向导：`pnpm mailclaw login`
- Gmail OAuth：`pnpm mailctl connect login gmail <accountId> [displayName]`
- Outlook OAuth：`pnpm mailctl connect login outlook <accountId> [displayName]`
- 无浏览器 Gmail OAuth：`pnpm mailctl connect login oauth gmail <accountId> [displayName] --no-browser`
- 无浏览器 Outlook OAuth：`pnpm mailctl connect login oauth outlook <accountId> [displayName] --no-browser`
- API 注册账号：`POST /api/accounts`

推荐 bootstrap 顺序：

```bash
pnpm mailclaw onboard you@example.com
pnpm mailclaw login
pnpm mailclaw accounts
```

如果你不确定该选哪个 provider，直接用 `pnpm mailclaw login`。向导会先问邮箱地址，识别到常见域名时自动带出常用配置；识别不到时就退回通用 IMAP/SMTP 提示。

查看已接入账号：

```bash
pnpm mailclaw accounts
```

Provider setup 目录 API：

```bash
curl -s http://127.0.0.1:3000/api/connect
curl -s "http://127.0.0.1:3000/api/connect/onboarding?emailAddress=you@example.com"
curl -s http://127.0.0.1:3000/api/connect/providers
curl -s http://127.0.0.1:3000/api/connect/providers/gmail
```

<a id="three-minute-first-mail"></a>

## 3. 先跑通第一封真实邮件 {#three-minute-first-mail}

账号登录后，先按日常邮件习惯走一遍：

1. 先从浏览器 workbench，或这里查看已连接邮箱地址：
   - `pnpm mailclaw accounts show <accountId>`
2. 用另一个邮箱客户端/账号给该地址发送一封邮件。
3. 运行 `mailclaw dashboard`，或打开 `http://127.0.0.1:3000/workbench/mail`，进入已连接账号页面。
4. 直接在浏览器里读取会话。
5. 如果你还想用 CLI 确认状态：
   - `pnpm mailclaw rooms`
   - `pnpm mailclaw inboxes <accountId>`
   - `pnpm mailclaw replay <roomKey>`
6. 如果你之后想看内部智能体协作邮件：
   - `pnpm mailclaw workbench <accountId> <roomKey>`
   - `pnpm mailctl mailbox view <roomKey> <mailboxId>`
   - `pnpm mailctl mailbox feed <accountId> <mailboxId>`

这是当前最短的“登录 -> 收信 -> 直接读会话”闭环。room replay、approval、internal mailbox feed 都还在，但不再要求你第一步就理解这些内部概念。

## 4. 路径 A：provider mail -> room -> approval -> delivery

注入规范化入站邮件：

```bash
curl -X POST 'http://127.0.0.1:3000/api/inbound?processImmediately=true' \
  -H 'content-type: application/json' \
  -d '{
    "accountId": "acct-1",
    "mailboxAddress": "mailclaw@example.com",
    "envelope": {
      "providerMessageId": "provider-1",
      "messageId": "<msg-1@example.com>",
      "subject": "API room",
      "from": { "email": "sender@example.com" },
      "to": [{ "email": "mailclaw@example.com" }],
      "text": "Hello from the API",
      "headers": [{ "name": "Message-ID", "value": "<msg-1@example.com>" }]
    }
  }'
```

查看 room 与审批状态：

```bash
pnpm mailctl observe rooms
pnpm mailctl observe room <roomKey>
pnpm mailctl observe approvals room <roomKey>
```

投递待发送 outbox：

```bash
pnpm mailctl operate deliver-outbox
```

## 5. 路径 B：Gateway turn -> virtual mail -> room -> final outcome

把 Gateway turn 投影进 MailClaw：

```bash
curl -X POST 'http://127.0.0.1:3000/api/gateway/project' \
  -H 'content-type: application/json' \
  -d '{
    "sessionKey": "gw-session-1",
    "sourceControlPlane": "openclaw",
    "fromPrincipalId": "agent:front",
    "fromMailboxId": "front-mailbox",
    "toMailboxIds": ["mail-orchestrator"],
    "kind": "claim",
    "visibility": "internal",
    "subject": "Gateway projection smoke",
    "bodyRef": "gateway message body",
    "inputsHash": "smoke-hash-1"
  }'
```

查看投影链路和 room 时间线：

```bash
pnpm mailctl gateway trace <roomKey>
pnpm mailctl replay <roomKey>
```

边界说明：Gateway projection API 已实现，但本仓库尚未把完整上游 Gateway 事件流自动接通。

## 6. 路径 C：internal multi-agent -> reducer/reviewer/guard -> projected outcome

本地开启 worker/governance 相关开关：

```bash
MAILCLAW_FEATURE_SWARM_WORKERS=true \
MAILCLAW_FEATURE_APPROVAL_GATE=true \
MAILCLAW_FEATURE_IDENTITY_TRUST_GATE=true \
pnpm dev
```

然后通过 room mailbox/feed 观察内部协作工件：

```bash
pnpm mailctl mailbox view <roomKey> <mailboxId>
pnpm mailctl mailbox feed <accountId> <mailboxId>
pnpm mailctl approvals trace <roomKey>
```

可通过 origin 过滤（`provider_mail`、`gateway_chat`、`virtual_internal`）检查内部多智能体状态流转。

## 7. 下一步

- 运维与排障流程：[运维指南](./operators-guide.zh-CN.md)
- Provider/Gateway/OpenClaw 接入方式：[集成指南](./integrations.zh-CN.md)
- 真实凭据 smoke 流程：[Live Provider Smoke](./live-provider-smoke.md)

发布验收基线：

```bash
pnpm build
pnpm test:workflow
pnpm test:security
pnpm docs:build
```
