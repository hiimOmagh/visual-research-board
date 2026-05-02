import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

const requiredFiles = [
  "src/lib/manual-import.ts",
  "src/components/search/SavedBoard.tsx",
  "src/lib/export.ts",
  "src/lib/local-storage.ts",
  "src/types/research.ts",
  "tests/fixtures/saved-results-alpha3.json"
];

requiredFiles.forEach((file) => assert(existsSync(join(root, file)), `Missing required file: ${file}`));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.1.0-alpha.3", "package.json version must be 0.1.0-alpha.3");
assert(Boolean(pkg.scripts?.qa), "package.json must define npm run qa");
assert(Boolean(pkg.scripts?.["test:ci:no-browser"]), "package.json must define npm run test:ci:no-browser");

const types = read("src/types/research.ts");
assert(types.includes('"manual"'), "ProviderName must include manual provider");
assert(types.includes("updated_at"), "ResearchResult must include updated_at for editable-note tracking");

const savedBoard = read("src/components/search/SavedBoard.tsx");
assert(savedBoard.includes("ManualImportForm"), "SavedBoard must include ManualImportForm");
assert(savedBoard.includes("onUpdateNotes"), "SavedBoard must support editable notes");
assert(savedBoard.includes("Copy attribution"), "SavedBoard must expose per-item attribution copy");
assert(savedBoard.includes("Attribution Pack"), "SavedBoard must expose attribution export");

const manualImport = read("src/lib/manual-import.ts");
assert(manualImport.includes("createManualUrlResult"), "manual-import.ts must export createManualUrlResult");
assert(manualImport.includes("isValidHttpUrl"), "manual-import.ts must export isValidHttpUrl");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes("createAttributionExport"), "export.ts must include createAttributionExport");
assert(exportLib.includes("createSingleAttribution"), "export.ts must include createSingleAttribution");
assert(exportLib.includes("notes_count"), "JSON export must include notes_count audit field");

const localStorage = read("src/lib/local-storage.ts");
assert(localStorage.includes("v0.1.0-alpha.3"), "localStorage key must be alpha.3");
assert(localStorage.includes("LEGACY_KEYS"), "localStorage migration from older alpha keys must exist");

const fixture = JSON.parse(read("tests/fixtures/saved-results-alpha3.json"));
assert(Array.isArray(fixture) && fixture.length === 1, "saved-results fixture must contain exactly one item");
assert(fixture[0].provider === "manual", "fixture provider must be manual");

if (failures.length > 0) {
  console.error("QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("QA checks passed for v0.1.0-alpha.3.");
