import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
  console.error(`FAIL stable release hygiene check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function gitOutput(args) {
  try {
    return execSync(`git ${args}`, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function isGeneratedOrTempPath(filePath) {
  return (
    filePath === "node_modules" ||
    filePath.startsWith("node_modules/") ||
    filePath === ".next" ||
    filePath.startsWith(".next/") ||
    filePath === "out" ||
    filePath.startsWith("out/") ||
    filePath === "dist" ||
    filePath.startsWith("dist/") ||
    filePath === "coverage" ||
    filePath.startsWith("coverage/") ||
    filePath === "playwright-report" ||
    filePath.startsWith("playwright-report/") ||
    filePath === "test-results" ||
    filePath.startsWith("test-results/") ||
    filePath === "__pycache__" ||
    filePath.startsWith("__pycache__/") ||
    filePath === "tsconfig.tsbuildinfo" ||
    /^apply-v.*\.(mjs|py)$/.test(path.basename(filePath)) ||
    /\.(zip|tar|tgz|log)$/.test(filePath)
  );
}

function assertGeneratedArtifactsNotCommitted() {
  const status = gitOutput("status --porcelain");
  if (!status) return;

  for (const line of status.split("\n")) {
    const state = line.slice(0, 2);
    const filePath = line.slice(3).trim().replace(/^"|"$/g, "");

    if (!isGeneratedOrTempPath(filePath)) continue;

    // Deleting a previously tracked generated file is acceptable in this hygiene patch.
    if (state.includes("D")) continue;

    fail(`generated/cache/temp path must not be staged or committed: ${filePath} (${state})`);
  }
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.0.5", "package.json version must be 2.0.5");
assert(pkg.description?.includes("Stable Release Hygiene + Audit Warning Review"), "package description must identify Stable Release Hygiene + Audit Warning Review");
assert(pkg.description?.includes("Reference Workflow Stable Release"), "package description must preserve Reference Workflow Stable Release wording");
assert(pkg.description?.includes("Activation Pack Export Integration"), "package description must preserve Activation Pack Export Integration wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["stable:hygiene:check"] === "node tests/stable-release-hygiene-check.mjs", "package.json must expose stable:hygiene:check");
assert(pkg.scripts?.["reference-workflow:stable:check"] === "node tests/reference-workflow-stable-release-check.mjs", "package.json must preserve reference-workflow:stable:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.0.5"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.0.5"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "tests/stable-release-hygiene-check.mjs",
  "docs/stable-release-hygiene-audit-review.md",
  "docs/audit-warning-review.md",
  "docs/release-artifact-hygiene.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "docs/reference-workflow-stable-release.md",
  "docs/stable-reference-workflow-checklist.md"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required hygiene file: ${file}`);
}

const requiredScripts = [
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
assert(fullQaGate.includes("stable-release-hygiene"), "Full QA gate must include stable-release-hygiene");
assert(fullQaGate.includes("tests/stable-release-hygiene-check.mjs"), "Full QA gate must run stable release hygiene check");
assert(fullQaGate.includes("reference-workflow-stable-release"), "Full QA gate must preserve reference workflow stable release");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("stable-release-hygiene"), "Full QA manifest must check stable release hygiene");

const hygieneDoc = read("docs/stable-release-hygiene-audit-review.md");
for (const token of [
  "2 moderate npm audit warnings",
  "Do not run `npm audit fix --force`",
  "no generated/cache files",
  "tag/release artifact consistency",
  "no new features",
  "no dependency churn",
  "full QA artifact"
]) {
  assert(hygieneDoc.includes(token), `stable hygiene doc must include ${token}`);
}

const auditDoc = read("docs/audit-warning-review.md");
for (const token of [
  "moderate",
  "npm audit",
  "without force-fixing",
  "triage separately",
  "do not change package versions blindly",
  "dependency-maintenance milestone"
]) {
  assert(auditDoc.includes(token), `audit warning review doc must include ${token}`);
}

const artifactDoc = read("docs/release-artifact-hygiene.md");
for (const token of [
  "generated/cache files",
  "node_modules",
  ".next",
  "tsconfig.tsbuildinfo",
  "__pycache__",
  "apply-v",
  "zip",
  "artifacts/full-qa-gate-report.json"
]) {
  assert(artifactDoc.includes(token), `release artifact hygiene doc must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.0.5"), `${file} must reference v2.0.5`);
}

// Only block positive unsafe claims, not negative non-goal statements.
const forbiddenPositiveClaims = [
  /paywall\s+bypass\s+enabled/i,
  /image\s+generation\s+enabled/i,
  /source\s+media\s+rehosting\s+enabled/i,
  /npm\s+audit\s+fix\s+--force\s+was\s+run/i
];

for (const file of [
  "docs/stable-release-hygiene-audit-review.md",
  "docs/audit-warning-review.md",
  "docs/release-artifact-hygiene.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of forbiddenPositiveClaims) {
    assert(!pattern.test(text), `${file} contains forbidden positive claim pattern ${pattern}`);
  }
}

assertGeneratedArtifactsNotCommitted();

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN stable hygiene: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN stable hygiene: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Stable Release Hygiene + Audit Warning Review checks passed for v${VERSION}.`);
