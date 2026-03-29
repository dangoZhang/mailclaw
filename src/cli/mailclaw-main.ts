#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";

import { loadConfig } from "../config.js";
import { runMailctl } from "./mailctl-main.js";

export async function runMailclaw(
  args: string[],
  deps?: {
    stdout?: Pick<NodeJS.WriteStream, "write">;
    stderr?: Pick<NodeJS.WriteStream, "write">;
    runMailctl?: typeof runMailctl;
    startServer?: () => Promise<void> | void;
    openExternal?: (url: string) => Promise<void> | void;
    fetchJson?: (url: string) => Promise<unknown>;
  }
) {
  const stdout = deps?.stdout ?? process.stdout;
  const stderr = deps?.stderr ?? process.stderr;
  const [command, ...rest] = args;

  if (!command || command === "serve" || command === "server") {
    await (deps?.startServer ?? startServer)();
    return 0;
  }

  if (command === "--help" || command === "-h" || command === "help") {
    writeUsage(stdout);
    return 0;
  }

  if (command === "dashboard") {
    const url = resolveConsoleUrl(rest[0] || "/workbench/mail");
    stderr.write(`Opening ${url}\n`);
    await (deps?.openExternal ?? openExternalUrl)(url);
    stdout.write(`${url}\n`);
    return 0;
  }

  if (command === "open" || command === "console") {
    const url = resolveConsoleUrl(rest[0]);
    stderr.write(`Opening ${url}\n`);
    await (deps?.openExternal ?? openExternalUrl)(url);
    stdout.write(`${url}\n`);
    return 0;
  }

  if (command === "status" || command === "doctor") {
    return inspectLocalRuntime({
      command,
      stdout,
      stderr,
      fetchJson: deps?.fetchJson ?? fetchJson
    });
  }

  const delegatedArgs = mapUserFacingCommand(command, rest) ?? args;
  if (delegatedArgs.length === 1 && delegatedArgs[0] === "__open_connect__") {
    const url = resolveConsoleUrl("/workbench/mail/login");
    stderr.write(`Opening ${url}\n`);
    await (deps?.openExternal ?? openExternalUrl)(url);
    stdout.write(`${url}\n`);
    return 0;
  }

  return (deps?.runMailctl ?? runMailctl)(delegatedArgs, {
    stdout,
    stderr
  });
}

function mapUserFacingCommand(command: string, rest: string[]) {
  switch (command) {
    case "onboard":
      return ["connect", "start", ...rest];
    case "login":
      if (rest[0] === "web" || rest[0] === "browser") {
        return ["__open_connect__"];
      }
      return ["connect", "login", ...rest];
    case "providers":
      return ["connect", "providers", ...rest];
    case "accounts":
      return ["accounts", ...rest];
    case "rooms":
      return ["rooms", ...rest];
    case "inboxes":
      return ["observe", "inboxes", ...rest];
    case "workbench":
      return ["observe", "workbench", ...rest];
    case "replay":
      return ["replay", ...rest];
    default:
      return null;
  }
}

function resolveConsoleUrl(pathname?: string) {
  const config = loadConfig(process.env);
  const baseUrl =
    config.http.publicBaseUrl.trim() || `http://${config.http.host}:${String(config.http.port)}`;
  const normalizedPath = pathname
    ? pathname.startsWith("/")
      ? pathname
      : pathname === "mail" ||
          pathname === "login" ||
          pathname === "workbench/mail" ||
          pathname === "workbench/mail/tab" ||
          pathname.startsWith("mail/") ||
          pathname.startsWith("login/") ||
          pathname.startsWith("workbench/mail/")
        ? `/${pathname.replace(/^\/+/, "")}`
        : `/console/${pathname.replace(/^console\/?/, "")}`
    : "/workbench/mail";
  return new URL(normalizedPath, ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

async function startServer() {
  await import("../index.js");
}

async function inspectLocalRuntime(input: {
  command: "status" | "doctor";
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
  fetchJson: (url: string) => Promise<unknown>;
}) {
  const config = loadConfig(process.env);
  const baseUrl =
    config.http.publicBaseUrl.trim() || `http://${config.http.host}:${String(config.http.port)}`;
  const healthUrl = new URL("/healthz", ensureTrailingSlash(baseUrl)).toString();
  const readyUrl = new URL("/readyz", ensureTrailingSlash(baseUrl)).toString();
  const workbenchUrl = new URL("/workbench/mail", ensureTrailingSlash(baseUrl)).toString();

  try {
    const [health, ready] = await Promise.all([
      input.fetchJson(healthUrl) as Promise<{ status?: string; service?: string; env?: string }>,
      input.fetchJson(readyUrl) as Promise<{ status?: string; service?: string }>
    ]);

    if (input.command === "status") {
      input.stdout.write(
        [
          `MailClaw ${String(health.service ?? config.serviceName)}`,
          `status: ${String(health.status ?? "unknown")} / ready: ${String(ready.status ?? "unknown")}`,
          `dashboard: ${workbenchUrl}`
        ].join("\n") + "\n"
      );
      return ready.status === "ok" ? 0 : 1;
    }

    input.stdout.write(
      [
        "MailClaw doctor",
        `service: ${String(health.service ?? config.serviceName)}`,
        `environment: ${String(health.env ?? config.env)}`,
        `health: ${String(health.status ?? "unknown")}`,
        `ready: ${String(ready.status ?? "unknown")}`,
        `dashboard: ${workbenchUrl}`,
        "",
        "next:",
        "  1. Run `mailclaw` if the server is not ready.",
        "  2. Run `mailclaw onboard you@example.com` for the recommended path.",
        "  3. Run `mailclaw login` to connect one mailbox.",
        "  4. Run `mailclaw dashboard` to open the workbench."
      ].join("\n") + "\n"
    );
    return ready.status === "ok" ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (input.command === "status") {
      input.stderr.write(`MailClaw is not reachable at ${baseUrl}: ${message}\n`);
      return 1;
    }

    input.stdout.write(
      [
        "MailClaw doctor",
        `status: not reachable at ${baseUrl}`,
        `error: ${message}`,
        "",
        "next:",
        "  1. Start MailClaw with `mailclaw`.",
        "  2. Run `mailclaw onboard you@example.com` for the recommended path.",
        "  3. Connect a mailbox with `mailclaw login`.",
        "  4. Open the dashboard with `mailclaw dashboard`."
      ].join("\n") + "\n"
    );
    return 1;
  }
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function openExternalUrl(url: string) {
  const platform = process.platform;
  if (platform === "darwin") {
    await spawnAndWait("open", [url]);
    return;
  }

  if (platform === "win32") {
    await spawnAndWait("cmd", ["/c", "start", "", url]);
    return;
  }

  await spawnAndWait("xdg-open", [url]);
}

function spawnAndWait(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "ignore"
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
      }
    });
  });
}

function writeUsage(stream: Pick<NodeJS.WriteStream, "write">) {
  stream.write(
    [
      "usage: mailclaw [serve|onboard|login|dashboard|open|status|doctor|accounts|rooms|inboxes|workbench|replay] ...",
      "",
      "first run:",
      "  mailclaw",
      "  mailclaw onboard [you@example.com]",
      "  mailclaw login",
      "  mailclaw dashboard",
      "",
      "quick checks:",
      "  mailclaw status",
      "  mailclaw doctor",
      "",
      "commands:",
      "  onboard [emailAddress] [provider]",
      "  login [provider-specific args|web]",
      "  dashboard [path]",
      "  providers [provider]",
      "  accounts [show <accountId>]",
      "  rooms [accountId]",
      "  inboxes <accountId>",
      "  workbench [accountId] [roomKey] [mailboxId]",
      "  replay <roomKey>",
      "",
      "advanced:",
      "  open [path]",
      "  mailclaw <mailctl command>",
      "  mailctl --help",
      "",
      "docs:",
      "  https://docs.openclaw.ai"
    ].join("\n") + "\n"
  );
}
