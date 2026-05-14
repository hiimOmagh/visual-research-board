#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const startedAt = new Date().toISOString();

const gates = [
    { category: "release", name: "public-demo-evidence-lock", command: ["node", "tests/public-demo-evidence-lock-check.mjs"] },
  { category: "release", name: "hosted-demo-evidence-review", command: ["node", "tests/hosted-demo-evidence-review-check.mjs"] },
  { category: "release", name: "public-demo-final-acceptance", command: ["node", "tests/public-demo-final-acceptance-check.mjs"] },
  { category: "release", name: "public-demo-stable-release", command: ["node", "tests/public-demo-stable-release-check.mjs"] },
{ category: "baseline", name: "core-static-qa", command: ["node", "tests/qa-check.mjs"] },
  { category: "baseline", name: "normalization-fixtures", command: ["node", "tests/normalization-check.mjs"] },
  { category: "baseline", name: "e2e-fixtures", command: ["node", "tests/e2e-fixture-check.mjs"] },
  { category: "baseline", name: "provider-smoke-fixtures", command: ["node", "tests/provider-smoke-check.mjs"] },
  { category: "baseline", name: "library-conflict-fixtures", command: ["node", "tests/library-conflict-check.mjs"] },
  { category: "baseline", name: "lockfile-registry", command: ["node", "tests/lockfile-registry-check.mjs"] },

  { category: "retrieval", name: "broad-retrieval", command: ["node", "tests/broad-retrieval-check.mjs"] },
  { category: "retrieval", name: "retrieval-evidence", command: ["node", "tests/retrieval-evidence-check.mjs"] },
  { category: "retrieval", name: "retrieval-calibration", command: ["node", "tests/retrieval-calibration-check.mjs"] },
  { category: "retrieval", name: "retrieval-autotuning", command: ["node", "tests/retrieval-autotuning-check.mjs"] },
  { category: "retrieval", name: "real-topic-matrix", command: ["node", "tests/real-topic-matrix-check.mjs"] },
  { category: "retrieval", name: "evidence-driven-tuning", command: ["node", "tests/evidence-driven-tuning-check.mjs"] },
  { category: "retrieval", name: "free-image-retrieval", command: ["node", "tests/free-image-retrieval-check.mjs"] },
  { category: "retrieval", name: "normalization-dedupe", command: ["node", "tests/normalization-dedupe-check.mjs"] },
  { category: "retrieval", name: "query-routing", command: ["node", "tests/query-routing-check.mjs"] },
  { category: "retrieval", name: "ranking-explainability", command: ["node", "tests/ranking-explainability-check.mjs"] },

  { category: "providers", name: "provider-runtime-pack", command: ["node", "tests/provider-runtime-pack-check.mjs"] },
  { category: "providers", name: "provider-result-inspector", command: ["node", "tests/provider-result-inspector-check.mjs"] },
  { category: "providers", name: "museum-open-access-pack", command: ["node", "tests/museum-open-access-provider-pack-check.mjs"] },
  { category: "providers", name: "stock-illustrative-pack", command: ["node", "tests/stock-illustrative-provider-pack-check.mjs"] },

  { category: "security", name: "provider-key-handling", command: ["node", "tests/security-key-handling-check.mjs"] },
  { category: "public-demo", name: "public-demo-release-candidate", command: ["node", "tests/public-demo-release-candidate-check.mjs"] },

  { category: "workflow", name: "manual-quality-review", command: ["node", "tests/manual-quality-review-check.mjs"] },
  { category: "workflow", name: "review-evidence-feedback", command: ["node", "tests/review-evidence-feedback-check.mjs"] },
  { category: "workflow", name: "project-review-memory", command: ["node", "tests/project-review-memory-check.mjs"] },
  { category: "workflow", name: "board-organization", command: ["node", "tests/board-organization-check.mjs"] },
  { category: "workflow", name: "claim-mapping", command: ["node", "tests/claim-mapping-check.mjs"] },
  { category: "workflow", name: "coverage-bias", command: ["node", "tests/coverage-bias-check.mjs"] },
  { category: "workflow", name: "ux-reliability", command: ["node", "tests/ux-reliability-check.mjs"] },
  { category: "workflow", name: "storage-hardening", command: ["node", "tests/storage-hardening-check.mjs"] },
  { category: "workflow", name: "reference-intelligence", command: ["node", "tests/reference-intelligence-check.mjs"] },
  { category: "workflow", name: "broad-reference-result-model", command: ["node", "tests/broad-reference-result-model-check.mjs"] },
  { category: "retrieval", name: "broad-web-image-discovery", command: ["node", "tests/broad-web-image-discovery-check.mjs"] },
  { category: "retrieval", name: "social-reference-discovery", command: ["node", "tests/social-reference-discovery-check.mjs"] },
  { category: "retrieval", name: "book-bibliographic-discovery", command: ["node", "tests/book-bibliographic-discovery-check.mjs"] },
  { category: "workflow", name: "reference-activation-pack", command: ["node", "tests/reference-activation-pack-check.mjs"] },
  { category: "workflow", name: "activation-pack-ui-integration", command: ["node", "tests/activation-pack-ui-integration-check.mjs"] },
  { category: "exports", name: "activation-pack-export-preview", command: ["node", "tests/activation-pack-export-preview-check.mjs"] },
  { category: "exports", name: "activation-pack-export-integration", command: ["node", "tests/activation-pack-export-integration-check.mjs"] },
  { category: "release", name: "reference-workflow-stable-release", command: ["node", "tests/reference-workflow-stable-release-check.mjs"] },
  { category: "release", name: "stable-release-hygiene", command: ["node", "tests/stable-release-hygiene-check.mjs"] },
  { category: "release", name: "dependency-audit-triage", command: ["node", "tests/dependency-audit-triage-check.mjs"] },

  { category: "exports", name: "evidence-pack-export", command: ["node", "tests/evidence-pack-export-check.mjs"] },
  { category: "exports", name: "attribution-generator", command: ["node", "tests/attribution-generator-check.mjs"] },

  { category: "release", name: "deployed-browser-evidence", command: ["node", "tests/deployed-browser-evidence-check.mjs"] },
  { category: "release", name: "full-qa-gate-manifest", command: ["node", "tests/full-qa-gate-check.mjs"] }
];

function parseArgs(argv) {
  const args = { list: false, category: null };
  for (const arg of argv) {
    if (arg === "--list") args.list = true;
    if (arg.startsWith("--category=")) args.category = arg.slice("--category=".length);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const selectedGates = args.category ? gates.filter((gate) => gate.category === args.category) : gates;

if (args.list) {
  for (const gate of selectedGates) console.log(`${gate.category}\t${gate.name}\t${gate.command.join(" ")}`);
  process.exit(0);
}

if (args.category && selectedGates.length === 0) {
  console.error(`Unknown QA category: ${args.category}`);
  console.error(`Available categories: ${[...new Set(gates.map((gate) => gate.category))].join(", ")}`);
  process.exit(1);
}

const results = [];
let failed = false;

for (const gate of selectedGates) {
  const gateStartedAt = Date.now();
  console.log(`\n[full-qa:${gate.category}] ${gate.name}`);
  const [cmd, ...cmdArgs] = gate.command;
  const result = spawnSync(cmd, cmdArgs, {
    cwd: root,
    stdio: "inherit",
    env: process.env
  });
  const durationMs = Date.now() - gateStartedAt;
  const status = result.status === 0 ? "passed" : "failed";
  results.push({
    category: gate.category,
    name: gate.name,
    command: gate.command.join(" "),
    status,
    exit_code: result.status,
    duration_ms: durationMs
  });
  if (result.status !== 0) {
    failed = true;
    break;
  }
}

const finishedAt = new Date().toISOString();
const report = {
  schema_version: "2.0.2",
  app_version: "2.0.2",
  gate: "full_qa_gate",
  started_at: startedAt,
  finished_at: finishedAt,
  selected_category: args.category,
  total_gate_count: selectedGates.length,
  passed_gate_count: results.filter((item) => item.status === "passed").length,
  failed_gate_count: results.filter((item) => item.status === "failed").length,
  status: failed ? "failed" : "passed",
  categories: [...new Set(selectedGates.map((gate) => gate.category))],
  results
};

mkdirSync(join(root, "artifacts"), { recursive: true });
writeFileSync(join(root, "artifacts/full-qa-gate-report.json"), `${JSON.stringify(report, null, 2)}\n`);

if (failed) {
  console.error("\nFull QA gate failed. See artifacts/full-qa-gate-report.json for the executed gate list.");
  process.exit(1);
}

console.log("\nFull QA gate passed for v2.0.2.");
console.log("Evidence artifact: artifacts/full-qa-gate-report.json");
