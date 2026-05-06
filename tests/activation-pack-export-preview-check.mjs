
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
  console.error(`FAIL activation pack export preview check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "1.8.0", "package.json version must be 1.8.0");
assert(pkg.description?.includes("Activation Pack Export Preview"), "package description must identify Activation Pack Export Preview");
assert(pkg.description?.includes("Activation Pack UI Integration"), "package description must preserve Activation Pack UI Integration wording");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must preserve Reference Activation Pack MVP wording");
assert(pkg.description?.includes("Book / Bibliographic Discovery Layer"), "package description must preserve Book / Bibliographic Discovery Layer wording");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must preserve Social Reference Discovery Layer wording");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["activation-pack:export-preview:check"] === "node tests/activation-pack-export-preview-check.mjs", "package.json must expose activation-pack:export-preview:check");
assert(pkg.scripts?.["activation-pack:ui:check"] === "node tests/activation-pack-ui-integration-check.mjs", "package.json must preserve activation-pack:ui:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^1.8.0"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^1.8.0"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/activation-pack-export-preview.ts",
  "src/lib/activation-pack-export-preview.ts",
  "src/components/search/ActivationPackExportPreviewPanel.tsx",
  "tests/activation-pack-export-preview-check.mjs",
  "docs/activation-pack-export-preview.md",
  "docs/activation-pack-export-preview-boundaries.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/activation-pack-export-preview.ts");
for (const token of [
  "ActivationPackExportPreview",
  "ActivationPackExportPreviewInput",
  "ActivationPackExportPreviewFormat",
  "markdown",
  "json",
  "ReferenceActivationPack"
]) {
  assert(types.includes(token), `activation pack export preview types must include ${token}`);
}

const lib = read("src/lib/activation-pack-export-preview.ts");
for (const token of [
  "createActivationPackExportPreview",
  "createActivationPackMarkdownPreview",
  "createActivationPackJsonPreview",
  "listActivationPackPreviewFormats",
  "Preview only",
  "No broad export system rewrite",
  "No new download behavior",
  "No scraping",
  "No image generation",
  "copyrighted text extraction",
  "paywall bypass"
]) {
  assert(lib.includes(token), `activation pack export preview lib must include ${token}`);
}

const panel = read("src/components/search/ActivationPackExportPreviewPanel.tsx");
for (const token of [
  "ActivationPackExportPreviewPanel",
  "Activation pack export preview",
  "structured Markdown or JSON",
  "preview-only",
  "does not add file downloads",
  "rewrite exports",
  "scrape sources",
  "generate images",
  "extract copyrighted text",
  "bypass paywalls"
]) {
  assert(panel.includes(token), `activation pack export preview panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("activation-pack-export-preview"), "Full QA gate must include activation pack export preview gate");
assert(fullQaGate.includes("tests/activation-pack-export-preview-check.mjs"), "Full QA gate must run activation pack export preview check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("activation-pack-export-preview"), "Full QA gate manifest must check activation pack export preview gate");

const previewDoc = read("docs/activation-pack-export-preview.md");
assert(previewDoc.includes("Preview-only"), "activation export preview doc must mention preview-only");
assert(previewDoc.includes("Markdown"), "activation export preview doc must mention Markdown");
assert(previewDoc.includes("JSON"), "activation export preview doc must mention JSON");
assert(previewDoc.includes("No broad export system rewrite"), "activation export preview doc must forbid export rewrite");
assert(previewDoc.includes("No file download expansion"), "activation export preview doc must forbid file download expansion");

const boundariesDoc = read("docs/activation-pack-export-preview-boundaries.md");
for (const token of ["allowed", "forbidden", "preview text", "metadata", "rights/access review"]) {
  assert(boundariesDoc.includes(token), `activation export preview boundary doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.(mjs|py)$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN activation pack export preview: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN activation pack export preview: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Activation Pack Export Preview checks passed for v${VERSION}.`);
