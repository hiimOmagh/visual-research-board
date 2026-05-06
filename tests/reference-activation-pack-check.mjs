
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
  console.error(`FAIL reference activation pack check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.0.1", "package.json version must be 2.0.1");
assert(pkg.description?.includes("Reference Activation Pack MVP"), "package description must identify Reference Activation Pack MVP");
assert(pkg.description?.includes("Book / Bibliographic Discovery Layer"), "package description must preserve Book / Bibliographic Discovery Layer wording");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must preserve Social Reference Discovery Layer wording");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["reference-activation:check"] === "node tests/reference-activation-pack-check.mjs", "package.json must expose reference-activation:check");
assert(pkg.scripts?.["book-reference:check"] === "node tests/book-bibliographic-discovery-check.mjs", "package.json must preserve book-reference:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.0.1"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.0.1"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/reference-activation-pack.ts",
  "src/lib/reference-activation-pack.ts",
  "src/components/search/ReferenceActivationPackPanel.tsx",
  "tests/reference-activation-pack-check.mjs",
  "docs/reference-activation-pack.md",
  "docs/reference-activation-safety-boundaries.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/reference-activation-pack.ts");
for (const token of [
  "ReferenceActivationPack",
  "ReferenceActivationPackInput",
  "ReferenceActivationSource",
  "ReferenceActivationPackSection",
  "research_brief",
  "visual_direction",
  "creative_brief",
  "source_map",
  "claim_context_pack"
]) {
  assert(types.includes(token), `reference activation types must include ${token}`);
}

const lib = read("src/lib/reference-activation-pack.ts");
for (const token of [
  "createReferenceActivationPack",
  "createReferenceActivationSource",
  "inferReferenceActivationSourceRole",
  "createActivationSummary",
  "createRiskAccessNotes",
  "createActivationNextSteps",
  "No image generation",
  "No scraping",
  "copyrighted text extraction",
  "paywall bypass"
]) {
  assert(lib.includes(token), `reference activation lib must include ${token}`);
}

const panel = read("src/components/search/ReferenceActivationPackPanel.tsx");
for (const token of [
  "ReferenceActivationPackPanel",
  "Reference activation pack",
  "Metadata / brief text",
  "does not perform image generation",
  "scraping",
  "copyrighted text extraction",
  "paywall bypass"
]) {
  assert(panel.includes(token), `reference activation panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("reference-activation-pack"), "Full QA gate must include reference activation pack gate");
assert(fullQaGate.includes("tests/reference-activation-pack-check.mjs"), "Full QA gate must run reference activation pack check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("reference-activation-pack"), "Full QA gate manifest must check reference activation pack gate");

const activationDoc = read("docs/reference-activation-pack.md");
assert(activationDoc.includes("activation-ready"), "activation doc must mention activation-ready packs");
assert(activationDoc.includes("No image generation"), "activation doc must forbid image generation");
assert(activationDoc.includes("No scraping"), "activation doc must forbid scraping");
assert(activationDoc.includes("No copyrighted text extraction"), "activation doc must forbid copyrighted text extraction");
assert(activationDoc.includes("No paywall bypass"), "activation doc must forbid paywall bypass");

const boundariesDoc = read("docs/reference-activation-safety-boundaries.md");
for (const token of ["allowed", "forbidden", "metadata", "brief text", "rights/access review"]) {
  assert(boundariesDoc.includes(token), `activation boundary doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.(mjs|py)$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN reference activation pack: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN reference activation pack: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Reference Activation Pack MVP checks passed for v${VERSION}.`);
