import readline from "node:readline/promises";
import { Writable } from "node:stream";
import process from "node:process";

import { resolveConnectProviderByEmailAddress, resolveConnectProviderGuide } from "../auth/oauth-providers.js";
import type { MailAccountRecord } from "../storage/repositories/mail-accounts.js";

export interface MailctlPrompter {
  ask(prompt: string, options?: { defaultValue?: string; secret?: boolean }): Promise<string>;
  close(): void;
}

export function createTerminalPrompter(
  input: NodeJS.ReadStream = process.stdin,
  output: NodeJS.WriteStream = process.stdout
): MailctlPrompter {
  const useTerminalMode = Boolean(input.isTTY && output.isTTY);
  let muted = false;
  const rl = readline.createInterface({
    input,
    ...(useTerminalMode ? { output: createPromptMirror(output, () => muted), terminal: true } : { terminal: false })
  });
  const lineIterator = !useTerminalMode ? rl[Symbol.asyncIterator]() : null;

  return {
    async ask(prompt, options) {
      const suffix =
        typeof options?.defaultValue === "string" && options.defaultValue.length > 0
          ? ` [${options.defaultValue}]`
          : "";
      output.write(`${prompt}${suffix}: `);
      muted = options?.secret === true;
      try {
        const answer = useTerminalMode
          ? await rl.question("")
          : await readNextPromptLine(lineIterator);
        const trimmed = answer.trim();
        return trimmed.length > 0 ? trimmed : options?.defaultValue ?? "";
      } finally {
        if (muted) {
          output.write("\n");
        }
        muted = false;
      }
    },
    close() {
      rl.close();
    }
  };
}

function createPromptMirror(
  output: NodeJS.WriteStream,
  isMuted: () => boolean
) {
  const mirror = new Writable({
    write(chunk, encoding, callback) {
      if (!isMuted()) {
        output.write(chunk, encoding as BufferEncoding, callback);
        return;
      }

      const value = chunk.toString();
      if (value.includes("\n")) {
        output.write("\n");
      }
      callback();
    }
  });
  return mirror;
}

async function readNextPromptLine(
  iterator: AsyncIterator<string> | null
) {
  if (!iterator) {
    return "";
  }

  const result = await iterator.next();
  if (result.done) {
    throw new Error("input stream closed while waiting for login input");
  }

  return result.value;
}

export interface InteractiveMailboxLoginResult {
  account: Omit<MailAccountRecord, "createdAt" | "updatedAt">;
  warnings: string[];
}

export async function promptInteractiveMailboxLogin(
  prompter: MailctlPrompter,
  options: {
    accountId?: string;
    displayName?: string;
    emailAddress?: string;
    password?: string;
    providerPreset?: string;
  } = {}
): Promise<InteractiveMailboxLoginResult> {
  const warnings: string[] = [];
  const emailAddress = options.emailAddress?.trim() || (await askRequired(prompter, "Email address", options.emailAddress));
  const profile = detectMailboxProfile(emailAddress, options.providerPreset);
  warnings.push(...buildMailboxLoginWarnings(profile));

  const password = await askRequired(
    prompter,
    profile?.credentialLabel ?? "Mailbox password / app password / authorization code",
    options.password,
    true
  );
  const accountId = await askRequired(
    prompter,
    "Account ID",
    options.accountId ?? createDefaultAccountId(emailAddress)
  );
  const displayName = await prompter.ask("Display name", {
    defaultValue: options.displayName ?? inferDisplayName(emailAddress)
  });
  const imapHost = await askRequired(prompter, "IMAP host", profile?.imapHost);
  const imapPort = parsePositiveInteger(await askRequired(prompter, "IMAP port", String(profile?.imapPort ?? 993)));
  const imapSecure = parseBooleanChoice(
    await askRequired(prompter, "IMAP secure (yes/no)", yesNo(profile?.imapSecure ?? true))
  );
  const imapMailbox = await askRequired(prompter, "IMAP mailbox", profile?.imapMailbox ?? "INBOX");
  const smtpHost = await askRequired(prompter, "SMTP host", profile?.smtpHost);
  const smtpPort = parsePositiveInteger(await askRequired(prompter, "SMTP port", String(profile?.smtpPort ?? 587)));
  const smtpSecure = parseBooleanChoice(
    await askRequired(prompter, "SMTP secure (yes/no)", yesNo(profile?.smtpSecure ?? false))
  );
  const smtpFrom = await askRequired(prompter, "SMTP from address", emailAddress);

  return {
    warnings,
    account: {
      accountId,
      provider: "imap",
      emailAddress,
      displayName: displayName || undefined,
      status: "active",
      settings: {
        imap: {
          host: imapHost,
          port: imapPort,
          secure: imapSecure,
          username: emailAddress,
          password,
          mailbox: imapMailbox
        },
        smtp: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          username: emailAddress,
          password,
          from: smtpFrom
        }
      }
    }
  };
}

interface MailboxProfile {
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  imapMailbox?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  credentialLabel?: string;
  credentialHint?: string;
  setupUrl?: string;
  loginUrl?: string;
  steps?: string[];
  warning?: string;
}

export function resolveMailboxProfilePreset(providerPreset?: string): MailboxProfile | null {
  const guide = resolveConnectProviderGuide(providerPreset);
  if (!guide?.preset) {
    return null;
  }

  return {
    imapHost: guide.preset.imapHost,
    imapPort: guide.preset.imapPort,
    imapSecure: guide.preset.imapSecure,
    imapMailbox: guide.preset.imapMailbox,
    smtpHost: guide.preset.smtpHost,
    smtpPort: guide.preset.smtpPort,
    smtpSecure: guide.preset.smtpSecure,
    credentialLabel: guide.login?.credentialLabel,
    credentialHint: guide.login?.credentialHint,
    setupUrl: guide.login?.setupUrl,
    loginUrl: guide.web?.loginUrl,
    steps: guide.login?.steps,
    warning: guide.login?.credentialHint
  };
}

function detectMailboxProfile(emailAddress: string, providerPreset?: string): MailboxProfile | null {
  const preset = resolveMailboxProfilePreset(providerPreset);
  if (preset) {
    return preset;
  }

  return resolveMailboxProfilePreset(resolveConnectProviderByEmailAddress(emailAddress)?.id);
}

function buildMailboxLoginWarnings(profile: MailboxProfile | null) {
  if (!profile) {
    return [];
  }

  const warnings: string[] = [];
  if (profile.warning) {
    warnings.push(profile.warning);
  }
  if (profile.loginUrl) {
    warnings.push(`Provider login page: ${profile.loginUrl}`);
  }
  if (profile.setupUrl) {
    warnings.push(`Credential setup page: ${profile.setupUrl}`);
  }
  if (profile.steps && profile.steps.length > 0) {
    warnings.push(...profile.steps.map((step, index) => `Login step ${index + 1}: ${step}`));
  }
  return warnings;
}

async function askRequired(
  prompter: MailctlPrompter,
  prompt: string,
  defaultValue?: string,
  secret = false
): Promise<string> {
  while (true) {
    const value = await prompter.ask(prompt, {
      defaultValue,
      secret
    });
    if (value.trim().length > 0) {
      return value.trim();
    }
  }
}

function createDefaultAccountId(emailAddress: string) {
  return `acct-${emailAddress
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)}`;
}

function inferDisplayName(emailAddress: string) {
  const local = emailAddress.split("@")[0] ?? "";
  return local.trim();
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`expected a positive integer, received: ${value}`);
  }
  return parsed;
}

function parseBooleanChoice(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["y", "yes", "true", "1"].includes(normalized)) {
    return true;
  }
  if (["n", "no", "false", "0"].includes(normalized)) {
    return false;
  }
  throw new Error(`expected yes or no, received: ${value}`);
}

function yesNo(value: boolean) {
  return value ? "yes" : "no";
}
