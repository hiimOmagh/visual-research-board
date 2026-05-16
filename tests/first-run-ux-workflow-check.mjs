
import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL first-run UX workflow check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.3.0", "package.json version must be 2.3.0");
assert(pkg.description?.includes("First-Run UX + Workflow Clarity"), "package description must identify First-Run UX + Workflow Clarity");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Release Package Audit"), "package description must preserve Release Package Audit wording");
assert(pkg.description?.includes("Public Demo Evidence + Screenshot Lock"), "package description must preserve Public Demo Evidence + Screenshot Lock wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["first-run:ux:check"] === "node tests/first-run-ux-workflow-check.mjs", "package.json must expose first-run:ux:check");
assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");
assert(pkg.scripts?.["release:verify:runner:check"] === "node tests/release-verify-runner-check.mjs", "package.json must preserve release:verify:runner:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "src/lib/first-run-workflow.ts",
  "src/components/search/FirstRunWorkflowPanel.tsx",
  "tests/first-run-ux-workflow-check.mjs",
  "docs/first-run-ux-workflow-clarity.md",
  "docs/first-run-ux-checklist.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const lib = read("src/lib/first-run-workflow.ts");
for (const token of [
  "firstRunWorkflowSteps",
  "Search broadly",
  "Save useful references",
  "Review evidence and risk",
  "Build an activation pack",
  "Export the pack",
  "firstRunPrimaryNextAction",
  "firstRunEmptyStateGuidance",
  "No automatic rights clearance",
  "No private/account-gated scraping",
  "No paywall bypass",
  "No source media rehosting"
]) {
  assert(lib.includes(token), `first-run workflow lib must include ${token}`);
}

const component = read("src/components/search/FirstRunWorkflowPanel.tsx");
for (const token of [
  "FirstRunWorkflowPanel",
  "First-run workflow",
  "From search results to a source-aware activation pack",
  "Next action:",
  "When the board is empty",
  "Boundaries"
]) {
  assert(component.includes(token), `first-run workflow component must include ${token}`);
}

const searchPanelPath = "src/components/search/SearchPanel.tsx";
if (exists(searchPanelPath)) {
  const searchPanel = read(searchPanelPath);
  assert(
    searchPanel.includes("FirstRunWorkflowPanel") || searchPanel.includes("first-run workflow"),
    "SearchPanel should reference FirstRunWorkflowPanel or first-run workflow copy"
  );
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("first-run-ux-workflow"), "Full QA gate must include first-run-ux-workflow");
assert(fullQaGate.includes("tests/first-run-ux-workflow-check.mjs"), "Full QA gate must run first-run UX workflow check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("first-run-ux-workflow"), "Full QA manifest must check first-run UX workflow");

const doc = read("docs/first-run-ux-workflow-clarity.md");
for (const token of [
  "first-run workflow",
  "new user",
  "search",
  "save",
  "review",
  "activation pack",
  "export",
  "empty-state",
  "what to do next",
  "no new providers",
  "no scraping",
  "no image generation"
]) {
  assert(doc.includes(token), `first-run UX doc must include ${token}`);
}

const checklist = read("docs/first-run-ux-checklist.md");
for (const token of [
  "under 60 seconds",
  "landing/default state",
  "empty board",
  "first useful search",
  "first saved reference",
  "activation pack",
  "export preview",
  "review outcome"
]) {
  assert(checklist.includes(token), `first-run UX checklist must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.3.0"), `${file} must reference v2.3.0`);
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run UX workflow: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run UX workflow: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

for (const file of [
  "docs/first-run-ux-workflow-clarity.md",
  "docs/first-run-ux-checklist.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of [
    /new\s+provider\s+implementation/i,
    /export\s+rewrite\s+completed/i,
    /private\s+account\s+scraping/i,
    /paywall\s+bypass\s+enabled/i,
    /image\s+generation\s+enabled/i,
    /source\s+media\s+rehosting\s+enabled/i,
    /rights\s+clearance\s+guaranteed/i
  ]) {
    assert(!pattern.test(text), `${file} contains forbidden first-run UX claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`First-Run UX + Workflow Clarity checks passed for v${VERSION}.`);
