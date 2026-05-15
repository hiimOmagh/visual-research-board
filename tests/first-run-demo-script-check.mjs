import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL first-run demo script check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.2.0", "package.json version must be 2.2.0");
assert(pkg.description?.includes("First-Run Demo Script + Public Walkthrough Copy"), "package description must identify First-Run Demo Script + Public Walkthrough Copy");
assert(pkg.description?.includes("First-Run Evidence Artifact Review + Demo Capture Notes"), "package description must preserve First-Run Evidence Artifact Review + Demo Capture Notes wording");
assert(pkg.description?.includes("First-Run Visual QA + Responsive Screenshot Evidence"), "package description must preserve First-Run Visual QA + Responsive Screenshot Evidence wording");
assert(pkg.description?.includes("Controlled First-Run Panel Mount + UI Consistency"), "package description must preserve Controlled First-Run Panel Mount + UI Consistency wording");
assert(pkg.description?.includes("First-Run UX + Workflow Clarity"), "package description must preserve First-Run UX + Workflow Clarity wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["first-run:demo-script"] === "node scripts/first-run-demo-script.mjs", "package.json must expose first-run:demo-script");
assert(pkg.scripts?.["first-run:demo-script:check"] === "node tests/first-run-demo-script-check.mjs", "package.json must expose first-run:demo-script:check");
assert(pkg.scripts?.["first-run:evidence-review"] === "node scripts/first-run-evidence-review.mjs", "package.json must preserve first-run:evidence-review");
assert(pkg.scripts?.["first-run:evidence-review:check"] === "node tests/first-run-evidence-review-check.mjs", "package.json must preserve first-run:evidence-review:check");
assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "scripts/first-run-demo-script.mjs",
  "tests/first-run-demo-script-check.mjs",
  "docs/first-run-demo-script.md",
  "docs/public-walkthrough-copy.md",
  "scripts/first-run-evidence-review.mjs",
  "tests/first-run-evidence-review-check.mjs",
  "src/components/search/FirstRunWorkflowPanel.tsx",
  "src/components/search/SearchPanel.tsx",
  "scripts/full-qa-gate.mjs",
  "scripts/release-verify.mjs",
  "tests/full-qa-gate-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const demoScriptSource = read("scripts/first-run-demo-script.mjs");
for (const token of [
  "first-run.demo-script.v1",
  "first-run-demo-script.json",
  "walkthrough_steps",
  "public_walkthrough_copy",
  "open-clean-board",
  "search-reference-topic",
  "save-useful-reference",
  "review-reference",
  "activation-pack",
  "export-preview",
  "No rights clearance guarantee",
  "No private account scraping",
  "No paywall bypass",
  "No source media rehosting"
]) {
  assert(demoScriptSource.includes(token), `demo script generator must include ${token}`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("<FirstRunWorkflowPanel />"), "SearchPanel must still mount FirstRunWorkflowPanel");
assert(searchPanel.includes("controlled first-run panel mount"), "SearchPanel must preserve controlled first-run panel mount marker");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("first-run-demo-script"), "Full QA gate must include first-run-demo-script");
assert(fullQaGate.includes("tests/first-run-demo-script-check.mjs"), "Full QA gate must run first-run demo script check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("first-run-demo-script"), "Full QA manifest must check first-run demo script");

const runner = read("scripts/release-verify.mjs");
assert(runner.includes("first-run:demo-script:check"), "release verifier must include first-run:demo-script:check");

const demoDoc = read("docs/first-run-demo-script.md");
for (const token of [
  "first-run demo script",
  "search -> save -> review -> activation pack -> export",
  "clean board",
  "first-run panel",
  "primary search action",
  "activation pack",
  "export preview",
  "No rights clearance guarantee",
  "No private account scraping",
  "No paywall bypass"
]) {
  assert(demoDoc.includes(token), `first-run demo script doc must include ${token}`);
}

const publicCopy = read("docs/public-walkthrough-copy.md");
for (const token of [
  "public walkthrough copy",
  "source-aware visual reference board",
  "Search",
  "Save",
  "Review",
  "Activate",
  "Export",
  "not rights-cleared",
  "human editorial review",
  "call to action"
]) {
  assert(publicCopy.includes(token), `public walkthrough copy doc must include ${token}`);
}

const artifactPath = "artifacts/first-run-demo-script.json";
if (exists(artifactPath)) {
  const artifact = JSON.parse(read(artifactPath));
  assert(artifact.schema_version === "first-run.demo-script.v1", "demo script artifact must use schema v1");
  if (artifact.app_version !== VERSION) {
    if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run demo script: artifact is ${artifact.app_version}, expected ${VERSION}. Run npm run first-run:demo-script to regenerate it.`);
  }
  assert(Array.isArray(artifact.walkthrough_steps), "demo script artifact must include walkthrough_steps");
  assert(artifact.walkthrough_steps.length >= 6, "demo script artifact must include at least six walkthrough steps");
  assert(artifact.public_walkthrough_copy?.headline, "demo script artifact must include public walkthrough headline");
  assert(Array.isArray(artifact.boundaries), "demo script artifact must include boundaries");
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run demo script: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN first-run demo script: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

for (const file of [
  "docs/first-run-demo-script.md",
  "docs/public-walkthrough-copy.md",
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
    assert(!pattern.test(text), `${file} contains forbidden first-run demo script claim pattern ${pattern}`);
  }
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.2.0"), `${file} must reference v2.2.0`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`First-Run Demo Script + Public Walkthrough Copy checks passed for v${VERSION}.`);
