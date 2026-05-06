import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.1";
const PREVIOUS_VERSION = "0.8.1";
const RELEASE_LABEL = "v0.8.1 — Release Warning Cleanup";

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

function replaceInFile(relativePath, updater) {
  if (!exists(relativePath)) return false;
  const before = read(relativePath);
  const after = updater(before);
  if (after !== before) {
    write(relativePath, after);
    return true;
  }
  return false;
}

function replaceVersionReferences(relativePath) {
  return replaceInFile(relativePath, (text) =>
    text
      .replaceAll(`v${PREVIOUS_VERSION}`, `v${VERSION}`)
      .replaceAll(PREVIOUS_VERSION, VERSION)
  );
}

function updatePackageJson() {
  if (!exists("package.json")) {
    throw new Error("package.json not found. Run this script from the repository root.");
  }

  const pkg = JSON.parse(read("package.json"));
  pkg.version = VERSION;
  pkg.description =
    "Release Warning Cleanup preserving Public Demo Release Candidate and Security and Key Handling coverage while removing known lint warnings and Node 20 CI action warnings.";
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["release:warning:check"] = "node tests/release-warning-cleanup-check.mjs";
  writeJson("package.json", pkg);
}

function updatePackageLock() {
  if (!exists("package-lock.json")) return;
  const lock = JSON.parse(read("package-lock.json"));
  lock.version = VERSION;
  if (lock.packages?.[""]) {
    lock.packages[""].version = VERSION;
  }
  writeJson("package-lock.json", lock);
}

function removeNamedImport(text, importedName) {
  return text.replace(/import\s+\{([\s\S]*?)\}\s+from\s+(["'][^"']+["']);\s*\n/g, (match, rawNames, modulePath) => {
    const names = rawNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const filtered = names.filter((name) => {
      const localName = name.includes(" as ") ? name.split(/\s+as\s+/).pop()?.trim() : name;
      return name !== importedName && localName !== importedName;
    });

    if (filtered.length === names.length) return match;
    if (filtered.length === 0) return "";

    return `import { ${filtered.join(", ")} } from ${modulePath};\n`;
  });
}

function fixKnownLintWarnings() {
  const exportFile = "src/lib/export.ts";
  replaceInFile(exportFile, (text) => {
    let next = text;
    for (const importedName of [
      "createEvidencePackCsvExport",
      "createEvidencePackHtmlExport",
      "createEvidencePackJsonExport",
      "buildAttributionPackPayload"
    ]) {
      next = removeNamedImport(next, importedName);
    }
    return next;
  });

  const evidencePackFile = "src/lib/evidence-pack-export.ts";
  replaceInFile(evidencePackFile, (text) => removeNamedImport(text, "ResearchClaim"));

  const attributionFile = "src/lib/attribution-generator.ts";
  replaceInFile(attributionFile, (text) => {
    if (!text.includes("_result") || text.includes("void _result;")) return text;

    let next = text.replace(
      /(function\s+\w+\s*\([^)]*\b_result\b[^)]*\)\s*\{)/,
      "$1\n  void _result;"
    );

    if (next !== text) return next;

    next = text.replace(
      /(\([^)]*\b_result\b[^)]*\)\s*=>\s*\{)/,
      "$1\n  void _result;"
    );

    if (next !== text) return next;

    throw new Error("Found _result in src/lib/attribution-generator.ts but could not insert a usage guard. Edit manually: add `void _result;` inside the function body.");
  });
}

function updateWorkflowActions() {
  const workflow = ".github/workflows/ci.yml";
  if (!exists(workflow)) return;

  replaceInFile(workflow, (text) =>
    text
      .replaceAll("actions/checkout@v4", "actions/checkout@v5")
      .replaceAll("actions/setup-node@v4", "actions/setup-node@v6")
      .replaceAll("actions/upload-artifact@v4", "actions/upload-artifact@v7")
      .replace(/node-version:\s*['\"]?20['\"]?/g, "node-version: 24")
      .replace(/node-version:\s*['\"]?22['\"]?/g, "node-version: 24")
  );
}

function updateVersionedFiles() {
  const targetExtensions = new Set([".json", ".mjs", ".md", ".ts", ".tsx", ".yml", ".yaml", ".example"]);
  const ignoredDirs = new Set([".git", "node_modules", ".next", "out", "dist", "coverage", "playwright-report", "test-results"]);

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, entry.name);
      const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");

      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(absolutePath);
        continue;
      }

      const ext = path.extname(entry.name);
      if (targetExtensions.has(ext) || entry.name === "package-lock.json" || entry.name === "package.json") {
        replaceVersionReferences(relativePath);
      }
    }
  }

  walk(root);
}

function prependPatchManifest() {
  const manifest = "PATCH_MANIFEST.md";
  const section = `# ${RELEASE_LABEL} Patch Manifest

## Scope

v0.8.1 is a release-warning cleanup patch. It removes known lint warnings, updates GitHub Actions to Node 24-capable action versions, and keeps v0.8.x public-demo/security behavior unchanged.

## Changed files

- \`package.json\`
- \`package-lock.json\`
- \`.github/workflows/ci.yml\`
- \`PATCH_MANIFEST.md\`
- \`docs/validation-report.md\`
- \`src/lib/attribution-generator.ts\`
- \`src/lib/evidence-pack-export.ts\`
- \`src/lib/export.ts\`
- \`tests/release-warning-cleanup-check.mjs\`

## Non-goals

- No retrieval changes
- No provider changes
- No public-demo behavior changes
- No security/key-handling behavior changes
- No UI feature expansion

## Validation

\`\`\`bash
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`
`;

  if (!exists(manifest)) {
    write(manifest, section);
    return;
  }

  const current = read(manifest);
  if (current.includes(`${RELEASE_LABEL} Patch Manifest`)) return;
  write(manifest, `${section}\n${current.trimStart()}`);
}

function appendValidationReport() {
  const file = "docs/validation-report.md";
  const section = `## ${RELEASE_LABEL}

v0.8.1 removes release-blocking noise after the v0.8.1 Public Demo Release Candidate validation pass.

Expected validation:

\`\`\`bash
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
\`\`\`

Acceptance standard:

- CI validate job passes.
- Full QA gate passes.
- Typecheck passes.
- Lint has no known unused-variable/import warnings from \`src/lib/export.ts\`, \`src/lib/evidence-pack-export.ts\`, or \`src/lib/attribution-generator.ts\`.
- GitHub Actions workflow no longer uses Node 20-era \`actions/checkout@v4\`, \`actions/setup-node@v4\`, or \`actions/upload-artifact@v4\`.
`;

  if (!exists(file)) {
    write(file, section);
    return;
  }

  const current = read(file);
  if (current.includes(RELEASE_LABEL)) return;
  write(file, `${current.trimEnd()}\n\n${section}`);
}

function writeReleaseWarningCheck() {
  const content = `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "0.8.1";

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function fail(message) {
  console.error(\`FAIL release-warning cleanup check: \${message}\`);
  process.exitCode = 1;
}

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== VERSION) fail(\`package.json version must be \${VERSION}, got \${pkg.version}\`);
if (!pkg.description.includes("Release Warning Cleanup")) fail("package description must identify Release Warning Cleanup");
if (!pkg.description.includes("Public Demo Release Candidate")) fail("package description must preserve Public Demo Release Candidate wording");
if (!pkg.description.includes("Security and Key Handling")) fail("package description must preserve Security and Key Handling wording");
if (pkg.scripts?.["release:warning:check"] !== "node tests/release-warning-cleanup-check.mjs") fail("package.json must expose npm run release:warning:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  if (lock.version !== VERSION) fail("package-lock.json root version must be 0.8.1");
  if (lock.packages?.[""]?.version !== VERSION) fail("package-lock.json package version must be 0.8.1");
}

const exportTs = exists("src/lib/export.ts") ? read("src/lib/export.ts") : "";
for (const staleImport of ["createEvidencePackCsvExport", "createEvidencePackHtmlExport", "createEvidencePackJsonExport", "buildAttributionPackPayload"]) {
  const importPattern = new RegExp("import\\s+\\{[^}]*" + staleImport + "[^}]*\\}\\s+from");
  if (importPattern.test(exportTs)) fail(\`src/lib/export.ts still imports unused \${staleImport}\`);
}

const evidencePack = exists("src/lib/evidence-pack-export.ts") ? read("src/lib/evidence-pack-export.ts") : "";
if (/import\\s+\\{[^}]*ResearchClaim[^}]*\\}\\s+from/.test(evidencePack)) fail("src/lib/evidence-pack-export.ts still imports unused ResearchClaim");

const attribution = exists("src/lib/attribution-generator.ts") ? read("src/lib/attribution-generator.ts") : "";
if (attribution.includes("_result") && !attribution.includes("void _result;")) fail("src/lib/attribution-generator.ts must either remove _result or mark it used with void _result;");

const workflow = exists(".github/workflows/ci.yml") ? read(".github/workflows/ci.yml") : "";
for (const staleAction of ["actions/checkout@v4", "actions/setup-node@v4", "actions/upload-artifact@v4"]) {
  if (workflow.includes(staleAction)) fail(\`.github/workflows/ci.yml still uses \${staleAction}\`);
}
if (workflow && !/actions\\/checkout@v[56]/.test(workflow)) fail("workflow should use actions/checkout@v5 or newer Node 24-capable major");
if (workflow && !workflow.includes("actions/setup-node@v6")) fail("workflow should use actions/setup-node@v6");
if (workflow && !workflow.includes("actions/upload-artifact@v7")) fail("workflow should use actions/upload-artifact@v7");
if (workflow && !/node-version:\\s*24/.test(workflow)) fail("workflow should run Node.js 24");

const fullQaGate = exists("scripts/full-qa-gate.mjs") ? read("scripts/full-qa-gate.mjs") : "";
if (fullQaGate && !fullQaGate.includes(VERSION)) fail("scripts/full-qa-gate.mjs should identify app version 0.8.1");

if (process.exitCode) process.exit(process.exitCode);
console.log("Release warning cleanup check passed for v0.8.1.");
`;
  write("tests/release-warning-cleanup-check.mjs", content);
}

writeReleaseWarningCheck();
updateVersionedFiles();
updatePackageJson();
updatePackageLock();
fixKnownLintWarnings();
updateWorkflowActions();
prependPatchManifest();
appendValidationReport();

console.log("Applied v0.8.1 Release Warning Cleanup patch.");
console.log("Next commands:");
console.log("npm run release:warning:check");
console.log("npm run public-demo:check");
console.log("npm run qa:public-demo");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
