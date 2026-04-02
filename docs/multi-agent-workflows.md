# Multi-Agent Collaboration

MailClaws does not ask multiple agents to share one giant transcript.

Instead, it splits the workflow into three inspectable layers:

- `Mail`: the external thread the user sees
- `Address`: the single-agent queue and mailbox projection for one agent
- `Room`: the shared collaboration truth when several agents touch the same mail

## The Practical Model

When one real email arrives:

1. MailClaws opens or updates one mail session.
2. That mail session points at one linked room.
3. The front agent reads the latest inbound plus the durable room state.
4. If more work is needed, it routes internal task mail to one or more addresses.
5. Workers reply through single-parent virtual mail.
6. A reducer or orchestrator converges the result back into the room.
7. Only then can MailClaws create an approval or governed outbox intent.

That means:

- internal collaboration is durable and replayable
- stale worker results can be discarded without corrupting the room
- external mail stays clean even when several workers participated
- you can inspect one agent queue without confusing it with the shared room truth

## Durable Agents Versus One-Off Subagents

MailClaws intentionally keeps these execution types separate:

- durable agents have their own `SOUL.md`, mailbox entrypoints, and internal role mailboxes
- one-off subagents are burst compute workers and do not keep a soul

That means:

- long-lived persona, collaboration rules, and division of work belong to durable agents
- elastic task execution belongs to subagents
- subagent output only enters the room collaboration path after it is normalized into internal reply mail

So MailClaws is not “make every agent permanent.” It is “keep durable agents for organization, keep subagents for elastic compute.”

## What To Look At In The Workbench

Start from the view that matches the question you are asking.

### If the question starts from the user's email

1. open `Mail`
2. open one mail session
3. pivot into `Addresses` or `Rooms` only when needed

### If the question is about shared collaboration truth

1. open `Rooms`
2. open one room
3. inspect these sections in order

### Room Summary

Use this to confirm:

- which account owns the room
- which front agent identity is active
- which collaborator agents or summoned roles participated
- which public or collaborator addresses were routed

### Virtual Mail

Use this to see:

- which mailbox sent each internal message
- which role received it
- whether a message was root work or a reply
- whether the message came from provider mail, gateway chat, or internal virtual mail

This is the clearest view of multi-agent coordination.

### Mailbox Deliveries

Use this to see:

- where each internal message was queued
- whether it was leased, consumed, stale, vetoed, or superseded

This tells you whether collaboration succeeded operationally, not just logically.

### Governed Outbox

Use this to see:

- which internal result became an external delivery candidate
- whether the outbox item is pending approval, queued, sent, or failed

This is the boundary between internal agent work and real external side effects.

### Gateway Projection

Use this when the room is linked to OpenClaw/Gateway.

It shows:

- which gateway session keys are bound to the room
- which room outcomes were projected back toward Gateway
- whether dispatch is pending, dispatched, or failed

## Address Views

If you want to inspect one agent queue directly:

1. open `Addresses`
2. select the address/mailbox
3. inspect both:
   - `Mailbox Feed`
   - `Room Thread In Mailbox`

This is useful when you want to answer:

- what did the reviewer actually see?
- what did the researcher mailbox receive?
- did the guard mailbox ever get the draft?

## Typical Patterns

### Simple Direct Reply

- one mail session
- one linked room
- one orchestrator decision
- one governed outbox intent

You will mainly inspect `Mail`, `Room Summary`, `Governed Outbox`, and `Timeline`.

### Parallel Worker Collaboration

- orchestrator sends several task mails
- workers answer in separate work threads
- reducer converges the results

You will mainly inspect `Addresses`, `Virtual Mail`, and `Mailbox Deliveries`.

### Approval-Gated Response

- drafter or orchestrator proposes an answer
- reviewer or guard blocks or escalates
- approval creates the release gate

You will mainly inspect `Approvals` plus the room’s `Governed Outbox`.

## Routing Entry Points

MailClaws can expose a durable agent through:

- plus-addressing such as `assistant+research@example.com`
- a subject fallback such as `[agent:research]`

That lets external mail target one agent directly without creating a separate external mailbox for every durable role.

## CLI Surfaces

If you want the same story from the terminal:

```bash
mailclaws rooms
mailclaws replay <roomKey>
mailctl mailbox view <roomKey> <mailboxId>
mailctl mailbox feed <accountId> <mailboxId>
mailclaws approvals room <roomKey>
mailclaws trace <roomKey>
```

## What MailClaws Intentionally Avoids

MailClaws does not use:

- one shared transcript as the authority for all agents
- subject-only continuity for collaboration truth
- direct worker-to-external send
- long-lived scratch traces as durable memory

The point of the system is not only to make agents collaborate.
The point is to make collaboration durable, inspectable, and governable.
