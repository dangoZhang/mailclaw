# Live Provider Smoke

这份 runbook 原先对应 `testplanauto.md` 里优先执行的 Gmail OAuth 链路（`T101-T108`）。从 2026-04-01 起，用户可见登录主路径已经切换到 IMAP/SMTP，因此这里的 Gmail OAuth 步骤只保留为兼容层历史记录，不再是当前主测试路线。

## Scope

- 当前主路线：邮箱地址 + IMAP/SMTP 凭据 / app password + provider preset。
- 兼容层历史路线：Gmail / Outlook OAuth HTTP API。
- `pnpm test:live-providers` 当前仍保留旧的 live provider case；在 IMAP/SMTP-only 测试计划补齐前，它不是新的验收基线。

## 当前状态

- `mailclaws login`、`mailclaws login you@example.com`、`mailclaws login gmail|outlook|qq|icloud|yahoo|163|126` 现在统一进入 IMAP/SMTP 登录向导。
- Gmail / Outlook 的网页登录链接保留为辅助入口，用于让用户先处理 app password、邮箱授权码、注册或安全设置。
- 旧的 Gmail OAuth 预检查、回调和 live smoke 记录仍可参考 `git` 历史，但不再作为当前主 runbook。

## IMAP/SMTP 手工 smoke 最小步骤

```bash
pnpm mailctl connect login you@example.com
```

- 人工输入邮箱地址。
- 按 provider preset 或手工 host 填好 IMAP/SMTP 主机、端口、安全选项。
- 输入普通密码、app password 或 provider 授权码。
- 登录后用另一邮箱发一封测试信，确认 room / mailbox / outbox 逻辑正常。

人工补充检查：

- 准备一个可回复的 seed thread，确保 recovery 至少拿到一封历史消息。
- 对同一线程发 reply，确认 Gmail conversation 正确续上。
- 核对外发头与线程字段：`In-Reply-To / References / Message-ID`。
