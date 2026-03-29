import { describe, expect, it, vi } from "vitest";

import { runMailclaw } from "../src/cli/mailclaw-main.js";

function createWritableBuffer() {
  let buffer = "";
  return {
    stream: {
      write(chunk: string) {
        buffer += chunk;
      }
    },
    read() {
      return buffer;
    }
  };
}

describe("mailclaw user-facing cli", () => {
  it("delegates onboarding and login to mailctl", async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const delegated: string[][] = [];

    const exitCode = await runMailclaw(["onboard", "person@gmail.com"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      runMailctl: async (args) => {
        delegated.push(args);
        return 0;
      }
    });

    expect(exitCode).toBe(0);
    expect(delegated).toEqual([["connect", "start", "person@gmail.com"]]);
    expect(stdout.read()).toBe("");
    expect(stderr.read()).toBe("");

    const loginExitCode = await runMailclaw(["login", "qq"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      runMailctl: async (args) => {
        delegated.push(args);
        return 0;
      }
    });

    expect(loginExitCode).toBe(0);
    expect(delegated.at(-1)).toEqual(["connect", "login", "qq"]);
  });

  it("starts the server by default", async () => {
    const startServer = vi.fn(async () => undefined);

    const exitCode = await runMailclaw([], {
      startServer
    });

    expect(exitCode).toBe(0);
    expect(startServer).toHaveBeenCalledTimes(1);
  });

  it("opens the browser console shortcut", async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const openExternal = vi.fn(async () => undefined);

    const exitCode = await runMailclaw(["open"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      openExternal
    });

    expect(exitCode).toBe(0);
    expect(openExternal).toHaveBeenCalledTimes(1);
    expect(String(openExternal.mock.calls[0]?.[0])).toContain("/workbench/mail");
    expect(stdout.read()).toContain("/workbench/mail");
    expect(stderr.read()).toContain("Opening");
  });

  it("opens the dashboard alias", async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const openExternal = vi.fn(async () => undefined);

    const exitCode = await runMailclaw(["dashboard"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      openExternal
    });

    expect(exitCode).toBe(0);
    expect(openExternal).toHaveBeenCalledTimes(1);
    expect(String(openExternal.mock.calls[0]?.[0])).toContain("/workbench/mail");
    expect(String(openExternal.mock.calls[0]?.[0])).not.toContain("/workbench/mail/tab");
    expect(stdout.read()).toContain("/workbench/mail");
    expect(stderr.read()).toContain("Opening");
  });

  it("opens browser login for web-first auth flows", async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();
    const openExternal = vi.fn(async () => undefined);

    const exitCode = await runMailclaw(["login", "web"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      openExternal,
      runMailctl: async () => {
        throw new Error("should not delegate browser login to mailctl");
      }
    });

    expect(exitCode).toBe(0);
    expect(openExternal).toHaveBeenCalledTimes(1);
    expect(String(openExternal.mock.calls[0]?.[0])).toContain("/workbench/mail/login");
    expect(stdout.read()).toContain("/workbench/mail/login");
    expect(stderr.read()).toContain("Opening");
  });

  it("reports status from the local runtime probe", async () => {
    const stdout = createWritableBuffer();
    const stderr = createWritableBuffer();

    const exitCode = await runMailclaw(["status"], {
      stdout: stdout.stream,
      stderr: stderr.stream,
      fetchJson: async (url) => {
        if (String(url).endsWith("/healthz")) {
          return { status: "ok", service: "MailClaw", env: "test" };
        }
        return { status: "ok", service: "MailClaw" };
      }
    });

    expect(exitCode).toBe(0);
    expect(stdout.read()).toContain("MailClaw");
    expect(stdout.read()).toContain("dashboard:");
    expect(stderr.read()).toBe("");
  });

  it("prints doctor guidance when the runtime is unavailable", async () => {
    const stdout = createWritableBuffer();

    const exitCode = await runMailclaw(["doctor"], {
      stdout: stdout.stream,
      fetchJson: async () => {
        throw new Error("connect ECONNREFUSED 127.0.0.1:3000");
      }
    });

    expect(exitCode).toBe(1);
    expect(stdout.read()).toContain("MailClaw doctor");
    expect(stdout.read()).toContain("Start MailClaw with `mailclaw`");
  });
});
