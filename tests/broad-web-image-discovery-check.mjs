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
  console.error(`FAIL broad web image discovery check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.5", "package.json version must be 2.1.5");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must identify Broad Web + Image Discovery Expansion");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["broad-discovery:check"] === "node tests/broad-web-image-discovery-check.mjs", "package.json must expose broad-discovery:check");
assert(pkg.scripts?.["broad-reference:model:check"] === "node tests/broad-reference-result-model-check.mjs", "package.json must preserve broad-reference:model:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.1.5"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.1.5"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/broad-discovery.ts",
  "src/lib/broad-discovery.ts",
  "src/components/search/BroadDiscoveryModePanel.tsx",
  "tests/broad-web-image-discovery-check.mjs",
  "docs/broad-web-image-discovery.md",
  "docs/discovery-mode-taxonomy.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/broad-discovery.ts");
for (const token of [
  "BroadDiscoveryMode",
  "BroadDiscoveryQueryPlan",
  "BroadDiscoveryCandidate",
  "BroadDiscoveryNormalizationResult",
  "broad",
  "web",
  "image",
  "visual",
  "safe_open"
]) {
  assert(types.includes(token), `broad discovery types must include ${token}`);
}

const lib = read("src/lib/broad-discovery.ts");
for (const token of [
  "createBroadDiscoveryQueryPlan",
  "normalizeBroadDiscoveryCandidate",
  "filterBroadDiscoveryResultsByMode",
  "describeBroadDiscoveryMode",
  "createBroadReferenceResult",
  "inferBroadReferenceSourceClass",
  "Discovery-first mode"
]) {
  assert(lib.includes(token), `broad discovery lib must include ${token}`);
}

const panel = read("src/components/search/BroadDiscoveryModePanel.tsx");
for (const token of [
  "BroadDiscoveryModePanel",
  "Broad web + image discovery",
  "does not add",
  "Risk/access labels inform review"
]) {
  assert(panel.includes(token), `broad discovery panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("broad-web-image-discovery"), "Full QA gate must include broad web image discovery gate");
assert(fullQaGate.includes("tests/broad-web-image-discovery-check.mjs"), "Full QA gate must run broad web image discovery check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("broad-web-image-discovery"), "Full QA gate manifest must check broad web image discovery gate");

const expansionDoc = read("docs/broad-web-image-discovery.md");
assert(expansionDoc.includes("Discovery first"), "broad web/image doc must preserve discovery-first philosophy");
assert(expansionDoc.includes("No provider changes"), "broad web/image doc must state no provider changes");
assert(expansionDoc.includes("No scraping"), "broad web/image doc must state no scraping");

const taxonomyDoc = read("docs/discovery-mode-taxonomy.md");
for (const token of ["broad", "web", "image", "visual", "safe_open"]) {
  assert(taxonomyDoc.includes(token), `discovery mode taxonomy must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN broad discovery: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN broad discovery: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Broad Web + Image Discovery Expansion checks passed for v${VERSION}.`);
