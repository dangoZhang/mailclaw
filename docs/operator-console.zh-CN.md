# Mail Workbench

<p align="center">
  <a href="./operator-console.md">English</a> ·
  <a href="./operator-console.zh-CN.md"><strong>简体中文</strong></a> ·
  <a href="./operator-console.fr.md">Français</a>
</p>

MailClaw 现在已经内置 `/workbench/mail` 的 OpenClaw 风格浏览器 workbench。它是 MailClaw 的邮件页，用来在一个浏览器视图里查看 rooms、approvals、provider state、mailbox projection 和 Gateway trace。

当前规范入口是 `/workbench/mail`。`/workbench/mail/tab` 会以嵌入模式复用同一套 UI，`/mail` 与 `/console/*` 则作为指向同一 shell 的兼容别名。

## 入口路由

- `/workbench/mail`
- `/workbench/mail/accounts/:accountId`
- `/workbench/mail/inboxes/:accountId/:inboxId`
- `/workbench/mail/rooms/:roomKey`
- `/workbench/mail/mailboxes/:accountId/:mailboxId`

这些路由可以稳定深链。`/mail` 与 `/console/*` 仍可兼容访问。当前第一批 UI 过滤参数为：

- `status`
- `originKind`
- `mailboxId`
- `approvalStatus`

## 30 秒定位内部 Agent Mailbox

邮件用户建议按这个最短路径操作：

1. 打开 `/workbench/mail/accounts/:accountId`
2. 点击刚收到邮件的 room
3. 在 room 详情里打开一个 mailbox 参与者
4. 跳转到 `/workbench/mail/mailboxes/:accountId/:mailboxId` 检查该 mailbox 的 feed 与投递状态

CLI 对应命令：

- `pnpm mailctl mailbox feed <accountId> <mailboxId>`
- `pnpm mailctl mailbox view <roomKey> <mailboxId>`

## 第一阶段已覆盖内容

- `Accounts`：账号健康、provider 模式、room 数量、待审批数量
- `Rooms`：room 列表、状态、attention 等级、来源、审批数、delivery 数
- `Detail`：room 摘要、timeline、包含自动 outcome projection 记录的 gateway projection trace、mailbox 参与情况、public inbox deep link 下的 inbox-first 详情，或者在 mailbox deep link 下显示 mailbox-first 详情
- `Provider + Mailboxes`：provider state 摘要、public inbox 策略摘要、mailbox 列表、mailbox feed
- `Approvals`：待处理或历史审批项，并可跳转回 room

本轮发布打磨补充：

- Hero 里新增了显式边界状态条（只读、是否邮箱客户端、Workbench tab 状态、Gateway round-trip 状态）。
- workbench 风格 tab strip 现在会暴露 `Connect`、`Accounts`、`Rooms`、`Mailboxes`、`Approvals` 五个顶层视图。
- Room 详情新增 timeline 分类计数（`provider`、`ledger`、`virtual_mail`、`approval`、`delivery`），方便排障。
- Room 卡片新增 attention 标识（`stable | watch | critical`），便于优先级排序。

## 数据来源

该 Mail workbench 坚持 kernel-first、API-first：

- `GET /api/console/workbench`
- `GET /api/console/terminology`
- `GET /api/console/accounts`
- `GET /api/console/rooms`
- `GET /api/console/approvals`
- `GET /api/accounts/:accountId/mailbox-console`
- `GET /api/accounts/:accountId/mailboxes/:mailboxId/feed`

页面不会直接读取存储表，也不会把 Gateway transcript 当成业务真相源。
最新一轮 UI 已可直接使用聚合的 `GET /api/console/workbench` 读取面，原来的细粒度接口继续保留给排障和兼容层使用。

## 当前边界

- 当前 Mail tab 在这一阶段仍然是只读的。
- 它是浏览器里的邮件工作台，不是完整的 Outlook 风格邮箱客户端。
- `/workbench/mail`、`/workbench/mail/tab` 与 `/console/*` 现在都会落到同一套 OpenClaw 风格 shell，而不是分裂成多套 UI。
- 已绑定 Gateway 的 room 现在能看到自动 outcome trace，但完整的 Gateway 自动 ingress / Workbench 生产级接线仍未完成。
