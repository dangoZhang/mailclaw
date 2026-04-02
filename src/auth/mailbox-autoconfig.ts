export interface MailboxProfile {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapMailbox?: string;
  imapUsername?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername?: string;
  warning?: string;
  source?: "preset" | "autoconfig_subdomain" | "autoconfig_well_known" | "ispdb";
  sourceUrl?: string;
}

const PASSWORD_LIKE_AUTHS = new Set([
  "password-cleartext",
  "plain",
  "password-encrypted",
  "secure",
  "client-ip-address",
  "gssapi"
]);

export async function discoverMailboxProfile(input: {
  emailAddress: string;
  providerPreset?: string;
  fetchImpl?: typeof fetch;
}) {
  const preset = detectMailboxProfile(input.emailAddress, input.providerPreset);
  if (preset) {
    return preset;
  }

  const emailAddress = input.emailAddress.trim();
  const domain = emailAddress.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) {
    return null;
  }

  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return null;
  }

  const candidates = [
    {
      source: "autoconfig_subdomain" as const,
      url: `https://autoconfig.${domain}/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(emailAddress)}`
    },
    {
      source: "autoconfig_well_known" as const,
      url: `https://${domain}/.well-known/autoconfig/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(emailAddress)}`
    },
    {
      source: "ispdb" as const,
      url: `https://autoconfig.thunderbird.net/v1.1/${encodeURIComponent(domain)}`
    }
  ];

  for (const candidate of candidates) {
    try {
      const response = await fetchImpl(candidate.url, {
        signal: AbortSignal.timeout(2500),
        headers: {
          accept: "application/xml, text/xml;q=0.9, */*;q=0.1"
        }
      });
      if (!response.ok) {
        continue;
      }
      const xml = await response.text();
      const profile = parseAutoconfigProfile(xml, emailAddress);
      if (!profile) {
        continue;
      }
      return {
        ...profile,
        source: candidate.source,
        sourceUrl: candidate.url
      };
    } catch {
      continue;
    }
  }

  return null;
}

export function resolveMailboxProfilePreset(providerPreset?: string): MailboxProfile | null {
  const normalized = providerPreset?.trim().toLowerCase();
  switch (normalized) {
    case "gmail":
    case "googlemail":
      return {
        imapHost: "imap.gmail.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.gmail.com",
        smtpPort: 465,
        smtpSecure: true,
        warning:
          "Gmail password login usually needs an app password. If you want browser OAuth instead, use `mailctl connect login gmail <accountId>`.",
        source: "preset"
      };
    case "qq":
      return {
        imapHost: "imap.qq.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.qq.com",
        smtpPort: 465,
        smtpSecure: true,
        warning: "QQ Mail typically requires an authorization code instead of the web password.",
        source: "preset"
      };
    case "outlook":
    case "microsoft":
    case "office365":
    case "hotmail":
    case "live":
    case "msn":
      return {
        imapHost: "outlook.office365.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.office365.com",
        smtpPort: 587,
        smtpSecure: false,
        warning:
          "Outlook and Microsoft 365 support browser OAuth. If you want OAuth instead of IMAP/SMTP credentials, use `mailctl connect login outlook <accountId>`.",
        source: "preset"
      };
    case "icloud":
    case "me":
    case "mac":
      return {
        imapHost: "imap.mail.me.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.mail.me.com",
        smtpPort: 587,
        smtpSecure: false,
        warning: "iCloud usually needs an app-specific password.",
        source: "preset"
      };
    case "yahoo":
      return {
        imapHost: "imap.mail.yahoo.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.mail.yahoo.com",
        smtpPort: 465,
        smtpSecure: true,
        warning: "Yahoo Mail commonly uses an app password for IMAP/SMTP access.",
        source: "preset"
      };
    case "163":
      return {
        imapHost: "imap.163.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.163.com",
        smtpPort: 465,
        smtpSecure: true,
        warning: "163 Mail typically requires a provider authorization code instead of the web password.",
        source: "preset"
      };
    case "126":
      return {
        imapHost: "imap.126.com",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        smtpHost: "smtp.126.com",
        smtpPort: 465,
        smtpSecure: true,
        warning: "126 Mail typically requires a provider authorization code instead of the web password.",
        source: "preset"
      };
    default:
      return null;
  }
}

export function detectMailboxProfile(emailAddress: string, providerPreset?: string): MailboxProfile | null {
  const preset = resolveMailboxProfilePreset(providerPreset);
  if (preset) {
    return preset;
  }

  const domain = emailAddress.split("@")[1]?.toLowerCase() ?? "";
  switch (domain) {
    case "gmail.com":
    case "googlemail.com":
      return resolveMailboxProfilePreset("gmail");
    case "qq.com":
      return resolveMailboxProfilePreset("qq");
    case "outlook.com":
    case "hotmail.com":
    case "live.com":
    case "msn.com":
      return resolveMailboxProfilePreset("outlook");
    case "icloud.com":
    case "me.com":
    case "mac.com":
      return resolveMailboxProfilePreset("icloud");
    case "yahoo.com":
      return resolveMailboxProfilePreset("yahoo");
    case "163.com":
      return resolveMailboxProfilePreset("163");
    case "126.com":
      return resolveMailboxProfilePreset("126");
    default:
      return null;
  }
}

function parseAutoconfigProfile(xml: string, emailAddress: string): MailboxProfile | null {
  const imapBlock = extractServerBlock(xml, "incomingServer", "imap");
  const smtpBlock = extractServerBlock(xml, "outgoingServer", "smtp");
  if (!imapBlock || !smtpBlock) {
    return null;
  }

  const imapHost = readTag(imapBlock, "hostname");
  const imapPort = parsePort(readTag(imapBlock, "port"));
  const smtpHost = readTag(smtpBlock, "hostname");
  const smtpPort = parsePort(readTag(smtpBlock, "port"));
  if (!imapHost || !imapPort || !smtpHost || !smtpPort) {
    return null;
  }

  const imapAuth = readRepeatedTags(imapBlock, "authentication");
  const smtpAuth = readRepeatedTags(smtpBlock, "authentication");
  const warningParts: string[] = [];
  if (imapAuth.length > 0 && !imapAuth.some((value) => PASSWORD_LIKE_AUTHS.has(value))) {
    warningParts.push(`IMAP auth modes advertised: ${imapAuth.join(", ")}`);
  }
  if (smtpAuth.length > 0 && !smtpAuth.some((value) => PASSWORD_LIKE_AUTHS.has(value))) {
    warningParts.push(`SMTP auth modes advertised: ${smtpAuth.join(", ")}`);
  }

  return {
    imapHost,
    imapPort,
    imapSecure: parseSocketType(readTag(imapBlock, "socketType")),
    imapMailbox: "INBOX",
    imapUsername: resolveUsernameTemplate(readTag(imapBlock, "username"), emailAddress),
    smtpHost,
    smtpPort,
    smtpSecure: parseSocketType(readTag(smtpBlock, "socketType")),
    smtpUsername: resolveUsernameTemplate(readTag(smtpBlock, "username"), emailAddress),
    ...(warningParts.length > 0 ? { warning: `Autoconfig found settings, but password login may not work everywhere. ${warningParts.join(" | ")}` } : {})
  };
}

function extractServerBlock(xml: string, tagName: string, serverType: string) {
  const pattern = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
    "gi"
  );
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(xml))) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    const typeMatch = attrs.match(/\btype\s*=\s*"([^"]+)"/i);
    if ((typeMatch?.[1] ?? "").toLowerCase() === serverType) {
      return body;
    }
  }
  return null;
}

function readTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1] ? decodeXml(match[1].trim()) : "";
}

function readRepeatedTags(xml: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const values: string[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(xml))) {
    const value = decodeXml((match[1] ?? "").trim()).toLowerCase();
    if (value) {
      values.push(value);
    }
  }
  return values;
}

function parsePort(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function parseSocketType(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === "ssl" || normalized === "ssl/tls";
}

function resolveUsernameTemplate(template: string, emailAddress: string) {
  if (!template) {
    return emailAddress;
  }
  const [localPart = "", domain = ""] = emailAddress.split("@");
  return template
    .replace(/%EMAILADDRESS%/gi, emailAddress)
    .replace(/%EMAILLOCALPART%/gi, localPart)
    .replace(/%EMAILDOMAIN%/gi, domain);
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
