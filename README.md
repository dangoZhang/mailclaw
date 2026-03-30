# MailClaw

<p align="center">
  Multi-agent email runtime with smaller prompts, cleaner handoffs, and durable room truth.
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

MailClaw is for teams that need more than a general agent shell. It is built for real inbox traffic, long-running conversations, frequent context switching, and multi-agent collaboration that stays inspectable instead of disappearing into one opaque run.

It turns every real email conversation into a durable operating unit. The room has memory. Agent collaboration is visible. Drafts can be reviewed. Outbound mail can be approved. Everything can be replayed later.

## Why MailClaw Feels Stronger Than OpenClaw

OpenClaw is a strong general agent workbench. MailClaw is what you use when the work itself keeps arriving as conversations, interruptions, follow-ups, and coordinated replies.

- OpenClaw is session-first. MailClaw is room-first, so one email thread keeps one durable truth source.
- OpenClaw can hide subagent work inside runs. MailClaw shows internal collaboration as inspectable mail between roles.
- OpenClaw keeps pushing long transcripts forward. MailClaw keeps compact Pre state, so later turns stay smaller and cleaner.
- OpenClaw is good at one task flow. MailClaw is better at switching between many active conversations without dragging every old turn back into the prompt.
- OpenClaw can finish work silently. MailClaw is designed to report progress, preserve approvals, and keep long-task status visible in the same room.
- OpenClaw gives you a workbench. MailClaw gives you a Mail tab with rooms, internal mail, approvals, outbox, and replay in one place.

If your work begins with “a customer replied again,” “this thread has been active for two weeks,” “we need to report progress before the final answer,” or “three agents need to cooperate before anyone sends,” MailClaw is the sharper tool.

## What Makes It Different

- Real email threads become durable rooms, not disposable chat state.
- Internal agent cooperation uses virtual mail, not one giant shared context window.
- Long-term memory keeps summaries, facts, decisions, and commitments instead of raw scratch traces.
- Progress replies, review, approval, and outbox stay attached to the same room instead of being scattered across separate runs.
- External sends are governed through review, approval, and outbox flow.
- Operators can inspect the whole chain: inbound mail, internal mail, approvals, delivery, and replay.

## Why It Uses Fewer Tokens

MailClaw keeps the working context small on purpose. Instead of replaying the whole transcript every time, it carries forward compact Pre state and pulls older context only by reference.

Repository benchmark results from `tests/prompt-footprint-benchmark.test.ts`:

- long-thread follow-ups: `755` estimated tokens vs `2006`, `62.3%` lower on average
- turn-6 follow-up: `752` vs `2868`, `73.8%` lower
- 5-worker reducer handoff: `750` vs `3444`, `78.2%` lower

That matters when a front agent has to switch between many rooms or keep reporting on long-running work without bloating every next turn.

## What You Can Do Today

- connect a real mailbox and receive real mail
- open the Mail tab and inspect accounts, rooms, internal mailboxes, and approvals
- watch multiple agents collaborate without losing the external thread
- send ACKs and progress updates early while longer work continues behind the scenes
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

## Built-In Team Templates

MailClaw already ships with one-click durable agent templates, including:

- `One-Person Company`
- `Three Provinces, Six Departments`

Template implementation lives in the repository here:

- <https://github.com/dangoZhang/mailclaw/blob/main/src/agents/templates.ts>

The current `One-Person Company` template is aligned with the solo-operator organizational pattern popularized in this GitHub project:

- <https://github.com/cyfyifanchen/one-person-company>

MailClaw reuses the upstream operating pattern here, but not by copying soul files directly. The source project is a playbook for how a solo operator runs a company; MailClaw maps that into one front inbox plus durable specialist peers.

The `Three Provinces, Six Departments` template is closer to direct role reuse. MailClaw aligns Taizi, Zhongshu, Menxia, Shangshu, and the six departments against the OpenClaw-based `Edict` project:

- <https://github.com/cft0808/edict>

When you apply that template, generated `SOUL.md` files include upstream alignment notes and role contracts so the roster stays close to Edict instead of drifting into a name-only homage.

## Documentation

- Docs site: <https://dangozhang.github.io/mailclaw/>
- Getting started: <https://dangozhang.github.io/mailclaw/getting-started>
- Core concepts: <https://dangozhang.github.io/mailclaw/concepts>
- Multi-agent workflows: <https://dangozhang.github.io/mailclaw/multi-agent-workflows>
- Mail tab guide: <https://dangozhang.github.io/mailclaw/operator-console>
- Prompt footprint benchmark: <https://dangozhang.github.io/mailclaw/prompt-footprint>

## License

MIT. See [LICENSE](./LICENSE).
