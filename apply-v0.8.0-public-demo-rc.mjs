import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.0";
const RELEASE_LABEL = "v0.8.0 — Public Demo Release Candidate";

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function write(relativePath, content) {
  const target = filePath(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function writeJson(relativePath, data) {
  write(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function appendOnce(relativePath, marker, content) {
  if (!exists(relativePath)) {
    write(relativePath, content.trimStart());
    return;
  }
  const current = read(relativePath);
  if (current.includes(marker)) return;
  write(relativePath, `${current.trimEnd()}\n\n${content.trim()}\n`);
}

function prependOnce(relativePath, marker, content) {
  if (!exists(relativePath)) {
    write(relativePath, content.trimStart());
    return;
  }
  const current = read(relativePath);
  if (current.includes(marker)) return;
  write(relativePath, `${content.trim()}\n\n${current.trimStart()}`);
}

function replaceVersionReferences(relativePath) {
  if (!exists(relativePath)) return;
  let text = read(relativePath);
  text = text.replaceAll("v0.8.0", `v${VERSION}`);
  text = text.replaceAll("0.8.0", VERSION);
  write(relativePath, text);
}

function updatePackageJson() {
  const relativePath = "package.json";
  if (!exists(relativePath)) {
    throw new Error("package.json not found. Run this script from the repository root.");
  }

  const packageJson = JSON.parse(read(relativePath));
  packageJson.version = VERSION;
  packageJson.description = "Public Demo Release Candidate for demo-safe sample data, visible limitations, release-candidate QA, and non-misleading provider/runtime presentation.";
  packageJson.scripts = packageJson.scripts || {};

  packageJson.scripts["public-demo:check"] = "node tests/public-demo-release-candidate-check.mjs";
  packageJson.scripts["qa:public-demo"] = "node scripts/full-qa-gate.mjs --category=public-demo";
  packageJson.scripts["clean:rc"] = "node scripts/clean-release-candidate.mjs";

  if (!packageJson.scripts["security:key:check"]) {
    packageJson.scripts["security:key:check"] = "node tests/security-key-handling-check.mjs";
  }
  if (!packageJson.scripts["qa:security"]) {
    packageJson.scripts["qa:security"] = "node scripts/full-qa-gate.mjs --category=security";
  }

  writeJson(relativePath, packageJson);
}

function updatePackageLock() {
  const relativePath = "package-lock.json";
  if (!exists(relativePath)) return;

  const lock = JSON.parse(read(relativePath));
  lock.version = VERSION;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = VERSION;
  }
  writeJson(relativePath, lock);
}

function updateFullQaGate() {
  const relativePath = "scripts/full-qa-gate.mjs";
  if (!exists(relativePath)) {
    throw new Error("scripts/full-qa-gate.mjs not found. v0.8.0 expects the v0.8.0 Full QA Gate baseline.");
  }

  let text = read(relativePath);
  const gateLine = "  { category: \"public-demo\", name: \"public-demo-release-candidate\", command: [\"node\", \"tests/public-demo-release-candidate-check.mjs\"] },";

  if (!text.includes("public-demo-release-candidate")) {
    const securityGatePattern = /(\s*\{ category: \"security\", name: \"provider-key-handling\", command: \[\"node\", \"tests\/security-key-handling-check\.mjs\"\] \},)/;
    if (securityGatePattern.test(text)) {
      text = text.replace(securityGatePattern, `$1\n${gateLine}`);
    } else {
      text = text.replace(/const gates = \[\s*/, (match) => `${match}${gateLine}\n`);
    }
  }

  text = text.replaceAll("0.8.0", VERSION);
  text = text.replaceAll("v0.8.0", `v${VERSION}`);
  text = text.replace(/Full QA gate passed for v[0-9.]+\./, `Full QA gate passed for v${VERSION}.`);
  write(relativePath, text);
}

function updateFullQaGateCheck() {
  const relativePath = "tests/full-qa-gate-check.mjs";
  if (!exists(relativePath)) return;

  let text = read(relativePath);
  text = text.replaceAll("0.8.0", VERSION);
  text = text.replaceAll("v0.8.0", `v${VERSION}`);

  text = text.replace(
    /assert\(pkg\.description\.includes\("Security and Key Handling"\),[^\n]+\n/,
    'assert(pkg.description.includes("Public Demo Release Candidate"), "package description must identify Public Demo Release Candidate");\n'
  );

  if (!text.includes('pkg.scripts?.["public-demo:check"]')) {
    text = text.replace(
      /assert\(pkg\.scripts\?\.\["qa:security"\]\?\.includes\("--category=security"\), "package\.json must expose security QA category"\);/,
      'assert(pkg.scripts?.["qa:security"]?.includes("--category=security"), "package.json must expose security QA category");\nassert(pkg.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must expose npm run public-demo:check");\nassert(pkg.scripts?.["qa:public-demo"]?.includes("--category=public-demo"), "package.json must expose public-demo QA category");'
    );
  }

  text = text.replace(
    'const expectedCategories = ["baseline", "retrieval", "providers", "security", "workflow", "exports", "release"];',
    'const expectedCategories = ["baseline", "retrieval", "providers", "security", "public-demo", "workflow", "exports", "release"];'
  );

  if (!text.includes('"tests/public-demo-release-candidate-check.mjs"')) {
    text = text.replace(
      '  "tests/security-key-handling-check.mjs",\n  "tests/full-qa-gate-check.mjs"',
      '  "tests/security-key-handling-check.mjs",\n  "tests/public-demo-release-candidate-check.mjs",\n  "tests/full-qa-gate-check.mjs"'
    );
  }

  text = text.replace(
    '"qa:security", "qa:workflow", "qa:exports", "qa:release"',
    '"qa:security", "qa:public-demo", "qa:workflow", "qa:exports", "qa:release"'
  );

  text = text.replace(
    /assert\(validation\.includes\("Security and Key Handling"\),[^\n]+\n/,
    'assert(validation.includes("Public Demo Release Candidate"), "validation report must describe the public demo release candidate");\n'
  );

  text = text.replace(
    /assert\(readme\.includes\("Security and Key Handling"\),[^\n]+\n/,
    'assert(readme.includes("Public Demo Release Candidate"), "README must identify the release capability");\n'
  );

  text = text.replace(
    /assert\(manifest\.includes\("Security and Key Handling"\),[^\n]+\n/,
    'assert(manifest.includes("Public Demo Release Candidate"), "PATCH_MANIFEST must identify the release capability");\n'
  );

  write(relativePath, text);
}

function updateDocs() {
  const versionedDocs = [
    "README.md",
    "docs/full-qa-gate.md",
    "docs/local-storage-import-export-hardening.md",
    "docs/museum-open-access-provider-pack.md",
    "docs/provider-runtime-test-pack.md",
    "docs/release-checklist.md",
    "docs/security-and-key-handling.md",
    "docs/stock-illustrative-provider-pack.md",
    "docs/ux-reliability-empty-state-polish.md",
    "docs/validation-report.md"
  ];

  for (const file of versionedDocs) replaceVersionReferences(file);

  const readmeSection = `
## Public Demo Release Candidate

The current target is **${RELEASE_LABEL}**.

This release hardens the app for public inspection. It does not add live scraping, production OAuth, paid-provider assumptions, or fake-live provider behavior.

The public demo must remain usable without private credentials. Provider keys are optional and must remain server-only. Attribution and rights labels are assistance layers, not legal clearance.

Run:

\`\`\`bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
\`\`\`
`;
  appendOnce("README.md", RELEASE_LABEL, readmeSection);

  const manifest = `
# ${RELEASE_LABEL} Patch Manifest

## Changed files

- \`package.json\`
- \`package-lock.json\`
- \`README.md\`
- \`PATCH_MANIFEST.md\`
- \`scripts/full-qa-gate.mjs\`
- \`scripts/clean-release-candidate.mjs\`
- \`tests/full-qa-gate-check.mjs\`
- \`tests/public-demo-release-candidate-check.mjs\`
- \`docs/public-demo.md\`
- \`docs/release-candidate-checklist.md\`
- \`docs/full-qa-gate.md\`
- \`docs/release-checklist.md\`
- \`docs/validation-report.md\`
- \`src/lib/public-demo-release-candidate.ts\`
- \`src/components/PublicDemoReleaseCandidatePanel.tsx\`

## Scope

v0.8.0 prepares the app as a Public Demo Release Candidate while preserving the v0.8.0 Security and Key Handling layer.

## Non-goals

- No new scraping behavior
- No production OAuth
- No paid-provider assumptions
- No fake-live providers
- No legal-clearance claims
- No source-verification guarantees

## Validation

\`\`\`bash
npm run clean:rc
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`
`;
  prependOnce("PATCH_MANIFEST.md", `${RELEASE_LABEL} Patch Manifest`, manifest);

  const fullQaGateAddition = `
## v0.8.0 public-demo category

Additional gate:

\`\`\`bash
npm run qa:public-demo
npm run public-demo:check
\`\`\`

The public-demo category verifies release-candidate copy, demo-safety docs, unavailable-provider boundaries, and preservation of v0.8.0 server-only provider key handling.
`;
  appendOnce("docs/full-qa-gate.md", "v0.8.0 public-demo category", fullQaGateAddition);

  const releaseChecklistAddition = `
## v0.8.0 public-demo release candidate

Run:

\`\`\`bash
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
\`\`\`

Confirm:

- Public demo does not require private credentials.
- Public demo does not imply live scraping.
- Public demo does not imply legal clearance.
- Unavailable providers are clearly disabled, skipped, or labeled.
- Exports do not contain secrets or provider credentials.
`;
  appendOnce("docs/release-checklist.md", "v0.8.0 public-demo release candidate", releaseChecklistAddition);

  const validationReportAddition = `
## v0.8.0 Public Demo Release Candidate

v0.8.0 hardens the project for public-demo inspection. It adds a public-demo release-candidate check, a cleanup command, demo-safe documentation, and explicit non-goals around scraping, production OAuth, legal clearance, and source-verification guarantees.

Required validation:

\`\`\`bash
npm run clean:rc
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`
`;
  appendOnce("docs/validation-report.md", "v0.8.0 Public Demo Release Candidate", validationReportAddition);
}

const patchRoot = path.dirname(new URL(import.meta.url).pathname);
const newFiles = new Map([
  ["tests/public-demo-release-candidate-check.mjs", fs.readFileSync(path.join(patchRoot, "tests/public-demo-release-candidate-check.mjs"), "utf8")],
  ["scripts/clean-release-candidate.mjs", fs.readFileSync(path.join(patchRoot, "scripts/clean-release-candidate.mjs"), "utf8")],
  ["docs/public-demo.md", fs.readFileSync(path.join(patchRoot, "docs/public-demo.md"), "utf8")],
  ["docs/release-candidate-checklist.md", fs.readFileSync(path.join(patchRoot, "docs/release-candidate-checklist.md"), "utf8")],
  ["src/lib/public-demo-release-candidate.ts", fs.readFileSync(path.join(patchRoot, "src/lib/public-demo-release-candidate.ts"), "utf8")],
  ["src/components/PublicDemoReleaseCandidatePanel.tsx", fs.readFileSync(path.join(patchRoot, "src/components/PublicDemoReleaseCandidatePanel.tsx"), "utf8")]
]);

for (const [relativePath, content] of newFiles) write(relativePath, content);

updatePackageJson();
updatePackageLock();
updateFullQaGate();
updateFullQaGateCheck();
updateDocs();

console.log("Applied v0.8.0 Public Demo Release Candidate patch files.");
console.log("v0.8.0 Security and Key Handling scripts are preserved.");
console.log("Next commands:");
console.log("npm run clean:rc");
console.log("npm install");
console.log("npm run public-demo:check");
console.log("npm run qa:public-demo");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
