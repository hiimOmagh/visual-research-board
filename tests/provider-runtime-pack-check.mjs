import { existsSync, readFileSync } from "node:fs";

const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function collectStringValues(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out);
    return out;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, out);
  }

  return out;
}

const pkg = readJson("package.json");
const appVersion = pkg?.version;

assert(Boolean(pkg), "package.json must be readable");
assert(appVersion === "2.3.0", "package.json version must be 2.3.0");
assert(pkg?.scripts?.["provider-runtime:report"] === "node scripts/provider-runtime-report.mjs", "package.json must expose provider-runtime:report");
assert(pkg?.scripts?.["verify:artifacts"] === "node scripts/verify-artifacts.mjs", "package.json must preserve compressed verify:artifacts");

const verifyArtifactsSource = existsSync("scripts/verify-artifacts.mjs")
  ? readFileSync("scripts/verify-artifacts.mjs", "utf8")
  : "";

assert(verifyArtifactsSource.includes("provider-runtime:report"), "verify-artifacts must regenerate provider runtime report");

const reportPaths = [
  "artifacts/provider-runtime-report.json",
  "artifacts/provider-runtime-pack-report.json",
  "artifacts/provider-runtime-pack.json"
];

for (const path of reportPaths) {
  assert(existsSync(path), `${path} must exist`);
}

const report =
  readJson("artifacts/provider-runtime-report.json") ||
  readJson("artifacts/provider-runtime-pack-report.json") ||
  readJson("artifacts/provider-runtime-pack.json");

assert(Boolean(report), "provider runtime report must be readable JSON");

if (report) {
  assert(report.schemaVersion === "provider-runtime-pack-report.v1", "provider runtime report schemaVersion must be stable");
  assert(report.status === "ready", "provider runtime report status must be ready");

  assert(report.appVersion === appVersion, `provider runtime report must expose app version ${appVersion}`);
  assert(report.app_version === appVersion, `provider runtime report must expose snake_case app version ${appVersion}`);
  assert(report.packageVersion === appVersion, `provider runtime report must expose package version ${appVersion}`);

  const allValues = collectStringValues(report);
  assert(allValues.includes(appVersion), `provider runtime report must contain app version ${appVersion}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Provider runtime pack checks failed:\n- ${failure}`);
  }
  process.exit(1);
}

console.log(`Provider runtime pack checks passed for v${appVersion}.`);
