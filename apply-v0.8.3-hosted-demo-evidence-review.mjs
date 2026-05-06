import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.3";
const RELEASE_LABEL = "v0.8.3 — Hosted Demo Evidence Review";

function fp(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(fp(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(fp(relativePath), "utf8");
}

function write(relativePath, content) {
  const target = fp(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function writeJson(relativePath, data) {
  write(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function appendOnce(relativePath, marker, content) {
  if (!exists(relativePath)) {
    write(relativePath, `${content.trim()}\n`);
    return;
  }

  const current = read(relativePath);
  if (current.includes(marker)) return;

  write(relativePath, `${current.trimEnd()}\n\n${content.trim()}\n`);
}

function prependOnce(relativePath, marker, content) {
  if (!exists(relativePath)) {
    write(relativePath, `${content.trim()}\n`);
    return;
  }

  const current = read(relativePath);
  if (current.includes(marker)) return;

  write(relativePath, `${content.trim()}\n\n${current.trimStart()}`);
}

function replaceVersionReferences(relativePath) {
  if (!exists(relativePath)) return;
  let text = read(relativePath);
  text = text.replaceAll("v0.8.2", `v${VERSION}`);
  text = text.replaceAll("0.8.2", VERSION);
  write(relativePath, text);
}

function updatePackageJson() {
  if (!exists("package.json")) {
    throw new Error("package.json not found. Run from repository root.");
  }

  const pkg = JSON.parse(read("package.json"));
  pkg.version = VERSION;
  pkg.description = "Hosted Demo Evidence Review preserving Public Demo Release Candidate, Public Demo Evidence Lock, Release Warning Cleanup, and Security and Key Handling validation.";

  pkg.scripts = pkg.scripts || {};
  pkg.scripts["hosted-demo:evidence:check"] = "node tests/hosted-demo-evidence-review-check.mjs";
  pkg.scripts["public-demo:evidence:check"] ||= "node tests/public-demo-evidence-lock-check.mjs";
  pkg.scripts["release:warning:check"] ||= "node tests/release-warning-cleanup-check.mjs";
  pkg.scripts["public-demo:check"] ||= "node tests/public-demo-release-candidate-check.mjs";
  pkg.scripts["qa:public-demo"] ||= "node scripts/full-qa-gate.mjs --category=public-demo";
  pkg.scripts["security:key:check"] ||= "node tests/security-key-handling-check.mjs";
  pkg.scripts["qa:security"] ||= "node scripts/full-qa-gate.mjs --category=security";

  writeJson("package.json", pkg);
}

function updatePackageLock() {
  if (!exists("package-lock.json")) return;

  const lock = JSON.parse(read("package-lock.json"));
  lock.version = VERSION;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = VERSION;
  }
  writeJson("package-lock.json", lock);
}

function updateFullQaGate() {
  const relativePath = "scripts/full-qa-gate.mjs";
  if (!exists(relativePath)) {
    throw new Error("scripts/full-qa-gate.mjs not found.");
  }

  let text = read(relativePath);
  const hostedGate = '  { category: "release", name: "hosted-demo-evidence-review", command: ["node", "tests/hosted-demo-evidence-review-check.mjs"] },';

  if (!text.includes("hosted-demo-evidence-review")) {
    const evidenceLockGate = /(\s*\{\s*category:\s*"release",\s*name:\s*"public-demo-evidence-lock",\s*command:\s*\["node",\s*"tests\/public-demo-evidence-lock-check\.mjs"\]\s*\},)/;
    if (evidenceLockGate.test(text)) {
      text = text.replace(evidenceLockGate, `$1\n${hostedGate}`);
    } else {
      text = text.replace(/const gates = \[\s*/, (match) => `${match}${hostedGate}\n`);
    }
  }

  text = text.replaceAll("0.8.2", VERSION);
  text = text.replaceAll("v0.8.2", `v${VERSION}`);
  text = text.replace(/Full QA gate passed for v[0-9.]+\./, `Full QA gate passed for v${VERSION}.`);

  write(relativePath, text);
}

function updateFullQaGateCheck() {
  const relativePath = "tests/full-qa-gate-check.mjs";
  if (!exists(relativePath)) return;

  let text = read(relativePath);
  text = text.replaceAll("0.8.2", VERSION);
  text = text.replaceAll("v0.8.2", `v${VERSION}`);

  if (!text.includes("hosted-demo-evidence-review")) {
    const insertion = `
const hostedDemoEvidenceReviewSource = read("scripts/full-qa-gate.mjs");
assert(hostedDemoEvidenceReviewSource.includes("hosted-demo-evidence-review"), "Full QA gate must include hosted demo evidence review");
assert(hostedDemoEvidenceReviewSource.includes("tests/hosted-demo-evidence-review-check.mjs"), "Full QA gate must run hosted demo evidence review check");

const packageForHostedDemoEvidence = JSON.parse(read("package.json"));
assert(packageForHostedDemoEvidence.scripts?.["hosted-demo:evidence:check"] === "node tests/hosted-demo-evidence-review-check.mjs", "package.json must expose hosted-demo:evidence:check");
assert(exists("tests/hosted-demo-evidence-review-check.mjs"), "hosted demo evidence review check file must exist");
assert(exists("docs/hosted-demo-evidence-review.md"), "hosted demo evidence review doc must exist");
assert(exists("docs/hosted-demo-review-checklist.md"), "hosted demo review checklist doc must exist");
`;
    if (/console\.log\(/.test(text)) {
      text = text.replace(/\nconsole\.log\(/, `${insertion}\nconsole.log(`);
    } else {
      text = `${text.trimEnd()}\n${insertion}\n`;
    }
  }

  write(relativePath, text);
}

function writeHostedDemoCheck() {
  const content = `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.3";

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
  console.error(\`FAIL hosted-demo evidence review check: \${message}\`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));

assert(pkg.version === VERSION, \`package.json version must be \${VERSION}\`);
assert(pkg.description?.includes("Hosted Demo Evidence Review"), "package description must identify Hosted Demo Evidence Review");
assert(pkg.description?.includes("Public Demo Release Candidate"), "package description must preserve Public Demo Release Candidate wording");
assert(pkg.description?.includes("Public Demo Evidence Lock"), "package description must preserve Public Demo Evidence Lock wording");
assert(pkg.description?.includes("Release Warning Cleanup"), "package description must preserve Release Warning Cleanup wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");

assert(pkg.scripts?.["hosted-demo:evidence:check"] === "node tests/hosted-demo-evidence-review-check.mjs", "package.json must expose hosted-demo:evidence:check");
assert(pkg.scripts?.["public-demo:evidence:check"] === "node tests/public-demo-evidence-lock-check.mjs", "package.json must preserve public-demo:evidence:check");
assert(pkg.scripts?.["release:warning:check"] === "node tests/release-warning-cleanup-check.mjs", "package.json must preserve release:warning:check");
assert(pkg.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must preserve public-demo:check");
assert(pkg.scripts?.["security:key:check"] === "node tests/security-key-handling-check.mjs", "package.json must preserve security:key:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, \`package-lock.json version must be \${VERSION}\`);
  assert(lock.packages?.[""]?.version === VERSION, \`package-lock root package version must be \${VERSION}\`);
}

const requiredFiles = [
  "docs/hosted-demo-evidence-review.md",
  "docs/hosted-demo-review-checklist.md",
  "docs/public-demo-evidence-lock.md",
  "docs/release-evidence-lock.md",
  "tests/hosted-demo-evidence-review-check.mjs",
  "tests/public-demo-evidence-lock-check.mjs",
  "tests/release-warning-cleanup-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/security-key-handling-check.mjs",
  "scripts/full-qa-gate.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), \`missing required file: \${file}\`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("0.8.3"), "Full QA gate must reference v0.8.3");
assert(fullQaGate.includes("hosted-demo-evidence-review"), "Full QA gate must include hosted demo evidence review");
assert(fullQaGate.includes("tests/hosted-demo-evidence-review-check.mjs"), "Full QA gate must run hosted demo evidence review check");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must preserve public demo evidence lock");

const hostedDemoDoc = read("docs/hosted-demo-evidence-review.md");
assert(hostedDemoDoc.includes("v0.8.3"), "hosted demo evidence review doc must reference v0.8.3");
assert(hostedDemoDoc.includes("No feature changes"), "hosted demo evidence review doc must state no feature changes");
assert(hostedDemoDoc.includes("No provider changes"), "hosted demo evidence review doc must state no provider changes");
assert(hostedDemoDoc.includes("Hosted demo URL"), "hosted demo evidence review doc must include hosted demo URL section");
assert(hostedDemoDoc.includes("Manual evidence"), "hosted demo evidence review doc must include manual evidence section");

const checklist = read("docs/hosted-demo-review-checklist.md");
assert(checklist.includes("npm run hosted-demo:evidence:check"), "hosted demo checklist must include hosted-demo evidence check command");
assert(checklist.includes("npm run qa"), "hosted demo checklist must include full QA command");
assert(checklist.includes("screenshots"), "hosted demo checklist must mention screenshots");
assert(checklist.includes("full-qa-gate-report"), "hosted demo checklist must mention full QA artifact");

const publicDemoDoc = exists("docs/public-demo.md") ? read("docs/public-demo.md") : "";
assert(!/production-ready\s+scraping/i.test(publicDemoDoc), "public demo docs must not claim production-ready scraping");
assert(!/automatic\s+legal\s+clearance/i.test(publicDemoDoc), "public demo docs must not claim automatic legal clearance");
assert(!/guaranteed\s+source\s+verification/i.test(publicDemoDoc), "public demo docs must not claim guaranteed source verification");

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  assert(report.app_version === VERSION, "current full QA artifact must match v0.8.3");
  assert(report.status === "passed", "current full QA artifact must be passed");
  assert(report.failed_gate_count === 0, "current full QA artifact must have zero failed gates");
  assert(Array.isArray(report.results), "full QA artifact must contain results array");
} else {
  console.warn("WARN hosted-demo evidence review: artifacts/full-qa-gate-report.json is absent. Run npm run qa to produce it.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Hosted Demo Evidence Review checks passed for v0.8.3.");
`;
  write("tests/hosted-demo-evidence-review-check.mjs", content);
}

function writeDocs() {
  write("docs/hosted-demo-evidence-review.md", `# Hosted Demo Evidence Review — v0.8.3

v0.8.3 locks the evidence-review process for the hosted public demo.

## Scope

- Hosted demo behavior review
- README/demo-copy consistency review
- Full QA artifact review
- Manual screenshot/evidence checklist
- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

## Hosted demo URL

Record the hosted demo URL here after deployment:

\`\`\`text
Hosted demo URL: pending
\`\`\`

If the URL is still pending, do not claim that a hosted deployment has been verified.

## Manual evidence

Capture or confirm:

- Landing page / initial public demo state
- Provider/runtime status panel if visible
- Export/review surface if visible
- Public-demo limitation copy
- Full QA artifact named \`full-qa-gate-report\`
- No private credentials displayed
- No fake-live provider claims

## Validation

\`\`\`bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`

## Pass condition

The hosted demo evidence review is complete only when the hosted URL, screenshots/evidence, docs, and full QA artifact match the public-demo behavior.
`);

  write("docs/hosted-demo-review-checklist.md", `# Hosted Demo Review Checklist — v0.8.3

## Required commands

\`\`\`bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`

## Hosted evidence

- Hosted URL loads.
- Landing page copy matches README and public-demo docs.
- Screenshots are captured for the public demo entry state.
- Screenshots are captured for evidence/export surfaces when available.
- The full-qa-gate-report artifact exists.
- The full-qa-gate-report artifact shows \`status: passed\`.
- The full-qa-gate-report artifact shows \`failed_gate_count: 0\`.
- The full-qa-gate-report artifact shows \`app_version: 0.8.3\`.

## Negative checks

- No claim of production scraping.
- No claim of automatic legal clearance.
- No claim of guaranteed source verification.
- No private provider keys or credentials visible.
- No unavailable provider appears active.

## Release rule

Do not move beyond v0.8.3 until the hosted demo evidence has been reviewed against the committed documentation and QA artifact.
`);
}

function updateDocs() {
  const docs = [
    "README.md",
    "PATCH_MANIFEST.md",
    "docs/release-checklist.md",
    "docs/validation-report.md",
    "docs/public-demo-evidence-lock.md",
    "docs/release-evidence-lock.md",
    "docs/public-demo.md",
    "docs/release-candidate-checklist.md",
    "docs/full-qa-gate.md"
  ];

  for (const doc of docs) replaceVersionReferences(doc);

  prependOnce("PATCH_MANIFEST.md", "v0.8.3 — Hosted Demo Evidence Review", `# v0.8.3 — Hosted Demo Evidence Review Patch Manifest

## Scope

v0.8.3 adds a hosted-demo evidence-review gate and documentation while preserving the v0.8.2 Public Demo Evidence Lock.

## Changed files

- \`package.json\`
- \`package-lock.json\`
- \`README.md\`
- \`PATCH_MANIFEST.md\`
- \`scripts/full-qa-gate.mjs\`
- \`tests/full-qa-gate-check.mjs\`
- \`tests/hosted-demo-evidence-review-check.mjs\`
- \`docs/hosted-demo-evidence-review.md\`
- \`docs/hosted-demo-review-checklist.md\`
- \`docs/release-checklist.md\`
- \`docs/validation-report.md\`

## Non-goals

- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes
`);

  appendOnce("README.md", "v0.8.3 — Hosted Demo Evidence Review", `## Hosted Demo Evidence Review

The current target is **v0.8.3 — Hosted Demo Evidence Review**.

This release adds a deterministic hosted-demo evidence-review gate and documentation. It does not add feature, provider, retrieval, or export behavior changes.

Run:

\`\`\`bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa
\`\`\`
`);

  appendOnce("docs/release-checklist.md", "v0.8.3 hosted demo evidence review", `## v0.8.3 hosted demo evidence review

Run:

\`\`\`bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`

Confirm the hosted demo evidence checklist before tagging.
`);

  appendOnce("docs/validation-report.md", "v0.8.3 Hosted Demo Evidence Review", `## v0.8.3 Hosted Demo Evidence Review

v0.8.3 adds the hosted-demo evidence-review gate. The release does not change application behavior.

Required validation:

\`\`\`bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`
`);
}

updatePackageJson();
updatePackageLock();
updateFullQaGate();
updateFullQaGateCheck();
writeHostedDemoCheck();
writeDocs();
updateDocs();

console.log("Applied v0.8.3 Hosted Demo Evidence Review patch.");
console.log("Next commands:");
console.log("npm run hosted-demo:evidence:check");
console.log("npm run public-demo:evidence:check");
console.log("npm run release:warning:check");
console.log("npm run public-demo:check");
console.log("npm run qa:public-demo");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
