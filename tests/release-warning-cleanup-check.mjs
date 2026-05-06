import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const VERSION = "1.5.0";

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
  console.error(`FAIL release-warning cleanup check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const packageJson = JSON.parse(read("package.json"));

assert(packageJson.version === VERSION, `package.json version must be ${VERSION}`);
assert(
  packageJson.description?.includes("Release Warning Cleanup"),
  "package description must identify Release Warning Cleanup"
);
assert(
  packageJson.description?.includes("Public Demo Release Candidate"),
  "package description must preserve Public Demo Release Candidate wording"
);
assert(
  packageJson.description?.includes("Security and Key Handling"),
  "package description must preserve Security and Key Handling wording"
);

assert(
  packageJson.scripts?.["release:warning:check"] === "node tests/release-warning-cleanup-check.mjs",
  "package.json must expose release:warning:check"
);
assert(
  packageJson.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs",
  "package.json must preserve public-demo:check"
);
assert(
  packageJson.scripts?.["security:key:check"] === "node tests/security-key-handling-check.mjs",
  "package.json must preserve security:key:check"
);

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, `package-lock.json version must be ${VERSION}`);
  assert(lock.packages?.[""]?.version === VERSION, `package-lock root package version must be ${VERSION}`);
}

const requiredFiles = [
  "src/lib/attribution-generator.ts",
  "src/lib/evidence-pack-export.ts",
  "src/lib/export.ts",
  "tests/release-warning-cleanup-check.mjs",
  ".github/workflows/ci.yml"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const attributionGenerator = read("src/lib/attribution-generator.ts");
assert(
  !/eslint-disable[^\n]*@typescript-eslint\/no-unused-vars/.test(attributionGenerator),
  "src/lib/attribution-generator.ts must not contain an unused no-unused-vars eslint-disable directive"
);
assert(
  !/\b_result\b/.test(attributionGenerator) || /void\s+_result\s*;/.test(attributionGenerator),
  "src/lib/attribution-generator.ts must either remove _result or mark it used with void _result;"
);

const evidencePackExport = read("src/lib/evidence-pack-export.ts");
assert(
  !/import\s+(?:type\s+)?\{[^}]*\bResearchClaim\b[^}]*\}\s+from\s+["']@\/types\/research["']/.test(evidencePackExport),
  "src/lib/evidence-pack-export.ts must not import unused ResearchClaim from @/types/research"
);

const exportLib = read("src/lib/export.ts");
for (const exportName of [
  "createEvidencePackCsvExport",
  "createEvidencePackHtmlExport",
  "createEvidencePackJsonExport",
  "createEvidencePackMarkdownExport"
]) {
  assert(
    exportLib.includes(exportName),
    `src/lib/export.ts must preserve ${exportName}`
  );
}

const workflow = read(".github/workflows/ci.yml");

for (const staleAction of [
  "actions/checkout@v4",
  "actions/setup-node@v4",
  "actions/upload-artifact@v4"
]) {
  assert(
    !workflow.includes(staleAction),
    `.github/workflows/ci.yml still uses stale ${staleAction}`
  );
}

assert(
  /actions\/checkout@v([5-9]|\d{2,})/.test(workflow),
  "workflow should use actions/checkout@v5 or newer"
);
assert(
  /actions\/setup-node@v([6-9]|\d{2,})/.test(workflow),
  "workflow should use actions/setup-node@v6 or newer"
);
assert(
  /actions\/upload-artifact@v([7-9]|\d{2,})/.test(workflow),
  "workflow should use actions/upload-artifact@v7 or newer"
);
assert(
  /node-version:\s*['"]?24(?:['"]|\s|$)/.test(workflow),
  "workflow should run Node.js 24"
);

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("1.5.0"), "Full QA gate must reference v1.5.0");

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Release Warning Cleanup checks passed for v1.5.0.");
