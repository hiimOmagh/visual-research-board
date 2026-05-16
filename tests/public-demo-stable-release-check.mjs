import fs from "node:fs";
import path from "node:path";

const suppressStaleReportWarnings = process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS === "1";
const root = process.cwd();

function fp(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(fp(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(fp(relativePath), "utf8");
}

function fail(message) {
  console.error(`FAIL public-demo stable release check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function isNegatedClaimContext(text, index, matchLength) {
  const before = text.slice(Math.max(0, index - 160), index).toLowerCase();
  const after = text.slice(index + matchLength, Math.min(text.length, index + matchLength + 160)).toLowerCase();
  const nearby = `${before} ${after}`;

  return /\b(no|not|never|without|avoid|forbid|forbidden|must not|does not|do not|cannot|should not|is not|are not)\b/.test(nearby);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.4.0", "package.json version must be 2.4.0");
assert(pkg.description?.includes("Public Demo Stable Release"), "package description must identify Public Demo Stable Release");
assert(pkg.description?.includes("Public Demo Final Acceptance"), "package description must preserve Public Demo Final Acceptance wording");
assert(pkg.description?.includes("Hosted Demo Evidence Review"), "package description must preserve Hosted Demo Evidence Review wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(pkg.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

const requiredScripts = {
  "public-demo:stable:check": "node tests/public-demo-stable-release-check.mjs",
  "public-demo:final:check": "node tests/public-demo-final-acceptance-check.mjs",
  "hosted-demo:evidence:check": "node tests/hosted-demo-evidence-review-check.mjs",
  "public-demo:evidence:check": "node tests/public-demo-evidence-lock-check.mjs",
  "release:warning:check": "node tests/release-warning-cleanup-check.mjs",
  "public-demo:check": "node tests/public-demo-release-candidate-check.mjs",
  "security:key:check": "node tests/security-key-handling-check.mjs"
};

for (const [scriptName, expectedCommand] of Object.entries(requiredScripts)) {
  assert(pkg.scripts?.[scriptName] === expectedCommand, `package.json must preserve ${scriptName}`);
}

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const requiredFiles = [
  "tests/public-demo-stable-release-check.mjs",
  "tests/public-demo-final-acceptance-check.mjs",
  "tests/hosted-demo-evidence-review-check.mjs",
  "tests/public-demo-evidence-lock-check.mjs",
  "tests/release-warning-cleanup-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/security-key-handling-check.mjs",
  "docs/public-demo-stable-release.md",
  "docs/stable-release-checklist.md",
  "docs/public-demo-final-acceptance.md",
  "docs/final-demo-review-checklist.md",
  "scripts/full-qa-gate.mjs",
  "README.md",
  "PATCH_MANIFEST.md"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes(VERSION), "Full QA gate must reference current package version");
assert(fullQaGate.includes("public-demo-stable-release"), "Full QA gate must include public demo stable release");
assert(fullQaGate.includes("tests/public-demo-stable-release-check.mjs"), "Full QA gate must run public demo stable release check");
assert(fullQaGate.includes("public-demo-final-acceptance"), "Full QA gate must preserve public demo final acceptance");

const fullQaManifest = read("tests/full-qa-gate-check.mjs");
assert(fullQaManifest.includes(VERSION), "Full QA gate manifest check must reference current package version");
assert(fullQaManifest.includes("public-demo-stable-release"), "Full QA gate manifest must check public demo stable release");

const readme = read("README.md");
assert(readme.includes("v2.4.0"), "README must mention v2.4.0");
assert(readme.includes("Public Demo Stable Release"), "README must mention Public Demo Stable Release");

const stableDoc = read("docs/public-demo-stable-release.md");
assert(stableDoc.includes("v2.4.0"), "stable release doc must mention v2.4.0");
assert(stableDoc.includes("No feature changes"), "stable release doc must state no feature changes");
assert(stableDoc.includes("No provider changes"), "stable release doc must state no provider changes");
assert(stableDoc.includes("No retrieval logic changes"), "stable release doc must state no retrieval logic changes");
assert(stableDoc.includes("No export behavior changes"), "stable release doc must state no export behavior changes");
assert(stableDoc.includes("Public demo stable"), "stable release doc must identify public demo stable release");

const checklist = read("docs/stable-release-checklist.md");
assert(checklist.includes("npm run public-demo:stable:check"), "stable checklist must include public-demo stable check command");
assert(checklist.includes("full-qa-gate-report"), "stable checklist must mention full QA artifact");
assert(checklist.includes("v2.4.0"), "stable checklist must mention v2.4.0");

const claimScanFiles = [
  "README.md",
  "docs/public-demo.md",
  "docs/public-demo-stable-release.md",
  "docs/stable-release-checklist.md",
  "docs/public-demo-final-acceptance.md",
  "docs/final-demo-review-checklist.md",
  "docs/hosted-demo-evidence-review.md",
  "docs/hosted-demo-review-checklist.md"
].filter(exists);

const forbiddenClaims = [
  /production-ready\s+scraping/gi,
  /live\s+scraping\s+enabled/gi,
  /automatic\s+legal\s+clearance/gi,
  /guaranteed\s+source\s+verification/gi,
  /unlimited\s+provider\s+access/gi,
  /private\s+credentials\s+required/gi
];

for (const file of claimScanFiles) {
  const text = read(file);

  for (const pattern of forbiddenClaims) {
    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];

    for (const match of matches) {
      if (!isNegatedClaimContext(text, match.index ?? 0, match[0].length)) {
        fail(`${file} contains unsafe positive claim pattern ${pattern}`);
      }
    }
  }
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN stable release: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    if (!suppressStaleReportWarnings) if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn(`WARN stable release: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
} else {
  if (process.env.VRB_SUPPRESS_STALE_REPORT_WARNINGS !== "1") console.warn("WARN stable release: artifacts/full-qa-gate-report.json is absent. Run npm run qa to produce it.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Public Demo Stable Release checks passed for v${VERSION}.`);
