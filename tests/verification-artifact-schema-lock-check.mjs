import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const expectedVersion = packageJson.version;

function fail(message) {
  console.error(`FAIL verification artifact schema lock check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function reportVersionMatches(report) {
  if (!report || typeof report !== "object") return false;

  const candidates = [
    report.version,
    report.appVersion,
    report.packageVersion,
    report.releaseVersion,
    report.releaseVerificationVersion,
  ].filter(Boolean);

  return candidates.includes(expectedVersion);
}

function reportIsFreshAndPassed(report) {
  return (
    report &&
    reportVersionMatches(report) &&
    report.status === "passed" &&
    Number(report.failed_gate_count ?? report.failed_command_count ?? 0) === 0
  );
}

assert(
  packageJson.scripts?.["verification:artifact-schema:check"] ===
    "node tests/verification-artifact-schema-lock-check.mjs",
  "package.json must expose verification:artifact-schema:check"
);

assert(
  packageJson.scripts?.["release:evidence:index"] === "node scripts/release-evidence-index.mjs",
  "package.json must expose release:evidence:index"
);

assert(
  packageJson.scripts?.["release:evidence:index:check"] ===
    "node tests/release-evidence-index-check.mjs",
  "package.json must expose release:evidence:index:check"
);

assert(
  packageJson.scripts?.["verify:artifacts"] === "node scripts/verify-artifacts.mjs",
  "package.json must preserve compressed verify:artifacts"
);

assert(
  packageJson.scripts?.["verify:all"]?.includes("npm run verify:artifacts") &&
    packageJson.scripts?.["verify:all"]?.includes("npm run verify:release"),
  "package.json must preserve verify:all artifact + release flow"
);

const verifyArtifactsSource = readText("scripts/verify-artifacts.mjs");

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

const releaseVerifySource = readText("scripts/release-verify.mjs");

assert(
  releaseVerifySource.includes("verification:artifact-schema:check"),
  "release verifier must include verification:artifact-schema:check"
);

assert(
  releaseVerifySource.includes("release:evidence:index:check"),
  "release verifier must include release:evidence:index:check"
);

const releaseEvidenceIndex = readJsonIfExists("artifacts/release-evidence-index.json");

if (releaseEvidenceIndex) {
  assert(
    releaseEvidenceIndex.status === "indexed",
    "release evidence index artifact must have indexed status"
  );

  const indexVersion =
    releaseEvidenceIndex.version ??
    releaseEvidenceIndex.appVersion ??
    releaseEvidenceIndex.packageVersion ??
    releaseEvidenceIndex.releaseVersion;

  if (indexVersion) {
    assert(
      indexVersion === expectedVersion,
      "release evidence index artifact must match package version when versioned"
    );
  }
}

const fullQaReport = readJsonIfExists("artifacts/full-qa-gate-report.json");
const releaseReport = readJsonIfExists("artifacts/release-verify-report.json");

if (!reportIsFreshAndPassed(fullQaReport)) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN verification artifact schema: full QA artifact is stale or failed. Run npm run verify:all to regenerate it.");
}

if (!reportIsFreshAndPassed(releaseReport)) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN verification artifact schema: release verification report is stale or failed. Run npm run verify:all to regenerate it.");
}

if (!process.exitCode) {
  console.log(`Verification Artifact Schema Lock checks passed for v${expectedVersion}.`);
}
