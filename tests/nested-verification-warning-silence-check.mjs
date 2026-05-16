import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const VERSION = pkg.version;

function fail(message) {
  console.error(`FAIL nested verification warning silence check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(path) {
  return readFileSync(path, "utf8");
}

assert(VERSION === "2.3.0", "package.json version must be 2.3.0");
assert(
  pkg.description?.includes("Nested Verification Warning Silence + Final Freshness Recheck"),
  "package description must identify Nested Verification Warning Silence + Final Freshness Recheck"
);
assert(
  pkg.scripts?.["nested:verification:warnings:check"] === "node tests/nested-verification-warning-silence-check.mjs",
  "package.json must expose nested:verification:warnings:check"
);
assert(
  pkg.scripts?.["verification:freshness:check"] === "node tests/verification-report-freshness-lock-check.mjs",
  "package.json must preserve verification:freshness:check"
);
assert(
  pkg.scripts?.["verify:all"] === "npm run verify:artifacts && npm run verify:release",
  "package.json must preserve single-command verify:all"
);
assert(
  pkg.scripts?.["verify:artifacts"] === "node scripts/verify-artifacts.mjs",
  "package.json must preserve compressed verify:artifacts"
);

const releaseVerify = read("scripts/release-verify.mjs");
assert(
  releaseVerify.includes('process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS ??= "1"'),
  "release verifier must enable nested stale-warning suppression"
);
assert(
  releaseVerify.includes('delete process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS'),
  "release verifier must clear suppression before final freshness recheck"
);
assert(
  releaseVerify.includes('phase: "final_freshness_recheck"'),
  "release verifier report must record final freshness recheck phase"
);
assert(
  releaseVerify.includes('npmRun("verification:freshness:check")'),
  "release verifier must run final freshness recheck after writing the passed report"
);

for (const file of [
  "tests/verification-report-freshness-lock-check.mjs",
  "tests/verification-artifact-schema-lock-check.mjs",
  "tests/single-command-verification-check.mjs",
  "tests/ci-parity-workflow-badge-check.mjs"
]) {
  const source = read(file);
  assert(
    source.includes("VRB_SUPPRESS_STALE_REPORT_WARNINGS"),
    `${file} must honor nested stale-warning suppression`
  );
}

const freshness = read("tests/verification-report-freshness-lock-check.mjs");
assert(freshness.includes("report.app_version"), "freshness check must accept app_version reports");
assert(
  freshness.includes("failed_command_count"),
  "freshness check must accept release verification command-count reports"
);

const fullQa = read("scripts/full-qa-gate.mjs");
assert(
  fullQa.includes('process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS ??= "1"'),
  "Full QA gate must suppress nested stale-report warnings during gate execution"
);
assert(
  fullQa.includes("nested-verification-warning-silence"),
  "Full QA gate must include nested verification warning silence"
);
assert(
  fullQa.includes("tests/nested-verification-warning-silence-check.mjs"),
  "Full QA gate must run nested verification warning silence check"
);

const releaseRunner = read("tests/release-verify-runner-check.mjs");
assert(
  releaseRunner.includes("nested:verification:warnings:check"),
  "release verify runner check must preserve nested verification warning check"
);

for (const file of [
  "README.md",
  "PATCH_MANIFEST.md",
  "docs/nested-verification-warning-silence.md",
  "RUNBOOK-v2.3.0.md"
]) {
  assert(existsSync(file), `${file} must exist`);
  assert(read(file).includes("v2.3.0"), `${file} must reference v2.3.0`);
}

if (!process.exitCode) {
  console.log(`Nested Verification Warning Silence + Final Freshness Recheck checks passed for v${VERSION}.`);
}
