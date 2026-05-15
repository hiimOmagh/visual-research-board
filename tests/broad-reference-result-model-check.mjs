import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
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
  console.error(`FAIL broad reference result model check: ${message}`);
  process.exitCode = 1;
}
function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.11", "package.json version must be 2.1.11");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must identify Broad Reference Result Model");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Public Demo Stable Release"), "package description must preserve Public Demo Stable Release wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["broad-reference:model:check"] === "node tests/broad-reference-result-model-check.mjs", "package.json must expose broad-reference:model:check");
assert(pkg.scripts?.["reference:intelligence:check"] === "node tests/reference-intelligence-check.mjs", "package.json must preserve reference:intelligence:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const requiredFiles = [
  "src/types/broad-reference-result.ts",
  "src/lib/broad-reference-result.ts",
  "src/components/search/SourceClassBadge.tsx",
  "src/components/search/BroadReferenceResultPanel.tsx",
  "tests/broad-reference-result-model-check.mjs",
  "docs/broad-reference-result-model.md",
  "docs/source-class-taxonomy.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) assert(exists(file), `missing required file: ${file}`);

const types = read("src/types/broad-reference-result.ts");
for (const token of [
  "BroadReferenceSourceClass",
  "BroadReferenceResult",
  "BroadReferenceResultSummary",
  "web_image",
  "web_page",
  "social_media",
  "book",
  "archive",
  "museum",
  "stock",
  "video",
  "unknown",
  "reference_intelligence"
]) assert(types.includes(token), `broad reference types must include ${token}`);

const lib = read("src/lib/broad-reference-result.ts");
for (const token of [
  "createBroadReferenceResult",
  "inferBroadReferenceSourceClass",
  "inferBroadReferenceRiskLevel",
  "summarizeBroadReferenceResult",
  "describeBroadReferenceSourceClass"
]) assert(lib.includes(token), `broad reference lib must include ${token}`);

const sourceBadge = read("src/components/search/SourceClassBadge.tsx");
assert(sourceBadge.includes("SourceClassBadge"), "source class badge component must be present");
assert(sourceBadge.includes("describeBroadReferenceSourceClass"), "source class badge must use source-class label helper");

const panel = read("src/components/search/BroadReferenceResultPanel.tsx");
for (const token of [
  "BroadReferenceResultPanel",
  "Broad reference result",
  "Needs review",
  "they do not block discovery"
]) assert(panel.includes(token), `broad reference panel must include ${token}`);

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("broad-reference-result-model"), "Full QA gate must include broad reference result model gate");
assert(fullQaGate.includes("tests/broad-reference-result-model-check.mjs"), "Full QA gate must run broad reference result model check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("broad-reference-result-model"), "Full QA gate manifest must check broad reference result model gate");

const modelDoc = read("docs/broad-reference-result-model.md");
assert(modelDoc.includes("Discovery first"), "broad reference model doc must preserve discovery-first philosophy");
assert(modelDoc.includes("No provider changes"), "broad reference model doc must state no provider changes");
assert(modelDoc.includes("source_class"), "broad reference model doc must mention source_class");

const taxonomyDoc = read("docs/source-class-taxonomy.md");
for (const token of ["web_image", "social_media", "book", "archive", "museum", "video", "unknown"]) {
  assert(taxonomyDoc.includes(token), `source-class taxonomy must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN broad reference model: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN broad reference model: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Broad Reference Result Model checks passed for v${VERSION}.`);
