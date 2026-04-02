import readline from "node:readline/promises";
import { Writable } from "node:stream";
import process from "node:process";

import {
  detectMailboxProfile,
  discoverMailboxProfile,
  type MailboxProfile
} from "../auth/mailbox-autoconfig.js";
import type { MailAccountRecord } from "../storage/repositories/mail-accounts.js";

export interface MailctlPrompter {
  ask(prompt: string, options?: { defaultValue?: string; secret?: boolean }): Promise<string>;
  close(): void;
}

export function createTerminalPrompter(
  input: NodeJS.ReadStream = process.stdin,
  output: NodeJS.WriteStream = process.stdout
): MailctlPrompter {
  let muted = false;
  const mirror = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) {
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
  const rl = readline.createInterface({
    input,
    output: mirror,
    terminal: Boolean(input.isTTY && output.isTTY)
  });

  return {
    async ask(prompt, options) {
      if (isInputClosed(input)) {
        throw new Error("input stream closed while waiting for login input");
      }
      const suffix =
        typeof options?.defaultValue === "string" && options.defaultValue.length > 0
          ? ` [${options.defaultValue}]`
          : "";
      output.write(`${prompt}${suffix}: `);
      muted = options?.secret === true;
      try {
        const answer = await readAnswer(rl, input);
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
    profileResolver?: (input: {
      emailAddress: string;
      providerPreset?: string;
    }) => Promise<MailboxProfile | null>;
  } = {}
): Promise<InteractiveMailboxLoginResult> {
  const warnings: string[] = [];
  const emailAddress = await askRequired(prompter, "Email address", options.emailAddress);
  const profileResolver = options.profileResolver ?? discoverMailboxProfile;
  const profile =
    (await profileResolver({
      emailAddress,
      providerPreset: options.providerPreset
    })) ?? detectMailboxProfile(emailAddress, options.providerPreset);
  if (profile?.warning) {
    warnings.push(profile.warning);
  }

  const password = await askRequired(prompter, "Password or app password", options.password, true);
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
          username: profile?.imapUsername ?? emailAddress,
          password,
          mailbox: imapMailbox
        },
        smtp: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          username: profile?.smtpUsername ?? emailAddress,
          password,
          from: smtpFrom
        }
      }
    }
  };
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

function isInputClosed(input: NodeJS.ReadStream) {
  return Boolean(
    (input as NodeJS.ReadStream & { readableEnded?: boolean }).readableEnded ||
      (input as NodeJS.ReadStream & { destroyed?: boolean }).destroyed
  );
}

function readAnswer(
  rl: readline.Interface,
  input: NodeJS.ReadStream
) {
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const finishResolve = (value: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };
    const finishReject = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };
    const handleClosed = () => {
      finishReject(new Error("input stream closed while waiting for login input"));
    };
    const cleanup = () => {
      input.off("end", handleClosed);
      input.off("close", handleClosed);
      input.off("error", handleClosed);
    };

    input.once("end", handleClosed);
    input.once("close", handleClosed);
    input.once("error", handleClosed);
    rl.question("")
      .then((answer) => finishResolve(answer))
      .catch((error) => finishReject(error));
  });
}
