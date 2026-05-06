import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.3";

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function fail(message) {
  console.error(`FAIL public-demo evidence lock check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.version === VERSION, `package.json version must be ${VERSION}`);
assert(packageJson.description?.includes("Public Demo Evidence Lock"), "package description must identify Public Demo Evidence Lock");
assert(packageJson.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(packageJson.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(packageJson.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

const expectedScripts = {
  "public-demo:evidence:check": "node tests/public-demo-evidence-lock-check.mjs",
  "release:warning:check": "node tests/release-warning-cleanup-check.mjs",
  "public-demo:check": "node tests/public-demo-release-candidate-check.mjs",
  "security:key:check": "node tests/security-key-handling-check.mjs"
};

for (const [scriptName, expectedCommand] of Object.entries(expectedScripts)) {
  assert(packageJson.scripts?.[scriptName] === expectedCommand, `${scriptName} must equal ${expectedCommand}`);
}

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, `package-lock.json version must be ${VERSION}`);
  assert(lock.packages?.[""]?.version === VERSION, `package-lock root package version must be ${VERSION}`);
}

const requiredFiles = [
  "docs/public-demo-evidence-lock.md",
  "docs/release-evidence-lock.md",
  "docs/public-demo.md",
  "docs/release-candidate-checklist.md",
  "tests/public-demo-evidence-lock-check.mjs",
  "tests/release-warning-cleanup-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "scripts/full-qa-gate.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must include public-demo evidence lock");
assert(fullQaGate.includes("tests/public-demo-evidence-lock-check.mjs"), "Full QA gate must run public demo evidence lock check");
assert(fullQaGate.includes(VERSION), "Full QA gate must reference v0.8.3");

const fullQaGateCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaGateCheck.includes(VERSION), "Full QA gate manifest check must reference v0.8.3");
assert(fullQaGateCheck.includes("public-demo-evidence-lock"), "Full QA gate manifest check must expect public-demo evidence lock");

const publicDemoEvidenceDoc = read("docs/public-demo-evidence-lock.md");
assert(publicDemoEvidenceDoc.includes("Public Demo Evidence Lock"), "public demo evidence doc must name the lock");
assert(publicDemoEvidenceDoc.includes("no feature changes"), "public demo evidence doc must state no feature changes");
assert(publicDemoEvidenceDoc.includes("full-qa-gate-report"), "public demo evidence doc must reference the full QA evidence artifact");

const releaseEvidenceDoc = read("docs/release-evidence-lock.md");
assert(releaseEvidenceDoc.includes("npm run public-demo:evidence:check"), "release evidence doc must include public-demo evidence check command");
assert(releaseEvidenceDoc.includes("npm run qa"), "release evidence doc must include full QA command");

const forbiddenClaims = [
  /new provider/i,
  /new scraping/i,
  /production OAuth/i,
  /automatic legal clearance/i,
  /guaranteed source verification/i
];

for (const file of ["docs/public-demo-evidence-lock.md", "docs/release-evidence-lock.md"]) {
  const text = read(file);
  for (const pattern of forbiddenClaims) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      const index = text.indexOf(match);
      const context = text.slice(Math.max(0, index - 80), Math.min(text.length, index + match.length + 120));
      assert(/no|not|forbid|non-goal|without/i.test(context), file + " contains unsafe evidence-lock claim: " + match);
    }
  }
}

if (exists("artifacts/full-qa-gate-report.json")) {
  const report = JSON.parse(read("artifacts/full-qa-gate-report.json"));
  if (report.app_version === VERSION) {  if (report.status !== "passed") console.warn(`WARN public-demo evidence lock: full QA artifact status is ${report.status}. Run npm run qa to regenerate it.`);  if (report.failed_gate_count !== 0) console.warn(`WARN public-demo evidence lock: full QA artifact failed_gate_count is ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Public Demo Evidence Lock checks passed for v0.8.3.");
