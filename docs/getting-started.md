# Getting Started

This page is the shortest path from zero to one working mailbox conversation.

If you already know what MailClaws is, jump to [Send Your First Real Email](#three-minute-first-mail).

## What You Need

- Node.js 22+
- one mailbox you want MailClaws to connect
- another mailbox or mail client to send a test email from

MailClaws does not assume one provider. Built-in IMAP/SMTP presets cover Gmail, Outlook, QQ, iCloud, Yahoo, 163/126, and generic IMAP/SMTP accounts.

## Install

Recommended:

```bash
./install.sh
```

Other supported paths:

```bash
npm install -g mailclaws
pnpm setup && pnpm add -g mailclaws
brew install mailclaws
```

If you are running from source:

```bash
pnpm install
```

## Start MailClaws

```bash
MAILCLAW_FEATURE_MAIL_INGEST=true \
mailclaws
```

This starts the local runtime and the Mail workbench backend.

## Connect One Mailbox

Recommended path:

```bash
mailclaws onboard you@example.com
mailclaws login you@example.com
```

What these do:

- `mailclaws onboard` recommends the easiest provider path from the mailbox address
- `mailclaws login you@example.com` detects the provider, suggests IMAP/SMTP defaults, and asks for the mailbox credential

What to expect in the current connect flow:

1. enter one mailbox address
2. let MailClaws detect the provider
3. open the provider's web login page if you need to sign in, register, or generate an app password
4. paste the mailbox password, app password, or provider authorization code into MailClaws
5. validate IMAP and SMTP before the account is saved

If you already know the provider path you want, use:

```bash
mailclaws providers
```

## Open The Mail Tab

Preferred host flow:

```bash
mailclaws dashboard
```

Then sign in to OpenClaw/Gateway and click `Mail`.

Direct fallback:

```bash
mailclaws open
```

or open:

```text
http://127.0.0.1:3000/workbench/mail
```

<a id="three-minute-first-mail"></a>

## Send Your First Real Email {#three-minute-first-mail}

1. Connect one mailbox with `mailclaws login you@example.com`.
2. Use the connected mailbox address, or the local MailClaws intake address shown on the account page.
3. Send one email to that address from another mailbox.
4. Open the Mail workbench.
5. Start from the new `Mail` session. Open `Addresses` for one agent view or `Rooms` for the shared collaboration view.

That is the core MailClaws loop:

- real mail arrives
- MailClaws creates or updates a mail session and its linked room
- agents work through addresses and virtual mail
- you inspect the result from `Mail`, `Addresses`, or `Rooms`

## What You Will See

After the first message arrives, the Mail workbench gives you six useful views:

- `Mail`: external mail sessions
- `Agents`: the durable agent roster and routing entrypoints
- `Addresses`: address-local mailbox projections for one agent
- `Rooms`: the shared collaboration truth
- `Accounts`: mailbox settings, provider state, local intake address, and allowlist
- `Approvals`: gated outbound work waiting for review

If you want to inspect internal agent collaboration after the first message:

- start from `Mail`
- open the linked `Room` when you need the shared truth
- inspect `Virtual Mail`, `Mailbox Deliveries`, and `Governed Outbox`
- open `Addresses` when you want one role-local feed without the full room

## For OpenClaw Users

If you already use OpenClaw, keep the same outer workflow:

1. start MailClaws
2. run `mailclaws dashboard`
3. enter the host console
4. click `Mail`

MailClaws is meant to feel like an extra Mail tab inside the existing OpenClaw shell, not like a separate console you have to learn first.

## Next Steps

- [Core Concepts](./concepts.md)
- [Multi-Agent Collaboration](./multi-agent-workflows.md)
- [Mail Workbench](./operator-console.md)
- [Integrations](./integrations.md)
