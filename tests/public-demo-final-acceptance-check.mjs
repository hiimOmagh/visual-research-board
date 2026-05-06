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
  console.error(`FAIL public-demo final acceptance check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "1.4.0", "package.json version must be 1.4.0");
assert(pkg.description?.includes("Public Demo Final Acceptance"), "package description must identify Public Demo Final Acceptance");
assert(pkg.description?.includes("Hosted Demo Evidence Review"), "package description must preserve Hosted Demo Evidence Review wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(pkg.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

const requiredScripts = {
  "public-demo:final:check": "node tests/public-demo-final-acceptance-check.mjs",
  "hosted-demo:evidence:check": "node tests/hosted-demo-evidence-review-check.mjs",
  "public-demo:evidence:check": "node tests/public-demo-evidence-lock-check.mjs",
  "release:warning:check": "node tests/release-warning-cleanup-check.mjs",
  "public-demo:check": "node tests/public-demo-release-candidate-check.mjs",
  "security:key:check": "node tests/security-key-handling-check.mjs"
};

for (const [scriptName, expectedCommand] of Object.entries(requiredScripts)) {
  assert(pkg.scripts?.[scriptName] === expectedCommand, `package.json must preserve ${scriptName}`);
}

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const requiredFiles = [
  "tests/public-demo-final-acceptance-check.mjs",
  "tests/hosted-demo-evidence-review-check.mjs",
  "tests/public-demo-evidence-lock-check.mjs",
  "tests/release-warning-cleanup-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/security-key-handling-check.mjs",
  "docs/public-demo-final-acceptance.md",
  "docs/final-demo-review-checklist.md",
  "docs/hosted-demo-evidence-review.md",
  "docs/hosted-demo-review-checklist.md",
  "scripts/full-qa-gate.mjs",
  "README.md",
  "PATCH_MANIFEST.md"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes(VERSION), "Full QA gate must reference current package version");
assert(fullQaGate.includes("public-demo-final-acceptance"), "Full QA gate must include public demo final acceptance");
assert(fullQaGate.includes("tests/public-demo-final-acceptance-check.mjs"), "Full QA gate must run public demo final acceptance check");
assert(fullQaGate.includes("hosted-demo-evidence-review"), "Full QA gate must preserve hosted demo evidence review");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must preserve public demo evidence lock");

const manifestCheck = read("tests/full-qa-gate-check.mjs");
assert(manifestCheck.includes(VERSION), "Full QA gate manifest check must reference current package version");
assert(manifestCheck.includes("public-demo-final-acceptance"), "Full QA gate manifest must check public demo final acceptance");

const readme = read("README.md");
assert(readme.includes("v1.4.0"), "README must mention v1.4.0");
assert(readme.includes("Public Demo Final Acceptance"), "README must mention Public Demo Final Acceptance");

const finalDoc = read("docs/public-demo-final-acceptance.md");
assert(finalDoc.includes("v1.4.0"), "final acceptance doc must mention v1.4.0");
assert(finalDoc.includes("No feature changes"), "final acceptance doc must state no feature changes");
assert(finalDoc.includes("No provider changes"), "final acceptance doc must state no provider changes");
assert(finalDoc.includes("No retrieval logic changes"), "final acceptance doc must state no retrieval logic changes");
assert(finalDoc.includes("No export behavior changes"), "final acceptance doc must state no export behavior changes");
assert(finalDoc.includes("Hosted demo URL"), "final acceptance doc must include Hosted demo URL section");

const checklist = read("docs/final-demo-review-checklist.md");
assert(checklist.includes("npm run public-demo:final:check"), "final checklist must include public-demo final check command");
assert(checklist.includes("hosted demo"), "final checklist must mention hosted demo");
assert(checklist.includes("full-qa-gate-report"), "final checklist must mention full QA artifact");

const forbiddenClaimFiles = [
  "README.md",
  "docs/public-demo.md",
  "docs/public-demo-final-acceptance.md",
  "docs/final-demo-review-checklist.md",
  "docs/hosted-demo-evidence-review.md",
  "docs/hosted-demo-review-checklist.md"
].filter(exists);

const forbiddenClaims = [
  /production-ready\s+scraping/i,
  /live\s+scraping\s+enabled/i,
  /automatic\s+legal\s+clearance/i,
  /guaranteed\s+source\s+verification/i,
  /unlimited\s+provider\s+access/i
];

for (const file of forbiddenClaimFiles) {
  const text = read(file);
  for (const pattern of forbiddenClaims) {
    assert(!pattern.test(text), `${file} contains forbidden claim pattern ${pattern}`);
  }
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN final acceptance: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN final acceptance: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
} else {
  console.warn("WARN final acceptance: artifacts/full-qa-gate-report.json is absent. Run npm run qa to produce it.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Public Demo Final Acceptance checks passed for v${VERSION}.`);
