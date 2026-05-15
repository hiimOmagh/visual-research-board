#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const APP_VERSION = "2.2.0";
const ARTIFACT_PATH = "artifacts/dependency-audit-safe-upgrade-lock.json";
const EXPECTED_SCHEMA = "visual-research-board.dependency-audit.safe-upgrade-lock.v1";

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL dependency audit safe-upgrade lock check: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path} must be valid JSON: ${error.message}`);
    return {};
  }
}

assert(existsSync(ARTIFACT_PATH), "audit lock artifact must exist. Run npm run dependency:audit:safe-lock first.");

const artifact = existsSync(ARTIFACT_PATH) ? readJson(ARTIFACT_PATH) : {};
const policy = artifact.policy || {};
const totals = artifact.severityTotals || {};

assert(artifact.schemaVersion === EXPECTED_SCHEMA, "audit lock artifact schemaVersion must be stable");
assert(artifact.appVersion === APP_VERSION, `audit lock appVersion must be ${APP_VERSION}`);
assert(artifact.lockVersion === APP_VERSION, `audit lock lockVersion must be ${APP_VERSION}`);
assert(["clean", "documented-noncritical"].includes(artifact.status), `audit lock status must be clean or documented-noncritical, got ${artifact.status}`);

assert(
  policy.forbidsForceFixes === true ||
    policy.forbidForceFixes === true ||
    policy.forceFixesForbidden === true,
  "audit lock policy must forbid force fixes"
);

assert(
  policy.forbiddenForceCommand === "npm audit fix --force" ||
    (Array.isArray(policy.forbiddenCommands) && policy.forbiddenCommands.includes("npm audit fix --force")),
  "audit lock policy must name forbidden force command"
);

assert(
  policy.requiresCiParityAfterDependencyChanges === true ||
    policy.requireCiParityAfterDependencyChanges === true ||
    policy.ciParityRequiredAfterDependencyChanges === true,
  "audit lock policy must require CI parity after dependency changes"
);

assert(
  policy.requiresPackageLockReview === true ||
    policy.requirePackageLockReview === true ||
    policy.packageLockReviewRequired === true,
  "audit lock policy must require package-lock review"
);

assert(
  policy.blocksHighCriticalVulnerabilities === true ||
    policy.blockHighCriticalVulnerabilities === true ||
    policy.highCriticalVulnerabilitiesBlocked === true,
  "audit lock policy must block high/critical vulnerabilities"
);

assert(Number(totals.high || 0) === 0, "audit lock must not allow high vulnerabilities");
assert(Number(totals.critical || 0) === 0, "audit lock must not allow critical vulnerabilities");

if (!failed) {
  console.log(`Dependency Audit Resolution + Safe Upgrade Lock checks passed for v${APP_VERSION}.`);
} else {
  process.exitCode = 1;
}
