# ADR-001: MailClaws V1 Sidecar Architecture

## Status

Accepted

## Context

MailClaws needs to turn one connected mailbox into durable OpenClaw execution boundaries while keeping message ingestion, dedupe, queueing, outbound mail, and audit concerns outside OpenClaw core. OpenClaw already treats `sessionKey` as the logical routing boundary, while NanoClaw demonstrates that a single-process orchestrator with SQLite and per-context FIFO queues is operationally simple and resilient.

The current implementation state is intentionally staged:

- V1 is a sidecar.
- The mail path is feature-flagged.
- The orchestration pipeline is `ingest -> normalize -> resolve -> queue -> bridge -> reply -> replay`.
- Queue recovery is lease-based rather than best-effort in-memory scheduling.
- Replay is append-only and reconstructs room state from ledger, runs, outbox, and attachments.
- The user-facing connect path is IMAP/SMTP-first.
- The browser workbench separates `mail session`, `address`, and `room` instead of collapsing everything into one thread view.

## Decision

1. MailClaws V1 will be a sidecar service and will not modify OpenClaw core.
2. Each external email thread will map to one stable OpenClaw `sessionKey` using the form `hook:mail:<account>:thread:<stableThreadId>`.
3. MailClaws will expose three operator-facing layers:
   - `mail session` for the external conversation surface
   - `address` for one agent queue and mailbox projection
   - `room` for shared multi-agent truth
4. OpenClaw will remain responsible for runtime execution and session history; MailClaws will own provider IO, normalization, dedupe, thread resolution, queueing, progress mail, outbox delivery, and durable audit records.
5. Every mail-facing capability will start behind an explicit feature flag.
6. The system will assume all inbound mail and attachments are untrusted content.

## Consequences

### Positive

- Reuses OpenClaw session routing without rewriting its session manager.
- Keeps V1 small enough to validate thread mapping and queue semantics first.
- Aligns with a room-kernel/swarm model where thread orchestration state is durable outside transient sub-agent sessions.
- Gives operators a clearer separation between mailbox connection state, external mail sessions, one-agent address views, and shared collaboration truth.

### Negative

- V1 has an extra process boundary between mail providers and OpenClaw.
- Native OpenClaw channel ergonomics are deferred until V2.

## Follow-up

- Phase 1 adds provider IO, normalization, and SQLite persistence.
- Phase 2 adds durable thread-to-session mapping.
- Phase 3 adds the OpenClaw bridge and attachment summary persistence.
- Phase 4 adds per-thread FIFO plus bounded global concurrency.
- Phase 5 hardens replay, recovery, and approval gates around the already persisted orchestration state.
