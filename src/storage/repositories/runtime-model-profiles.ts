import type { DatabaseSync } from "node:sqlite";

export type RuntimeModelSourceKind = "embedded" | "openclaw_reuse" | "openclaw_login" | "api_key";

export interface RuntimeModelProfileRecord {
  profileId: string;
  label: string;
  sourceKind: RuntimeModelSourceKind;
  model: string;
  baseUrl?: string;
  publicBaseUrl?: string;
  openClawAgentId?: string;
  loginUrl?: string;
  gatewayToken?: string;
  apiKey?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeSettingsRecord {
  defaultProfileId?: string;
  updatedAt: string;
}

export function listRuntimeModelProfiles(db: DatabaseSync): RuntimeModelProfileRecord[] {
  const rows = db
    .prepare(
      `
        SELECT
          profile_id,
          label,
          source_kind,
          model,
          base_url,
          public_base_url,
          openclaw_agent_id,
          login_url,
          gateway_token,
          api_key,
          enabled,
          created_at,
          updated_at
        FROM runtime_model_profiles
        ORDER BY updated_at DESC, profile_id ASC;
      `
    )
    .all() as unknown as RuntimeModelProfileRow[];

  return rows.map(mapRuntimeModelProfileRow);
}

export function getRuntimeModelProfile(db: DatabaseSync, profileId: string) {
  const row = db
    .prepare(
      `
        SELECT
          profile_id,
          label,
          source_kind,
          model,
          base_url,
          public_base_url,
          openclaw_agent_id,
          login_url,
          gateway_token,
          api_key,
          enabled,
          created_at,
          updated_at
        FROM runtime_model_profiles
        WHERE profile_id = ?
        LIMIT 1;
      `
    )
    .get(profileId) as RuntimeModelProfileRow | undefined;

  return row ? mapRuntimeModelProfileRow(row) : null;
}

export function upsertRuntimeModelProfile(db: DatabaseSync, profile: RuntimeModelProfileRecord) {
  db.prepare(
    `
      INSERT INTO runtime_model_profiles (
        profile_id,
        label,
        source_kind,
        model,
        base_url,
        public_base_url,
        openclaw_agent_id,
        login_url,
        gateway_token,
        api_key,
        enabled,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        label = excluded.label,
        source_kind = excluded.source_kind,
        model = excluded.model,
        base_url = excluded.base_url,
        public_base_url = excluded.public_base_url,
        openclaw_agent_id = excluded.openclaw_agent_id,
        login_url = excluded.login_url,
        gateway_token = excluded.gateway_token,
        api_key = excluded.api_key,
        enabled = excluded.enabled,
        updated_at = excluded.updated_at;
    `
  ).run(
    profile.profileId,
    profile.label,
    profile.sourceKind,
    profile.model,
    profile.baseUrl ?? null,
    profile.publicBaseUrl ?? null,
    profile.openClawAgentId ?? null,
    profile.loginUrl ?? null,
    profile.gatewayToken ?? null,
    profile.apiKey ?? null,
    profile.enabled ? 1 : 0,
    profile.createdAt,
    profile.updatedAt
  );
}

export function deleteRuntimeModelProfile(db: DatabaseSync, profileId: string) {
  db.prepare("DELETE FROM runtime_model_profiles WHERE profile_id = ?;").run(profileId);
}

export function getRuntimeSettings(db: DatabaseSync) {
  const row = db
    .prepare(
      `
        SELECT
          default_profile_id,
          updated_at
        FROM runtime_settings
        WHERE settings_id = 'singleton'
        LIMIT 1;
      `
    )
    .get() as RuntimeSettingsRow | undefined;

  return row ? mapRuntimeSettingsRow(row) : null;
}

export function upsertRuntimeSettings(db: DatabaseSync, settings: RuntimeSettingsRecord) {
  db.prepare(
    `
      INSERT INTO runtime_settings (
        settings_id,
        default_profile_id,
        updated_at
      ) VALUES ('singleton', ?, ?)
      ON CONFLICT(settings_id) DO UPDATE SET
        default_profile_id = excluded.default_profile_id,
        updated_at = excluded.updated_at;
    `
  ).run(settings.defaultProfileId ?? null, settings.updatedAt);
}

function mapRuntimeModelProfileRow(row: RuntimeModelProfileRow): RuntimeModelProfileRecord {
  return {
    profileId: row.profile_id,
    label: row.label,
    sourceKind: row.source_kind,
    model: row.model,
    baseUrl: row.base_url ?? undefined,
    publicBaseUrl: row.public_base_url ?? undefined,
    openClawAgentId: row.openclaw_agent_id ?? undefined,
    loginUrl: row.login_url ?? undefined,
    gatewayToken: row.gateway_token ?? undefined,
    apiKey: row.api_key ?? undefined,
    enabled: row.enabled === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRuntimeSettingsRow(row: RuntimeSettingsRow): RuntimeSettingsRecord {
  return {
    defaultProfileId: row.default_profile_id ?? undefined,
    updatedAt: row.updated_at
  };
}

interface RuntimeModelProfileRow {
  profile_id: string;
  label: string;
  source_kind: RuntimeModelSourceKind;
  model: string;
  base_url: string | null;
  public_base_url: string | null;
  openclaw_agent_id: string | null;
  login_url: string | null;
  gateway_token: string | null;
  api_key: string | null;
  enabled: 0 | 1;
  created_at: string;
  updated_at: string;
}

interface RuntimeSettingsRow {
  default_profile_id: string | null;
  updated_at: string;
}
