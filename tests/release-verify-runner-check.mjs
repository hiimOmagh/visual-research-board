
import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");

function fail(message) {
  console.error(`FAIL release verify runner check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.2.0", "package.json version must be 2.2.0");
assert(pkg.description?.includes("Unified Release Verification Runner"), "package description must identify Unified Release Verification Runner");
assert(pkg.description?.includes("Release Package Audit"), "package description must preserve Release Package Audit wording");
assert(pkg.description?.includes("Public Demo Evidence + Screenshot Lock"), "package description must preserve Public Demo Evidence + Screenshot Lock wording");
assert(pkg.description?.includes("Dependency Audit Triage"), "package description must preserve Dependency Audit Triage wording");
assert(pkg.description?.includes("Reference Workflow Stable Release"), "package description must preserve Reference Workflow Stable Release wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must expose verify:release");
assert(pkg.scripts?.["verify:artifacts"] === "node scripts/verify-artifacts.mjs", "package.json must expose compressed verify:artifacts");
assert(exists("scripts/verify-artifacts.mjs"), "verify artifacts runner must exist");
const verifyArtifactsSource = read("scripts/verify-artifacts.mjs");
assert(verifyArtifactsSource.includes("first-run:visual:evidence"), "verify artifacts runner must generate first-run visual evidence");
assert(verifyArtifactsSource.includes("first-run:evidence-review"), "verify artifacts runner must generate first-run evidence review");
assert(verifyArtifactsSource.includes("first-run:demo-script"), "verify artifacts runner must generate first-run demo script");
assert(verifyArtifactsSource.includes("release:evidence:index"), "verify artifacts runner must generate release evidence index");
assert(pkg.scripts?.["verify:all"] === "npm run verify:artifacts && npm run verify:release", "package.json must expose verify:all");
assert(pkg.scripts?.["verify:ci-parity"] === "npm ci && npm run verify:all", "package.json must expose verify:ci-parity");
assert(pkg.scripts?.["release:verify:runner:check"] === "node tests/release-verify-runner-check.mjs", "package.json must expose release:verify:runner:check");

for (const script of [
  "release:package:audit:check",
  "public-demo:screenshot:check",
  "dependency:audit:triage:check",
  "stable:hygiene:check",
  "reference-workflow:stable:check",
  "activation-pack:export:check",
  "activation-pack:export-preview:check",
  "activation-pack:ui:check",
  "public-demo:stable:check",
  "public-demo:final:check",
  "hosted-demo:evidence:check",
  "public-demo:evidence:check",
  "release:warning:check",
  "public-demo:check",
  "qa:public-demo",
  "security:key:check",
  "qa",
  "typecheck",
  "lint",
  "build"
]) {
  assert(typeof pkg.scripts?.[script] === "string", `package.json must preserve ${script}`);
}

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const runner = read("scripts/release-verify.mjs");
for (const token of [
  "release-verify-report.json",
  "node_modules missing",
  "verify:ci-parity",
  "release:verify:runner:check",
  "release:package:audit:check",
  "public-demo:screenshot:check",
  "dependency:audit:triage:check",
  "stable:hygiene:check",
  "qa:public-demo",
  "security:key:check",
  "typecheck",
  "lint",
  "build",
  "failed_command",
  "planned_scripts",
  "Do not run npm audit fix --force"
]) {
  assert(runner.includes(token), `release verify runner must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("release-verify-runner"), "Full QA gate must include release-verify-runner");
assert(fullQaGate.includes("tests/release-verify-runner-check.mjs"), "Full QA gate must run release verify runner check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("release-verify-runner"), "Full QA manifest must check release verify runner");

const doc = read("docs/unified-release-verification-runner.md");
for (const token of [
  "verify:release",
  "verify:ci-parity",
  "fail-fast",
  "release-verify-report.json",
  "local/CI parity",
  "no new features",
  "no dependency churn",
  "no provider expansion"
]) {
  assert(doc.includes(token), `unified release verification runner doc must include ${token}`);
}

const checklist = read("docs/release-verification-runner-checklist.md");
for (const token of [
  "npm ci",
  "npm run verify:release",
  "npm run verify:ci-parity",
  "artifacts/release-verify-report.json",
  "failed_command",
  "GitHub Actions",
  "review outcome"
]) {
  assert(checklist.includes(token), `release verification runner checklist must include ${token}`);
}

for (const file of ["README.md", "PATCH_MANIFEST.md", "docs/release-checklist.md", "docs/validation-report.md"]) {
  assert(exists(file), `${file} must exist`);
  assert(read(file).includes("v2.2.0"), `${file} must reference v2.2.0`);
}

const reportPath = "artifacts/release-verify-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN release verify runner: report is ${report.app_version}, expected ${VERSION}. Run npm run verify:release to regenerate it.`);
  } else if (report.status !== "passed") {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN release verify runner: report status is ${report.status}. Run npm run verify:release to regenerate it.`);
  }
}

for (const file of [
  "docs/unified-release-verification-runner.md",
  "docs/release-verification-runner-checklist.md",
  "README.md",
  "PATCH_MANIFEST.md"
]) {
  const text = read(file);
  for (const pattern of [
    /new\s+feature\s+implemented/i,
    /new\s+provider\s+implementation/i,
    /export\s+rewrite\s+completed/i,
    /private\s+account\s+scraping/i,
    /paywall\s+bypass\s+enabled/i,
    /image\s+generation\s+enabled/i,
    /source\s+media\s+rehosting\s+enabled/i
  ]) {
    assert(!pattern.test(text), `${file} contains forbidden release verify runner claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
assert(pkg.scripts?.["ci-parity:workflow:check"] === "node tests/ci-parity-workflow-badge-check.mjs", "package.json must expose ci-parity:workflow:check");
assert(pkg.scripts?.["verification:freshness:check"] === "node tests/verification-report-freshness-lock-check.mjs", "package.json must expose verification:freshness:check");
assert(pkg.scripts?.["verification:artifact-schema:check"] === "node tests/verification-artifact-schema-lock-check.mjs", "package.json must expose verification:artifact-schema:check");
assert(pkg.scripts?.["release:evidence:index"] === "node scripts/release-evidence-index.mjs", "package.json must expose release:evidence:index");
assert(pkg.scripts?.["release:evidence:index:check"] === "node tests/release-evidence-index-check.mjs", "package.json must expose release:evidence:index:check");
assert(pkg.scripts?.["nested:verification:warnings:check"] === "node tests/nested-verification-warning-silence-check.mjs", "package.json must expose nested:verification:warnings:check");
const releaseVerifySource = read("scripts/release-verify.mjs");
assert(releaseVerifySource.includes("verification:artifact-schema:check"), "release verifier must include verification:artifact-schema:check");
assert(releaseVerifySource.includes("release:evidence:index"), "release verifier must include release:evidence:index");
assert(releaseVerifySource.includes("release:evidence:index:check"), "release verifier must include release:evidence:index:check");
assert(releaseVerifySource.includes("nested:verification:warnings:check"), "release verifier must include nested:verification:warnings:check");
assert(releaseVerifySource.includes("final_freshness_recheck"), "release verifier must record final freshness recheck");
console.log(`Unified Release Verification Runner checks passed for v${VERSION}.`);

assert(pkg.scripts?.["single-command:verification:check"] === "node tests/single-command-verification-check.mjs", "package.json must expose single-command:verification:check");
