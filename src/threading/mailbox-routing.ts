import { buildAgentRoutingTag, buildAgentSubjectRoutingHint, buildAgentVirtualAddress } from "../agents/addressing.js";
import type { WorkerRole } from "../core/types.js";
import type { NormalizedMailEnvelope } from "../providers/types.js";
import type { MailAccountRecord } from "../storage/repositories/mail-accounts.js";

const ROLE_ALIAS_ENTRIES = [
  ["attachment", "mail-attachment-reader"],
  ["attachment-reader", "mail-attachment-reader"],
  ["research", "mail-researcher"],
  ["researcher", "mail-researcher"],
  ["draft", "mail-drafter"],
  ["drafter", "mail-drafter"],
  ["review", "mail-reviewer"],
  ["reviewer", "mail-reviewer"],
  ["guard", "mail-guard"],
  ["orchestrator", "mail-orchestrator"]
] as const satisfies ReadonlyArray<readonly [string, WorkerRole]>;

const DEFAULT_ROLE_ALIAS_MAP = new Map<string, WorkerRole>(ROLE_ALIAS_ENTRIES);

export interface MailboxRoute {
  canonicalMailboxAddress: string;
  frontAgentAddress: string;
  frontAgentId?: string;
  matchedAddress: string;
  publicAgentAddresses: string[];
  publicAgentIds: string[];
  collaboratorAgentAddresses: string[];
  collaboratorAgentIds: string[];
  summonedRoles: WorkerRole[];
  internalAliasAddresses: string[];
}

export interface AgentRoutingTarget {
  ingressAddresses: string[];
  subjectRoutingHint: string;
}

export function resolveMailboxRoute(input: {
  account?: MailAccountRecord | null;
  fallbackMailboxAddress: string;
  envelope: NormalizedMailEnvelope;
}): MailboxRoute {
  const routing = parseRoutingSettings(input.account);
  const defaultMailboxAddress = firstNonEmpty(
    routing.defaultMailboxAddress,
    normalizeAddress(input.account?.emailAddress),
    normalizeAddress(input.fallbackMailboxAddress)
  );
  const { candidates, explicitCandidates } = collectRouteCandidates(input.envelope, defaultMailboxAddress);
  const knownAgentIds = collectKnownAgentIds(routing);
  const publicAliases = buildPublicAliases(routing, defaultMailboxAddress);
  const publicAgentAddresses: string[] = [];
  const collaboratorAgentAddresses: string[] = [];
  const internalAliasAddresses = new Set<string>();
  const summonedRoles = new Set<WorkerRole>();
  const matchedAgentIds: string[] = [];
  let hasExplicitNonDefaultAgentRoute = false;

  let matchedAddress = defaultMailboxAddress;
  let canonicalMailboxAddress = defaultMailboxAddress;
  let frontAgentAddress = defaultMailboxAddress;
  let frontRouteResolved = false;

  for (const candidate of candidates) {
    const exactRole = routing.roleAliases.get(candidate);
    if (exactRole) {
      internalAliasAddresses.add(candidate);
      summonedRoles.add(exactRole);
      if (matchedAddress === defaultMailboxAddress) {
        matchedAddress = candidate;
      }
      continue;
    }

    const matchedAgentId = resolveAddressAgentId(candidate, defaultMailboxAddress, routing, publicAliases, knownAgentIds);
    if (matchedAgentId) {
      const plusAgentAlias = isPlusAgentAlias(candidate, defaultMailboxAddress, knownAgentIds);
      addUniqueToken(matchedAgentIds, matchedAgentId);
      if (explicitCandidates.has(candidate) && candidate !== defaultMailboxAddress) {
        addUniqueAddress(publicAgentAddresses, candidate);
        if (!frontRouteResolved) {
          matchedAddress = candidate;
          canonicalMailboxAddress = plusAgentAlias ? defaultMailboxAddress : candidate;
          frontAgentAddress = plusAgentAlias ? defaultMailboxAddress : candidate;
          frontRouteResolved = true;
        } else if (candidate !== canonicalMailboxAddress) {
          addUniqueAddress(collaboratorAgentAddresses, candidate);
        }
        hasExplicitNonDefaultAgentRoute = true;
      }
      continue;
    }

    const plusRole = resolvePlusRoleAlias(candidate, publicAliases, routing.plusRoleAliases);
    if (plusRole) {
      internalAliasAddresses.add(candidate);
      summonedRoles.add(plusRole);
      if (matchedAddress === defaultMailboxAddress) {
        matchedAddress = candidate;
      }
      continue;
    }

    if (publicAliases.has(candidate)) {
      addUniqueAddress(publicAgentAddresses, candidate);
      if (!frontRouteResolved) {
        matchedAddress = candidate;
        canonicalMailboxAddress = candidate;
        frontAgentAddress = candidate;
        frontRouteResolved = true;
      } else if (candidate !== canonicalMailboxAddress) {
        if (explicitCandidates.has(candidate) && candidate !== defaultMailboxAddress) {
          addUniqueAddress(collaboratorAgentAddresses, candidate);
        }
      }
      continue;
    }
  }

  const subjectAgentId = resolveSubjectAgentId(input.envelope.subject, knownAgentIds);
  let frontAgentId = matchedAgentIds[0] ?? routing.frontAgentId;
  if (subjectAgentId && (!frontAgentId || !hasExplicitNonDefaultAgentRoute)) {
    frontAgentId = subjectAgentId;
  }
  const collaboratorAgentIds = uniqueTokens([
    ...routing.collaboratorAgentIds,
    ...matchedAgentIds.filter((agentId) => agentId !== frontAgentId)
  ]);
  const publicAgentIds = uniqueTokens([
    ...(frontAgentId ? [frontAgentId] : []),
    ...routing.publicAgentIds,
    ...matchedAgentIds,
    ...collaboratorAgentIds
  ]);

  return {
    canonicalMailboxAddress,
    frontAgentAddress,
    ...(frontAgentId ? { frontAgentId } : {}),
    matchedAddress,
    publicAgentAddresses,
    publicAgentIds,
    collaboratorAgentAddresses,
    collaboratorAgentIds,
    summonedRoles: [...summonedRoles],
    internalAliasAddresses: [...internalAliasAddresses]
  };
}

export function describeAgentRoutingTarget(input: {
  account?: MailAccountRecord | null;
  fallbackMailboxAddress: string;
  agentId: string;
}): AgentRoutingTarget {
  const routing = parseRoutingSettings(input.account);
  const defaultMailboxAddress = firstNonEmpty(
    routing.defaultMailboxAddress,
    normalizeAddress(input.account?.emailAddress),
    normalizeAddress(input.fallbackMailboxAddress)
  );
  const publicAliases = buildPublicAliases(routing, defaultMailboxAddress);
  const normalizedAgentId = normalizeToken(input.agentId);
  const knownAgentIds = collectKnownAgentIds(routing);
  const ingressAddresses = uniqueAddresses([
    ...Array.from(publicAliases).filter(
      (address) =>
        address !== defaultMailboxAddress &&
        resolveAddressAgentId(address, defaultMailboxAddress, routing, publicAliases, knownAgentIds) === normalizedAgentId
    ),
    buildPlusAgentAddress(defaultMailboxAddress, normalizedAgentId),
    routing.frontAgentId === normalizedAgentId ? defaultMailboxAddress : ""
  ]);

  return {
    ingressAddresses,
    subjectRoutingHint: buildSubjectRoutingHint(normalizedAgentId)
  };
}

export function filterInternalAliasRecipients(
  recipients: string[],
  canonicalMailboxAddress: string,
  extraInternalAliasAddresses: string[] = []
) {
  const mailboxDomain = getDomain(canonicalMailboxAddress);
  const extra = new Set(extraInternalAliasAddresses.map((value) => normalizeAddress(value)).filter(Boolean));

  return recipients.filter((recipient) => {
    const normalized = normalizeAddress(recipient);
    if (!normalized) {
      return false;
    }

    if (normalized === normalizeAddress(canonicalMailboxAddress)) {
      return false;
    }

    if (extra.has(normalized)) {
      return false;
    }

    if (!mailboxDomain || getDomain(normalized) !== mailboxDomain) {
      return true;
    }

    return !matchesDefaultRoleAlias(normalized);
  });
}

function collectRouteCandidates(envelope: NormalizedMailEnvelope, fallbackMailboxAddress: string) {
  const explicitCandidates = uniqueAddresses([
    ...envelope.envelopeRecipients,
    readAddressHeader(envelope.headers, "delivered-to"),
    readAddressHeader(envelope.headers, "x-original-to"),
    ...envelope.to.map((entry) => entry.email),
    ...envelope.cc.map((entry) => entry.email)
  ]);

  const candidates = [
    ...explicitCandidates,
    fallbackMailboxAddress
  ];

  return {
    candidates: uniqueAddresses(candidates),
    explicitCandidates: new Set(explicitCandidates)
  };
}

function buildPublicAliases(
  routing: ParsedRoutingSettings,
  defaultMailboxAddress: string
) {
  const values = [
    defaultMailboxAddress,
    ...routing.publicAliases
  ];

  return new Set(values.map((value) => normalizeAddress(value)).filter(Boolean));
}

function collectKnownAgentIds(routing: ParsedRoutingSettings) {
  return new Set(
    [routing.frontAgentId, ...routing.publicAgentIds, ...routing.collaboratorAgentIds]
      .map((value) => normalizeToken(value))
      .filter(Boolean)
  );
}

function resolveAddressAgentId(
  address: string,
  defaultMailboxAddress: string,
  routing: ParsedRoutingSettings,
  publicAliases: Set<string>,
  knownAgentIds: Set<string>
) {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return "";
  }

  if (routing.agentAddressAliases.has(normalizedAddress)) {
    return routing.agentAddressAliases.get(normalizedAddress) ?? "";
  }

  const parsed = splitAddress(normalizedAddress);
  const defaultParsed = splitAddress(defaultMailboxAddress);

  if (
    parsed.plusTag &&
    parsed.domain === defaultParsed.domain &&
    parsed.local === defaultParsed.local &&
    findAgentIdByRoutingTag(parsed.plusTag, knownAgentIds)
  ) {
    return findAgentIdByRoutingTag(parsed.plusTag, knownAgentIds);
  }

  if (
    publicAliases.has(normalizedAddress) &&
    parsed.domain === defaultParsed.domain &&
    findAgentIdByRoutingTag(parsed.local, knownAgentIds)
  ) {
    return findAgentIdByRoutingTag(parsed.local, knownAgentIds);
  }

  if (normalizedAddress === defaultMailboxAddress) {
    return routing.frontAgentId;
  }

  return "";
}

function isPlusAgentAlias(address: string, defaultMailboxAddress: string, knownAgentIds: Set<string>) {
  const parsed = splitAddress(address);
  const defaultParsed = splitAddress(defaultMailboxAddress);
  return (
    parsed.plusTag.length > 0 &&
    parsed.domain === defaultParsed.domain &&
    parsed.local === defaultParsed.local &&
    Boolean(findAgentIdByRoutingTag(parsed.plusTag, knownAgentIds))
  );
}

function resolvePlusRoleAlias(
  address: string,
  publicAliases: Set<string>,
  plusRoleAliases: Map<string, WorkerRole>
) {
  const parsed = splitAddress(address);
  if (!parsed.plusTag) {
    return null;
  }

  const baseAddress = `${parsed.local}@${parsed.domain}`;
  if (!publicAliases.has(baseAddress)) {
    return null;
  }

  return plusRoleAliases.get(parsed.plusTag) ?? null;
}

function matchesDefaultRoleAlias(address: string) {
  const parsed = splitAddress(address);
  if (!parsed.domain) {
    return false;
  }

  return (
    DEFAULT_ROLE_ALIAS_MAP.has(parsed.local) ||
    (parsed.plusTag ? DEFAULT_ROLE_ALIAS_MAP.has(parsed.plusTag) : false)
  );
}

function resolveSubjectAgentId(subject: string, knownAgentIds: Set<string>) {
  const normalizedSubject = subject.trim();
  if (!normalizedSubject) {
    return "";
  }

  const patterns = [
    /\[agent:([a-z0-9._-]+)\]/gi,
    /\[to:([a-z0-9._-]+)\]/gi,
    /\bagent:([a-z0-9._-]+)\b/gi,
    /\bto:([a-z0-9._-]+)\b/gi,
    /\[([a-z0-9._-]+)\]/gi
  ];

  for (const pattern of patterns) {
    for (const match of normalizedSubject.matchAll(pattern)) {
      const candidate = normalizeToken(match[1]);
      const matchedAgentId = findAgentIdByRoutingTag(candidate, knownAgentIds);
      if (matchedAgentId) {
        return matchedAgentId;
      }
    }
  }

  return "";
}

function parseRoutingSettings(account?: MailAccountRecord | null): ParsedRoutingSettings {
  const settings = (account?.settings ?? {}) as Record<string, unknown>;
  const routing =
    typeof settings.routing === "object" && settings.routing !== null
      ? (settings.routing as Record<string, unknown>)
      : {};
  const agentRouting =
    typeof settings.agentRouting === "object" && settings.agentRouting !== null
      ? (settings.agentRouting as Record<string, unknown>)
      : {};
  const aliases =
    typeof settings.aliases === "object" && settings.aliases !== null
      ? (settings.aliases as Record<string, unknown>)
      : {};

  const defaultMailboxAddress = firstNonEmpty(
    readString(routing.canonicalAlias),
    readString(aliases.canonicalAlias)
  );
  const publicAliases = uniqueAddresses([
    ...readStringArray(routing.publicAliases),
    ...readStringArray(aliases.publicAliases),
    ...readStringArray(aliases.exactAliases)
  ]);
  const agentAddressAliases = new Map<string, string>();

  const roleAliases = new Map<string, WorkerRole>();
  const plusRoleAliases = new Map<string, WorkerRole>(DEFAULT_ROLE_ALIAS_MAP);

  for (const [alias, role] of readRoleMap(routing.roleAliases)) {
    roleAliases.set(alias, role);
  }
  for (const [alias, role] of readRoleMap(aliases.roleAliases)) {
    roleAliases.set(alias, role);
  }
  for (const [tag, role] of readRoleMap(routing.plusRoleAliases, true)) {
    plusRoleAliases.set(tag, role);
  }
  for (const [tag, role] of readRoleMap(aliases.plusRoleAliases, true)) {
    plusRoleAliases.set(tag, role);
  }
  for (const [alias, agentId] of readAgentMap(agentRouting.addressAliases)) {
    agentAddressAliases.set(alias, agentId);
  }
  for (const [alias, agentId] of readAgentMap(agentRouting.agentAddressAliases)) {
    agentAddressAliases.set(alias, agentId);
  }

  return {
    defaultMailboxAddress,
    publicAliases,
    frontAgentId: firstNonEmpty(
      readToken(agentRouting.frontAgentId),
      readToken(agentRouting.defaultFrontAgentId)
    ),
    publicAgentIds: uniqueTokens([
      ...readTokenArray(agentRouting.durableAgentIds),
      ...readTokenArray(agentRouting.publicAgentIds),
      ...readTokenArray(agentRouting.agentIds),
      ...readTokenArray(agentRouting.collaboratorAgentIds)
    ]),
    collaboratorAgentIds: readTokenArray(agentRouting.collaboratorAgentIds),
    agentAddressAliases,
    roleAliases,
    plusRoleAliases
  };
}

function readAgentMap(value: unknown): Array<[string, string]> {
  if (typeof value !== "object" || value === null) {
    return [];
  }

  const entries: Array<[string, string]> = [];
  for (const [rawAlias, rawAgentId] of Object.entries(value)) {
    const alias = normalizeAddress(rawAlias);
    const agentId = normalizeToken(typeof rawAgentId === "string" ? rawAgentId : "");
    if (!alias || !agentId) {
      continue;
    }
    entries.push([alias, agentId]);
  }
  return entries;
}

function readRoleMap(
  value: unknown,
  normalizeKeyOnly = false
): Array<[string, WorkerRole]> {
  if (typeof value !== "object" || value === null) {
    return [];
  }

  const entries: Array<[string, WorkerRole]> = [];

  for (const [rawKey, rawRole] of Object.entries(value)) {
    if (typeof rawRole !== "string") {
      continue;
    }

    const role = normalizeWorkerRole(rawRole);
    if (!role) {
      continue;
    }

    const key = normalizeKeyOnly ? normalizeToken(rawKey) : normalizeAddress(rawKey);
    if (!key) {
      continue;
    }

    entries.push([key, role]);
  }

  return entries;
}

function normalizeWorkerRole(value: string): WorkerRole | null {
  const normalized = normalizeToken(value);

  for (const role of DEFAULT_ROLE_ALIAS_MAP.values()) {
    if (role === normalized) {
      return role;
    }
  }

  return DEFAULT_ROLE_ALIAS_MAP.get(normalized) ?? null;
}

function readString(value: unknown) {
  return typeof value === "string" ? normalizeAddress(value) : "";
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => (typeof entry === "string" ? entry : "")).map(normalizeAddress).filter(Boolean);
}

function readToken(value: unknown) {
  return typeof value === "string" ? normalizeToken(value) : "";
}

function readTokenArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => (typeof entry === "string" ? entry : "")).map(normalizeToken).filter(Boolean);
}

function readAddressHeader(headers: Array<{ name: string; value: string }>, name: string) {
  const header = headers.find((entry) => entry.name.toLowerCase() === name.toLowerCase())?.value;
  return extractEmailAddress(header);
}

function extractEmailAddress(value: string | undefined) {
  if (!value) {
    return "";
  }

  const match = value.match(/<([^>]+)>/);
  return normalizeAddress(match ? match[1] : value.split(/[,\s]/)[0] ?? "");
}

function splitAddress(address: string) {
  const normalized = normalizeAddress(address);
  const [localPart = "", domain = ""] = normalized.split("@");
  const [local, plusTag = ""] = localPart.split("+");

  return {
    local,
    plusTag: normalizeToken(plusTag),
    domain
  };
}

function buildPlusAgentAddress(address: string, agentId: string) {
  return buildAgentVirtualAddress(address, agentId) ?? "";
}

function buildSubjectRoutingHint(agentId: string) {
  return buildAgentSubjectRoutingHint(agentId) ?? "";
}

function findAgentIdByRoutingTag(tag: string, knownAgentIds: Set<string>) {
  const normalizedTag = normalizeToken(tag);
  if (!normalizedTag) {
    return "";
  }

  for (const agentId of knownAgentIds) {
    if (normalizeToken(agentId) === normalizedTag || buildAgentRoutingTag(agentId) === normalizedTag) {
      return agentId;
    }
  }

  return "";
}

function getDomain(address: string) {
  return splitAddress(address).domain;
}

function uniqueAddresses(values: string[]) {
  const seen = new Set<string>();
  const addresses: string[] = [];

  for (const value of values) {
    const normalized = normalizeAddress(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    addresses.push(normalized);
  }

  return addresses;
}

function uniqueTokens(values: string[]) {
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const value of values) {
    const normalized = normalizeToken(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    tokens.push(normalized);
  }

  return tokens;
}

function addUniqueAddress(target: string[], value: string) {
  const normalized = normalizeAddress(value);
  if (!normalized || target.includes(normalized)) {
    return;
  }

  target.push(normalized);
}

function addUniqueToken(target: string[], value: string) {
  const normalized = normalizeToken(value);
  if (!normalized || target.includes(normalized)) {
    return;
  }

  target.push(normalized);
}

function normalizeAddress(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeToken(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function firstNonEmpty(...values: string[]) {
  return values.find((value) => value.length > 0) ?? "";
}

interface ParsedRoutingSettings {
  defaultMailboxAddress: string;
  publicAliases: string[];
  frontAgentId: string;
  publicAgentIds: string[];
  collaboratorAgentIds: string[];
  agentAddressAliases: Map<string, string>;
  roleAliases: Map<string, WorkerRole>;
  plusRoleAliases: Map<string, WorkerRole>;
}
