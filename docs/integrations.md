# Integrations

This page explains how MailClaws connects to the outside world.

MailClaws is built to sit on top of real email systems and, when needed, inside an OpenClaw/Gateway host workflow.

## Integration Model

MailClaws separates responsibilities:

- providers move mail in and out
- rooms keep durable truth
- virtual mail handles internal agent collaboration
- approvals and outbox govern external side effects
- the Mail tab lets users inspect the whole system

That means MailClaws can connect to existing mailbox providers without treating any one provider as the system of record.

## Which Mailbox Paths Are Supported

MailClaws currently supports three practical connection paths.

### 1. IMAP / SMTP Mailboxes

Primary user-facing path.

Common presets include:

- Gmail
- Outlook / Microsoft 365
- QQ
- iCloud
- Yahoo
- 163 / 126
- generic IMAP / SMTP

Why choose this path:

- one login path across common mailbox providers
- uses the user's own mailbox directly
- works well for CLI and workbench onboarding
- keeps MailClaws provider-agnostic at the account boundary

### 2. Forward / Raw MIME Ingress

Best choice when you cannot yet use direct mailbox credentials.

Why choose this path:

- simple migration path
- useful for staged adoption
- lets MailClaws receive mail even when native watch support is not available yet

## Recommended Order For Users

If you only know the mailbox address and want the easiest path:

```bash
mailclaws onboard you@example.com
mailclaws login
```

If you want to inspect supported paths first:

```bash
mailclaws providers
```

General recommendation:

1. use the IMAP / SMTP login path first
2. use a provider app password / authorization code when the normal mailbox password is rejected
3. use forward/raw MIME as the fallback path

## OpenClaw / Gateway Fit

MailClaws is designed to fit into an OpenClaw-shaped workflow.

Use it like this:

1. start MailClaws
2. run `mailclaws dashboard`
3. sign in to OpenClaw/Gateway
4. click `Mail`

In that setup:

- OpenClaw/Gateway remains the host shell
- MailClaws provides the Mail tab and email-native runtime semantics
- direct `/workbench/mail` access remains available as a fallback

## Inbound Paths

MailClaws can receive mail through:

- provider-native watchers and fetchers
- normalized API ingress
- raw MIME ingress
- Gateway event projection

Typical examples:

- IMAP fetch and polling
- `POST /api/inbound`
- `POST /api/inbound/raw`
- `POST /api/gateway/events`

## Outbound Paths

MailClaws can deliver external mail through:

- SMTP
- governed outbox delivery flows

The key design rule is constant:

real external send happens through approval and outbox control, not directly from worker execution.

## Mailbox Account Setup

Useful commands:

```bash
mailclaws providers
mailclaws login
mailctl connect providers [provider]
mailctl connect login gmail <accountId> [displayName]
mailctl connect login outlook <accountId> [displayName]
```

Useful APIs:

- `GET /api/connect`
- `GET /api/connect/providers`
- `GET /api/connect/providers/:provider`
- `POST /api/accounts`

Legacy compatibility note:

- `/api/auth/:provider/*` remains available for older OAuth-based integrations, but the primary user-facing login flow is now IMAP/SMTP.

## What To Read Next

- [Getting Started](./getting-started.md)
- [Core Concepts](./concepts.md)
- [Mail Workbench](./operator-console.md)
- [Operators Guide](./operators-guide.md)
