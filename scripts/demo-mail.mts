import fs from "node:fs";
import path from "node:path";
import { once } from "node:events";

import { createAppServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { createMailSidecarRuntime } from "../src/orchestration/runtime.js";
import type { ProviderAddress, ProviderHeader, ProviderMailEnvelope } from "../src/providers/types.js";
import type { MailAgentExecutor } from "../src/runtime/agent-executor.js";
import { initializeDatabase } from "../src/storage/db.js";
import { upsertMailAccount } from "../src/storage/repositories/mail-accounts.js";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3020;
const DEFAULT_STATE_DIR = ".demo/mailclaw-state";
const DEFAULT_SQLITE_PATH = ".demo/mailclaw-state/mailclaw.sqlite";

const ASSISTANT_ADDRESS = "assistant@acme.ai";
const ACCOUNT_ID = "acct-demo";
const ORCHESTRATOR_MAILBOX_ID = `internal:${encodeURIComponent(ASSISTANT_ADDRESS)}:orchestrator`;

interface DemoManifest {
  baseUrl: string;
  accountId: string;
  inboxId: string | null;
  roomKeys: {
    approval: string;
    internalResearch: string;
    handoff: string;
  };
  deepLinks: {
    mail: string;
    account: string;
    inbox: string | null;
    approvalRoom: string;
    internalResearchRoom: string;
    handoffRoom: string;
  };
}

function parseArgs(argv: string[]) {
  const args = {
    host: process.env.MAILCLAW_HTTP_HOST || DEFAULT_HOST,
    port: Number(process.env.MAILCLAW_HTTP_PORT || DEFAULT_PORT),
    stateDir: process.env.MAILCLAW_STATE_DIR || DEFAULT_STATE_DIR,
    sqlitePath: process.env.MAILCLAW_SQLITE_PATH || DEFAULT_SQLITE_PATH,
    seedOnly: false,
    reset: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--seed-only") {
      args.seedOnly = true;
      continue;
    }
    if (value === "--keep-state") {
      args.reset = false;
      continue;
    }
    if (value === "--host" && argv[index + 1]) {
      args.host = argv[index + 1]!;
      index += 1;
      continue;
    }
    if (value === "--port" && argv[index + 1]) {
      args.port = Number(argv[index + 1] || DEFAULT_PORT);
      index += 1;
      continue;
    }
    if (value === "--state-dir" && argv[index + 1]) {
      args.stateDir = argv[index + 1]!;
      index += 1;
      continue;
    }
    if (value === "--sqlite-path" && argv[index + 1]) {
      args.sqlitePath = argv[index + 1]!;
      index += 1;
    }
  }

  return args;
}

function buildHeaders(input: {
  messageId: string;
  subject: string;
  from: ProviderAddress;
  to: ProviderAddress[];
  date: string;
  extraHeaders?: ProviderHeader[];
}) {
  return [
    { name: "Message-ID", value: input.messageId },
    { name: "Date", value: new Date(input.date).toUTCString() },
    { name: "From", value: input.from.email },
    { name: "To", value: input.to.map((entry) => entry.email).join(", ") },
    { name: "Subject", value: input.subject },
    ...(input.extraHeaders ?? [])
  ];
}

function createMailFactory(seed = "demo-mail") {
  let sequence = 1;

  const nextId = () => {
    const value = sequence;
    sequence += 1;
    return value;
  };

  const createEnvelope = (input: {
    subject: string;
    text: string;
    from: string;
    to?: string[];
    date: string;
    extraHeaders?: ProviderHeader[];
  }): ProviderMailEnvelope => {
    const id = nextId();
    const messageId = `<${seed}-${id}@example.test>`;
    const to = (input.to ?? [ASSISTANT_ADDRESS]).map((email) => ({ email }));
    const headers = buildHeaders({
      messageId,
      subject: input.subject,
      from: { email: input.from },
      to,
      date: input.date,
      extraHeaders: input.extraHeaders
    });

    return {
      providerMessageId: `${seed}-provider-${id}`,
      messageId,
      subject: input.subject,
      from: { email: input.from },
      to,
      text: input.text,
      date: input.date,
      headers
    };
  };

  const replyEnvelope = (
    parent: Pick<ProviderMailEnvelope, "messageId" | "subject" | "from" | "headers">,
    input: {
      text: string;
      from: string;
      date: string;
      subject?: string;
    }
  ) => {
    const inheritedReferences =
      parent.headers
        ?.find((header) => header.name.toLowerCase() === "references")
        ?.value.split(/\s+/)
        .filter(Boolean) ?? [];
    const subject =
      input.subject ?? (parent.subject.toLowerCase().startsWith("re:") ? parent.subject : `Re: ${parent.subject}`);

    return createEnvelope({
      subject,
      text: input.text,
      from: input.from,
      to: [ASSISTANT_ADDRESS],
      date: input.date,
      extraHeaders: [
        { name: "In-Reply-To", value: parent.messageId ?? "" },
        { name: "References", value: [...inheritedReferences, parent.messageId ?? ""].filter(Boolean).join(" ") }
      ]
    });
  };

  return {
    createEnvelope,
    replyEnvelope
  };
}

function createDemoExecutor(): MailAgentExecutor {
  return {
    async executeMailTurn(input) {
      const startedAt = "2026-03-29T09:00:00.000Z";
      const completedAt = "2026-03-29T09:00:04.000Z";
      const responseText = input.inputText.toLowerCase().includes("pricing")
        ? "I prepared the reply draft. Because pricing approval is required, the external send is waiting in review."
        : "I summarized the latest room state and prepared the next visible reply.";

      return {
        startedAt,
        completedAt,
        responseText,
        request: {
          url: "http://127.0.0.1:11437/v1/responses",
          method: "POST",
          headers: {},
          body: {}
        }
      };
    }
  };
}

async function seedDemoRuntime(input: {
  host: string;
  port: number;
  stateDir: string;
  sqlitePath: string;
}) {
  const config = loadConfig({
    ...process.env,
    MAILCLAW_HTTP_HOST: input.host,
    MAILCLAW_HTTP_PORT: String(input.port),
    MAILCLAW_STATE_DIR: input.stateDir,
    MAILCLAW_SQLITE_PATH: input.sqlitePath,
    MAILCLAW_FEATURE_MAIL_INGEST: "true",
    MAILCLAW_FEATURE_APPROVAL_GATE: "true",
    MAILCLAW_FEATURE_OPENCLAW_BRIDGE: "true"
  });
  const handle = initializeDatabase(config);
  const runtime = createMailSidecarRuntime({
    db: handle.db,
    config,
    agentExecutor: createDemoExecutor()
  });

  upsertMailAccount(handle.db, {
    accountId: ACCOUNT_ID,
    provider: "forward",
    emailAddress: ASSISTANT_ADDRESS,
    displayName: "Acme Assistant",
    status: "active",
    settings: {
      smtp: {
        host: "smtp.demo.example",
        port: 587
      }
    },
    createdAt: "2026-03-29T08:55:00.000Z",
    updatedAt: "2026-03-29T08:55:00.000Z"
  });

  const virtualMailboxBase = {
    accountId: ACCOUNT_ID,
    principalId: "principal:assistant",
    active: true,
    createdAt: "2026-03-29T08:55:00.000Z",
    updatedAt: "2026-03-29T08:55:00.000Z"
  };

  runtime.upsertVirtualMailbox({
    ...virtualMailboxBase,
    mailboxId: `public:${ASSISTANT_ADDRESS}`,
    kind: "public"
  });
  runtime.upsertVirtualMailbox({
    ...virtualMailboxBase,
    mailboxId: ORCHESTRATOR_MAILBOX_ID,
    kind: "internal_role",
    role: "orchestrator"
  });
  runtime.upsertVirtualMailbox({
    ...virtualMailboxBase,
    mailboxId: "internal:assistant:researcher",
    kind: "internal_role",
    role: "researcher"
  });
  runtime.upsertVirtualMailbox({
    ...virtualMailboxBase,
    mailboxId: "internal:assistant:reviewer",
    kind: "internal_role",
    role: "reviewer"
  });
  runtime.upsertVirtualMailbox({
    accountId: ACCOUNT_ID,
    principalId: "principal:ops",
    mailboxId: "human:ops",
    kind: "human",
    active: true,
    createdAt: "2026-03-29T08:55:00.000Z",
    updatedAt: "2026-03-29T08:55:00.000Z"
  });

  runtime.ensurePublicAgentInbox({
    accountId: ACCOUNT_ID,
    agentId: ASSISTANT_ADDRESS,
    activeRoomLimit: 2,
    ackSlaSeconds: 45,
    burstCoalesceSeconds: 30,
    now: "2026-03-29T08:56:00.000Z"
  });

  const mailFactory = createMailFactory();

  const approvalMail = mailFactory.createEnvelope({
    subject: "Pricing approval for 25 seats",
    text: "We need the final quote approved by finance before you reply to the customer.",
    from: "buyer@northwind.example",
    date: "2026-03-29T09:00:00.000Z"
  });
  const approvalResult = await runtime.ingest({
    accountId: ACCOUNT_ID,
    mailboxAddress: ASSISTANT_ADDRESS,
    envelope: approvalMail,
    processImmediately: true
  });

  const researchMail = mailFactory.createEnvelope({
    subject: "Need a vendor comparison before I reply",
    text: "Please compare the migration vendors and summarize tradeoffs before replying.",
    from: "ops@contoso.example",
    date: "2026-03-29T09:03:00.000Z"
  });
  const researchResult = await runtime.ingest({
    accountId: ACCOUNT_ID,
    mailboxAddress: ASSISTANT_ADDRESS,
    envelope: researchMail,
    processImmediately: false
  });

  const researchReply = mailFactory.replyEnvelope(researchMail, {
    from: "ops@contoso.example",
    text: "One more thing: include the expected migration cost band in the answer.",
    date: "2026-03-29T09:04:00.000Z"
  });
  await runtime.ingest({
    accountId: ACCOUNT_ID,
    mailboxAddress: ASSISTANT_ADDRESS,
    envelope: researchReply,
    processImmediately: false
  });

  const researchRoom = runtime.replay(researchResult.ingested.roomKey).room;
  if (!researchRoom) {
    throw new Error("research demo room not found after ingest");
  }

  const task = runtime.submitVirtualMessage({
    roomKey: researchRoom.roomKey,
    threadKind: "work",
    topic: "Vendor comparison",
    fromPrincipalId: "principal:assistant",
    fromMailboxId: ORCHESTRATOR_MAILBOX_ID,
    toMailboxIds: ["internal:assistant:researcher"],
    kind: "task",
    visibility: "internal",
    subject: "Need a vendor comparison before I reply",
    bodyRef: "body://demo/vendor-comparison-task",
    roomRevision: researchRoom.revision,
    inputsHash: "demo-vendor-comparison-task",
    createdAt: "2026-03-29T09:05:00.000Z"
  });
  const claim = runtime.replyVirtualMessage(task.message.messageId, {
    fromPrincipalId: "principal:assistant",
    fromMailboxId: "internal:assistant:researcher",
    toMailboxIds: [ORCHESTRATOR_MAILBOX_ID],
    kind: "claim",
    visibility: "internal",
    subject: "Need a vendor comparison before I reply",
    bodyRef: "body://demo/vendor-comparison-claim",
    roomRevision: researchRoom.revision,
    inputsHash: "demo-vendor-comparison-claim",
    createdAt: "2026-03-29T09:06:00.000Z"
  });
  runtime.replyVirtualMessage(claim.message.messageId, {
    fromPrincipalId: "principal:assistant",
    fromMailboxId: ORCHESTRATOR_MAILBOX_ID,
    toMailboxIds: ["internal:assistant:reviewer"],
    kind: "review",
    visibility: "internal",
    subject: "Need a vendor comparison before I reply",
    bodyRef: "body://demo/vendor-comparison-review",
    roomRevision: researchRoom.revision,
    inputsHash: "demo-vendor-comparison-review",
    createdAt: "2026-03-29T09:07:00.000Z"
  });

  const handoffMail = mailFactory.createEnvelope({
    subject: "Legal review needed before we continue",
    text: "Please hand this off to a human. Do not auto-reply until legal finishes.",
    from: "legal-contact@example.com",
    date: "2026-03-29T09:08:00.000Z"
  });
  const handoffResult = await runtime.ingest({
    accountId: ACCOUNT_ID,
    mailboxAddress: ASSISTANT_ADDRESS,
    envelope: handoffMail,
    processImmediately: false
  });
  runtime.requestHandoff(handoffResult.ingested.roomKey, {
    requestedBy: "ops@acme.ai",
    reason: "Human legal review requested by demo operator.",
    now: "2026-03-29T09:09:00.000Z"
  });
  const handoffRoom = runtime.replay(handoffResult.ingested.roomKey).room;
  if (!handoffRoom) {
    throw new Error("handoff demo room not found after request");
  }
  runtime.submitVirtualMessage({
    roomKey: handoffRoom.roomKey,
    threadKind: "work",
    topic: "Human legal review",
    fromPrincipalId: "principal:assistant",
    fromMailboxId: ORCHESTRATOR_MAILBOX_ID,
    toMailboxIds: ["human:ops"],
    kind: "handoff",
    visibility: "governance",
    subject: "Legal review needed before we continue",
    bodyRef: "body://demo/handoff-notice",
    roomRevision: handoffRoom.revision,
    inputsHash: "demo-handoff-notice",
    createdAt: "2026-03-29T09:10:00.000Z"
  });

  runtime.projectPublicAgentInbox({
    accountId: ACCOUNT_ID,
    agentId: ASSISTANT_ADDRESS,
    now: "2026-03-29T09:11:00.000Z"
  });

  const mailboxConsole = runtime.getMailboxConsole(ACCOUNT_ID);
  const publicInbox = mailboxConsole.publicAgentInboxes[0]?.inbox ?? null;
  const baseUrl = `http://${input.host}:${input.port}`;

  const manifest: DemoManifest = {
    baseUrl,
    accountId: ACCOUNT_ID,
    inboxId: publicInbox?.inboxId ?? null,
    roomKeys: {
      approval: approvalResult.ingested.roomKey,
      internalResearch: researchResult.ingested.roomKey,
      handoff: handoffResult.ingested.roomKey
    },
    deepLinks: {
      mail: `${baseUrl}/workbench/mail`,
      account: `${baseUrl}/workbench/mail/accounts/${encodeURIComponent(ACCOUNT_ID)}`,
      inbox: publicInbox ? `${baseUrl}/workbench/mail/inboxes/${encodeURIComponent(ACCOUNT_ID)}/${encodeURIComponent(publicInbox.inboxId)}` : null,
      approvalRoom: `${baseUrl}/workbench/mail/rooms/${encodeURIComponent(approvalResult.ingested.roomKey)}`,
      internalResearchRoom: `${baseUrl}/workbench/mail/rooms/${encodeURIComponent(researchResult.ingested.roomKey)}`,
      handoffRoom: `${baseUrl}/workbench/mail/rooms/${encodeURIComponent(handoffResult.ingested.roomKey)}`
    }
  };

  const outputDir = path.resolve(process.cwd(), ".demo/output");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  return {
    config,
    handle,
    runtime,
    manifest
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const resolvedStateDir = path.resolve(process.cwd(), args.stateDir);
  const resolvedSqlitePath = path.resolve(process.cwd(), args.sqlitePath);

  if (args.reset) {
    fs.rmSync(resolvedStateDir, { recursive: true, force: true });
  }

  const seeded = await seedDemoRuntime({
    host: args.host,
    port: args.port,
    stateDir: resolvedStateDir,
    sqlitePath: resolvedSqlitePath
  });

  console.log("MailClaws demo data seeded.");
  console.log(`State dir: ${resolvedStateDir}`);
  console.log(`SQLite:    ${resolvedSqlitePath}`);
  console.log(`Account:   ${seeded.manifest.accountId}`);
  console.log(`Mail:      ${seeded.manifest.deepLinks.mail}`);
  console.log(`Account:   ${seeded.manifest.deepLinks.account}`);
  if (seeded.manifest.deepLinks.inbox) {
    console.log(`Inbox:     ${seeded.manifest.deepLinks.inbox}`);
  }
  console.log(`Room A:    ${seeded.manifest.deepLinks.approvalRoom}`);
  console.log(`Room B:    ${seeded.manifest.deepLinks.internalResearchRoom}`);
  console.log(`Room C:    ${seeded.manifest.deepLinks.handoffRoom}`);

  if (args.seedOnly) {
    seeded.handle.close();
    return;
  }

  const server = createAppServer({
    config: seeded.config,
    mailApi: seeded.runtime
  });

  server.listen(args.port, args.host);
  await once(server, "listening");
  console.log("");
  console.log("Demo server is ready.");
  console.log(`Open ${seeded.manifest.deepLinks.mail}`);
  console.log("This seeded state includes:");
  console.log("- one room waiting for approval");
  console.log("- one room with internal researcher/reviewer mail");
  console.log("- one room already handed off to a human");

  const shutdown = () => {
    server.close(() => {
      seeded.handle.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
