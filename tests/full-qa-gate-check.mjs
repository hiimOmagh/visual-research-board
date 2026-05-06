import path from "node:path";
import fs from "node:fs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(path) { return readFileSync(join(root, path), "utf8"); }

const requiredFiles = [
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "docs/full-qa-gate.md",
  "docs/release-checklist.md",
  "docs/validation-report.md",
  ".github/workflows/ci.yml"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing full QA gate file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.1.0", "package.json version must be 1.1.0");
assert(pkg.description.includes("Public Demo Release Candidate"), "package description must identify Public Demo Release Candidate");
assert(pkg.scripts?.qa === "node scripts/full-qa-gate.mjs", "npm run qa must delegate to scripts/full-qa-gate.mjs");
assert(pkg.scripts?.["qa:list"] === "node scripts/full-qa-gate.mjs --list", "package.json must expose npm run qa:list");
assert(pkg.scripts?.["qa:baseline"]?.includes("--category=baseline"), "package.json must expose baseline QA category");
assert(pkg.scripts?.["qa:retrieval"]?.includes("--category=retrieval"), "package.json must expose retrieval QA category");
assert(pkg.scripts?.["qa:providers"]?.includes("--category=providers"), "package.json must expose providers QA category");
assert(pkg.scripts?.["qa:security"]?.includes("--category=security"), "package.json must expose security QA category");
assert(pkg.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must expose npm run public-demo:check");
assert(pkg.scripts?.["qa:public-demo"]?.includes("--category=public-demo"), "package.json must expose public-demo QA category");
assert(pkg.scripts?.["qa:workflow"]?.includes("--category=workflow"), "package.json must expose workflow QA category");
assert(pkg.scripts?.["qa:exports"]?.includes("--category=exports"), "package.json must expose exports QA category");
assert(pkg.scripts?.["qa:release"]?.includes("--category=release"), "package.json must expose release QA category");
assert(pkg.scripts?.["full:qa:check"] === "node tests/full-qa-gate-check.mjs", "package.json must expose npm run full:qa:check");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run qa"), "test:ci:no-browser must run the full QA gate");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run typecheck"), "test:ci:no-browser must run typecheck");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run lint"), "test:ci:no-browser must run lint");

const fullGate = read("scripts/full-qa-gate.mjs");
const expectedCategories = ["baseline", "retrieval", "providers", "security", "public-demo", "workflow", "exports", "release"];
for (const category of expectedCategories) assert(fullGate.includes(`category: "${category}"`), `full QA gate must include ${category} category`);
const expectedChecks = [
  "tests/qa-check.mjs",
  "tests/normalization-check.mjs",
  "tests/e2e-fixture-check.mjs",
  "tests/provider-smoke-check.mjs",
  "tests/library-conflict-check.mjs",
  "tests/broad-retrieval-check.mjs",
  "tests/retrieval-evidence-check.mjs",
  "tests/provider-runtime-pack-check.mjs",
  "tests/retrieval-calibration-check.mjs",
  "tests/retrieval-autotuning-check.mjs",
  "tests/deployed-browser-evidence-check.mjs",
  "tests/real-topic-matrix-check.mjs",
  "tests/evidence-driven-tuning-check.mjs",
  "tests/lockfile-registry-check.mjs",
  "tests/provider-result-inspector-check.mjs",
  "tests/manual-quality-review-check.mjs",
  "tests/review-evidence-feedback-check.mjs",
  "tests/free-image-retrieval-check.mjs",
  "tests/normalization-dedupe-check.mjs",
  "tests/query-routing-check.mjs",
  "tests/ranking-explainability-check.mjs",
  "tests/project-review-memory-check.mjs",
  "tests/board-organization-check.mjs",
  "tests/claim-mapping-check.mjs",
  "tests/coverage-bias-check.mjs",
  "tests/evidence-pack-export-check.mjs",
  "tests/attribution-generator-check.mjs",
  "tests/ux-reliability-check.mjs",
  "tests/storage-hardening-check.mjs",
  "tests/museum-open-access-provider-pack-check.mjs",
  "tests/stock-illustrative-provider-pack-check.mjs",
  "tests/security-key-handling-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/full-qa-gate-check.mjs"
];
for (const check of expectedChecks) assert(fullGate.includes(check), `full QA gate must include ${check}`);
assert(fullGate.includes("artifacts/full-qa-gate-report.json"), "full QA gate must write a report artifact");
assert(fullGate.includes("--category="), "full QA gate must support category execution");
assert(fullGate.includes("--list"), "full QA gate must support list mode");
assert(fullGate.includes('schema_version: "1.1.0"'), "full QA gate report schema must identify v1.1.0");

const ci = read(".github/workflows/ci.yml");
assert(ci.includes("npm run test:ci:no-browser"), "CI must run the consolidated no-browser CI gate");
assert(ci.includes("npm run build"), "CI must still run runtime build");
assert(ci.includes("actions/upload-artifact"), "CI must upload full QA evidence artifacts");
assert(ci.includes("full-qa-gate-report"), "CI artifact name must identify the full QA gate report");

const docs = read("docs/full-qa-gate.md");
for (const token of ["v1.1.0", "npm run qa", "npm run qa:list", "qa:baseline", "qa:retrieval", "qa:providers", "qa:security", "qa:public-demo", "qa:workflow", "qa:exports", "qa:release", "artifacts/full-qa-gate-report.json"]) {
  assert(docs.includes(token), `full QA docs must include ${token}`);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const release = read("docs/release-checklist.md");
assert(release.includes("v1.1.0"), "release checklist must identify v1.1.0");
assert(release.includes("npm run test:ci:no-browser"), "release checklist must include no-browser CI gate");
assert(release.includes("artifacts/full-qa-gate-report.json"), "release checklist must mention full QA artifact");

const validation = read("docs/validation-report.md");
assert(validation.includes("Visual Research Board v1.1.0"), "validation report must identify v1.1.0");
assert(validation.includes("Public Demo Release Candidate"), "validation report must describe the public demo release candidate");
assert(validation.includes("artifacts/full-qa-gate-report.json"), "validation report must mention the QA artifact");

const readme = read("README.md");
assert(readme.includes("Visual Research Board v1.1.0"), "README must identify v1.1.0");
assert(readme.includes("Public Demo Release Candidate"), "README must identify the release capability");
assert(readme.includes("npm run qa:list"), "README must document qa:list");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v1.1.0"), "PATCH_MANIFEST must identify v1.1.0");
assert(manifest.includes("Public Demo Release Candidate"), "PATCH_MANIFEST must identify the release capability");
assert(manifest.includes("scripts/full-qa-gate.mjs"), "PATCH_MANIFEST must list the full QA script");

if (failures.length) {
  console.error("Full QA gate checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const hostedDemoEvidenceReviewSource = read("scripts/full-qa-gate.mjs");
assert(hostedDemoEvidenceReviewSource.includes("hosted-demo-evidence-review"), "Full QA gate must include hosted demo evidence review");
assert(hostedDemoEvidenceReviewSource.includes("tests/hosted-demo-evidence-review-check.mjs"), "Full QA gate must run hosted demo evidence review check");

const packageForHostedDemoEvidence = JSON.parse(read("package.json"));
assert(packageForHostedDemoEvidence.scripts?.["hosted-demo:evidence:check"] === "node tests/hosted-demo-evidence-review-check.mjs", "package.json must expose hosted-demo:evidence:check");
assert(exists("tests/hosted-demo-evidence-review-check.mjs"), "hosted demo evidence review check file must exist");
assert(exists("docs/hosted-demo-evidence-review.md"), "hosted demo evidence review doc must exist");
assert(exists("docs/hosted-demo-review-checklist.md"), "hosted demo review checklist doc must exist");

const publicDemoFinalAcceptanceSource = read("scripts/full-qa-gate.mjs");
assert(publicDemoFinalAcceptanceSource.includes("public-demo-final-acceptance"), "Full QA gate must include public demo final acceptance");
assert(publicDemoFinalAcceptanceSource.includes("tests/public-demo-final-acceptance-check.mjs"), "Full QA gate must run public demo final acceptance check");

const packageForPublicDemoFinalAcceptance = JSON.parse(read("package.json"));
assert(packageForPublicDemoFinalAcceptance.scripts?.["public-demo:final:check"] === "node tests/public-demo-final-acceptance-check.mjs", "package.json must expose public-demo:final:check");
assert(exists("tests/public-demo-final-acceptance-check.mjs"), "public demo final acceptance check file must exist");
assert(exists("docs/public-demo-final-acceptance.md"), "public demo final acceptance doc must exist");
assert(exists("docs/final-demo-review-checklist.md"), "final demo review checklist doc must exist");

const publicDemoStableReleaseGateSource = read("scripts/full-qa-gate.mjs");
assert(publicDemoStableReleaseGateSource.includes("public-demo-stable-release"), "Full QA gate must include public demo stable release");
assert(publicDemoStableReleaseGateSource.includes("tests/public-demo-stable-release-check.mjs"), "Full QA gate must run public demo stable release check");

const packageForPublicDemoStableRelease = JSON.parse(read("package.json"));
assert(packageForPublicDemoStableRelease.scripts?.["public-demo:stable:check"] === "node tests/public-demo-stable-release-check.mjs", "package.json must expose public-demo:stable:check");
assert(exists("tests/public-demo-stable-release-check.mjs"), "public demo stable release check file must exist");
assert(exists("docs/public-demo-stable-release.md"), "public demo stable release doc must exist");
assert(exists("docs/stable-release-checklist.md"), "stable release checklist doc must exist");

const referenceIntelligenceGateSource = read("scripts/full-qa-gate.mjs");
assert(referenceIntelligenceGateSource.includes("reference-intelligence"), "Full QA gate must include reference intelligence");
assert(referenceIntelligenceGateSource.includes("tests/reference-intelligence-check.mjs"), "Full QA gate must run reference intelligence check");

const packageForReferenceIntelligence = JSON.parse(read("package.json"));
assert(packageForReferenceIntelligence.scripts?.["reference:intelligence:check"] === "node tests/reference-intelligence-check.mjs", "package.json must expose reference:intelligence:check");
assert(exists("tests/reference-intelligence-check.mjs"), "reference intelligence check file must exist");
assert(exists("src/types/reference-intelligence.ts"), "reference intelligence types must exist");
assert(exists("src/lib/reference-intelligence.ts"), "reference intelligence lib must exist");
assert(exists("src/components/search/ReferenceIntelligencePanel.tsx"), "reference intelligence panel must exist");
assert(exists("docs/reference-intelligence-layer.md"), "reference intelligence layer doc must exist");

console.log("Full QA Gate checks passed for v1.1.0.");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must include public-demo evidence lock");
assert(fullQaGate.includes("tests/public-demo-evidence-lock-check.mjs"), "Full QA gate must run public demo evidence lock check");
