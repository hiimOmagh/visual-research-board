import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "docs/public-demo.md",
  "docs/release-candidate-checklist.md",
  "src/lib/public-demo-release-candidate.ts",
  "src/components/PublicDemoReleaseCandidatePanel.tsx",
  "tests/public-demo-release-candidate-check.mjs",
  "scripts/clean-release-candidate.mjs"
];

const filesToScan = [
  "README.md",
  "PATCH_MANIFEST.md",
  "docs/public-demo.md",
  "docs/release-candidate-checklist.md",
  "docs/full-qa-gate.md",
  "docs/release-checklist.md",
  "docs/validation-report.md",
  "src/lib/public-demo-release-candidate.ts",
  "src/components/PublicDemoReleaseCandidatePanel.tsx"
];

const misleadingCapabilityPatterns = [
  /production-ready\s+scraping/i,
  /live\s+scraping\s+enabled/i,
  /fully\s+automated\s+rights\s+verification/i,
  /automatic\s+legal\s+clearance/i,
  /guaranteed\s+source\s+verification/i,
  /unlimited\s+provider\s+access/i,
  /scrapes\s+the\s+web\s+automatically/i
];

const safeNegationPattern = /\b(does\s+not|do\s+not|must\s+not|not\s+claim|not\s+provide|not\s+guarantee|not\s+imply|no\s+new|no\s+production|no\s+paid|no\s+fake|non-goals?|blocked|forbidden|avoid|invalid|never)\b/i;

const suspiciousSecretValuePatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /(?:api[_-]?key|token|secret|password)\s*[:=]\s*["'][A-Za-z0-9._-]{12,}["']/i
];

const forbiddenPublicSecretEnvPatterns = [
  /NEXT_PUBLIC_[A-Z0-9_]*(API_KEY|ACCESS_KEY|TOKEN|SECRET|PASSWORD)/g
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(text, expected, filePath) {
  assert(text.includes(expected), `${filePath} must include "${expected}"`);
}

function contextAround(text, index, length, radius = 180) {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + length + radius));
}

function hasUnsafePattern(text, pattern) {
  pattern.lastIndex = 0;
  const matches = [...text.matchAll(pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`))];
  return matches.some((match) => {
    const context = contextAround(text, match.index ?? 0, match[0].length);
    return !safeNegationPattern.test(context);
  });
}

const packageJsonPath = absolute("package.json");
if (!fs.existsSync(packageJsonPath)) {
  fail("package.json is missing; run this check from the repository root");
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  assert(packageJson.version === "2.1.7", `package.json version must be 2.1.7, got ${packageJson.version}`);

  const scripts = packageJson.scripts || {};
  assert(scripts["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must define public-demo:check");
  assert(scripts["qa:public-demo"] === "node scripts/full-qa-gate.mjs --category=public-demo", "package.json must define qa:public-demo");
  assert(scripts["clean:rc"] === "node scripts/clean-release-candidate.mjs", "package.json must define clean:rc");
  assert(scripts["security:key:check"] === "node tests/security-key-handling-check.mjs", "v2.1.7 must preserve v2.1.7 security:key:check");
  assert(scripts["qa:security"] === "node scripts/full-qa-gate.mjs --category=security", "v2.1.7 must preserve v2.1.7 qa:security");
}

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

if (exists("scripts/full-qa-gate.mjs")) {
  const fullQaGate = readText("scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "public-demo", "scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "public-demo-release-candidate", "scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "tests/public-demo-release-candidate-check.mjs", "scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "2.1.7", "scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "provider-key-handling", "scripts/full-qa-gate.mjs");
  assertIncludes(fullQaGate, "tests/security-key-handling-check.mjs", "scripts/full-qa-gate.mjs");
} else {
  fail("scripts/full-qa-gate.mjs is missing");
}

if (exists("tests/full-qa-gate-check.mjs")) {
  const fullQaGateCheck = readText("tests/full-qa-gate-check.mjs");
  assertIncludes(fullQaGateCheck, "public-demo", "tests/full-qa-gate-check.mjs");
  assertIncludes(fullQaGateCheck, "tests/public-demo-release-candidate-check.mjs", "tests/full-qa-gate-check.mjs");
  assertIncludes(fullQaGateCheck, "qa:public-demo", "tests/full-qa-gate-check.mjs");
  assertIncludes(fullQaGateCheck, "2.1.7", "tests/full-qa-gate-check.mjs");
}

for (const file of filesToScan) {
  if (!exists(file)) continue;
  const text = readText(file);

  for (const pattern of misleadingCapabilityPatterns) {
    if (hasUnsafePattern(text, pattern)) {
      fail(`${file} contains an unsafe public-demo claim matching ${pattern}`);
    }
  }

  for (const pattern of suspiciousSecretValuePatterns) {
    if (pattern.test(text)) {
      fail(`${file} appears to contain a secret-like value matching ${pattern}`);
    }
  }

  for (const pattern of forbiddenPublicSecretEnvPatterns) {
    const matches = text.match(pattern) || [];
    const unsafeMatches = matches.filter((match) => {
      const index = text.indexOf(match);
      const nearbyText = contextAround(text, index, match.length);
      return !safeNegationPattern.test(nearbyText);
    });

    if (unsafeMatches.length > 0) {
      fail(`${file} contains unsafe public secret env reference: ${unsafeMatches.join(", ")}`);
    }
  }
}

const readme = exists("README.md") ? readText("README.md") : "";
assertIncludes(readme, "v2.1.7", "README.md");
assertIncludes(readme, "Public Demo Release Candidate", "README.md");

if (exists("docs/public-demo.md")) {
  const publicDemoDoc = readText("docs/public-demo.md");
  assert(/limitations/i.test(publicDemoDoc), "docs/public-demo.md must include limitations copy");
  assertIncludes(publicDemoDoc, "npm run public-demo:check", "docs/public-demo.md");
  assertIncludes(publicDemoDoc, "server-only", "docs/public-demo.md");
}

if (exists("docs/release-candidate-checklist.md")) {
  const rcChecklist = readText("docs/release-candidate-checklist.md");
  assertIncludes(rcChecklist, "npm run public-demo:check", "docs/release-candidate-checklist.md");
  assertIncludes(rcChecklist, "npm run qa:public-demo", "docs/release-candidate-checklist.md");
  assertIncludes(rcChecklist, "npm run security:key:check", "docs/release-candidate-checklist.md");
}

if (failures.length) {
  console.error("Public demo release-candidate checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Public demo release-candidate check passed for v2.1.7.");
