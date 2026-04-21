import { buildEmailRlSweepArtifacts, renderEmailRlSweepMarkdown } from "../src/benchmarks/email-rl-sweep.js";

const wantsJson = process.argv.includes("--json");
const outputDirArg = process.argv.slice(2).filter((entry) => entry !== "--json")[0];

const result = await buildEmailRlSweepArtifacts({
  outputDir: outputDirArg
});

if (wantsJson) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log(renderEmailRlSweepMarkdown(result));
