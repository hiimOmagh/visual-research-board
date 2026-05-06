import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.8.1", "package.json version must be 0.8.1");
assert(Boolean(pkg.scripts?.["board:organization:check"]), "package.json must define npm run board:organization:check");
assert((pkg.scripts?.qa?.includes("board-organization-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include board-organization-check");

for (const file of [
  "src/lib/board-organization.ts",
  "src/components/search/SavedBoard.tsx",
  "docs/board-sections-source-organization.md"
]) assert(existsSync(join(root, file)), `Missing v0.3.2 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "BoardSectionKind",
  "BoardOrganizationAudit",
  "schema_version: \"0.3.2\"",
  "kind?: BoardSectionKind",
  "export_priority?: number"
]) assert(types.includes(token), `types must include ${token}`);

const boardLib = read("src/lib/board-organization.ts");
for (const token of [
  "createDefaultBoardSections",
  "normalizeBoardSections",
  "normalizeBoardTags",
  "toggleBoardTag",
  "suggestSectionForResult",
  "buildBoardOrganizationAudit",
  "PRIMARY_EVIDENCE_SECTION_ID",
  "COUNTER_EVIDENCE_SECTION_ID",
  "CHECK_REQUIRED_SECTION_ID",
  "REJECTED_SECTION_ID",
  "DEFAULT_BOARD_TAGS"
]) assert(boardLib.includes(token), `board-organization lib must include ${token}`);

const project = read("src/lib/project.ts");
for (const token of [
  "createDefaultBoardSections(nowIso())",
  "normalizeBoardSections",
  "normalizeBoardTags(result.tags ?? [])",
  "suggestSectionForResult",
  "VISUAL_REFERENCE_SECTION_ID",
  "section_thumbnail"
]) assert(project.includes(token), `project.ts must include ${token}`);

const savedBoard = read("src/components/search/SavedBoard.tsx");
for (const token of [
  "Board organization",
  "v0.3.2 section taxonomy",
  "buildBoardOrganizationAudit(project)",
  "TagEditor",
  "DEFAULT_BOARD_TAGS",
  "onUpdateTags",
  "Organization warnings",
  "Tagged: {organizationAudit.tagged_count}"
]) assert(savedBoard.includes(token), `SavedBoard must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v0.8.1",
  "updateSavedTags",
  "normalizeBoardTags(tags)",
  "visual-research-board-library-v0.8.1.json",
  "onUpdateTags={updateSavedTags}"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "buildBoardOrganizationAudit",
  "board_organization",
  "section_kind",
  "sectionName(project, result.section_id)",
  "tagged_result_count",
  "noted_result_count"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const docs = read("docs/board-sections-source-organization.md");
assert(docs.includes("v0.3.2"), "docs must identify v0.3.2");
assert(docs.includes("npm run board:organization:check"), "docs must document validation command");

if (failures.length) {
  console.error("Board organization checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Board organization checks passed for v0.3.2.");
process.exit(0);
