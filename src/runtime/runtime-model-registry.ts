import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

import type { AppConfig } from "../config.js";
import { getAgentRuntimePreference } from "../storage/repositories/agent-runtime-preferences.js";
import {
  getRuntimeModelProfile,
  getRuntimeSettings,
  listRuntimeModelProfiles,
  type RuntimeModelProfileRecord,
  type RuntimeModelSourceKind
} from "../storage/repositories/runtime-model-profiles.js";

export interface RuntimeModelProfileView {
  profileId: string;
  label: string;
  sourceKind: RuntimeModelSourceKind;
  model: string;
  builtin: boolean;
  enabled: boolean;
  defaultSelected: boolean;
  baseUrl?: string;
  publicBaseUrl?: string;
  openClawAgentId?: string;
  loginUrl?: string;
  apiKeyConfigured: boolean;
  gatewayTokenConfigured: boolean;
  editMode: "readonly" | "custom";
}

export interface ResolvedRuntimeModelProfile {
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
  builtin: boolean;
  enabled: boolean;
}

export function createRuntimeModelProfileId() {
  return `profile-${randomUUID()}`;
}

export function listRuntimeModelProfileViews(db: DatabaseSync, config: AppConfig) {
  const builtins = listBuiltinRuntimeModelProfiles(config);
  const custom = listRuntimeModelProfiles(db).map(mapCustomProfile);
  const defaultProfileId = resolveDefaultRuntimeModelProfileId(db, config);

  return [...builtins, ...custom].map((profile) => ({
    profileId: profile.profileId,
    label: profile.label,
    sourceKind: profile.sourceKind,
    model: profile.model,
    builtin: profile.builtin,
    enabled: profile.enabled,
    defaultSelected: profile.profileId === defaultProfileId,
    baseUrl: profile.baseUrl,
    publicBaseUrl: profile.publicBaseUrl,
    openClawAgentId: profile.openClawAgentId,
    loginUrl: profile.loginUrl,
    apiKeyConfigured: typeof profile.apiKey === "string" && profile.apiKey.trim().length > 0,
    gatewayTokenConfigured:
      typeof profile.gatewayToken === "string" && profile.gatewayToken.trim().length > 0,
    editMode: profile.builtin ? "readonly" : "custom"
  })) satisfies RuntimeModelProfileView[];
}

export function resolveDefaultRuntimeModelProfileId(db: DatabaseSync, config: AppConfig) {
  const saved = getRuntimeSettings(db)?.defaultProfileId;
  if (saved?.trim()) {
    const candidate = saved.trim();
    if (candidate.startsWith("builtin:")) {
      return candidate;
    }
    if (getRuntimeModelProfile(db, candidate)) {
      return candidate;
    }
  }
  return config.runtime.mode === "bridge" ? "builtin:openclaw-reuse" : "builtin:embedded";
}

export function resolveRuntimeModelProfile(
  db: DatabaseSync,
  config: AppConfig,
  input: {
    tenantId?: string;
    agentId?: string;
  } = {}
) {
  const preference =
    input.tenantId && input.agentId ? getAgentRuntimePreference(db, input.tenantId, input.agentId) : null;
  const requestedProfileId =
    typeof preference?.profileId === "string" && preference.profileId.trim().length > 0
      ? preference.profileId.trim()
      : resolveDefaultRuntimeModelProfileId(db, config);
  const resolvedProfile = getResolvedRuntimeModelProfileById(db, config, requestedProfileId);
  const fallbackProfile = getResolvedRuntimeModelProfileById(db, config, "builtin:embedded");

  return {
    profile: resolvedProfile ?? fallbackProfile,
    preference
  };
}

export function getResolvedRuntimeModelProfileById(
  db: DatabaseSync,
  config: AppConfig,
  profileId: string
): ResolvedRuntimeModelProfile | null {
  const builtin = listBuiltinRuntimeModelProfiles(config).find((entry) => entry.profileId === profileId);
  if (builtin) {
    return builtin;
  }
  const custom = getRuntimeModelProfile(db, profileId);
  return custom ? mapCustomProfile(custom) : null;
}

function listBuiltinRuntimeModelProfiles(config: AppConfig): ResolvedRuntimeModelProfile[] {
  const openClawBaseUrl = config.openClaw.baseUrl.trim();
  const openClawPublicBaseUrl = config.openClaw.publicBaseUrl.trim();
  const openClawAgentId = config.openClaw.agentId.trim() || "mail";
  const gatewayToken = config.openClaw.gatewayToken.trim();

  return [
    {
      profileId: "builtin:embedded",
      label: "Embedded deterministic adapter",
      sourceKind: "embedded",
      model: "embedded-deterministic",
      builtin: true,
      enabled: true
    },
    {
      profileId: "builtin:openclaw-reuse",
      label: "Reuse OpenClaw runtime",
      sourceKind: "openclaw_reuse",
      model: `openclaw:${openClawAgentId}`,
      baseUrl: openClawBaseUrl || undefined,
      publicBaseUrl: openClawPublicBaseUrl || undefined,
      openClawAgentId,
      loginUrl: buildDefaultOpenClawLoginUrl(openClawPublicBaseUrl || openClawBaseUrl),
      gatewayToken: gatewayToken || undefined,
      builtin: true,
      enabled: openClawBaseUrl.length > 0
    }
  ];
}

function mapCustomProfile(profile: RuntimeModelProfileRecord): ResolvedRuntimeModelProfile {
  return {
    profileId: profile.profileId,
    label: profile.label,
    sourceKind: profile.sourceKind,
    model: profile.model,
    baseUrl: profile.baseUrl,
    publicBaseUrl: profile.publicBaseUrl,
    openClawAgentId: profile.openClawAgentId,
    loginUrl: profile.loginUrl,
    gatewayToken: profile.gatewayToken,
    apiKey: profile.apiKey,
    builtin: false,
    enabled: profile.enabled
  };
}

function buildDefaultOpenClawLoginUrl(baseUrl: string | undefined) {
  if (!baseUrl) {
    return undefined;
  }
  try {
    return new URL("/login", baseUrl).toString();
  } catch {
    return undefined;
  }
}
