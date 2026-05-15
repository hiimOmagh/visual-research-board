import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const VERSION = "2.1.11";

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
  console.error(`FAIL hosted-demo evidence review check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));

assert(pkg.version === VERSION, `package.json version must be ${VERSION}`);
assert(pkg.description?.includes("Hosted Demo Evidence Review"), "package description must identify Hosted Demo Evidence Review");
assert(pkg.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["hosted-demo:evidence:check"] === "node tests/hosted-demo-evidence-review-check.mjs", "package.json must expose hosted-demo:evidence:check");
assert(pkg.scripts?.["public-demo:evidence:check"] === "node tests/public-demo-evidence-lock-check.mjs", "package.json must preserve public-demo:evidence:check");
assert(pkg.scripts?.["release:warning:check"] === "node tests/release-warning-cleanup-check.mjs", "package.json must preserve release:warning:check");
assert(pkg.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must preserve public-demo:check");
assert(pkg.scripts?.["security:key:check"] === "node tests/security-key-handling-check.mjs", "package.json must preserve security:key:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, `package-lock.json version must be ${VERSION}`);
  assert(lock.packages?.[""]?.version === VERSION, `package-lock root package version must be ${VERSION}`);
}

const requiredFiles = [
  "docs/hosted-demo-evidence-review.md",
  "docs/hosted-demo-review-checklist.md",
  "docs/public-demo-evidence-lock.md",
  "docs/release-evidence-lock.md",
  "tests/hosted-demo-evidence-review-check.mjs",
  "tests/public-demo-evidence-lock-check.mjs",
  "tests/release-warning-cleanup-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/security-key-handling-check.mjs",
  "scripts/full-qa-gate.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("2.1.11"), "Full QA gate must reference v2.1.11");
assert(fullQaGate.includes("hosted-demo-evidence-review"), "Full QA gate must include hosted demo evidence review");
assert(fullQaGate.includes("tests/hosted-demo-evidence-review-check.mjs"), "Full QA gate must run hosted demo evidence review check");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must preserve public demo evidence lock");

const hostedDemoDoc = read("docs/hosted-demo-evidence-review.md");
assert(hostedDemoDoc.includes("v2.1.11"), "hosted demo evidence review doc must reference v2.1.11");
assert(hostedDemoDoc.includes("No feature changes"), "hosted demo evidence review doc must state no feature changes");
assert(hostedDemoDoc.includes("No provider changes"), "hosted demo evidence review doc must state no provider changes");
assert(hostedDemoDoc.includes("Hosted demo URL"), "hosted demo evidence review doc must include hosted demo URL section");
assert(hostedDemoDoc.includes("Manual evidence"), "hosted demo evidence review doc must include manual evidence section");

const checklist = read("docs/hosted-demo-review-checklist.md");
assert(checklist.includes("npm run hosted-demo:evidence:check"), "hosted demo checklist must include hosted-demo evidence check command");
assert(checklist.includes("npm run qa"), "hosted demo checklist must include full QA command");
assert(checklist.includes("screenshots"), "hosted demo checklist must mention screenshots");
assert(checklist.includes("full-qa-gate-report"), "hosted demo checklist must mention full QA artifact");

const publicDemoDoc = exists("docs/public-demo.md") ? read("docs/public-demo.md") : "";
assert(!/production-readys+scraping/i.test(publicDemoDoc), "public demo docs must not claim production-ready scraping");
assert(!/automatics+legals+clearance/i.test(publicDemoDoc), "public demo docs must not claim automatic legal clearance");
assert(!/guaranteeds+sources+verification/i.test(publicDemoDoc), "public demo docs must not claim guaranteed source verification");

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (!suppressStaleReportWarnings) if (report.app_version !== VERSION) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN evidence check: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);  if (report.status !== "passed") if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN evidence check: full QA artifact status is ${report.status}. Run npm run qa to regenerate it.`);  if (report.failed_gate_count !== 0) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN evidence check: full QA artifact failed_gate_count is ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  assert(Array.isArray(report.results), "full QA artifact must contain results array");
} else {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN hosted-demo evidence review: artifacts/full-qa-gate-report.json is absent. Run npm run qa to produce it.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Hosted Demo Evidence Review checks passed for v2.1.11.");
