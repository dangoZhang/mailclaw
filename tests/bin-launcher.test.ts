import childProcess from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("npm bin launchers", () => {
  function runLauncherFixture(commandName: string, distEntry: string, args: string[]) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mailclaw-bin-launcher-"));
    tempDirs.push(tempDir);

    const packageDir = path.join(tempDir, "node_modules", "mailclaws");
    const binDir = path.join(packageDir, "bin");
    const cliDir = path.join(packageDir, "dist", "cli");
    const npmBinDir = path.join(tempDir, "node_modules", ".bin");
    fs.mkdirSync(binDir, { recursive: true });
    fs.mkdirSync(cliDir, { recursive: true });
    fs.mkdirSync(npmBinDir, { recursive: true });

    const launcherSource = fs.readFileSync(path.join(process.cwd(), "bin", commandName), "utf8");
    const launcherPath = path.join(binDir, commandName);
    fs.writeFileSync(launcherPath, launcherSource, { mode: 0o755 });
    fs.writeFileSync(
      path.join(cliDir, distEntry),
      [
        "#!/usr/bin/env node",
        "process.stdout.write(JSON.stringify({",
        "  entry: process.argv[1],",
        "  args: process.argv.slice(2)",
        "}));"
      ].join("\n"),
      { mode: 0o755 }
    );

    fs.symlinkSync(path.relative(npmBinDir, launcherPath), path.join(npmBinDir, commandName));

    const output = childProcess.execFileSync(path.join(npmBinDir, commandName), args, {
      cwd: tempDir,
      env: {
        ...process.env,
        PATH: ["/usr/local/bin", path.dirname(process.execPath), "/usr/bin", "/bin"].join(":")
      },
      encoding: "utf8"
    });

    return {
      parsed: JSON.parse(output) as { entry: string; args: string[] },
      cliDir
    };
  }

  it("resolves the real package directory for mailctl when invoked through node_modules/.bin symlinks", () => {
    const { parsed, cliDir } = runLauncherFixture("mailctl", "mailctl.js", ["observe", "runtime"]);

    expect(parsed).toEqual({
      entry: fs.realpathSync(path.join(cliDir, "mailctl.js")),
      args: ["observe", "runtime"]
    });
  });

  it("resolves the real package directory for mailclaws when invoked through node_modules/.bin symlinks", () => {
    const { parsed, cliDir } = runLauncherFixture("mailclaws", "mailclaws.js", ["status"]);

    expect(parsed).toEqual({
      entry: fs.realpathSync(path.join(cliDir, "mailclaws.js")),
      args: ["status"]
    });
  });
});
