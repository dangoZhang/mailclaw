import fs from "node:fs";
import { Writable } from "node:stream";

import { describe, expect, it } from "vitest";

import { createTerminalPrompter, promptInteractiveMailboxLogin } from "../src/cli/login-wizard.js";

describe("login wizard", () => {
  it("fails fast when stdin is closed in a non-interactive session", async () => {
    const input = fs.createReadStream("/dev/null");
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
    input.destroy();
  });
});
