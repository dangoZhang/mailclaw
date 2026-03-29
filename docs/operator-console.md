# Mail Workbench

<p align="center">
  <a href="./operator-console.md"><strong>English</strong></a> ·
  <a href="./operator-console.zh-CN.md">简体中文</a> ·
  <a href="./operator-console.fr.md">Français</a>
</p>

MailClaw now ships an OpenClaw-style browser workbench surface at `/workbench/mail`. It is the MailClaw mail tab surface for inspecting rooms, approvals, provider state, mailbox projections, and Gateway traces from one browser view.

The canonical mailbox-first entry is `/workbench/mail`. `/workbench/mail/tab` reuses the same UI in embedded mode, and `/mail` plus `/console/*` are compatibility aliases to that same shell.

## Entry Points

- `/workbench/mail`
- `/workbench/mail/accounts/:accountId`
- `/workbench/mail/inboxes/:accountId/:inboxId`
- `/workbench/mail/rooms/:roomKey`
- `/workbench/mail/mailboxes/:accountId/:mailboxId`

These routes are deep-link stable. `/mail` and `/console/*` still resolve for compatibility. Query parameters currently cover the first UI filter set:

- `status`
- `originKind`
- `mailboxId`
- `approvalStatus`

## 30-Second Mailbox Discovery Path

For email-native operators, the fastest way to find internal agent collaboration is:

1. Open `/workbench/mail/accounts/:accountId`
2. Click a room that just received mail
3. From room detail, open one mailbox participant
4. Land on `/workbench/mail/mailboxes/:accountId/:mailboxId` to inspect delivery/feed state

CLI mirrors the same inspection path:

- `pnpm mailctl mailbox feed <accountId> <mailboxId>`
- `pnpm mailctl mailbox view <roomKey> <mailboxId>`

## What The First Slice Covers

- `Accounts`: health, provider mode, room counts, pending approvals
- `Rooms`: room list with state, attention level, origins, approvals, and delivery counts
- `Detail`: room summary, timeline, gateway projection trace including automatic outcome projection records, mailbox participation, inbox-first detail when opened from a public inbox deep link, or mailbox-first detail when opened from a mailbox deep link
- `Provider + Mailboxes`: provider state summary, inbox policy summary, mailbox cards, mailbox feed
- `Approvals`: pending or historical approval items with room jump links

Release polish in this slice:

- The hero now includes an explicit boundary status strip (read-only surface, mailbox-client boundary, Workbench tab status, gateway round-trip status).
- A workbench-style tab strip now exposes `Connect`, `Accounts`, `Rooms`, `Mailboxes`, and `Approvals` as stable top-level console views.
- Room detail now includes timeline category counters (`provider`, `ledger`, `virtual_mail`, `approval`, `delivery`) to speed incident triage.
- Room cards now surface an explicit attention label (`stable | watch | critical`) so operators can prioritize quickly.

## Data Sources

The console is kernel-first and API-first:

- `GET /api/console/workbench`
- `GET /api/console/terminology`
- `GET /api/console/accounts`
- `GET /api/console/rooms`
- `GET /api/console/approvals`
- `GET /api/accounts/:accountId/mailbox-console`
- `GET /api/accounts/:accountId/mailboxes/:mailboxId/feed`

The page does not read storage tables directly and does not depend on Gateway transcript state as truth.
The latest UI slice can hydrate from the aggregated `GET /api/console/workbench` read model while the narrower endpoints remain available for inspection and compatibility.

## Current Boundaries

- The current Mail tab is read-only in this phase.
- It is a Mail workbench, not a full Outlook-like mailbox client yet.
- `/workbench/mail`, `/workbench/mail/tab`, and `/console/*` now land on the same OpenClaw-style shell instead of separate UI stacks.
- Gateway outcome traces are visible once a room is Gateway-bound, but full Gateway auto-ingress/Workbench production wiring is still incomplete.
