import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const packageJsonPath = "package.json";
const workflowDir = path.join(".github", "workflows");
const docsToCheck = ["README.md", "PATCH_MANIFEST.md"];

let failed = false;

function fail(message) {
  console.error(`FAIL CI parity workflow badge check: ${message}`);
  failed = true;
}

function warn(message) {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN CI parity workflow badge: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readIfExists(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

const pkg = readJson(packageJsonPath);
const scripts = pkg.scripts ?? {};

assert(pkg.version === "2.4.0", "package.json version must be 2.4.0");
assert(
  scripts["verify:artifacts"] === "node scripts/verify-artifacts.mjs",
  "package.json must expose compressed verify:artifacts",
);
assert(
  scripts["verify:all"] === "npm run verify:artifacts && npm run verify:release",
  "package.json must expose verify:all as artifact generation plus release verification",
);
assert(
  scripts["verify:ci-parity"] === "npm ci && npm run verify:all",
  "package.json must expose verify:ci-parity as clean install plus verify:all",
);
assert(
  scripts["ci-parity:workflow:check"] === "node tests/ci-parity-workflow-badge-check.mjs",
  "package.json must expose ci-parity:workflow:check",
);

assert(
  !scripts["verify:all"]?.includes("verify:ci-parity"),
  "verify:all must not recursively call verify:ci-parity",
);
assert(
  !scripts["verify:ci-parity"]?.replace("npm run verify:all", "").includes("verify:ci-parity"),
  "verify:ci-parity must not recursively call itself",
);

const workflowFiles = existsSync(workflowDir)
  ? readdirSync(workflowDir)
      .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
      .map((name) => path.join(workflowDir, name))
  : [];

const workflowText = workflowFiles.map(readIfExists).join("\n");

assert(workflowFiles.length > 0, "repository must include at least one GitHub Actions workflow");
assert(
  workflowText.includes("verify:ci-parity") || workflowText.includes("npm run verify:ci-parity"),
  "CI workflow must run verify:ci-parity",
);

const docText = docsToCheck.map(readIfExists).join("\n");

assert(
  docText.includes("verify:all"),
  "verification docs must mention verify:all",
);
assert(
  docText.includes("verify:ci-parity"),
  "verification docs must mention verify:ci-parity",
);
assert(
  docText.includes("verify:artifacts"),
  "verification docs must mention verify:artifacts",
);
assert(
  /CI Parity Workflow Badge \+ Verification Docs Lock/i.test(docText),
  "verification docs must preserve CI Parity Workflow Badge + Verification Docs Lock wording",
);

const fullQaReport = readIfExists(path.join("artifacts", "full-qa-gate-report.json"));
if (fullQaReport) {
  try {
    const report = JSON.parse(fullQaReport);
    if (report.appVersion !== pkg.version || report.status !== "passed") {
      warn("full QA artifact is stale or failed. Run npm run qa to regenerate it.");
    }
  } catch {
    warn("full QA artifact is unreadable. Run npm run qa to regenerate it.");
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`CI Parity Workflow Badge + Verification Docs Lock checks passed for v${pkg.version}.`);
}
