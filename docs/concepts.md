# Core Concepts

MailClaws is easiest to reason about if you separate five objects.

## 1. Account

An account is one connected external mailbox.

What an account owns:

- one validated IMAP/SMTP connection
- one MailClaws intake address
- one inbound allowlist used during first-connect safety policy
- provider posture such as ingress, outbound, and watch state

The account is the mailbox boundary, not the collaboration boundary.

## 2. Mail Session

A mail session is the external conversation surface.

Use it to answer:

- which real thread is this
- which address currently owns it
- which room is coordinating internal work for it
- whether governed delivery has produced an outbound candidate

The `Mail` tab starts here because this is the closest view to what the user actually sent.

## 3. Address

An address is the single-agent work layer.

Use it to answer:

- which mail sessions are visible to one agent
- what one agent mailbox received
- what one agent replied with

MailClaws can route into an agent-specific address with:

- plus-addressing like `assistant+research@example.com`
- subject fallback like `[agent:research]`

If you want one agent's queue, open `Addresses` rather than the shared room.

## 4. Room

A room is the multi-agent collaboration truth layer.

What lives in a room:

- the durable state for one mail session
- revisions and replay-visible timeline entries
- mailbox participation
- task and handoff state
- approvals and governed outbox state
- gateway projection and synchronization traces

The room is where MailClaws keeps truth when several agents have touched the same conversation.

## 5. Virtual Mail

Virtual mail is the internal collaboration plane inside a room.

Its constraints matter:

- replies are single-parent
- work can fan out to multiple agents
- reducers or orchestrators handle fan-in
- delivery rows make queueing and staleness visible

This is how MailClaws keeps internal coordination inspectable without treating one giant transcript as truth.

## 6. Durable Memory

MailClaws does not treat raw reasoning traces as durable memory.

Instead:

- agents work in scratch space
- durable summaries and facts are kept in compact state
- the next turn loads the latest mail, durable room state, and only the references it needs

That keeps long-running threads lighter and easier to govern.

## 7. Approval And Outbox

MailClaws separates collaboration from external side effects.

The normal path is:

1. internal draft
2. review / guard / approval
3. outbox intent
4. delivery attempt

Workers and subagents do not send real external mail directly.

## 8. Workbench

The Workbench exposes the runtime model directly.

Main views:

- `Mail`: external mail sessions
- `Agents`: persistent agent roster, entrypoints, collaborators, skills
- `Addresses`: address-local queueing and mailbox projections
- `Rooms`: shared collaboration truth
- `Accounts`: mailbox settings, provider state, intake address, allowlist
- `Approvals`: governed outbound release state

## In One Sentence

MailClaws turns one mailbox into mail sessions for users, addresses for single agents, and rooms for shared multi-agent truth.
