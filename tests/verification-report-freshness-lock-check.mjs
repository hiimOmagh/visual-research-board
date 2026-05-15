import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const expectedVersion = packageJson.version;

function fail(message) {
  console.error(`FAIL verification report freshness lock check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function reportVersion(report) {
  if (!report || typeof report !== "object") return null;
  return (
    report.version ??
    report.app_version ??
    report.appVersion ??
    report.packageVersion ??
    report.releaseVersion ??
    null
  );
}

function artifactIsFreshAndPassed(report) {
  return (
    report &&
    reportVersion(report) === expectedVersion &&
    report.status === "passed" &&
    Number(report.failed_gate_count ?? 0) === 0
  );
}

function releaseReportIsFreshAndPassed(report) {
  return (
    report &&
    reportVersion(report) === expectedVersion &&
    report.status === "passed" &&
    Number(report.failed_command_count ?? report.failed_gate_count ?? 0) === 0
  );
}

assert(
  packageJson.scripts?.["verify:artifacts"] === "node scripts/verify-artifacts.mjs",
  "package.json must preserve compressed verify:artifacts"
);

assert(
  packageJson.scripts?.["verify:all"]?.includes("npm run verify:artifacts") &&
    packageJson.scripts?.["verify:all"]?.includes("npm run verify:release"),
  "package.json must preserve verify:all artifact + release flow"
);

assert(
  packageJson.scripts?.["verify:ci-parity"]?.includes("npm ci") &&
    packageJson.scripts?.["verify:ci-parity"]?.includes("npm run verify:all"),
  "package.json must preserve verify:ci-parity clean install flow"
);

const verifyArtifactsSource = readFileSync("scripts/verify-artifacts.mjs", "utf8");

assert(
  verifyArtifactsSource.includes("first-run:visual:evidence"),
  "verify-artifacts runner must generate first-run visual evidence"
);

assert(
  verifyArtifactsSource.includes("first-run:evidence-review"),
  "verify-artifacts runner must generate first-run evidence review"
);

assert(
  verifyArtifactsSource.includes("first-run:demo-script"),
  "verify-artifacts runner must generate first-run demo script"
);

assert(
  verifyArtifactsSource.includes("release:evidence:index"),
  "verify-artifacts runner must generate release evidence index"
);

const releaseVerifySource = readFileSync("scripts/release-verify.mjs", "utf8");

assert(
  releaseVerifySource.includes("verification:freshness:check"),
  "release verifier must include verification:freshness:check"
);

assert(
  releaseVerifySource.includes("verification:artifact-schema:check"),
  "release verifier must include verification:artifact-schema:check"
);

assert(
  releaseVerifySource.includes("release:evidence:index:check"),
  "release verifier must include release:evidence:index:check"
);

const fullQaReport = readJsonIfExists("artifacts/full-qa-gate-report.json");
const releaseReport = readJsonIfExists("artifacts/release-verify-report.json");

if (!artifactIsFreshAndPassed(fullQaReport)) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN verification freshness: full QA artifact is stale or failed. Run npm run verify:all to regenerate it.");
}

if (!releaseReportIsFreshAndPassed(releaseReport)) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN verification freshness: release verification report is stale or failed. Run npm run verify:all to regenerate it.");
}

if (!process.exitCode) {
  console.log(`Verification Report Freshness Lock + Warning Suppression checks passed for v${expectedVersion}.`);
}
