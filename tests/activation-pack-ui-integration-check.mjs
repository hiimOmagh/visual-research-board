
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
  console.error(`FAIL activation pack UI integration check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.0.5", "package.json version must be 2.0.5");
assert(pkg.description?.includes("Activation Pack UI Integration"), "package description must identify Activation Pack UI Integration");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Book / Bibliographic Discovery Layer"), "package description must preserve Book / Bibliographic Discovery Layer wording");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must preserve Social Reference Discovery Layer wording");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["activation-pack:ui:check"] === "node tests/activation-pack-ui-integration-check.mjs", "package.json must expose activation-pack:ui:check");
assert(pkg.scripts?.["reference-activation:check"] === "node tests/reference-activation-pack-check.mjs", "package.json must preserve reference-activation:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.0.5"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.0.5"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/activation-pack-ui.ts",
  "src/lib/activation-pack-ui.ts",
  "src/components/search/ActivationPackWorkflowPanel.tsx",
  "tests/activation-pack-ui-integration-check.mjs",
  "docs/activation-pack-ui-integration.md",
  "docs/activation-pack-ui-workflow.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/activation-pack-ui.ts");
for (const token of [
  "ActivationPackUiInput",
  "ActivationPackUiModel",
  "ActivationPackUiMode",
  "board",
  "selected",
  "empty",
  "review",
  "ReferenceActivationPack"
]) {
  assert(types.includes(token), `activation pack UI types must include ${token}`);
}

const lib = read("src/lib/activation-pack-ui.ts");
for (const token of [
  "createActivationPackUiModel",
  "selectActivationResults",
  "resolveActivationPackUiMode",
  "createActivationPackEmptyState",
  "createActivationPackGuidanceNotes",
  "createReferenceActivationPack",
  "No scraping",
  "image generation",
  "copyrighted text extraction",
  "paywall bypass"
]) {
  assert(lib.includes(token), `activation pack UI lib must include ${token}`);
}

const panel = read("src/components/search/ActivationPackWorkflowPanel.tsx");
for (const token of [
  "ActivationPackWorkflowPanel",
  "Activation pack workflow",
  "Activation-ready board workflow",
  "ReferenceActivationPackPanel",
  "does not generate images",
  "scrape sources",
  "extract copyrighted text",
  "bypass paywalls",
  "only organizes existing board references"
]) {
  assert(panel.includes(token), `activation pack workflow panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("activation-pack-ui-integration"), "Full QA gate must include activation pack UI integration gate");
assert(fullQaGate.includes("tests/activation-pack-ui-integration-check.mjs"), "Full QA gate must run activation pack UI integration check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("activation-pack-ui-integration"), "Full QA gate manifest must check activation pack UI integration gate");

const activationDoc = read("docs/activation-pack-ui-integration.md");
assert(activationDoc.includes("Activation-ready"), "activation UI doc must mention activation-ready workflow");
assert(activationDoc.includes("No image generation"), "activation UI doc must forbid image generation");
assert(activationDoc.includes("No scraping"), "activation UI doc must forbid scraping");
assert(activationDoc.includes("No copyrighted text extraction"), "activation UI doc must forbid copyrighted text extraction");
assert(activationDoc.includes("No export expansion"), "activation UI doc must forbid export expansion");

const workflowDoc = read("docs/activation-pack-ui-workflow.md");
for (const token of ["allowed", "forbidden", "selection", "board references", "rights/access review"]) {
  assert(workflowDoc.includes(token), `activation UI workflow doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.(mjs|py)$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN activation pack UI integration: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN activation pack UI integration: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Activation Pack UI Integration checks passed for v${VERSION}.`);
