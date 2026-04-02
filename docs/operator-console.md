# Mail Workbench

The Mail workbench is the user-facing surface for MailClaws.

In the intended setup, it appears as the `Mail` tab inside OpenClaw/Gateway. The direct `/workbench/mail` route exists as a fallback and deep-link target.

## Open It

Preferred path:

```bash
mailclaws dashboard
```

Then sign in to OpenClaw/Gateway and click `Mail`.

Direct fallback:

```bash
mailclaws open
```

## What Each Tab Means

### Mail

The external conversation surface.

Use it when:

- you want to browse external mail sessions first
- you want to inspect who currently owns a conversation
- you want to jump from the external thread into one address or one linked room

### Agents

The persistent agent roster.

Use it when:

- you want to inspect durable agents and their entrypoints
- you want to see collaborator links
- you want to inspect installed skills
- you want to understand which agent identities exist before looking at one queue

### Addresses

The single-agent work layer.

Use it when:

- you want to inspect one agent's mailbox feed
- you want to see which mail sessions are visible to one address
- you want to inspect queueing and room-local projection without opening the shared room first

### Rooms

The room-level truth view.

Use it when:

- you want the durable collaboration state for one conversation
- you want replay, task tracking, gateway projection, and governed delivery in one place
- you want to inspect multi-agent coordination rather than one agent queue

### Accounts

The account-level view.

Use it when:

- you want to confirm a mailbox is connected
- you want to inspect provider posture and general health
- you want to inspect the single local MailClaws intake address for that mailbox
- you want to inspect the inbound allowlist used during first connect

### Approvals

The governed side-effects view.

Use it when:

- you want to inspect pending outbound approval work
- you want to review or trace what must happen before external delivery

## Typical User Flow

The most common path is:

1. open `Mail`
2. select the external mail session
3. if needed, open one `Address`
4. if needed, open the linked `Room`
5. if needed, inspect `Approvals` before delivery

This mirrors the runtime model:

- mail session gives you the user-visible thread
- address gives you one agent queue
- room gives you shared truth
- account gives you provider and intake configuration
- approvals give you side-effect control

## Multi-Agent Collaboration In One Room

When you open a room, read these sections in order:

1. `Room Summary`
2. `Virtual Mail`
3. `Mailbox Deliveries`
4. `Governed Outbox`
5. `Gateway Projection`

This gives you a clean explanation of:

- which internal roles participated
- which mailbox received which task or reply
- whether delivery rows were consumed or marked stale
- which internal result became an external send candidate

If you then want one address-local view, click a mailbox chip from the room or open `Addresses` directly.

## Deep Links

Useful direct routes:

- `/workbench/mail`
- `/workbench/mail?mode=agents`
- `/workbench/mail?mode=accounts`
- `/workbench/mail?mode=rooms`
- `/workbench/mail?mode=mailboxes`
- `/workbench/mail?mode=approvals&approvalStatus=requested`
- `/workbench/mail/accounts/:accountId`
- `/workbench/mail/rooms/:roomKey`
- `/workbench/mail/mailboxes/:accountId/:mailboxId`

These routes are meant to make navigation stable whether you entered from Gateway or from the direct fallback URL.

## What This Surface Is For

The Mail workbench is designed to explain the system in operationally useful terms:

- external mail sessions
- agent addresses
- durable rooms
- connected accounts and intake address
- approval state

It is not meant to be just another generic chat transcript viewer.

## Related Reading

- [Core Concepts](./concepts.md)
- [Multi-Agent Collaboration](./multi-agent-workflows.md)
- [Getting Started](./getting-started.md)
- [Integrations](./integrations.md)
