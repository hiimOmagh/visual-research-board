
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fp = (x) => path.join(root, x);
const exists = (x) => fs.existsSync(fp(x));
const read = (x) => fs.readFileSync(fp(x), "utf8");
function fail(message) { console.error(`FAIL release package audit check: ${message}`); process.exitCode = 1; }
function assert(condition, message) { if (!condition) fail(message); }

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.0.5", "package.json version must be 2.0.5");
for (const token of [
  "Release Package Audit",
  "Public Demo Evidence + Screenshot Lock",
  "Dependency Audit Triage",
  "Stable Release Hygiene + Audit Warning Review",
  "Reference Workflow Stable Release",
  "Activation Pack Export Integration",
  "Security and Key Handling"
]) assert(pkg.description?.includes(token), `package description must include ${token}`);

assert(pkg.scripts?.["release:package:audit:check"] === "node tests/release-package-audit-check.mjs", "package.json must expose release:package:audit:check");
assert(pkg.scripts?.["public-demo:screenshot:check"] === "node tests/public-demo-screenshot-lock-check.mjs", "package.json must preserve public-demo:screenshot:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
  const lockText = read("package-lock.json");
  assert(!lockText.includes('"is-finalizationregistry": "^2.0.5"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
  assert(!lockText.includes('"which-boxed-primitive": "^2.0.5"'), "lockfile must not mutate which-boxed-primitive dependency to app version");
}

for (const file of [
  "tests/release-package-audit-check.mjs",
  "docs/release-package-audit.md",
  "docs/release-package-audit-checklist.md",
  "docs/public-demo-evidence-screenshot-lock.md",
  "docs/public-demo-screenshot-checklist.md",
  "docs/dependency-audit-triage.md",
  "docs/stable-release-hygiene-audit-review.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "README.md",
  "PATCH_MANIFEST.md",
  "artifacts/full-qa-gate-report.json"
]) assert(exists(file), `missing required release package audit file: ${file}`);

for (const script of [
  "release:package:audit:check","public-demo:screenshot:check","dependency:audit:triage:check",
  "stable:hygiene:check","reference-workflow:stable:check","activation-pack:export:check",
  "activation-pack:export-preview:check","activation-pack:ui:check","public-demo:stable:check",
  "public-demo:final:check","hosted-demo:evidence:check","public-demo:evidence:check",
  "public-demo:check","security:key:check","qa","typecheck","lint","build"
]) assert(typeof pkg.scripts?.[script] === "string", `package.json must preserve ${script}`);

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("release-package-audit"), "Full QA gate must include release-package-audit");
assert(fullQaGate.includes("tests/release-package-audit-check.mjs"), "Full QA gate must run release package audit check");
assert(fullQaGate.includes("public-demo-screenshot-lock"), "Full QA gate must preserve public demo screenshot lock");
assert(fullQaGate.includes("dependency-audit-triage"), "Full QA gate must preserve dependency audit triage");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("release-package-audit"), "Full QA manifest must check release package audit");

const auditDoc = read("docs/release-package-audit.md");
for (const token of ["version consistency","tag consistency","package metadata","artifact boundaries","full QA artifact","generated/cache files","no new features","no dependency churn","no provider expansion","no export rewrite"]) {
  assert(auditDoc.includes(token), `release package audit doc must include ${token}`);
}

const checklistDoc = read("docs/release-package-audit-checklist.md");
for (const token of ["package.json","package-lock.json","README.md","PATCH_MANIFEST.md","artifacts/full-qa-gate-report.json","git tag","GitHub Actions","npm ci","npm run qa","npm run build","review outcome"]) {
  assert(checklistDoc.includes(token), `release package audit checklist must include ${token}`);
}

for (const file of ["README.md","PATCH_MANIFEST.md","docs/release-checklist.md","docs/validation-report.md"]) {
  assert(read(file).includes("v2.0.5"), `${file} must reference v2.0.5`);
}

const report = JSON.parse(read("artifacts/full-qa-gate-report.json"));
if (report.app_version !== VERSION) console.warn(`WARN release package audit: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
else if (report.status !== "passed" || report.failed_gate_count !== 0) console.warn(`WARN release package audit: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);

for (const file of ["docs/release-package-audit.md","docs/release-package-audit-checklist.md","README.md","PATCH_MANIFEST.md"]) {
  const text = read(file);
  for (const pattern of [/new\s+feature\s+implemented/i,/new\s+provider\s+implementation/i,/export\s+rewrite\s+completed/i,/account-gated\s+scraping\s+enabled/i,/private\s+account\s+scraping/i,/paywall\s+bypass\s+enabled/i,/image\s+generation\s+enabled/i,/source\s+media\s+rehosting\s+enabled/i,/rights\s+clearance\s+guaranteed/i]) {
    assert(!pattern.test(text), `${file} contains forbidden release-package claim pattern ${pattern}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Release Package Audit checks passed for v${VERSION}.`);
