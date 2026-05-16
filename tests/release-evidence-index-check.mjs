import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");
const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";

function fail(message) {
  console.error(`FAIL release evidence index check: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function parseJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    fail(`${file} must be valid JSON: ${error.message}`);
    return null;
  }
}

const pkg = parseJson("package.json");
const VERSION = pkg.version;

assert(VERSION === "2.4.0", "package.json version must be 2.4.0");
assert(pkg.scripts?.["release:evidence:index"] === "node scripts/release-evidence-index.mjs", "package.json must expose release:evidence:index");
assert(pkg.scripts?.["release:evidence:index:check"] === "node tests/release-evidence-index-check.mjs", "package.json must expose release:evidence:index:check");
assert(exists("scripts/release-evidence-index.mjs"), "release evidence index generator must exist");

if (!exists("artifacts/release-evidence-index.json")) {
  warn("WARN release evidence index: index artifact is missing. Run npm run release:evidence:index to regenerate it.");
} else {
  const index = parseJson("artifacts/release-evidence-index.json");
  assert(index.schema === "visual-research-board.release-evidence-index.v1", "release evidence index schema must match v1");
  assert(index.app_version === VERSION, "release evidence index app_version must match package version");
  assert(["indexed", "partial"].includes(index.status), "release evidence index status must be indexed or partial");
  assert(Number.isInteger(index.artifact_count), "release evidence index must include artifact_count integer");
  assert(Number.isInteger(index.missing_count), "release evidence index must include missing_count integer");
  assert(Number.isInteger(index.invalid_json_count), "release evidence index must include invalid_json_count integer");
  assert(Array.isArray(index.files), "release evidence index must include files array");
  assert(index.files.length >= 5, "release evidence index must track the required release evidence artifacts");
  for (const requiredPath of [
    "artifacts/full-qa-gate-report.json",
    "artifacts/release-verify-report.json",
    "artifacts/first-run-visual-evidence.json",
    "artifacts/first-run-evidence-review.json",
    "artifacts/first-run-demo-script.json"
  ]) {
    assert(index.files.some((file) => file.path === requiredPath), `release evidence index must include ${requiredPath}`);
  }
  assert(index.commands?.generate === "npm run release:evidence:index", "release evidence index must expose generate command");
  assert(index.commands?.check === "npm run release:evidence:index:check", "release evidence index must expose check command");
  if (index.status !== "indexed") {
    warn("WARN release evidence index: index is partial. Run npm run verify:all after all artifacts exist.");
  }
}

const script = read("scripts/release-evidence-index.mjs");
for (const token of [
  "visual-research-board.release-evidence-index.v1",
  "artifacts/full-qa-gate-report.json",
  "artifacts/release-verify-report.json",
  "first-run-visual-evidence.json",
  "sha256",
  "artifact inventory"
]) {
  assert(script.includes(token), `release evidence index generator must include ${token}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Release Evidence Index checks passed for v${VERSION}.`);
