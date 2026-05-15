import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL first-run visual QA check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.2.0", "package.json version must be 2.2.0");
assert(pkg.description?.includes("First-Run Visual QA + Responsive Screenshot Evidence"), "package description must identify First-Run Visual QA + Responsive Screenshot Evidence");
assert(pkg.description?.includes("Controlled First-Run Panel Mount + UI Consistency"), "package description must preserve Controlled First-Run Panel Mount + UI Consistency wording");
assert(pkg.description?.includes("First-Run UX + Workflow Clarity"), "package description must preserve First-Run UX + Workflow Clarity wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["first-run:visual:check"] === "node tests/first-run-visual-qa-check.mjs", "package.json must expose first-run:visual:check");
assert(pkg.scripts?.["first-run:visual:evidence"] === "node scripts/first-run-visual-evidence.mjs", "package.json must expose first-run:visual:evidence");
assert(pkg.scripts?.["first-run:panel:check"] === "node tests/first-run-panel-mount-check.mjs", "package.json must preserve first-run:panel:check");
assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "scripts/first-run-visual-evidence.mjs",
  "tests/first-run-visual-qa-check.mjs",
  "docs/first-run-visual-qa-screenshot-evidence.md",
  "docs/first-run-responsive-screenshot-checklist.md",
  "src/components/search/FirstRunWorkflowPanel.tsx",
  "src/components/search/SearchPanel.tsx",
  "scripts/full-qa-gate.mjs",
  "scripts/release-verify.mjs",
  "tests/full-qa-gate-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const evidenceScript = read("scripts/first-run-visual-evidence.mjs");
for (const token of [
  "first-run.visual-evidence.v1",
  "desktop-first-run",
  "tablet-first-run",
  "mobile-first-run",
  "first-run-screenshots",
  "first-run-visual-evidence.json",
  "manual_review_required",
  "No automatic rights clearance",
  "does not add a screenshot/browser dependency"
]) {
  assert(evidenceScript.includes(token), `visual evidence script must include ${token}`);
}

const panel = read("src/components/search/FirstRunWorkflowPanel.tsx");
for (const token of [
  "data-testid=\"first-run-workflow-panel\"",
  "First-run workflow",
  "Next action:",
  "When the board is empty",
  "Boundaries"
]) {
  assert(panel.includes(token), `FirstRunWorkflowPanel must include ${token}`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("<FirstRunWorkflowPanel />"), "SearchPanel must still mount FirstRunWorkflowPanel");
assert(searchPanel.includes("controlled first-run panel mount"), "SearchPanel must preserve controlled mount marker");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("first-run-visual-qa"), "Full QA gate must include first-run-visual-qa");
assert(fullQaGate.includes("tests/first-run-visual-qa-check.mjs"), "Full QA gate must run first-run visual QA check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("first-run-visual-qa"), "Full QA manifest must check first-run visual QA");

const runner = read("scripts/release-verify.mjs");
assert(runner.includes("first-run:visual:check"), "release verifier must include first-run:visual:check");

const doc = read("docs/first-run-visual-qa-screenshot-evidence.md");
for (const token of [
  "responsive screenshot evidence",
  "desktop",
  "tablet",
  "mobile",
  "first-run-screenshots",
  "first-run-visual-evidence.json",
  "manual review",
  "no dependency churn",
  "no provider expansion",
  "no export rewrite"
]) {
  assert(doc.includes(token), `visual QA evidence doc must include ${token}`);
}

const checklist = read("docs/first-run-responsive-screenshot-checklist.md");
for (const token of [
  "desktop-first-run",
  "tablet-first-run",
  "mobile-first-run",
  "first-run panel visible",
  "primary search action visible",
  "no horizontal overflow",
  "activation pack",
  "export preview",
  "review outcome"
]) {
  assert(checklist.includes(token), `responsive screenshot checklist must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.2.0"), `${file} must reference v2.2.0`);
}

const evidencePath = "artifacts/first-run-visual-evidence.json";
if (exists(evidencePath)) {
  const evidence = JSON.parse(read(evidencePath));
  if (evidence.app_version !== VERSION) {
    if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run visual QA: evidence artifact is ${evidence.app_version}, expected ${VERSION}. Run npm run first-run:visual:evidence to regenerate it.`);
  }
  assert(evidence.schema_version === "first-run.visual-evidence.v1", "visual evidence artifact must use schema v1");
  assert(Array.isArray(evidence.screenshots), "visual evidence artifact must include screenshots array");
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run visual QA: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run visual QA: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

for (const file of [
  "docs/first-run-visual-qa-screenshot-evidence.md",
  "docs/first-run-responsive-screenshot-checklist.md",
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
    assert(!pattern.test(text), `${file} contains forbidden first-run visual QA claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`First-Run Visual QA + Responsive Screenshot Evidence checks passed for v${VERSION}.`);
