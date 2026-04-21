import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildEmailRlSweepArtifacts, runEmailRlSweep } from "../src/benchmarks/email-rl-sweep.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("email rl sweep", () => {
  it("searches multiple candidate configs and returns a ranked best candidate", async () => {
    const result = await runEmailRlSweep({
      gammaValues: [0.6, 0.72],
      supportPenaltyValues: [0.1],
      behaviorPenaltyValues: [0.04, 0.08],
      similarityFloorValues: [0.45],
      maxWriteFieldsValues: [4, 5],
      maxReadFieldsValues: [3],
      maxExplainFieldsValues: [3]
    });

    expect(result.experimentCount).toBe(8);
    expect(result.topCandidates.length).toBeGreaterThan(0);
    expect(result.bestCandidate.summary.reward).toBeGreaterThan(3);
    expect(result.bestCandidate.summary.rewardLiftPct).toBeGreaterThan(10);
  });

  it("writes artifact files for the best sweep result", async () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "mailclaws-email-rl-sweep-"));
    tempDirs.push(outputDir);

    const result = await buildEmailRlSweepArtifacts({
      outputDir,
      gammaValues: [0.72],
      supportPenaltyValues: [0.18],
      behaviorPenaltyValues: [0.08],
      similarityFloorValues: [0.45, 0.55],
      maxWriteFieldsValues: [4, 5],
      maxReadFieldsValues: [3],
      maxExplainFieldsValues: [3]
    });

    expect(result.files.map((entry) => path.basename(entry.path))).toEqual(
      expect.arrayContaining([
        "email-rl-sweep.json",
        "email-rl-sweep.md",
        "email-rl-best-benchmark.json",
        "email-rl-best-benchmark.md"
      ])
    );
  });
});
