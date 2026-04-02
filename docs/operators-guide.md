# Operators Guide

This page is for people responsible for keeping MailClaws healthy in daily use.

It focuses on what to check when users say:

- “I sent an email, did the system receive it?”
- “Why did this room not reply?”
- “Why is outbound mail still waiting?”

## The Main Objects To Check

MailClaws operations are easiest when you follow the same object model the runtime uses:

- `account`: one connected mailbox, its intake address, allowlist, and provider posture
- `mail session`: the external conversation surface
- `address`: the single-agent queue and mailbox projection
- `room`: the durable multi-agent truth boundary
- `approval`: gated external side effects

## First-Line Triage

When a user says “I sent an email, what happened?”, check in this order.

### 1. Account

Confirm the connected mailbox exists and looks healthy.

Useful commands:

```bash
mailclaws accounts
mailclaws accounts show <accountId>
```

Useful API:

- `GET /api/accounts/:accountId/provider-state`

### 2. Mail Session

Confirm MailClaws created or updated the external conversation surface, then pivot to the linked room if needed.

Useful commands:

```bash
mailclaws rooms
mailclaws replay <roomKey>
```

### 3. Address View

If the mail session exists but behavior is unclear, inspect the related address/mailbox view.

Useful commands:

```bash
mailclaws inboxes <accountId>
mailctl observe mailbox-feed <accountId> <mailboxId>
mailctl observe mailbox-view <roomKey> <mailboxId>
```

### 4. Room

If several agents participated or you need the durable truth view, inspect the room next.

Useful commands:

```bash
mailclaws replay <roomKey>
mailctl observe mailbox-view <roomKey> <mailboxId>
```

### 5. Approval State

If the system prepared an answer but did not send it, check approval state next.

Useful commands:

```bash
mailctl observe approvals room <roomKey>
mailctl operate deliver-outbox
```

## Workbench Path

The browser workbench mirrors the same triage flow:

1. open `Mail`
2. open the mail session
3. jump into `Addresses` if one agent queue is the question
4. open the linked `Room` if shared truth is the question
5. open `Accounts` for provider/intake config
6. open `Approvals` if delivery is blocked

Useful deep links:

- `/workbench/mail`
- `/workbench/mail?mode=agents`
- `/workbench/mail?mode=accounts`
- `/workbench/mail?mode=rooms`
- `/workbench/mail?mode=mailboxes`
- `/workbench/mail?mode=approvals&approvalStatus=requested`
- `/workbench/mail/accounts/:accountId`
- `/workbench/mail/rooms/:roomKey`
- `/workbench/mail/mailboxes/:accountId/:mailboxId`

## Common Situations

### Mail Was Sent But No Mail Session Appears

Check:

- account/provider posture
- inbound path configuration
- whether the message reached MailClaws at all

Start with:

```bash
mailclaws accounts show <accountId>
mailclaws rooms
```

### Mail Session Exists But There Is No Reply Yet

Check:

- the linked room replay
- address-local mailbox activity
- approval state

Start with:

```bash
mailclaws replay <roomKey>
mailctl observe mailbox-view <roomKey> <mailboxId>
mailctl observe approvals room <roomKey>
```

### Outbound Delivery Looks Stuck

Check:

- whether approval is still pending
- whether delivery has been attempted
- whether the chosen provider path is healthy

Start with:

```bash
mailctl operate deliver-outbox
mailctl observe approvals room <roomKey>
```

## Useful APIs

Room and mailbox inspection:

- `GET /api/rooms/:roomKey/replay`
- `GET /api/rooms/:roomKey/approvals`
- `GET /api/rooms/:roomKey/mailboxes/:mailboxId`
- `GET /api/accounts/:accountId/inboxes`
- `GET /api/accounts/:accountId/mailbox-console`
- `GET /api/accounts/:accountId/mailboxes/:mailboxId/feed`

Console read models:

- `GET /api/console/workbench`
- `GET /api/console/accounts`
- `GET /api/console/rooms`
- `GET /api/console/approvals`

Delivery and recovery:

- `POST /api/outbox/:outboxId/approve`
- `POST /api/outbox/:outboxId/reject`
- `POST /api/outbox/deliver`
- `POST /api/recovery/room-queue`

## Practical Rule

If something is unclear, inspect in this order:

1. account
2. mail session
3. address
4. room
5. approval

That order matches the way MailClaws itself is structured, so it usually gets you to the answer faster than starting from raw execution traces.
