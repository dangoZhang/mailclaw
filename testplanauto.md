# testplanauto

这是一份面向 OpenClaw 深度用户的中文自动化测试清单。

目标：
- 覆盖 MailClaws 的安装、CLI、API、Workbench、路由、迁移、子代理桥接、实时 provider smoke。
- 逐项跑完本地可执行项。
- 对真实复现的缺陷立刻修复并补回归。

说明：
- `PASS` 表示已验证通过。
- `FAIL` 表示已复现问题。
- `SKIP` 表示需要真实凭据、外部服务或当前环境不满足。

## 1. 安装与启动

- [ ] T01 安装脚本 `./install.sh` 可运行。
- [ ] T02 Windows 安装脚本 `install.ps1` 语法与路径引用正确。
- [ ] T03 `mailclaws --help` 输出完整帮助。
- [ ] T04 `mailclaws --version` 输出版本。
- [ ] T05 `mailclaws dashboard` 能打开工作台入口。
- [ ] T06 `mailclaws login` 能进入登录向导。
- [ ] T07 `mailclaws open` 能打开工作台。
- [ ] T08 `mailclaws onboard` 能输出 onboarding 指引。
- [ ] T09 `mailclaws gateway` 的帮助和入口描述正确。
- [ ] T10 `mailclawsctl --help` 输出完整帮助。

## 2. 基础服务

- [ ] T11 `/healthz` 返回 200 且包含服务名。
- [ ] T12 `/readyz` 在 ready 状态返回 200。
- [ ] T13 `/readyz` 在不可用状态返回 503。
- [ ] T14 `/api/connect` 返回连接发现数据。
- [ ] T15 `/api/connect/providers` 返回 provider 列表。
- [ ] T16 `/api/connect/onboarding` 返回 onboarding 计划。
- [ ] T17 `/api/skills` 返回技能清单。
- [ ] T18 `/api/console/terminology` 返回工作台术语。
- [ ] T19 `/api/console/workbench-host` 返回 host integration。
- [ ] T20 `/api/console/agent-directory` 返回 agent 目录。

## 3. Workbench 路由

- [ ] T21 `/workbench/mail` 可打开。
- [ ] T22 `/workbench/mail/tab` 可打开嵌入式版本。
- [ ] T23 `/dashboard` 兼容跳转正常。
- [ ] T24 `/mail` 兼容跳转正常。
- [ ] T25 `/workbench/mailclaw` 兼容别名正常。
- [ ] T26 `/workbench/mailclaws` 兼容别名正常。
- [ ] T27 `/login` 路由可打开工作台登录页。
- [ ] T28 `/workbench/mail/login` 路由可打开登录页。
- [ ] T29 `mode=connect` 的 query 路由可正确渲染。
- [ ] T30 `mode=accounts` 的 query 路由可正确渲染。

## 4. Account / Room / Mailbox

- [ ] T31 account 列表可见。
- [ ] T32 account 详情页可见。
- [ ] T33 room 列表可见。
- [ ] T34 room 详情页可见。
- [ ] T35 inbox 列表可见。
- [ ] T36 inbox 详情页可见。
- [ ] T37 mailbox 列表可见。
- [ ] T38 mailbox 详情页可见。
- [ ] T39 approvals 列表可见。
- [ ] T40 approvals 详情页可见。

## 5. 路由与编码

- [ ] T41 `roomKey` path 编码/解码正确。
- [ ] T42 `accountId` path 编码/解码正确。
- [ ] T43 `mailboxId` path 编码/解码正确。
- [ ] T44 `mailboxId` query 里 `%40` 形式可正确回到 canonical 值。
- [ ] T45 `mailboxFilterId` query 里 `%40` 形式可正确回到 canonical 值。
- [ ] T46 room chip 点击 mailbox 后 URL 正确更新。
- [ ] T47 browser 直接打开 mailbox query deep link 不报 not found。
- [ ] T48 browser 直接打开 room deep link 不报 not found。
- [ ] T49 query 与 path 混合时，最终 route state 正确。
- [ ] T50 embedded shell 与 standalone shell 的 URL 一致性正确。

## 6. 虚拟邮件

- [ ] T51 inbound mail 会新建 room。
- [ ] T52 同线程 reply 会续用原 room。
- [ ] T53 mailbox feed 返回正确消息。
- [ ] T54 room-local mailbox projection 返回正确消息。
- [ ] T55 public mailbox 可见性正确。
- [ ] T56 internal mailbox 可见性正确。
- [ ] T57 governance mail 可见性正确。
- [ ] T58 private mail 可见性正确。
- [ ] T59 消息 leasing 行为正确。
- [ ] T60 消息 consumed 状态保留正确。

## 7. 房间与任务

- [ ] T61 room replay 正确。
- [ ] T62 room timeline 正确。
- [ ] T63 room revision bump 正确。
- [ ] T64 stale delivery 标记正确。
- [ ] T65 superseded thread 标记正确。
- [ ] T66 ACK 生成正确。
- [ ] T67 progress 邮件生成正确。
- [ ] T68 final mail 生成正确。
- [ ] T69 approval request 生成正确。
- [ ] T70 approval reject/approve 流程正确。

## 8. CLI 观察命令

- [ ] T71 `mailctl observe accounts` 可用。
- [ ] T72 `mailctl observe rooms` 可用。
- [ ] T73 `mailctl observe room <roomKey>` 可用。
- [ ] T74 `mailctl observe workbench` 可用。
- [ ] T75 `mailctl observe mailbox-feed` 可用。
- [ ] T76 `mailctl observe mailbox-view` 可用。
- [ ] T77 `mailctl observe approvals` 可用。
- [ ] T78 `mailctl observe inboxes` 可用。
- [ ] T79 `mailctl observe runtime` 可用。
- [ ] T80 `mailctl observe mail-io` 可用。

## 9. 账号与 OAuth

- [ ] T81 OAuth provider discovery 返回正确。
- [ ] T82 Google OAuth 启动页可生成。
- [ ] T83 Microsoft OAuth 启动页可生成。
- [ ] T84 OAuth state / PKCE 生成正确。
- [ ] T85 OAuth callback 成功态可渲染。
- [ ] T86 OAuth callback 失败态可渲染。
- [ ] T87 provider 未支持时错误信息可读。
- [ ] T88 account connect onboarding 文案正确。
- [ ] T89 account provider state 汇总正确。
- [ ] T90 账户同步后 inbox/room/mailbox 关系正确。

## 10. 子代理与记忆

- [ ] T91 subagent mailbox 创建正确。
- [ ] T92 subagent target 解析正确。
- [ ] T93 subagent bridge dispatch 正确。
- [ ] T94 subagent run accepted/completed 正确。
- [ ] T95 subagent run failed/stale 正确。
- [ ] T96 agent memory draft 创建正确。
- [ ] T97 agent memory draft 审批流程正确。
- [ ] T98 memory namespace capabilities 正确。
- [ ] T99 SOUL/agent workspace 绑定正确。
- [ ] T100 durable agent mailbox 与 public mailbox 映射正确。

## 11. 真实 provider smoke

- [ ] T101 live IMAP smoke 能连通真实 IMAP。
- [ ] T102 live IMAP smoke 能拿到 durable UIDVALIDITY。
- [ ] T103 live IMAP smoke 能发出真实 SMTP outbox。
- [ ] T104 live Gmail recovery 能跑通。
- [ ] T105 live Gmail reply threading 能跑通。
- [ ] T106 live provider smoke 的跳过逻辑正确。
- [ ] T107 live provider smoke 的前置预检查输出正确。
- [ ] T108 live provider smoke 的手工核对项文档正确。

## 12. 回归与边界

- [ ] T109 旧 schema 迁移不会漏列。
- [ ] T110 零 limit 列表语义正确。
- [ ] T111 批量页面分页边界正确。
- [ ] T112 空数据态文案正确。
- [ ] T113 错误态文案正确。
- [ ] T114 兼容别名不会破坏主路由。
- [ ] T115 browser deep link 与 API deep link 一致。
- [ ] T116 lint / test / build 入口可执行。
- [ ] T117 关键命令的退出码正确。
- [ ] T118 任何修复都至少有一条回归测试。

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
- `T101-T108` 属于 live provider smoke，当前环境没有真实 provider 凭据，因此保持 `SKIP`。
- 当前未再发现新的可复现 bug。
