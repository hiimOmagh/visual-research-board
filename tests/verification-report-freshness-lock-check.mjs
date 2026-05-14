import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");
const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";

function fail(message) {
  console.error(`FAIL verification report freshness lock check: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  if (!suppressStaleReportWarnings) {
    console.warn(message);
  }
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.7", "package.json version must be 2.1.7");
assert(pkg.description?.includes("Verification Report Freshness Lock + Warning Suppression"), "package description must identify Verification Report Freshness Lock + Warning Suppression");
assert(pkg.description?.includes("CI Parity Workflow Badge + Verification Docs Lock"), "package description must preserve CI Parity Workflow Badge + Verification Docs Lock wording");
assert(pkg.description?.includes("Single-Command Verification UX + Release Command Compression"), "package description must preserve Single-Command Verification UX + Release Command Compression wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Release Package Audit"), "package description must preserve Release Package Audit wording");
assert(pkg.description?.includes("Public Demo Evidence + Screenshot Lock"), "package description must preserve Public Demo Evidence + Screenshot Lock wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(pkg.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["verify:artifacts"] === "npm run first-run:visual:evidence && npm run first-run:evidence-review && npm run first-run:demo-script", "package.json must preserve verify:artifacts");
assert(pkg.scripts?.["verify:all"] === "npm run verify:artifacts && npm run verify:release", "package.json must preserve verify:all");
assert(pkg.scripts?.["verify:ci-parity"] === "npm ci && npm run verify:all", "package.json must preserve verify:ci-parity");
assert(pkg.scripts?.["single-command:verification:check"] === "node tests/single-command-verification-check.mjs", "package.json must preserve single-command:verification:check");
assert(pkg.scripts?.["ci-parity:workflow:check"] === "node tests/ci-parity-workflow-badge-check.mjs", "package.json must preserve ci-parity:workflow:check");
assert(pkg.scripts?.["verification:freshness:check"] === "node tests/verification-report-freshness-lock-check.mjs", "package.json must expose verification:freshness:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "tests/verification-report-freshness-lock-check.mjs",
  "docs/verification-report-freshness-lock.md",
  "docs/warning-suppression.md",
  "scripts/release-verify.mjs",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "tests/release-verify-runner-check.mjs",
  "tests/ci-parity-workflow-badge-check.mjs",
  "tests/single-command-verification-check.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const releaseVerify = read("scripts/release-verify.mjs");
assert(releaseVerify.includes("VRB_SUPPRESS_STALE_REPORT_WARNINGS"), "release verifier must set stale report warning suppression env");
assert(releaseVerify.includes("verification:freshness:check"), "release verifier must include verification:freshness:check");
assert(releaseVerify.includes("qa"), "release verifier must preserve full QA execution");
assert(!releaseVerify.includes('"verify:all"'), "release verifier must not recursively call verify:all");
assert(!releaseVerify.includes('"verify:ci-parity"'), "release verifier must not recursively call verify:ci-parity");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("verification-report-freshness-lock"), "Full QA gate must include verification-report-freshness-lock");
assert(fullQaGate.includes("tests/verification-report-freshness-lock-check.mjs"), "Full QA gate must run verification report freshness lock check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("verification-report-freshness-lock"), "Full QA manifest must check verification report freshness lock");

const runnerCheck = read("tests/release-verify-runner-check.mjs");
assert(runnerCheck.includes("verification:freshness:check"), "release verifier runner check must validate verification:freshness:check");

const staleWarningPatterns = [
  "full QA artifact",
  "report status is failed",
  "report is ",
  "failed_gate_count",
  "Run npm run qa to regenerate it",
  "Run npm run verify:release to regenerate it"
];

for (const file of fs.readdirSync(fp("tests")).filter((name) => name.endsWith(".mjs"))) {
  const testPath = path.join("tests", file);
  const text = read(testPath);
  const staleWarningLines = text
    .split(/\r?\n/)
    .filter((line) => line.includes("console.warn(") && staleWarningPatterns.some((pattern) => line.includes(pattern)));
  for (const line of staleWarningLines) {
    assert(line.includes("suppressStaleReportWarnings") || line.includes("warn("), `${testPath} contains unsuppressed stale report warning line`);
  }
}

const freshnessDoc = read("docs/verification-report-freshness-lock.md");
for (const token of [
  "verification report freshness lock",
  "stale report warnings",
  "VRB_SUPPRESS_STALE_REPORT_WARNINGS",
  "npm run verify:all",
  "npm run verify:ci-parity",
  "fresh report",
  "warning suppression"
]) {
  assert(freshnessDoc.includes(token), `verification report freshness lock doc must include ${token}`);
}

const suppressionDoc = read("docs/warning-suppression.md");
for (const token of [
  "warning suppression",
  "stale artifact warnings",
  "release verifier",
  "must not suppress failing gates",
  "must not hide errors",
  "VRB_SUPPRESS_STALE_REPORT_WARNINGS"
]) {
  assert(suppressionDoc.includes(token), `warning suppression doc must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.1.7"), `${file} must reference v2.1.7`);
}

const reports = [
  ["artifacts/full-qa-gate-report.json", "full QA artifact"],
  ["artifacts/release-verify-report.json", "release verification report"]
];

for (const [reportPath, label] of reports) {
  if (!exists(reportPath)) continue;
  try {
    const report = JSON.parse(read(reportPath));
    const version = report.app_version ?? report.appVersion ?? report.version;
    const failedCount = report.failed_gate_count ?? report.failedGateCount ?? 0;
    const status = report.status;
    if (version !== VERSION || status === "failed" || failedCount > 0) {
      warn(`WARN verification freshness: ${label} is stale or failed. Run npm run verify:all to regenerate it.`);
    }
  } catch {
    warn(`WARN verification freshness: ${label} could not be parsed. Run npm run verify:all to regenerate it.`);
  }
}

for (const file of [
  "docs/verification-report-freshness-lock.md",
  "docs/warning-suppression.md",
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
    assert(!pattern.test(text), `${file} contains forbidden verification freshness claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Verification Report Freshness Lock + Warning Suppression checks passed for v${VERSION}.`);
