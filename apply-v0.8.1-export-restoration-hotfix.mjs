import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function file(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(file(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(file(relativePath), "utf8");
}

function write(relativePath, text) {
  fs.writeFileSync(file(relativePath), text, "utf8");
}

function ensurePackageVersion() {
  const pkgPath = "package.json";
  if (!exists(pkgPath)) throw new Error("package.json not found. Run from repo root.");
  const pkg = JSON.parse(read(pkgPath));
  pkg.version = "0.8.2";
  pkg.description =
    "Release Warning Cleanup preserving Public Demo Release Candidate and Security and Key Handling for server-only provider keys, redacted diagnostics, demo-safe limitations, and non-misleading provider/runtime presentation.";
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["release:warning:check"] = "node tests/release-warning-cleanup-check.mjs";
  write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const lockPath = "package-lock.json";
  if (exists(lockPath)) {
    const lock = JSON.parse(read(lockPath));
    lock.version = "0.8.2";
    if (lock.packages?.[""]) lock.packages[""].version = "0.8.2";
    write(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  }
}

function restoreEvidencePackExports() {
  const target = "src/lib/export.ts";
  if (!exists(target)) throw new Error(`${target} not found`);
  let text = read(target);

  const exportLine =
    'export { createEvidencePackCsvExport, createEvidencePackHtmlExport, createEvidencePackJsonExport } from "@/lib/evidence-pack-export";';

  // Remove old value imports for these names if present. They caused no-unused-vars warnings in v0.8.0.
  text = text.replace(
    /import\s+\{([^}]*)\}\s+from\s+["']@\/lib\/evidence-pack-export["'];\n?/g,
    (match, names) => {
      const keep = names
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .filter(
          (name) =>
            ![
              "createEvidencePackCsvExport",
              "createEvidencePackHtmlExport",
              "createEvidencePackJsonExport"
            ].includes(name)
        );

      if (keep.length === 0) return "";
      return `import { ${keep.join(", ")} } from "@/lib/evidence-pack-export";\n`;
    }
  );

  // Add named re-export. This restores API compatibility without creating unused imports.
  if (!text.includes(exportLine)) {
    text = `${exportLine}\n${text}`;
  }

  write(target, text);
}

function removeUnusedResearchClaimImport() {
  const target = "src/lib/evidence-pack-export.ts";
  if (!exists(target)) throw new Error(`${target} not found`);
  let text = read(target);

  // Remove ResearchClaim only from import specifiers. ESLint reported it as unused.
  text = text.replace(
    /import\s+type\s+\{([^}]*)\}\s+from\s+["']@\/types\/research["'];/g,
    (match, names) => {
      const keep = names
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .filter((name) => name !== "ResearchClaim");
      if (keep.length === 0) return "";
      return `import type { ${keep.join(", ")} } from "@/types/research";`;
    }
  );

  text = text.replace(
    /import\s+\{([^}]*)\}\s+from\s+["']@\/types\/research["'];/g,
    (match, names) => {
      const keep = names
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .filter((name) => name !== "ResearchClaim");
      if (keep.length === 0) return "";
      return `import { ${keep.join(", ")} } from "@/types/research";`;
    }
  );

  write(target, text);
}

function markResultParameterUsed() {
  const target = "src/lib/attribution-generator.ts";
  if (!exists(target)) throw new Error(`${target} not found`);
  let text = read(target);

  if (!text.includes("_result") || text.includes("void _result;")) {
    write(target, text);
    return;
  }

  const resultIndex = text.indexOf("_result");
  const braceIndex = text.indexOf("{", resultIndex);
  if (braceIndex === -1) {
    throw new Error("Found _result but could not find a following function body opening brace.");
  }

  const lineStart = text.lastIndexOf("\n", 0, braceIndex) + 1;
  const indent = (text.slice(lineStart, braceIndex).match(/^\s*/) || [""])[0];
  text = `${text.slice(0, braceIndex + 1)}\n${indent}  void _result;${text.slice(braceIndex + 1)}`;
  write(target, text);
}

function fixReleaseWarningCheck() {
  const target = "tests/release-warning-cleanup-check.mjs";
  if (!exists(target)) throw new Error(`${target} not found`);

  const text = `import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function file(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(file(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(file(relativePath), "utf8");
}

function fail(message) {
  failures.push(message);
}

const pkg = JSON.parse(read("package.json"));

if (pkg.version !== "0.8.2") {
  fail(\`package.json version must be 0.8.2, got \${pkg.version}\`);
}

const description = pkg.description || "";
for (const phrase of ["Release Warning Cleanup", "Public Demo Release Candidate", "Security and Key Handling"]) {
  if (!description.includes(phrase)) {
    fail(\`package description must include \"\${phrase}\"\`);
  }
}

if (pkg.scripts?.["release:warning:check"] !== "node tests/release-warning-cleanup-check.mjs") {
  fail("package.json must expose npm run release:warning:check");
}

const exportLib = read("src/lib/export.ts");
for (const expectedExport of [
  "createEvidencePackCsvExport",
  "createEvidencePackHtmlExport",
  "createEvidencePackJsonExport"
]) {
  if (!exportLib.includes(expectedExport)) {
    fail(\`src/lib/export.ts must export \${expectedExport}\`);
  }
}

const evidencePack = read("src/lib/evidence-pack-export.ts");
if (/import[^;]*\\bResearchClaim\\b[^;]*from/.test(evidencePack)) {
  fail("src/lib/evidence-pack-export.ts still imports unused ResearchClaim");
}

const attribution = read("src/lib/attribution-generator.ts");
if (attribution.includes("_result") && !attribution.includes("void _result;")) {
  fail("src/lib/attribution-generator.ts must either remove _result or mark it used with void _result;");
}

const workflowPath = ".github/workflows/ci.yml";
if (exists(workflowPath)) {
  const workflow = read(workflowPath);

  for (const staleAction of ["actions/checkout@v4", "actions/setup-node@v4", "actions/upload-artifact@v4"]) {
    if (workflow.includes(staleAction)) {
      fail(\`${workflowPath} still uses stale \${staleAction}\`);
    }
  }

  if (!workflow.includes("actions/checkout@v5")) {
    fail("workflow should use actions/checkout@v5 or newer Node 24-capable major");
  }
  if (!workflow.includes("actions/setup-node@v6")) {
    fail("workflow should use actions/setup-node@v6");
  }
  if (!workflow.includes("actions/upload-artifact@v7")) {
    fail("workflow should use actions/upload-artifact@v7");
  }
  if (!/node-version:\\s*["']?24["']?/.test(workflow)) {
    fail("workflow should run Node.js 24");
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(\`FAIL release-warning cleanup check: \${failure}\`);
  }
  process.exit(1);
}

console.log("Release warning cleanup checks passed for v0.8.2.");
`;

  write(target, text);
}

function updateWorkflow() {
  const target = ".github/workflows/ci.yml";
  if (!exists(target)) return;
  let text = read(target);
  text = text.replaceAll("actions/checkout@v4", "actions/checkout@v5");
  text = text.replaceAll("actions/setup-node@v4", "actions/setup-node@v6");
  text = text.replaceAll("actions/upload-artifact@v4", "actions/upload-artifact@v7");
  text = text.replace(/node-version:\s*["']?20["']?/g, "node-version: 24");
  text = text.replace(/node-version:\s*["']?22["']?/g, "node-version: 24");
  write(target, text);
}

function appendMetadata() {
  const manifest = "PATCH_MANIFEST.md";
  if (exists(manifest)) {
    let text = read(manifest);
    if (!text.includes("v0.8.2 — Export Restoration + Warning Check Hotfix")) {
      text += `\n\n# v0.8.2 — Export Restoration + Warning Check Hotfix\n\nRestores evidence-pack export compatibility after warning cleanup, removes the remaining targeted lint warnings, and corrects the release warning check so it rejects stale Node 20-era action versions without rejecting Node 24-capable action versions.\n`;
      write(manifest, text);
    }
  }
}

ensurePackageVersion();
restoreEvidencePackExports();
removeUnusedResearchClaimImport();
markResultParameterUsed();
updateWorkflow();
fixReleaseWarningCheck();
appendMetadata();

console.log("Applied v0.8.2 export restoration + warning-check hotfix.");
console.log("Next commands:");
console.log("npm run release:warning:check");
console.log("npm run public-demo:check");
console.log("npm run qa:public-demo");
console.log("npm run security:key:check");
console.log("npm run qa");
console.log("npm run typecheck");
console.log("npm run lint");
console.log("npm run build");
