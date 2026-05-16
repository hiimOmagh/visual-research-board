
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
  console.error(`FAIL activation pack export integration check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.4.0", "package.json version must be 2.4.0");
assert(pkg.description?.includes("Activation Pack Export Integration"), "package description must identify Activation Pack Export Integration");
assert(pkg.description?.includes("Activation Pack Export Preview"), "package description must preserve Activation Pack Export Preview wording");
assert(pkg.description?.includes("Activation Pack UI Integration"), "package description must preserve Activation Pack UI Integration wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Book / Bibliographic Discovery Layer"), "package description must preserve Book / Bibliographic Discovery Layer wording");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must preserve Social Reference Discovery Layer wording");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["activation-pack:export:check"] === "node tests/activation-pack-export-integration-check.mjs", "package.json must expose activation-pack:export:check");
assert(pkg.scripts?.["activation-pack:export-preview:check"] === "node tests/activation-pack-export-preview-check.mjs", "package.json must preserve activation-pack:export-preview:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.4.0"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.4.0"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/activation-pack-export-integration.ts",
  "src/lib/activation-pack-export-integration.ts",
  "src/components/search/ActivationPackExportIntegrationPanel.tsx",
  "tests/activation-pack-export-integration-check.mjs",
  "docs/activation-pack-export-integration.md",
  "docs/activation-pack-export-integration-boundaries.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/activation-pack-export-integration.ts");
for (const token of [
  "ActivationPackExportPayload",
  "ActivationPackExportIntegrationInput",
  "ActivationPackExportIntegrationState",
  "markdown",
  "json",
  "ReferenceActivationPack"
]) {
  assert(types.includes(token), `activation pack export integration types must include ${token}`);
}

const lib = read("src/lib/activation-pack-export-integration.ts");
for (const token of [
  "createActivationPackExportPayload",
  "createActivationPackExportIntegrationState",
  "createActivationPackExportFilename",
  "listActivationPackExportFormats",
  "createActivationPackExportPreview",
  "Metadata/brief-text export only",
  "no broad export system rewrite",
  "Markdown and JSON only",
  "source media rehosting"
]) {
  assert(lib.includes(token), `activation pack export integration lib must include ${token}`);
}

const panel = read("src/components/search/ActivationPackExportIntegrationPanel.tsx");
for (const token of [
  "ActivationPackExportIntegrationPanel",
  "Activation pack export integration",
  "downloadTextFile",
  "Markdown",
  "JSON",
  "metadata/brief-text only",
  "does not rewrite exports",
  "scrape sources",
  "generate images",
  "extract copyrighted text",
  "bypass paywalls",
  "rehost source media"
]) {
  assert(panel.includes(token), `activation pack export integration panel must include ${token}`);
}

if (exists("src/components/search/ActivationPackWorkflowPanel.tsx")) {
  const workflowPanel = read("src/components/search/ActivationPackWorkflowPanel.tsx");
  assert(workflowPanel.includes("ActivationPackExportIntegrationPanel"), "ActivationPackWorkflowPanel must include export integration panel");
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("activation-pack-export-integration"), "Full QA gate must include activation pack export integration gate");
assert(fullQaGate.includes("tests/activation-pack-export-integration-check.mjs"), "Full QA gate must run activation pack export integration check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("activation-pack-export-integration"), "Full QA gate manifest must check activation pack export integration gate");

const integrationDoc = read("docs/activation-pack-export-integration.md");
assert(integrationDoc.includes("metadata/brief-text"), "activation export integration doc must mention metadata/brief-text");
assert(integrationDoc.includes("Markdown"), "activation export integration doc must mention Markdown");
assert(integrationDoc.includes("JSON"), "activation export integration doc must mention JSON");
assert(integrationDoc.includes("No export system rewrite"), "activation export integration doc must forbid export rewrite");
assert(integrationDoc.includes("No source media rehosting"), "activation export integration doc must forbid source media rehosting");

const boundariesDoc = read("docs/activation-pack-export-integration-boundaries.md");
for (const token of ["allowed", "forbidden", "existing text download utilities", "metadata", "rights/access review"]) {
  assert(boundariesDoc.includes(token), `activation export integration boundary doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.(mjs|py)$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN activation pack export integration: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN activation pack export integration: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Activation Pack Export Integration checks passed for v${VERSION}.`);
