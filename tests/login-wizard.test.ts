import { PassThrough } from "node:stream";
import { Writable } from "node:stream";

import { describe, expect, it } from "vitest";

import { createTerminalPrompter, promptInteractiveMailboxLogin } from "../src/cli/login-wizard.js";

describe("login wizard", () => {
  it("uses discovered mailbox defaults for custom domains", async () => {
    const answers = [
      "person@custom.example",
      "secret-1",
      "acct-custom",
      "Custom Person",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ];
    const prompter = {
      async ask(_prompt: string, options?: { defaultValue?: string }) {
        const answer = answers.shift();
        if (answer === undefined) {
          throw new Error("unexpected prompt");
        }
        return answer.length > 0 ? answer : options?.defaultValue ?? "";
      },
      close() {}
    };

    const result = await promptInteractiveMailboxLogin(prompter, {
      profileResolver: async () => ({
        imapHost: "imap.custom.example",
        imapPort: 993,
        imapSecure: true,
        imapMailbox: "INBOX",
        imapUsername: "person",
        smtpHost: "smtp.custom.example",
        smtpPort: 587,
        smtpSecure: false,
        smtpUsername: "person@custom.example",
        warning: "Autoconfig resolved custom.example through Thunderbird ISPDB."
      })
    });

    expect(result.warnings).toContain("Autoconfig resolved custom.example through Thunderbird ISPDB.");
    expect(result.account).toMatchObject({
      accountId: "acct-custom",
      emailAddress: "person@custom.example",
      settings: {
        imap: {
          host: "imap.custom.example",
          port: 993,
          secure: true,
          username: "person",
          mailbox: "INBOX"
        },
        smtp: {
          host: "smtp.custom.example",
          port: 587,
          secure: false,
          username: "person@custom.example",
          from: "person@custom.example"
        }
      }
    });
  });

  it("fails fast when stdin is closed in a non-interactive session", async () => {
    const input = new PassThrough();
    input.end();
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      }
    }) as unknown as NodeJS.WriteStream;
    const prompter = createTerminalPrompter(input, output);

    await expect(promptInteractiveMailboxLogin(prompter)).rejects.toThrow(
      /input stream closed while waiting for login input/
    );

    prompter.close();
  });
});
