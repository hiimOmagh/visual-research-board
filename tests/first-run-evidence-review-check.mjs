import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL first-run evidence review check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.3.0", "package.json version must be 2.3.0");
assert(pkg.description?.includes("First-Run Evidence Artifact Review + Demo Capture Notes"), "package description must identify First-Run Evidence Artifact Review + Demo Capture Notes");
assert(pkg.description?.includes("First-Run Visual QA + Responsive Screenshot Evidence"), "package description must preserve First-Run Visual QA + Responsive Screenshot Evidence wording");
assert(pkg.description?.includes("Controlled First-Run Panel Mount + UI Consistency"), "package description must preserve Controlled First-Run Panel Mount + UI Consistency wording");
assert(pkg.description?.includes("First-Run UX + Workflow Clarity"), "package description must preserve First-Run UX + Workflow Clarity wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["first-run:evidence-review"] === "node scripts/first-run-evidence-review.mjs", "package.json must expose first-run:evidence-review");
assert(pkg.scripts?.["first-run:evidence-review:check"] === "node tests/first-run-evidence-review-check.mjs", "package.json must expose first-run:evidence-review:check");
assert(pkg.scripts?.["first-run:visual:evidence"] === "node scripts/first-run-visual-evidence.mjs", "package.json must preserve first-run:visual:evidence");
assert(pkg.scripts?.["first-run:visual:check"] === "node tests/first-run-visual-qa-check.mjs", "package.json must preserve first-run:visual:check");
assert(pkg.scripts?.["first-run:panel:check"] === "node tests/first-run-panel-mount-check.mjs", "package.json must preserve first-run:panel:check");
assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "scripts/first-run-evidence-review.mjs",
  "tests/first-run-evidence-review-check.mjs",
  "docs/first-run-evidence-artifact-review.md",
  "docs/first-run-demo-capture-notes.md",
  "scripts/first-run-visual-evidence.mjs",
  "tests/first-run-visual-qa-check.mjs",
  "src/components/search/FirstRunWorkflowPanel.tsx",
  "src/components/search/SearchPanel.tsx",
  "scripts/full-qa-gate.mjs",
  "scripts/release-verify.mjs",
  "tests/full-qa-gate-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const reviewScript = read("scripts/first-run-evidence-review.mjs");
for (const token of [
  "first-run.evidence-review.v1",
  "first-run-evidence-review.json",
  "first-run-visual-evidence.json",
  "full-qa-gate-report.json",
  "release-verify-report.json",
  "desktop-first-run.png",
  "tablet-first-run.png",
  "mobile-first-run.png",
  "demo_capture_notes",
  "manual_review_required",
  "Do not claim rights clearance"
]) {
  assert(reviewScript.includes(token), `evidence review script must include ${token}`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("<FirstRunWorkflowPanel />"), "SearchPanel must still mount FirstRunWorkflowPanel");
assert(searchPanel.includes("controlled first-run panel mount"), "SearchPanel must preserve controlled first-run panel mount marker");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("first-run-evidence-review"), "Full QA gate must include first-run-evidence-review");
assert(fullQaGate.includes("tests/first-run-evidence-review-check.mjs"), "Full QA gate must run first-run evidence review check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("first-run-evidence-review"), "Full QA manifest must check first-run evidence review");

const runner = read("scripts/release-verify.mjs");
assert(runner.includes("first-run:evidence-review:check"), "release verifier must include first-run:evidence-review:check");

const artifactDoc = read("docs/first-run-evidence-artifact-review.md");
for (const token of [
  "evidence artifact review",
  "first-run-evidence-review.json",
  "first-run-visual-evidence.json",
  "full-qa-gate-report.json",
  "release-verify-report.json",
  "manual review",
  "no rights clearance",
  "no private account scraping",
  "no paywall bypass",
  "no source media rehosting"
]) {
  assert(artifactDoc.includes(token), `evidence artifact review doc must include ${token}`);
}

const captureDoc = read("docs/first-run-demo-capture-notes.md");
for (const token of [
  "demo capture notes",
  "desktop",
  "tablet",
  "mobile",
  "search -> save -> review -> activation pack -> export",
  "primary search action",
  "activation pack",
  "export preview",
  "review outcome"
]) {
  assert(captureDoc.includes(token), `demo capture notes doc must include ${token}`);
}

const reviewPath = "artifacts/first-run-evidence-review.json";
if (exists(reviewPath)) {
  const review = JSON.parse(read(reviewPath));
  assert(review.schema_version === "first-run.evidence-review.v1", "review artifact must use schema v1");
  if (review.app_version !== VERSION) {
    if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run evidence review: review artifact is ${review.app_version}, expected ${VERSION}. Run npm run first-run:evidence-review to regenerate it.`);
  }
  assert(Array.isArray(review.artifact_inputs), "review artifact must include artifact_inputs");
  assert(Array.isArray(review.screenshot_inputs), "review artifact must include screenshot_inputs");
  assert(Array.isArray(review.demo_capture_notes), "review artifact must include demo_capture_notes");
  assert(review.manual_review_required === true, "review artifact must require manual review");
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run evidence review: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run evidence review: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

for (const file of [
  "docs/first-run-evidence-artifact-review.md",
  "docs/first-run-demo-capture-notes.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of [
    /rights\s+clearance\s+guaranteed/i,
    /private\s+account\s+scraping\s+enabled/i,
    /paywall\s+bypass\s+enabled/i,
    /source\s+media\s+rehosting\s+enabled/i,
    /image\s+generation\s+enabled/i,
    /new\s+provider\s+implementation/i,
    /export\s+rewrite\s+completed/i
  ]) {
    assert(!pattern.test(text), `${file} contains forbidden first-run evidence review claim pattern ${pattern}`);
  }
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.3.0"), `${file} must reference v2.3.0`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`First-Run Evidence Artifact Review + Demo Capture Notes checks passed for v${VERSION}.`);
