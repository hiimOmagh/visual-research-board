
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
  console.error(`FAIL dependency audit triage check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.2.0", "package.json version must be 2.2.0");
assert(pkg.description?.includes("Dependency Audit Triage"), "package description must identify Dependency Audit Triage");
assert(pkg.description?.includes("Stable Release Hygiene + Audit Warning Review"), "package description must preserve Stable Release Hygiene + Audit Warning Review wording");
assert(pkg.description?.includes("Reference Workflow Stable Release"), "package description must preserve Reference Workflow Stable Release wording");
assert(pkg.description?.includes("Activation Pack Export Integration"), "package description must preserve Activation Pack Export Integration wording");
assert(pkg.description?.includes("Activation Pack UI Integration"), "package description must preserve Activation Pack UI Integration wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["dependency:audit:triage:check"] === "node tests/dependency-audit-triage-check.mjs", "package.json must expose dependency:audit:triage:check");
assert(pkg.scripts?.["stable:hygiene:check"] === "node tests/stable-release-hygiene-check.mjs", "package.json must preserve stable:hygiene:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.2.0"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.2.0"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "tests/dependency-audit-triage-check.mjs",
  "docs/dependency-audit-triage.md",
  "docs/dependency-audit-triage-checklist.md",
  "docs/audit-warning-review.md",
  "docs/stable-release-hygiene-audit-review.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required dependency audit triage file: ${file}`);
}

const requiredScripts = [
  "dependency:audit:triage:check",
  "stable:hygiene:check",
  "reference-workflow:stable:check",
  "activation-pack:export:check",
  "activation-pack:export-preview:check",
  "activation-pack:ui:check",
  "reference-activation:check",
  "book-reference:check",
  "social-reference:check",
  "broad-discovery:check",
  "broad-reference:model:check",
  "reference:intelligence:check",
  "public-demo:stable:check",
  "security:key:check"
];

for (const script of requiredScripts) {
  assert(typeof pkg.scripts?.[script] === "string", `package.json must preserve ${script}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("dependency-audit-triage"), "Full QA gate must include dependency-audit-triage");
assert(fullQaGate.includes("tests/dependency-audit-triage-check.mjs"), "Full QA gate must run dependency audit triage check");
assert(fullQaGate.includes("stable-release-hygiene"), "Full QA gate must preserve stable release hygiene");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("dependency-audit-triage"), "Full QA manifest must check dependency audit triage");

const triageDoc = read("docs/dependency-audit-triage.md");
for (const token of [
  "2 moderate npm audit warnings",
  "direct vs transitive",
  "runtime vs dev-only exposure",
  "non-breaking update path",
  "No `npm audit fix --force`",
  "no dependency churn",
  "no feature changes",
  "separate dependency-maintenance milestone"
]) {
  assert(triageDoc.includes(token), `dependency audit triage doc must include ${token}`);
}

const checklistDoc = read("docs/dependency-audit-triage-checklist.md");
for (const token of [
  "run `npm audit`",
  "package name",
  "severity",
  "direct dependency",
  "transitive dependency",
  "patched version",
  "production runtime",
  "development tooling",
  "breaking change risk",
  "decision"
]) {
  assert(checklistDoc.includes(token), `dependency audit triage checklist must include ${token}`);
}

const auditReviewDoc = read("docs/audit-warning-review.md");
for (const token of [
  "without force-fixing",
  "triage separately",
  "do not change package versions blindly",
  "dependency-maintenance milestone"
]) {
  assert(auditReviewDoc.includes(token), `audit warning review doc must preserve ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.2.0"), `${file} must reference v2.2.0`);
}

const forbiddenPositiveClaims = [
  /npm\s+audit\s+fix\s+--force\s+was\s+run/i,
  /dependency\s+versions\s+were\s+force\s+updated/i,
  /force\s+fix\s+completed/i,
  /new\s+feature\s+implemented/i,
  /new\s+provider\s+implementation/i,
  /export\s+rewrite\s+completed/i,
  /paywall\s+bypass\s+enabled/i,
  /image\s+generation\s+enabled/i
];

for (const file of [
  "docs/dependency-audit-triage.md",
  "docs/dependency-audit-triage-checklist.md",
  "docs/audit-warning-review.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of forbiddenPositiveClaims) {
    assert(!pattern.test(text), `${file} contains forbidden dependency/feature claim pattern ${pattern}`);
  }
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN dependency audit triage: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN dependency audit triage: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Dependency Audit Triage checks passed for v${VERSION}.`);
