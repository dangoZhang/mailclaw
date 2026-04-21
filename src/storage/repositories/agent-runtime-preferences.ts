import type { DatabaseSync } from "node:sqlite";

export interface AgentRuntimePreferenceRecord {
  tenantId: string;
  agentId: string;
  profileId?: string;
  modelOverride?: string;
  createdAt: string;
  updatedAt: string;
}

export function getAgentRuntimePreference(db: DatabaseSync, tenantId: string, agentId: string) {
  const row = db
    .prepare(
      `
        SELECT
          tenant_id,
          agent_id,
          profile_id,
          model_override,
          created_at,
          updated_at
        FROM agent_runtime_preferences
        WHERE tenant_id = ? AND agent_id = ?
        LIMIT 1;
      `
    )
    .get(tenantId, agentId) as AgentRuntimePreferenceRow | undefined;

  return row ? mapAgentRuntimePreferenceRow(row) : null;
}

export function listAgentRuntimePreferences(db: DatabaseSync, tenantId: string) {
  const rows = db
    .prepare(
      `
        SELECT
          tenant_id,
          agent_id,
          profile_id,
          model_override,
          created_at,
          updated_at
        FROM agent_runtime_preferences
        WHERE tenant_id = ?
        ORDER BY updated_at DESC, agent_id ASC;
      `
    )
    .all(tenantId) as unknown as AgentRuntimePreferenceRow[];

  return rows.map(mapAgentRuntimePreferenceRow);
}

export function upsertAgentRuntimePreference(db: DatabaseSync, preference: AgentRuntimePreferenceRecord) {
  db.prepare(
    `
      INSERT INTO agent_runtime_preferences (
        tenant_id,
        agent_id,
        profile_id,
        model_override,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(tenant_id, agent_id) DO UPDATE SET
        profile_id = excluded.profile_id,
        model_override = excluded.model_override,
        updated_at = excluded.updated_at;
    `
  ).run(
    preference.tenantId,
    preference.agentId,
    preference.profileId ?? null,
    preference.modelOverride ?? null,
    preference.createdAt,
    preference.updatedAt
  );
}

export function deleteAgentRuntimePreference(db: DatabaseSync, tenantId: string, agentId: string) {
  db.prepare("DELETE FROM agent_runtime_preferences WHERE tenant_id = ? AND agent_id = ?;").run(
    tenantId,
    agentId
  );
}

function mapAgentRuntimePreferenceRow(row: AgentRuntimePreferenceRow): AgentRuntimePreferenceRecord {
  return {
    tenantId: row.tenant_id,
    agentId: row.agent_id,
    profileId: row.profile_id ?? undefined,
    modelOverride: row.model_override ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

interface AgentRuntimePreferenceRow {
  tenant_id: string;
  agent_id: string;
  profile_id: string | null;
  model_override: string | null;
  created_at: string;
  updated_at: string;
}
