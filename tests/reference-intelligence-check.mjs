import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fp(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(fp(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(fp(relativePath), "utf8");
}

function fail(message) {
  console.error(`FAIL reference intelligence check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "1.6.0", "package.json version must be 1.6.0");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must identify Reference Intelligence Layer MVP");
assert(pkg.description?.includes("Public Demo Stable Release"), "package description must preserve Public Demo Stable Release wording");
assert(pkg.scripts?.["reference:intelligence:check"] === "node tests/reference-intelligence-check.mjs", "package.json must expose reference:intelligence:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const requiredFiles = [
  "src/types/reference-intelligence.ts",
  "src/lib/reference-intelligence.ts",
  "src/components/search/ReferenceIntelligencePanel.tsx",
  "tests/reference-intelligence-check.mjs",
  "docs/reference-intelligence-layer.md",
  "docs/reference-intelligence-workflow.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/reference-intelligence.ts");
for (const token of [
  "ReferenceUseAs",
  "ReferenceEvidenceRole",
  "ReferenceAccessStatus",
  "ReferenceRightsStatus",
  "ReferenceRiskLevel",
  "ReferenceIntelligence",
  "visual_inspiration",
  "generation_seed",
  "claim_support",
  "research_anchor"
]) {
  assert(types.includes(token), `reference intelligence types must include ${token}`);
}

const lib = read("src/lib/reference-intelligence.ts");
for (const token of [
  "createReferenceIntelligence",
  "inferReferenceRiskLevel",
  "summarizeReferenceIntelligence",
  "describeReferenceUse",
  "describeEvidenceRole",
  "activation_ready"
]) {
  assert(lib.includes(token), `reference intelligence lib must include ${token}`);
}

const panel = read("src/components/search/ReferenceIntelligencePanel.tsx");
for (const token of [
  "ReferenceIntelligencePanel",
  "Reference intelligence",
  "Use this result as a structured reference",
  "does not block discovery"
]) {
  assert(panel.includes(token), `reference intelligence panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("reference-intelligence"), "Full QA gate must include reference intelligence gate");
assert(fullQaGate.includes("tests/reference-intelligence-check.mjs"), "Full QA gate must run reference intelligence check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("reference-intelligence"), "Full QA gate manifest must check reference intelligence gate");

const layerDoc = read("docs/reference-intelligence-layer.md");
assert(layerDoc.includes("Discovery first"), "reference intelligence doc must preserve discovery-first philosophy");
assert(layerDoc.includes("not a licensing filter"), "reference intelligence doc must state it is not a licensing filter");
assert(layerDoc.includes("No provider changes"), "reference intelligence doc must state no provider changes");

const workflowDoc = read("docs/reference-intelligence-workflow.md");
assert(workflowDoc.includes("Find"), "workflow doc must include Find step");
assert(workflowDoc.includes("Understand"), "workflow doc must include Understand step");
assert(workflowDoc.includes("Activate"), "workflow doc must include Activate step");

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN reference intelligence: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN reference intelligence: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Reference Intelligence Layer MVP checks passed for v${VERSION}.`);
