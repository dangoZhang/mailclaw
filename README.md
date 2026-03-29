# MailClaw

<p align="center">
  The email-native layer for teams that already work from the inbox.
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <a href="https://dangozhang.github.io/mailclaw/">Docs</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/ci.yml">CI</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/release.yml">Release</a>
</p>

MailClaw is for people who actually run work through email: founders, operators, support teams, shared inbox owners, and AI-heavy teams that need more than “reply with a prompt.”

It turns every real email conversation into a durable operating unit. The room has memory. Agent collaboration is visible. Drafts can be reviewed. Outbound mail can be approved. Everything can be replayed later.

## Why MailClaw Feels Stronger Than OpenClaw For Email Work

OpenClaw is a strong general agent workbench. MailClaw is what you use when the inbox itself becomes the product surface.

- OpenClaw is session-first. MailClaw is room-first, so one email thread keeps one durable truth source.
- OpenClaw can hide subagent work inside runs. MailClaw shows internal collaboration as inspectable mail between roles.
- OpenClaw keeps pushing long transcripts forward. MailClaw keeps compact Pre state, so later turns stay smaller and cleaner.
- OpenClaw helps an agent act. MailClaw helps a team receive, triage, collaborate, approve, and send from real inboxes.
- OpenClaw gives you a workbench. MailClaw gives you a Mail tab with rooms, internal mail, approvals, outbox, and replay in one place.

If your daily work begins with “a customer emailed us,” “the founder inbox needs triage,” or “several agents need to collaborate before anyone replies,” MailClaw is the sharper tool.

## What Makes It Different

- Real email threads become durable rooms, not disposable chat state.
- Internal agent cooperation uses virtual mail, not one giant shared context window.
- Long-term memory keeps summaries, facts, decisions, and commitments instead of raw scratch traces.
- External sends are governed through review, approval, and outbox flow.
- Operators can inspect the whole chain: inbound mail, internal mail, approvals, delivery, and replay.

## What You Can Do Today

- connect a real mailbox and receive real mail
- open the Mail tab and inspect accounts, rooms, internal mailboxes, and approvals
- watch multiple agents collaborate without losing the external thread
- see which draft was approved, blocked, or superseded
- replay why a room replied the way it did
- run MailClaw inside an OpenClaw-style host instead of switching to a separate tool

## Three-Minute Start

```bash
./install.sh
MAILCLAW_FEATURE_MAIL_INGEST=true mailclaw
```

Then in a second terminal:

```bash
mailclaw onboard you@example.com
mailclaw login
mailclaw dashboard
```

Recommended first run:

1. Start MailClaw.
2. Connect one mailbox you already use.
3. Send one test email from another mailbox.
4. Open the `Mail` tab.
5. Inspect the room, the internal collaboration, and the outbound state.

If you want a safe local walkthrough first:

```bash
pnpm demo:mail
```

Then open `http://127.0.0.1:3020/workbench/mail`.

## Inside The Mail Tab

- `Accounts`: which inboxes are connected and healthy
- `Rooms`: durable conversations with revisioned state
- `Mailboxes`: what each public role or internal role actually saw
- `Approvals`: outbound mail waiting for a human or governance decision
- `Mail`: the integrated OpenClaw-style entry point for all of the above

The key difference is visibility. MailClaw does not ask you to trust that “the swarm handled it.” You can inspect the actual handoff between orchestrator, workers, reviewer, and guard.

## Multi-Agent Without The Mess

MailClaw separates:

- the external conversation
- the internal collaboration
- the durable memory that survives each turn

That means multiple agents can help on one email without turning the whole thread into an unreadable transcript swamp.

## Documentation

- Docs site: <https://dangozhang.github.io/mailclaw/>
- Getting started: <https://dangozhang.github.io/mailclaw/getting-started>
- Core concepts: <https://dangozhang.github.io/mailclaw/concepts>
- Multi-agent workflows: <https://dangozhang.github.io/mailclaw/multi-agent-workflows>
- Mail tab guide: <https://dangozhang.github.io/mailclaw/operator-console>

## License

MIT. See [LICENSE](./LICENSE).
