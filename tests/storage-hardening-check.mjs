import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.0", "package.json version must be 2.1.0");
assert(Boolean(pkg.scripts?.["storage:hardening:check"]), "package.json must define npm run storage:hardening:check");
assert((pkg.scripts?.qa?.includes("storage-hardening-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include storage-hardening-check");

for (const file of [
  "src/lib/storage-hardening.ts",
  "src/components/search/SearchPanel.tsx",
  "src/components/search/ProjectLibraryPanel.tsx",
  "docs/local-storage-import-export-hardening.md"
]) assert(existsSync(join(root, file)), `Missing v2.1.0 file: ${file}`);

const storage = read("src/lib/storage-hardening.ts");
for (const token of [
  "STORAGE_HARDENING_SCHEMA_VERSION",
  "2.1.0",
  "visual_research_board_library_backup",
  "StorageImportValidationReport",
  "StorageBackupEnvelope",
  "createStorageChecksum",
  "buildStorageIntegritySnapshot",
  "validateImportedLibraryPayload",
  "parseProjectLibraryImportText",
  "createStorageBackupEnvelope",
  "createStorageBackupExport",
  "Corrupted or unreadable JSON",
  "checksum_match",
  "migration_required",
  "can_merge",
  "can_restore"
]) assert(storage.includes(token), `storage-hardening lib must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v2.1.0",
  "local storage import/export hardening",
  "createStorageBackupExport",
  "parseProjectLibraryImportText",
  "StorageImportValidationReport",
  "storageImportReport",
  "StorageImportReportNotice",
  "visual-research-board-backup-v2.1.0.json",
  "visual-research-board-library-v2.1.0.json",
  "Validation:",
  "Storage import validation",
  "Checksum:",
  "Fingerprint:"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const projectLibrary = read("src/components/search/ProjectLibraryPanel.tsx");
for (const token of [
  "StorageImportValidationReport",
  "onExportBackup",
  "Export backup",
  "backup envelopes",
  "validation reports",
  "corrupted-file warnings",
  "Latest import validation",
  "storageImportReport"
]) assert(projectLibrary.includes(token), `ProjectLibraryPanel must include ${token}`);

const docs = read("docs/local-storage-import-export-hardening.md");
for (const token of [
  "v2.1.0",
  "Local Storage + Import/Export Hardening",
  "backup envelopes",
  "corrupted/unreadable JSON rejection",
  "needs_migration",
  "npm run storage:hardening:check"
]) assert(docs.includes(token), `docs must include ${token}`);

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v2.1.0"), "PATCH_MANIFEST must identify v2.1.0");
assert(manifest.includes("Local Storage + Import/Export Hardening"), "PATCH_MANIFEST must identify the feature");

const lock = read("package-lock.json");
assert(lock.includes('"version": "2.1.0"'), "package-lock.json must use version 2.1.0");

if (failures.length) {
  console.error("Storage hardening checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Local Storage + Import/Export Hardening checks passed for v2.1.0.");
process.exit(0);
