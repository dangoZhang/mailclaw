function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function splitEmail(value: string) {
  const normalized = normalizeEmail(value);
  const [local = "", domain = ""] = normalized.split("@");
  return {
    local,
    domain
  };
}

export function buildAgentRoutingTag(agentId: string) {
  const normalized = normalizeEmail(agentId);
  const seed = normalized.includes("@") ? splitEmail(normalized).local : normalized;

  return seed
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildAgentVirtualAddress(mailboxAddress: string, agentId: string) {
  const normalizedMailbox = normalizeEmail(mailboxAddress);
  const normalizedAgent = normalizeEmail(agentId);
  if (!normalizedMailbox.includes("@")) {
    return null;
  }

  if (normalizedAgent.includes("@")) {
    return normalizedAgent;
  }

  const tag = buildAgentRoutingTag(agentId);
  if (!tag) {
    return null;
  }

  const { local, domain } = splitEmail(normalizedMailbox);
  if (!local || !domain) {
    return null;
  }

  return `${local}+${tag}@${domain}`;
}

export function buildAgentSubjectRoutingHint(agentId: string) {
  const tag = buildAgentRoutingTag(agentId);
  return tag ? `[agent:${tag}]` : null;
}
