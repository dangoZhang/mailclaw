import fs from "node:fs";
import { fileURLToPath } from "node:url";
import process from "node:process";

let knownWarningsSuppressed = false;

export function ensureSupportedNodeVersion() {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);
  if (Number.isFinite(major) && major >= 22) {
    return;
  }

  process.stderr.write("\nMailClaw requires Node.js 22+ because it uses the built-in node:sqlite module.\n");
  process.stderr.write(`Current runtime: ${process.version}\n`);
  process.stderr.write("Install Node.js 22+ and retry.\n");
  process.exit(1);
}

export function suppressKnownNodeWarnings() {
  if (knownWarningsSuppressed) {
    return;
  }
  knownWarningsSuppressed = true;

  const originalEmitWarning = process.emitWarning.bind(process);
  process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
    const warningName =
      typeof warning === "string"
        ? typeof args[0] === "string"
          ? args[0]
          : undefined
        : warning.name;
    const message = typeof warning === "string" ? warning : warning.message;

    if (warningName === "ExperimentalWarning" && message.includes("SQLite is an experimental feature")) {
      return;
    }

    return originalEmitWarning(warning as string | Error, ...(args as []));
  }) as typeof process.emitWarning;
}

export function isCliEntrypoint(importMetaUrl: string, argvPath = process.argv[1]) {
  if (!argvPath) {
    return false;
  }

  try {
    return fs.realpathSync(fileURLToPath(importMetaUrl)) === fs.realpathSync(argvPath);
  } catch {
    return importMetaUrl === new URL(argvPath, "file://").href;
  }
}
