# Getting Started

<p align="center">
  <a href="./getting-started.md"><strong>English</strong></a> ·
  <a href="./getting-started.zh-CN.md">简体中文</a> ·
  <a href="./getting-started.fr.md">Français</a>
</p>

This guide starts with the normal mailbox-user path first: install, log in one mailbox, send one test email, and read the conversation in the browser. Operator and developer flows come after that.

MailClaw does not assume QQ Mail or any other single provider. Start with the mailbox address you already use. The built-in paths cover Gmail, Outlook, QQ, iCloud, Yahoo, 163/126, plus generic IMAP/SMTP accounts.

## Prerequisites

- Node.js 22+ and `pnpm`
- A checkout of this repository
- Optional real mailbox credentials (for live provider tests)

Fastest local install:

```bash
./install.sh
```

Or install dependencies from source:

```bash
pnpm install
```

MailClaw uses the built-in `node:sqlite` module, so older Node versions will not run the packaged CLI/runtime correctly. Before using the packaged `mailclaw` or `mailctl` binaries, confirm that both `which node` and `node -p process.version` resolve to Node 22+.

<a id="release-bundle"></a>

## 0. Choose Source Run Or Release Bundle {#release-bundle}

You can start MailClaw in two ways:

- Source checkout:
  use `pnpm install`, `pnpm dev`, and `pnpm mailctl ...`
- Release bundle:
  use `pnpm package:release` to produce a runtime bundle plus static docs site

Build the release bundle:

```bash
pnpm package:release
```

This creates:

- `output/release/mailclaw-v<version>/`
- `output/release/mailclaw-v<version>.tar.gz`

Run the packaged build:

```bash
cd output/release/mailclaw-v<version>
pnpm install --prod
pnpm start
```

The packaged bundle also includes:

- `docs-site/` for static documentation hosting
- `dist/cli/mailclaw.js`
- `dist/cli/mailctl.js`
- `dist/cli/mailioctl.js`
- `.env.example`, `README.md`, and `release-manifest.json`

OpenClaw-style installer entrypoints:

```bash
./install.sh
pwsh ./install.ps1
```

Local one-command installs from generated assets:

```bash
npm install -g ./output/release/npm/mailclaw-<version>.tgz
pnpm setup
pnpm add -g "file://$PWD/output/release/npm/mailclaw-<version>.tgz"
brew install ./output/release/homebrew/mailclaw.rb
```

Notes:

- For a local tarball, `pnpm add -g` should use an absolute path or `file://` URL.
- On a fresh machine, run `pnpm setup` once before the first global install.
- Local Homebrew installs still depend on Homebrew being able to reach its own download endpoints.

When the same artifact layout is published upstream, the intended install commands are:

```bash
npm install -g mailclaw
pnpm setup
pnpm add -g mailclaw
npx mailclaw@latest
pnpm dlx mailclaw@latest
brew install mailclaw
```

`npx mailclaw@latest` and `pnpm dlx mailclaw@latest` run the default runtime entrypoint. Install the package first if you want to call `mailctl` directly.

## 1. Start MailClaw

Default embedded mode (fastest local path):

```bash
MAILCLAW_FEATURE_MAIL_INGEST=true \
pnpm mailclaw
```

Open the browser dashboard after boot:

```text
http://127.0.0.1:3000/workbench/mail
```

`mailclaw` is the user-facing entrypoint. It starts the local runtime by default, and it also exposes simple shortcuts such as `mailclaw onboard`, `mailclaw login`, `mailclaw dashboard`, `mailclaw status`, and `mailclaw doctor`. `mailclaw dashboard` opens the full `/workbench/mail` surface. `/workbench/mail/tab` reuses the same Mail tab UI in embedded mode for a parent OpenClaw/Gateway workbench, while `/console/*` remains a compatibility alias to that same surface.

Bridge mode (OpenClaw-compatible):

```bash
MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON='{"toolPolicies":["mail-orchestrator","mail-attachment-reader","mail-researcher","mail-drafter","mail-reviewer","mail-guard"],"sandboxPolicies":["mail-room-orchestrator","mail-room-worker"],"networkAccess":"allowlisted","filesystemAccess":"workspace-read","outboundMode":"approval_required"}' \
MAILCLAW_FEATURE_MAIL_INGEST=true \
MAILCLAW_FEATURE_OPENCLAW_BRIDGE=true \
MAILCLAW_OPENCLAW_GATEWAY_TOKEN=dev-token \
pnpm dev
```

Command mode (local runtime command):

```bash
MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON='{"toolPolicies":["mail-orchestrator","mail-attachment-reader","mail-researcher","mail-drafter","mail-reviewer","mail-guard"],"sandboxPolicies":["mail-room-orchestrator","mail-room-worker"],"networkAccess":"allowlisted","filesystemAccess":"workspace-read","outboundMode":"approval_required"}' \
MAILCLAW_RUNTIME_MODE=command \
MAILCLAW_RUNTIME_COMMAND='mail-runtime --stdio' \
MAILCLAW_FEATURE_MAIL_INGEST=true \
pnpm dev
```

`MAILCLAW_RUNTIME_POLICY_MANIFEST_JSON` is required for bridge or command runtimes whenever turns carry `executionPolicy` metadata. The default embedded runtime ships with a built-in manifest so a fresh install can run locally without extra runtime wiring.

On the first turn for an agent workspace, MailClaw also bootstraps:

- `SOUL.md`
- `AGENTS.md`
- `MEMORY.md`
- `roles/mail-read.default.md`
- `roles/mail-write.default.md`

These defaults are summarized into orchestration turns so mail handling starts with "latest inbound first" and "ACK/progress/final stay distinct" behavior.

## 2. Connect A Mailbox

Choose one path:

- Inspect the provider/setup matrix first: `pnpm mailclaw providers [provider]`
- Ask MailClaw for a mailbox-first recommendation: `pnpm mailclaw onboard you@example.com`
- Interactive terminal wizard: `pnpm mailclaw login`
- Gmail OAuth: `pnpm mailctl connect login gmail <accountId> [displayName]`
- Outlook OAuth: `pnpm mailctl connect login outlook <accountId> [displayName]`
- Headless OAuth: `pnpm mailctl connect login oauth gmail <accountId> [displayName] --no-browser`
- Headless Outlook OAuth: `pnpm mailctl connect login oauth outlook <accountId> [displayName] --no-browser`
- API account registration: `POST /api/accounts`

Recommended bootstrap order:

```bash
pnpm mailclaw onboard you@example.com
pnpm mailclaw login
pnpm mailclaw accounts
```

If you are unsure which provider path to pick, use `pnpm mailclaw login`. The wizard asks for your email address first, uses common defaults when it recognizes the domain, and otherwise falls back to generic IMAP/SMTP prompts.

You can inspect connected accounts with:

```bash
pnpm mailclaw accounts
```

Provider setup catalog APIs:

```bash
curl -s http://127.0.0.1:3000/api/connect
curl -s "http://127.0.0.1:3000/api/connect/onboarding?emailAddress=you@example.com"
curl -s http://127.0.0.1:3000/api/connect/providers
curl -s http://127.0.0.1:3000/api/connect/providers/gmail
```

<a id="three-minute-first-mail"></a>

## 3. Send Your First Real Email {#three-minute-first-mail}

After account login, use your normal mail habit first:

1. Copy the connected mailbox address from the browser console or:
   - `pnpm mailclaw accounts show <accountId>`
2. Send one email to that address from another mailbox client/account.
3. Run `mailclaw dashboard` or open `http://127.0.0.1:3000/workbench/mail`, then pick the connected account.
4. Read the room from the browser account page.
5. If you want CLI confirmation too:
   - `pnpm mailclaw rooms`
   - `pnpm mailclaw inboxes <accountId>`
   - `pnpm mailclaw replay <roomKey>`
6. If you want to inspect internal agent collaboration later:
   - `pnpm mailclaw workbench <accountId> <roomKey>`
   - `pnpm mailctl observe mailbox-view <roomKey> <mailboxId>`
   - `pnpm mailctl observe mailbox-feed <accountId> <mailboxId>`

This is the shortest "login -> receive -> read the conversation" path for real mailbox users. Mailbox feeds, internal agent mail, replay, and governance views are still there, but they are second-step tooling rather than first-run requirements.

Behavior note: MailClaw agents do not reload an entire transcript by default. The normal turn assembly is latest inbound + latest room pre snapshot + referenced facts/artifacts.

## 4. Path A: provider mail -> room -> approval -> delivery

Inject a normalized inbound message:

```bash
curl -X POST 'http://127.0.0.1:3000/api/inbound?processImmediately=true' \
  -H 'content-type: application/json' \
  -d '{
    "accountId": "acct-1",
    "mailboxAddress": "mailclaw@example.com",
    "envelope": {
      "providerMessageId": "provider-1",
      "messageId": "<msg-1@example.com>",
      "subject": "API room",
      "from": { "email": "sender@example.com" },
      "to": [{ "email": "mailclaw@example.com" }],
      "text": "Hello from the API",
      "headers": [{ "name": "Message-ID", "value": "<msg-1@example.com>" }]
    }
  }'
```

Inspect room and approval state:

```bash
pnpm mailctl observe rooms
pnpm mailctl observe room <roomKey>
pnpm mailctl observe approvals room <roomKey>
```

Deliver pending outbox messages:

```bash
pnpm mailctl operate deliver-outbox
```

## 5. Path B: Gateway turn -> virtual mail -> room -> final outcome

Project a Gateway turn into MailClaw:

```bash
curl -X POST 'http://127.0.0.1:3000/api/gateway/project' \
  -H 'content-type: application/json' \
  -d '{
    "sessionKey": "gw-session-1",
    "sourceControlPlane": "openclaw",
    "fromPrincipalId": "agent:front",
    "fromMailboxId": "front-mailbox",
    "toMailboxIds": ["mail-orchestrator"],
    "kind": "claim",
    "visibility": "internal",
    "subject": "Gateway projection smoke",
    "bodyRef": "gateway message body",
    "inputsHash": "smoke-hash-1"
  }'
```

Inspect projection trace and room timeline:

```bash
pnpm mailctl gateway trace <roomKey>
pnpm mailctl replay <roomKey>
```

Boundary note: projection APIs are implemented, but automatic upstream Gateway event-stream wiring is not complete in this repository.

## 6. Path C: internal multi-agent -> reducer/reviewer/guard -> projected outcome

Enable worker/governance flags for local runs:

```bash
MAILCLAW_FEATURE_SWARM_WORKERS=true \
MAILCLAW_FEATURE_APPROVAL_GATE=true \
MAILCLAW_FEATURE_IDENTITY_TRUST_GATE=true \
pnpm dev
```

Then inspect internal collaboration artifacts via room mailboxes/feed:

```bash
pnpm mailctl observe mailbox-view <roomKey> <mailboxId>
pnpm mailctl observe mailbox-feed <accountId> <mailboxId>
pnpm mailctl approvals trace <roomKey>
```

You can filter mailbox views by origin kinds (`provider_mail`, `gateway_chat`, `virtual_internal`) to verify internal multi-agent transitions.

## 7. Next Steps

- Operator workflows and troubleshooting: [Operators Guide](./operators-guide.md)
- Provider/Gateway/OpenClaw wiring: [Integrations](./integrations.md)
- Real credential smoke procedures: [Live Provider Smoke](./live-provider-smoke.md)

Release verification baseline:

```bash
pnpm build
pnpm test:workflow
pnpm test:security
pnpm docs:build
```
