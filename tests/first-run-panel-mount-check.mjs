
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL first-run panel mount check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.5", "package.json version must be 2.1.5");
assert(pkg.description?.includes("Controlled First-Run Panel Mount + UI Consistency"), "package description must identify Controlled First-Run Panel Mount + UI Consistency");
assert(pkg.description?.includes("First-Run UX + Workflow Clarity"), "package description must preserve First-Run UX + Workflow Clarity wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["first-run:panel:check"] === "node tests/first-run-panel-mount-check.mjs", "package.json must expose first-run:panel:check");
assert(pkg.scripts?.["first-run:ux:check"] === "node tests/first-run-ux-workflow-check.mjs", "package.json must preserve first-run:ux:check");
assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "src/components/search/FirstRunWorkflowPanel.tsx",
  "src/components/search/SearchPanel.tsx",
  "tests/first-run-panel-mount-check.mjs",
  "docs/controlled-first-run-panel-mount.md",
  "docs/ui-consistency-first-run-checklist.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes('import { FirstRunWorkflowPanel } from "./FirstRunWorkflowPanel";'), "SearchPanel must import FirstRunWorkflowPanel");
assert(searchPanel.includes("<FirstRunWorkflowPanel />"), "SearchPanel must mount FirstRunWorkflowPanel");
assert(searchPanel.includes("v2.1.5 controlled first-run panel mount"), "SearchPanel must contain controlled mount marker");

const component = read("src/components/search/FirstRunWorkflowPanel.tsx");
for (const token of [
  "data-testid=\"first-run-workflow-panel\"",
  "First-run workflow",
  "Next action:",
  "When the board is empty",
  "Boundaries"
]) {
  assert(component.includes(token), `FirstRunWorkflowPanel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("first-run-panel-mount"), "Full QA gate must include first-run-panel-mount");
assert(fullQaGate.includes("tests/first-run-panel-mount-check.mjs"), "Full QA gate must run first-run panel mount check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("first-run-panel-mount"), "Full QA manifest must check first-run panel mount");

const runner = read("scripts/release-verify.mjs");
assert(runner.includes("first-run:panel:check"), "release verifier must include first-run:panel:check");

const doc = read("docs/controlled-first-run-panel-mount.md");
for (const token of [
  "controlled mount",
  "SearchPanel",
  "FirstRunWorkflowPanel",
  "import section",
  "responsive visibility",
  "no regex-blind JSX corruption",
  "no provider expansion",
  "no export rewrite"
]) {
  assert(doc.includes(token), `controlled first-run panel mount doc must include ${token}`);
}

const checklist = read("docs/ui-consistency-first-run-checklist.md");
for (const token of [
  "desktop",
  "mobile",
  "first-run panel visible",
  "primary action",
  "empty-state",
  "activation pack",
  "export preview",
  "review outcome"
]) {
  assert(checklist.includes(token), `UI consistency checklist must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.1.5"), `${file} must reference v2.1.5`);
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN first-run panel mount: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN first-run panel mount: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Controlled First-Run Panel Mount + UI Consistency checks passed for v${VERSION}.`);
