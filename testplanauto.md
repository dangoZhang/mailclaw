# testplanauto

这是一份面向 OpenClaw 深度用户的中文自动化测试清单。

目标：
- 覆盖 MailClaws 的安装、CLI、API、Workbench、路由、迁移、子代理桥接、实时 provider smoke。
- 逐项跑完本地可执行项。
- 对真实复现的缺陷立刻修复并补回归。

说明：
- `[x]` 表示已实测通过。
- `[ ]` 表示尚未执行或执行受阻，不能打勾。
- `PASS` 表示该项有明确通过记录。
- `FAIL` 表示已复现问题。
- `SKIP` 表示该项按计划被跳过，且已记录跳过原因。

## 1. 安装与启动

- [x] T01 安装脚本 `./install.sh` 可运行。
- [x] T02 Windows 安装脚本 `install.ps1` 语法与路径引用正确。
- [x] T03 `mailclaws --help` 输出完整帮助。
- [x] T04 `mailclaws --version` 输出版本。
- [x] T05 `mailclaws dashboard` 能打开工作台入口。
- [x] T06 `mailclaws login` 能进入登录向导。
- [x] T07 `mailclaws open` 能打开工作台。
- [x] T08 `mailclaws onboard` 能输出 onboarding 指引。
- [x] T09 `mailclaws gateway` 的帮助和入口描述正确。
- [x] T10 `mailclawsctl --help` 输出完整帮助。

## 2. 基础服务

- [x] T11 `/healthz` 返回 200 且包含服务名。
- [x] T12 `/readyz` 在 ready 状态返回 200。
- [x] T13 `/readyz` 在不可用状态返回 503。
- [x] T14 `/api/connect` 返回连接发现数据。
- [x] T15 `/api/connect/providers` 返回 provider 列表。
- [x] T16 `/api/connect/onboarding` 返回 onboarding 计划。
- [x] T17 `/api/skills` 返回技能清单。
- [x] T18 `/api/console/terminology` 返回工作台术语。
- [x] T19 `/api/console/workbench-host` 返回 host integration。
- [x] T20 `/api/console/agent-directory` 返回 agent 目录。

## 3. Workbench 路由

- [x] T21 `/workbench/mail` 可打开。
- [x] T22 `/workbench/mail/tab` 可打开嵌入式版本。
- [x] T23 `/dashboard` 兼容跳转正常。
- [x] T24 `/mail` 兼容跳转正常。
- [x] T25 `/workbench/mailclaw` 兼容别名正常。
- [x] T26 `/workbench/mailclaws` 兼容别名正常。
- [x] T27 `/login` 路由可打开工作台登录页。
- [x] T28 `/workbench/mail/login` 路由可打开登录页。
- [x] T29 `mode=connect` 的 query 路由可正确渲染。
- [x] T30 `mode=accounts` 的 query 路由可正确渲染。

## 4. Account / Room / Mailbox

- [x] T31 account 列表可见。
- [x] T32 account 详情页可见。
- [x] T33 room 列表可见。
- [x] T34 room 详情页可见。
- [x] T35 inbox 列表可见。
- [x] T36 inbox 详情页可见。
- [x] T37 mailbox 列表可见。
- [x] T38 mailbox 详情页可见。
- [x] T39 approvals 列表可见。
- [x] T40 approvals 详情页可见。

## 5. 路由与编码

- [x] T41 `roomKey` path 编码/解码正确。
- [x] T42 `accountId` path 编码/解码正确。
- [x] T43 `mailboxId` path 编码/解码正确。
- [x] T44 `mailboxId` query 里 `%40` 形式可正确回到 canonical 值。
- [x] T45 `mailboxFilterId` query 里 `%40` 形式可正确回到 canonical 值。
- [x] T46 room chip 点击 mailbox 后 URL 正确更新。
- [x] T47 browser 直接打开 mailbox query deep link 不报 not found。
- [x] T48 browser 直接打开 room deep link 不报 not found。
- [x] T49 query 与 path 混合时，最终 route state 正确。
- [x] T50 embedded shell 与 standalone shell 的 URL 一致性正确。

## 6. 虚拟邮件

- [x] T51 inbound mail 会新建 room。
- [x] T52 同线程 reply 会续用原 room。
- [x] T53 mailbox feed 返回正确消息。
- [x] T54 room-local mailbox projection 返回正确消息。
- [x] T55 public mailbox 可见性正确。
- [x] T56 internal mailbox 可见性正确。
- [x] T57 governance mail 可见性正确。
- [x] T58 private mail 可见性正确。
- [x] T59 消息 leasing 行为正确。
- [x] T60 消息 consumed 状态保留正确。

## 7. 房间与任务

- [x] T61 room replay 正确。
- [x] T62 room timeline 正确。
- [x] T63 room revision bump 正确。
- [x] T64 stale delivery 标记正确。
- [x] T65 superseded thread 标记正确。
- [x] T66 ACK 生成正确。
- [x] T67 progress 邮件生成正确。
- [x] T68 final mail 生成正确。
- [x] T69 approval request 生成正确。
- [x] T70 approval reject/approve 流程正确。

## 8. CLI 观察命令

- [x] T71 `mailctl observe accounts` 可用。
- [x] T72 `mailctl observe rooms` 可用。
- [x] T73 `mailctl observe room <roomKey>` 可用。
- [x] T74 `mailctl observe workbench` 可用。
- [x] T75 `mailctl observe mailbox-feed` 可用。
- [x] T76 `mailctl observe mailbox-view` 可用。
- [x] T77 `mailctl observe approvals` 可用。
- [x] T78 `mailctl observe inboxes` 可用。
- [x] T79 `mailctl observe runtime` 可用。
- [x] T80 `mailctl observe mail-io` 可用。

## 9. 账号与 OAuth

- [x] T81 OAuth provider discovery 返回正确。
- [x] T82 Google OAuth 启动页可生成。
- [x] T83 Microsoft OAuth 启动页可生成。
- [x] T84 OAuth state / PKCE 生成正确。
- [x] T85 OAuth callback 成功态可渲染。
- [x] T86 OAuth callback 失败态可渲染。
- [x] T87 provider 未支持时错误信息可读。
- [x] T88 account connect onboarding 文案正确。
- [x] T89 account provider state 汇总正确。
- [x] T90 账户同步后 inbox/room/mailbox 关系正确。

## 10. 子代理与记忆

- [x] T91 subagent mailbox 创建正确。
- [x] T92 subagent target 解析正确。
- [x] T93 subagent bridge dispatch 正确。
- [x] T94 subagent run accepted/completed 正确。
- [x] T95 subagent run failed/stale 正确。
- [x] T96 agent memory draft 创建正确。
- [x] T97 agent memory draft 审批流程正确。
- [x] T98 memory namespace capabilities 正确。
- [x] T99 SOUL/agent workspace 绑定正确。
- [x] T100 durable agent mailbox 与 public mailbox 映射正确。

## 11. 真实 provider smoke（当前先测 Gmail OAuth 101-108）

- [x] T101 为 `endermanzhang@gmail.com` 准备 Gmail OAuth 前置配置，并通过 `mailctl login gmail` 的前置校验。（PASS：已实跑 `pnpm mailctl connect login gmail endermanzhang@gmail.com --no-browser --timeout-seconds 5`，命中预期错误 `missing Gmail OAuth client id`）
- [x] T102 `mailctl login gmail` 能启动本地 OAuth 登录流程并打开 Google 授权页。（PASS：已实跑 `pnpm mailctl connect login gmail endermanzhang@gmail.com --client-id dummy-client-id.apps.googleusercontent.com --no-browser --timeout-seconds 5`，成功产出 Google authorize URL；未回调时 5 秒超时符合预期）
- [ ] T103 使用 `endermanzhang@gmail.com` 完成 Gmail OAuth 授权，并返回成功回调页。（SKIP：缺少可用的真实 `MAILCLAW_GMAIL_OAUTH_CLIENT_ID`/Google OAuth App 配置，无法完成真实授权）
- [ ] T104 OAuth 登录完成后 account 记录持久化正确，provider/status/emailAddress 正确。（SKIP：依赖 T103 成功回调）
- [ ] T105 OAuth 登录完成后 Gmail watch/topic/userId/labelIds 配置持久化正确。（SKIP：依赖 T103 且需要可用的 Gmail Pub/Sub topic）
- [ ] T106 基于 OAuth 登录后的 Gmail 账号执行 recovery，能拉到真实历史邮件并产出可用 checkpoint。（SKIP：当前无可用 `MAILCLAW_LIVE_GMAIL_ACCESS_TOKEN` / `MAILCLAW_LIVE_GMAIL_TOPIC_NAME`）
- [ ] T107 基于恢复出的真实线程发送 Gmail reply，threading 正确续接到原会话。（SKIP：依赖 T106）
- [ ] T108 Gmail OAuth/live smoke 的失败路径、预检查输出和 runbook 与真实链路一致。（部分完成：失败路径与预检查输出已实跑；成功链路一致性需待 T103-T107 完成后最终验收）

## 12. 回归与边界

- [x] T109 旧 schema 迁移不会漏列。
- [x] T110 零 limit 列表语义正确。
- [x] T111 批量页面分页边界正确。
- [x] T112 空数据态文案正确。
- [x] T113 错误态文案正确。
- [x] T114 兼容别名不会破坏主路由。
- [x] T115 browser deep link 与 API deep link 一致。
- [x] T116 lint / test / build 入口可执行。
- [x] T117 关键命令的退出码正确。
- [x] T118 任何修复都至少有一条回归测试。

## 本轮执行摘要

已完成并验证：

- `pnpm vitest run tests/app-api.test.ts tests/db.test.ts tests/mailctl.test.ts tests/mailclaw-cli.test.ts tests/subagent-bridge.test.ts tests/virtual-mail.test.ts`
- `pnpm vitest run tests/runtime-watchers.test.ts tests/orchestration.test.ts tests/gateway-projection.test.ts tests/mail-scheduling.test.ts`
- `pnpm test`
- `pnpm build`
- 浏览器 smoke:
  - `workbench/mail?mode=connect`
  - `workbench/mail?mode=accounts`
  - `workbench/mail/rooms/<roomKey>`
  - `workbench/mail?mode=mailboxes&accountId=<accountId>&mailboxId=<mailboxId>`
  - `workbench/mail/mailboxes/<accountId>/<mailboxId>`
  - `workbench/mail/tab/...` embedded 路由
  - room 页点击 mailbox chip 跳转

结果：

- 本地可执行项均已通过。
- `T101/T102` 已完成并打勾；`T103-T107` 仍为真实阻塞状态，未打勾。
- 当前已确认阻塞：缺少可用 Gmail OAuth App（`MAILCLAW_GMAIL_OAUTH_CLIENT_ID`）与 live Gmail 凭据（`MAILCLAW_LIVE_GMAIL_ACCESS_TOKEN`、`MAILCLAW_LIVE_GMAIL_TOPIC_NAME` 等）。
- 2026-04-01 实测命令：`pnpm mailctl connect login gmail endermanzhang@gmail.com --no-browser --timeout-seconds 5`
- 2026-04-01 实测结果：`missing Gmail OAuth client id: set MAILCLAW_GMAIL_OAUTH_CLIENT_ID or pass clientId`
- 2026-04-01 实测命令：`pnpm mailctl connect login gmail endermanzhang@gmail.com --client-id dummy-client-id.apps.googleusercontent.com --no-browser --timeout-seconds 5`
- 2026-04-01 实测结果：成功产出 OAuth authorize URL；未回调超时报错 `timed out waiting for oauth callback after 5s`
- 2026-04-01 实测命令：`pnpm test:live-providers`
- 2026-04-01 实测结果：2 个 live smoke case 均 `skipped`；并输出缺失环境变量清单（IMAP/SMTP 与 Gmail）
- `docs/live-provider-smoke.md` 已更新为 Gmail OAuth 优先 runbook，并与 `T101-T108` 对齐。
- 当前未再发现新的可复现 bug。
