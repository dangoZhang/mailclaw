# Live Provider Smoke

这份 runbook 对应 `testplanauto.md` 里优先执行的 Gmail OAuth 链路（`T101-T108`），以及 live provider smoke 的实跑项。目标不是在默认 CI 跑真实邮箱，而是在有真实凭据时提供可重复执行的路径。

## Scope

- `T101-T105`：Gmail OAuth 登录与账号持久化（CLI + runtime）。
- `T106-T108`：基于真实凭据的 Gmail recovery/reply smoke、预检查输出和文档一致性。
- `pnpm test:live-providers` 仍包含 IMAP/SMTP + Gmail live smoke 两个 case；默认会 `skip`。

## T101-T102: OAuth 前置校验与启动

先跑无凭据预检查（预期失败）：

```bash
pnpm mailctl connect login gmail endermanzhang@gmail.com --no-browser --timeout-seconds 5
```

预期输出：

- 缺少 client id 时，报错 `missing Gmail OAuth client id: set MAILCLAW_GMAIL_OAUTH_CLIENT_ID or pass clientId`。

再准备 OAuth 环境变量（最小集合）：

- `MAILCLAW_GMAIL_OAUTH_CLIENT_ID`

可选：

- `MAILCLAW_GMAIL_OAUTH_CLIENT_SECRET`
- `MAILCLAW_GMAIL_OAUTH_TOPIC_NAME`
- `MAILCLAW_GMAIL_OAUTH_USER_ID`（默认 `me`）
- `MAILCLAW_GMAIL_OAUTH_LABEL_IDS`
- `MAILCLAW_GMAIL_OAUTH_SCOPES`

启动 OAuth（会打印授权 URL，并尝试打开浏览器）：

```bash
pnpm mailctl connect login gmail endermanzhang@gmail.com --client-id "$MAILCLAW_GMAIL_OAUTH_CLIENT_ID"
```

## T103-T105: OAuth 完成与 watch 配置

- 在 Google 授权页选择目标 Gmail 账号并同意权限。
- 回调到本地 `http://127.0.0.1:<port>/callback` 后，CLI 应输出连接成功摘要。
- 若未提供 topic，连接仍可成功，但 `watchReady` 预期为 `false`。
- 若提供可用 topic（`MAILCLAW_GMAIL_OAUTH_TOPIC_NAME` 或 `--topic-name`），`watchReady` 预期为 `true`，可继续 recovery/watch 测试。

## T106-T108: Live Gmail smoke

命令：

```bash
pnpm test:live-providers
```

`tests/providers-live-smoke.test.ts` 的 Gmail case 需要这些环境变量：

- `MAILCLAW_LIVE_GMAIL_ACCESS_TOKEN`
- `MAILCLAW_LIVE_GMAIL_TOPIC_NAME`
- `MAILCLAW_LIVE_GMAIL_FROM`
- `MAILCLAW_LIVE_GMAIL_TO`

可选：

- `MAILCLAW_LIVE_GMAIL_USER_ID`
- `MAILCLAW_LIVE_GMAIL_LABEL_IDS`

说明：

- 若环境变量缺失，测试会 `skip`，并打印缺失 key（用于预检查）。
- 这组变量是 live smoke 的直接输入；它与 OAuth 登录结果是两条链路。若要打通“OAuth -> live smoke”全链路，需要把 OAuth 得到的可用 access token/topic 映射到上述 live 环境变量。

人工补充检查：

- 准备一个可回复的 seed thread，确保 recovery 至少拿到一封历史消息。
- 对同一线程发 reply，确认 Gmail conversation 正确续上。
- 核对外发头与线程字段：`In-Reply-To / References / Message-ID / threadId`。
