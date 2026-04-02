# Integrations

This page explains how MailClaws connects to the outside world.

MailClaws is built to sit on top of real email systems and, when needed, inside an OpenClaw/Gateway host workflow.

## Integration Model

MailClaws separates responsibilities like this:

- providers move mail in and out
- accounts own the external mailbox connection
- mail sessions represent the external conversation surface
- addresses represent one agent's work queue
- rooms keep shared multi-agent truth
- approvals and outbox govern external side effects

That means MailClaws can connect to existing mailbox providers without treating any one provider as the system of record.

## Which Mailbox Paths Are Supported

MailClaws currently supports two practical connection paths.

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
- matches the current Workbench connect flow and validation model

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
mailclaws login you@example.com
```

If you want to inspect supported paths first:

```bash
mailclaws providers
```

General recommendation:

1. use the IMAP / SMTP login path first
2. use a provider app password / authorization code when the normal mailbox password is rejected
3. use forward/raw MIME as the fallback path

In the browser workbench, the connect flow is intentionally minimal:

1. enter one email address
2. open the provider's login page if needed
3. expand advanced options only when manual IMAP/SMTP input is needed
4. run `Validate Mailbox`
5. save only after validation succeeds

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
- `POST /api/accounts/validate`

Legacy compatibility note:

- `/api/auth/:provider/*` remains available for older compatibility surfaces
- the primary user-facing connection flow is now IMAP/SMTP-only
- older Gmail API smoke coverage is no longer the main onboarding baseline

## What To Read Next

- [Getting Started](./getting-started.md)
- [Core Concepts](./concepts.md)
- [Mail Workbench](./operator-console.md)
- [Operators Guide](./operators-guide.md)
