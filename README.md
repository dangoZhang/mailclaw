# MailClaws

<p align="center">
  Multi-agent email. Visible collaboration. Traceable context. Smaller prompts.
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <a href="https://dangozhang.github.io/mailclaw/">Website</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/ci.yml">CI</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/release.yml">Release</a>
</p>

<p align="center">
  <img src="./docs/public/mailclaws-poster.svg" alt="MailClaws poster showing a real email workflow: one public mailbox in front, several specialist agents behind it, and visible internal mail flowing around a shared room." width="960" />
</p>

MailClaws turns one real mailbox into a governed multi-agent runtime for OpenClaw-style work.

It is built for:

- people who already work in email
- OpenClaw users
- long-running threads
- frequent context switching
- work that needs progress before the final answer
- teams that want many agents without losing control of context

## Current Architecture

MailClaws separates the runtime into three user-facing layers:

- `Mail`: the external conversation session the user sees
- `Address`: the single-agent work layer for one agent queue
- `Room`: the shared multi-agent truth layer for collaboration, replay, approvals, and delivery

Around those layers:

- one connected mailbox account exposes one MailClaws intake address
- the account page keeps the inbound allowlist used during first connect
- durable agents can expose virtual ingress like `mailbox+research@example.com`
- if plus-addressing is unavailable, MailClaws falls back to subject routing like `[agent:research]`

## Why Email Fits

Email already has the right shape.

- clear context boundaries
- traceable history
- easy thread sharing
- natural message size
- familiar work habits
- no extra protocol to teach your team

MailClaws starts from what users already understand.

## What You Actually Get

- IMAP/SMTP-first mailbox connection instead of a provider-specific primary login path
- a Workbench that starts from external mail sessions, then lets you pivot into one address or one room
- one account page focused on provider state, the single intake address, and the inbound allowlist
- virtual agent routing through plus-addressing and subject fallback
- governed delivery: only approvals and the outbox can produce real external email
- durable agents with `SOUL.md`, mailbox identity, and collaboration boundaries

## Install It Your Way

```bash
npm install -g mailclaws
```

```bash
pnpm setup && pnpm add -g mailclaws
```

```bash
brew install mailclaws
```

You can also run the repo installer directly with `./install.sh`.

## Three Minutes To Your First Mail Session

```bash
./install.sh
MAILCLAW_FEATURE_MAIL_INGEST=true mailclaws
```

Open a second terminal:

```bash
mailclaws onboard you@example.com
mailclaws login you@example.com
mailclaws dashboard
```

Then do this:

1. Enter one mailbox address.
2. Let MailClaws detect the provider and open the provider's login page if needed.
3. Paste the mailbox password, app password, or provider authorization code into the IMAP/SMTP flow.
4. Send a test email to the connected mailbox from another mailbox.
5. Open `Mail`, then pivot into `Addresses` or `Rooms` only when needed.

If you want a safe local walkthrough first, run `pnpm demo:mail`, then open `http://127.0.0.1:3020/workbench/mail`.

## Login Model

MailClaws currently treats IMAP/SMTP as the main user-facing connection path.

- Gmail, Outlook, QQ, iCloud, Yahoo, 163, 126, and generic IMAP/SMTP are supported presets
- MailClaws can open the provider's web login page so the user can sign in, register, or generate an app password
- the saved account connection in MailClaws is the validated IMAP/SMTP configuration
- older OAuth API routes remain only as compatibility surfaces, not the main onboarding path

## Already Using OpenClaw?

- Keep your existing Gateway and Workbench habits.
- Run `mailclaws dashboard`, sign in, and click the `Mail` tab.
- Start from external mail sessions first. Open `Addresses` for one agent queue. Open `Rooms` only when you need shared collaboration truth.
- If you want the direct fallback route, run `mailclaws open`.

## Quick-Start Templates

Templates exist for one reason: faster multi-agent setup.

- `One-Person Company`: a front desk plus specialist back-office roles. It follows the operating style popularized by <https://github.com/cyfyifanchen/one-person-company>, but MailClaws turns it into durable agents with real mailboxes and visible collaboration.
- `Three Provinces, Six Departments`: a larger governance-heavy roster aligned with the structure from <https://github.com/cft0808/edict>.

Template definitions live here:

- <https://github.com/dangoZhang/mailclaw/blob/main/src/agents/templates.ts>

## Website And Workbench

- Website: <https://dangozhang.github.io/mailclaw/>
- Workbench: run `mailclaws dashboard`, sign in, and click `Mail`

The website explains the model.
The Workbench lets you inspect the runtime directly.

## License

MIT. See [LICENSE](./LICENSE).
