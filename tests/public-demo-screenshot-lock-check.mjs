
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
  console.error(`FAIL public demo screenshot lock check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.2.0", "package.json version must be 2.2.0");
assert(pkg.description?.includes("Public Demo Evidence + Screenshot Lock"), "package description must identify Public Demo Evidence + Screenshot Lock");
assert(pkg.description?.includes("Dependency Audit Triage"), "package description must preserve Dependency Audit Triage wording");
assert(pkg.description?.includes("Stable Release Hygiene + Audit Warning Review"), "package description must preserve Stable Release Hygiene + Audit Warning Review wording");
assert(pkg.description?.includes("Reference Workflow Stable Release"), "package description must preserve Reference Workflow Stable Release wording");
assert(pkg.description?.includes("Activation Pack Export Integration"), "package description must preserve Activation Pack Export Integration wording");
assert(pkg.description?.includes("Activation Pack Export Preview"), "package description must preserve Activation Pack Export Preview wording");
assert(pkg.description?.includes("Activation Pack UI Integration"), "package description must preserve Activation Pack UI Integration wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Hosted Demo Evidence Review"), "package description must preserve Hosted Demo Evidence Review wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["public-demo:screenshot:check"] === "node tests/public-demo-screenshot-lock-check.mjs", "package.json must expose public-demo:screenshot:check");
assert(pkg.scripts?.["dependency:audit:triage:check"] === "node tests/dependency-audit-triage-check.mjs", "package.json must preserve dependency:audit:triage:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.2.0"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.2.0"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "tests/public-demo-screenshot-lock-check.mjs",
  "docs/public-demo-evidence-screenshot-lock.md",
  "docs/public-demo-screenshot-checklist.md",
  "docs/hosted-demo-evidence-review.md",
  "docs/public-demo-evidence-lock.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required screenshot lock file: ${file}`);
}

const requiredScripts = [
  "public-demo:screenshot:check",
  "dependency:audit:triage:check",
  "stable:hygiene:check",
  "reference-workflow:stable:check",
  "activation-pack:export:check",
  "activation-pack:export-preview:check",
  "activation-pack:ui:check",
  "public-demo:stable:check",
  "public-demo:final:check",
  "hosted-demo:evidence:check",
  "public-demo:evidence:check",
  "public-demo:check",
  "security:key:check"
];

for (const script of requiredScripts) {
  assert(typeof pkg.scripts?.[script] === "string", `package.json must preserve ${script}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("public-demo-screenshot-lock"), "Full QA gate must include public-demo-screenshot-lock");
assert(fullQaGate.includes("tests/public-demo-screenshot-lock-check.mjs"), "Full QA gate must run public demo screenshot lock check");
assert(fullQaGate.includes("dependency-audit-triage"), "Full QA gate must preserve dependency audit triage");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("public-demo-screenshot-lock"), "Full QA manifest must check public demo screenshot lock");

const lockDoc = read("docs/public-demo-evidence-screenshot-lock.md");
for (const token of [
  "hosted demo screenshots",
  "desktop",
  "mobile",
  "landing/default state",
  "discovery/board state",
  "activation pack workflow",
  "export integration panel",
  "empty-state behavior",
  "no new features",
  "no provider expansion",
  "no export rewrite",
  "no scraping",
  "no image generation"
]) {
  assert(lockDoc.includes(token), `public demo screenshot lock doc must include ${token}`);
}

const checklistDoc = read("docs/public-demo-screenshot-checklist.md");
for (const token of [
  "screenshot evidence",
  "required screenshots",
  "landing/default state",
  "discovery/board state",
  "activation pack workflow",
  "export integration panel",
  "desktop-width sanity",
  "mobile-width sanity",
  "file naming",
  "review outcome"
]) {
  assert(checklistDoc.includes(token), `public demo screenshot checklist must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.2.0"), `${file} must reference v2.2.0`);
}

const forbiddenPositiveClaims = [
  /new\s+feature\s+implemented/i,
  /new\s+provider\s+implementation/i,
  /export\s+rewrite\s+completed/i,
  /private\s+account\s+scraping/i,
  /paywall\s+bypass\s+enabled/i,
  /image\s+generation\s+enabled/i,
  /source\s+media\s+rehosting\s+enabled/i,
  /rights\s+clearance\s+guaranteed/i
];

for (const file of [
  "docs/public-demo-evidence-screenshot-lock.md",
  "docs/public-demo-screenshot-checklist.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of forbiddenPositiveClaims) {
    assert(!pattern.test(text), `${file} contains forbidden public-demo evidence claim pattern ${pattern}`);
  }
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN public demo screenshot lock: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN public demo screenshot lock: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Public Demo Evidence + Screenshot Lock checks passed for v${VERSION}.`);
