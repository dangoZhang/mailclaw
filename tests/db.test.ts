import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { afterEach, describe, expect, it } from "vitest";

import { loadConfig } from "../src/config.js";
import { initializeDatabase } from "../src/storage/db.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("initializeDatabase", () => {
  it("creates the sqlite file, schema metadata, and a control-plane-only outbox schema", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mailclaw-"));
    tempDirs.push(tempDir);

    const config = loadConfig({
      MAILCLAW_STATE_DIR: tempDir,
      MAILCLAW_SQLITE_PATH: path.join(tempDir, "mailclaw.sqlite")
    });

    const handle = initializeDatabase(config);
    const row = handle.db.prepare("SELECT version FROM schema_meta WHERE id = 1").get() as {
      version: number;
    };

    expect(fs.existsSync(handle.path)).toBe(true);
    expect(row.version).toBe(32);
    expect(
      handle.db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'mail_outbox'
            LIMIT 1;
          `
        )
        .get()
    ).toBeUndefined();
    expect(
      handle.db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'outbox_intents'
            LIMIT 1;
          `
        )
        .get()
    ).toEqual({
      name: "outbox_intents"
    });
    expect(
      handle.db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = 'oauth_login_sessions'
            LIMIT 1;
          `
        )
        .get()
    ).toEqual({
      name: "oauth_login_sessions"
    });
    expect(
      handle.db
        .prepare(
          `
            SELECT name
            FROM pragma_table_info('virtual_messages')
            WHERE name = 'origin_kind'
            LIMIT 1;
          `
        )
        .get()
    ).toEqual({
      name: "origin_kind"
    });
    expect(
      handle.db
        .prepare(
          `
            SELECT name
            FROM pragma_table_info('task_nodes')
            WHERE name = 'task_class'
            LIMIT 1;
          `
        )
        .get()
    ).toEqual({
      name: "task_class"
    });

    handle.close();
  });

  it("reopens an already-initialized database while another handle is still active", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mailclaw-db-reopen-"));
    tempDirs.push(tempDir);

    const config = loadConfig({
      MAILCLAW_STATE_DIR: tempDir,
      MAILCLAW_SQLITE_PATH: path.join(tempDir, "mailclaw.sqlite")
    });

    const first = initializeDatabase(config);
    const second = initializeDatabase(config);
    const row = second.db.prepare("SELECT version FROM schema_meta WHERE id = 1").get() as {
      version: number;
    };

    expect(row.version).toBe(32);

    second.close();
    first.close();
  });

  it("migrates legacy thread_rooms rows missing durable-agent id columns", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mailclaw-db-legacy-thread-rooms-"));
    tempDirs.push(tempDir);
    const sqlitePath = path.join(tempDir, "mailclaw.sqlite");

    const legacyDb = new DatabaseSync(sqlitePath);
    legacyDb.exec(`
      CREATE TABLE schema_meta (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL,
        applied_at TEXT NOT NULL
      );
      INSERT INTO schema_meta (id, version, applied_at)
      VALUES (1, 31, '2026-03-29T07:56:55.415Z');
      CREATE TABLE thread_rooms (
        room_key TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        stable_thread_id TEXT NOT NULL,
        parent_session_key TEXT NOT NULL,
        front_agent_address TEXT,
        public_agent_addresses_json TEXT NOT NULL DEFAULT '[]',
        collaborator_agent_addresses_json TEXT NOT NULL DEFAULT '[]',
        summoned_roles_json TEXT NOT NULL DEFAULT '[]',
        state TEXT NOT NULL,
        revision INTEGER NOT NULL,
        last_inbound_seq INTEGER NOT NULL,
        last_outbound_seq INTEGER NOT NULL,
        summary_ref TEXT,
        shared_facts_ref TEXT
      );
    `);
    legacyDb.close();

    const config = loadConfig({
      MAILCLAW_STATE_DIR: tempDir,
      MAILCLAW_SQLITE_PATH: sqlitePath
    });
    const handle = initializeDatabase(config);
    const migratedVersion = handle.db.prepare("SELECT version FROM schema_meta WHERE id = 1").get() as {
      version: number;
    };
    const columns = handle.db
      .prepare("SELECT name FROM pragma_table_info('thread_rooms');")
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));

    expect(migratedVersion.version).toBe(32);
    expect(columnNames.has("front_agent_id")).toBe(true);
    expect(columnNames.has("public_agent_ids_json")).toBe(true);
    expect(columnNames.has("collaborator_agent_ids_json")).toBe(true);
    expect(() => handle.db.prepare("SELECT front_agent_id FROM thread_rooms LIMIT 1;").all()).not.toThrow();

    handle.close();
  });
});
