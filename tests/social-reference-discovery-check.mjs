
import fs from "node:fs";
import path from "node:path";

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
  console.error(`FAIL social reference discovery check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "1.4.0", "package.json version must be 1.4.0");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must identify Social Reference Discovery Layer");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.scripts?.["social-reference:check"] === "node tests/social-reference-discovery-check.mjs", "package.json must expose social-reference:check");
assert(pkg.scripts?.["broad-discovery:check"] === "node tests/broad-web-image-discovery-check.mjs", "package.json must preserve broad-discovery:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^1.4.0"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^1.4.0"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/social-reference.ts",
  "src/lib/social-reference-discovery.ts",
  "src/components/search/SocialReferenceDiscoveryPanel.tsx",
  "tests/social-reference-discovery-check.mjs",
  "docs/social-reference-discovery.md",
  "docs/social-reference-safety-boundaries.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/social-reference.ts");
for (const token of [
  "SocialReferencePlatform",
  "SocialReferenceCandidate",
  "SocialReferenceNormalizationResult",
  "x_twitter",
  "instagram",
  "tiktok",
  "youtube",
  "pinterest",
  "reddit",
  "facebook_public",
  "forum"
]) {
  assert(types.includes(token), `social reference types must include ${token}`);
}

const lib = read("src/lib/social-reference-discovery.ts");
for (const token of [
  "inferSocialReferencePlatform",
  "inferSocialReferenceContentType",
  "inferSocialReferenceAccessState",
  "normalizeSocialReferenceCandidate",
  "createSocialReferenceDiscoveryNotes",
  "social_media",
  "No private account scraping",
  "login bypass",
  "hidden API abuse",
  "media rehosting"
]) {
  assert(lib.includes(token), `social reference lib must include ${token}`);
}

const panel = read("src/components/search/SocialReferenceDiscoveryPanel.tsx");
for (const token of [
  "SocialReferenceDiscoveryPanel",
  "Social reference discovery",
  "private scraping",
  "login bypass",
  "hidden API abuse",
  "media rehosting"
]) {
  assert(panel.includes(token), `social reference panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("social-reference-discovery"), "Full QA gate must include social reference discovery gate");
assert(fullQaGate.includes("tests/social-reference-discovery-check.mjs"), "Full QA gate must run social reference discovery check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("social-reference-discovery"), "Full QA gate manifest must check social reference discovery gate");

const socialDoc = read("docs/social-reference-discovery.md");
assert(socialDoc.includes("public social-reference"), "social reference doc must mention public social-reference scope");
assert(socialDoc.includes("No private account scraping"), "social reference doc must forbid private account scraping");
assert(socialDoc.includes("No login bypass"), "social reference doc must forbid login bypass");
assert(socialDoc.includes("No hidden API abuse"), "social reference doc must forbid hidden API abuse");
assert(socialDoc.includes("No media rehosting"), "social reference doc must forbid media rehosting");

const boundariesDoc = read("docs/social-reference-safety-boundaries.md");
for (const token of ["allowed", "forbidden", "public links", "platform restrictions"]) {
  assert(boundariesDoc.includes(token), `social boundary doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.mjs$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN social reference discovery: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN social reference discovery: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Social Reference Discovery Layer checks passed for v${VERSION}.`);
