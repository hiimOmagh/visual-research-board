import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL single-command verification check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.5", "package.json version must be 2.1.5");
assert(pkg.description?.includes("Single-Command Verification UX + Release Command Compression"), "package description must identify Single-Command Verification UX + Release Command Compression");
assert(pkg.description?.includes("First-Run Demo Script + Public Walkthrough Copy"), "package description must preserve First-Run Demo Script + Public Walkthrough Copy wording");
assert(pkg.description?.includes("First-Run Evidence Artifact Review + Demo Capture Notes"), "package description must preserve First-Run Evidence Artifact Review + Demo Capture Notes wording");
assert(pkg.description?.includes("First-Run Visual QA + Responsive Screenshot Evidence"), "package description must preserve First-Run Visual QA + Responsive Screenshot Evidence wording");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must preserve Unified Release Verification Runner wording");
assert(pkg.description?.includes("Release Package Audit"), "package description must preserve Release Package Audit wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

const expectedArtifactCommand = "npm run first-run:visual:evidence && npm run first-run:evidence-review && npm run first-run:demo-script";
assert(pkg.scripts?.["verify:artifacts"] === expectedArtifactCommand, "package.json must expose compressed verify:artifacts");
assert(pkg.scripts?.["verify:all"] === "npm run verify:artifacts && npm run verify:release", "package.json must expose compressed verify:all");
assert(pkg.scripts?.["verify:ci-parity"] === "npm ci && npm run verify:all", "package.json must expose compressed verify:ci-parity");
assert(pkg.scripts?.["single-command:verification:check"] === "node tests/single-command-verification-check.mjs", "package.json must expose single-command:verification:check");

assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must preserve verify:release");
assert(pkg.scripts?.["first-run:visual:evidence"] === "node scripts/first-run-visual-evidence.mjs", "package.json must preserve first-run:visual:evidence");
assert(pkg.scripts?.["first-run:evidence-review"] === "node scripts/first-run-evidence-review.mjs", "package.json must preserve first-run:evidence-review");
assert(pkg.scripts?.["first-run:demo-script"] === "node scripts/first-run-demo-script.mjs", "package.json must preserve first-run:demo-script");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

for (const file of [
  "tests/single-command-verification-check.mjs",
  "docs/single-command-verification.md",
  "docs/release-command-compression.md",
  "scripts/release-verify.mjs",
  "tests/release-verify-runner-check.mjs",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "scripts/first-run-visual-evidence.mjs",
  "scripts/first-run-evidence-review.mjs",
  "scripts/first-run-demo-script.mjs"
]) {
  assert(exists(file), `${file} must exist`);
}

const releaseVerify = read("scripts/release-verify.mjs");
assert(releaseVerify.includes("single-command:verification:check"), "release verifier must include single-command:verification:check");
assert(releaseVerify.includes("verify:release"), "release verifier must preserve verify:release script references");
assert(!releaseVerify.includes('"verify:all"'), "release verifier must not recursively call verify:all");
assert(!releaseVerify.includes('"verify:ci-parity"'), "release verifier must not recursively call verify:ci-parity");

const runnerCheck = read("tests/release-verify-runner-check.mjs");
assert(runnerCheck.includes("verify:artifacts"), "release verifier runner check must validate verify:artifacts");
assert(runnerCheck.includes("verify:all"), "release verifier runner check must validate verify:all");
assert(runnerCheck.includes("verify:ci-parity"), "release verifier runner check must validate verify:ci-parity");
assert(runnerCheck.includes("single-command:verification:check"), "release verifier runner check must validate single-command check script");
assert(!runnerCheck.includes('verify:ci-parity"] === "npm ci && npm run verify:release"'), "release verifier runner check must not require old verify:ci-parity target");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("single-command-verification"), "Full QA gate must include single-command-verification");
assert(fullQaGate.includes("tests/single-command-verification-check.mjs"), "Full QA gate must run single-command verification check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("single-command-verification"), "Full QA manifest must check single-command verification");

const commandDocs = read("docs/single-command-verification.md");
for (const token of [
  "npm run verify:all",
  "npm run verify:ci-parity",
  "npm run verify:artifacts",
  "debug-only",
  "single command",
  "artifact generation",
  "release verification"
]) {
  assert(commandDocs.includes(token), `single-command verification doc must include ${token}`);
}

const compressionDocs = read("docs/release-command-compression.md");
for (const token of [
  "release command compression",
  "verify:artifacts",
  "verify:all",
  "verify:ci-parity",
  "must not recursively call verify:all",
  "must not recursively call verify:ci-parity",
  "failure isolation"
]) {
  assert(compressionDocs.includes(token), `release command compression doc must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.1.5"), `${file} must reference v2.1.5`);
}

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN single-command verification: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN single-command verification: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

for (const file of [
  "docs/single-command-verification.md",
  "docs/release-command-compression.md",
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
    assert(!pattern.test(text), `${file} contains forbidden single-command verification claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Single-Command Verification UX + Release Command Compression checks passed for v${VERSION}.`);
