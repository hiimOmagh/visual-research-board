import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function readJson(relPath) {
  return JSON.parse(read(relPath));
}

function warn(message) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN single-command verification: ${message}`);
}

function fail(message) {
  console.error(`FAIL single-command verification check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = readJson("package.json");
const scripts = pkg.scripts ?? {};

assert(pkg.version === "2.1.11", "package version must be 2.1.11");

assert(
  scripts["verify:artifacts"] === "node scripts/verify-artifacts.mjs",
  "package.json must expose compressed verify:artifacts"
);
assert(
  scripts["verify:all"] === "npm run verify:artifacts && npm run verify:release",
  "package.json must expose compressed verify:all"
);
assert(
  scripts["verify:ci-parity"] === "npm ci && npm run verify:all",
  "package.json must expose verify:ci-parity"
);

assert(!scripts["verify:artifacts"]?.includes("&&"), "verify:artifacts must not inline artifact generation");
assert(!scripts["verify:artifacts"]?.includes("verify:all"), "verify:artifacts must not recursively call verify:all");
assert(!scripts["verify:artifacts"]?.includes("verify:ci-parity"), "verify:artifacts must not recursively call verify:ci-parity");
assert(!scripts["verify:release"]?.includes("verify:all"), "verify:release must not recursively call verify:all");
assert(!scripts["verify:release"]?.includes("verify:ci-parity"), "verify:release must not recursively call verify:ci-parity");

assert(exists("scripts/verify-artifacts.mjs"), "compressed verify artifacts runner must exist");

const verifyArtifactsSource = read("scripts/verify-artifacts.mjs");

assert(verifyArtifactsSource.includes("first-run:visual:evidence"), "verify artifacts runner must include first-run visual evidence generation");
assert(verifyArtifactsSource.includes("first-run:evidence-review"), "verify artifacts runner must include first-run evidence review generation");
assert(verifyArtifactsSource.includes("first-run:demo-script"), "verify artifacts runner must include first-run demo script generation");
assert(verifyArtifactsSource.includes("release:evidence:index"), "verify artifacts runner must include release evidence index generation");
assert(verifyArtifactsSource.includes("process.env.npm_execpath"), "verify artifacts runner must use npm_execpath for Windows-safe npm invocation");
assert(!verifyArtifactsSource.includes("shell: true"), "verify artifacts runner must not use shell:true");

const singleCommandDoc = exists("docs/single-command-verification.md")
  ? read("docs/single-command-verification.md")
  : "";

const releaseCompressionDoc = exists("docs/release-command-compression.md")
  ? read("docs/release-command-compression.md")
  : "";

assert(singleCommandDoc.includes("artifact generation"), "single-command verification doc must include artifact generation");
assert(singleCommandDoc.includes("release verification"), "single-command verification doc must include release verification");
assert(releaseCompressionDoc.includes("must not recursively call verify:all"), "release command compression doc must include must not recursively call verify:all");
assert(releaseCompressionDoc.includes("must not recursively call verify:ci-parity"), "release command compression doc must include must not recursively call verify:ci-parity");

if (exists("artifacts/full-qa-gate-report.json")) {
  const report = readJson("artifacts/full-qa-gate-report.json");
  if (report.version !== pkg.version || report.status !== "passed" || report.failed_gate_count !== 0) {
    warn("full QA artifact is stale or failed. Run npm run qa to regenerate it.");
  }
}

if (process.exitCode) process.exit(process.exitCode);

console.log(`Single-Command Verification UX + Release Command Compression checks passed for v${pkg.version}.`);
