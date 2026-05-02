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
  "src/lib/project.ts",
  "src/lib/manual-import.ts",
  "src/components/search/SavedBoard.tsx",
  "src/components/search/ProjectLibraryPanel.tsx",
  "src/components/search/SearchHistoryPanel.tsx",
  "src/components/search/ProviderTogglePanel.tsx",
  "src/lib/export.ts",
  "src/lib/local-storage.ts",
  "src/app/api/metadata/route.ts",
  "src/types/research.ts",
  "tests/fixtures/project-library-alpha5.json",
  "tests/fixtures/normalization-alpha5.json",
  "tests/normalization-check.mjs"
];

requiredFiles.forEach((file) => assert(existsSync(join(root, file)), `Missing required file: ${file}`));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.1.0-alpha.5", "package.json version must be 0.1.0-alpha.5");
assert(Boolean(pkg.scripts?.qa), "package.json must define npm run qa");
assert(Boolean(pkg.scripts?.["normalization:test"]), "package.json must define npm run normalization:test");
assert(Boolean(pkg.scripts?.["test:ci:no-browser"]), "package.json must define npm run test:ci:no-browser");

const types = read("src/types/research.ts");
assert(types.includes("ProjectLibrary"), "ProjectLibrary type must exist");
assert(types.includes("ResearchProject"), "ResearchProject type must exist");
assert(types.includes("UrlMetadataResponse"), "UrlMetadataResponse type must exist");
assert(types.includes("ExportTemplateId"), "ExportTemplateId type must exist");
assert(types.includes("EXPORT_TEMPLATES"), "EXPORT_TEMPLATES must exist");
assert(types.includes('schema_version: "0.1.0-alpha.5"'), "Project schema must be alpha.5");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("ProjectLibraryPanel"), "SearchPanel must render ProjectLibraryPanel");
assert(searchPanel.includes("loadProjectLibrary"), "SearchPanel must load project library");
assert(searchPanel.includes("persistProjectLibrary"), "SearchPanel must persist project library");
assert(searchPanel.includes("duplicateProject"), "SearchPanel must support project duplication");
assert(searchPanel.includes("removeProject"), "SearchPanel must support project deletion");
assert(searchPanel.includes("provider_toggles"), "SearchPanel must send provider_toggles to API");

const projectLibraryPanel = read("src/components/search/ProjectLibraryPanel.tsx");
assert(projectLibraryPanel.includes("Project library"), "ProjectLibraryPanel must expose project library UI");
assert(projectLibraryPanel.includes("Duplicate active"), "ProjectLibraryPanel must expose duplicate active action");
assert(projectLibraryPanel.includes("Delete active"), "ProjectLibraryPanel must expose delete active action");

const savedBoard = read("src/components/search/SavedBoard.tsx");
assert(savedBoard.includes("Fetch metadata"), "SavedBoard manual import must support metadata fetch");
assert(savedBoard.includes("Export templates"), "SavedBoard must expose export templates");
assert(savedBoard.includes("createTemplateExport"), "SavedBoard must use template export function");
assert(savedBoard.includes("UrlMetadataResponse"), "SavedBoard must type metadata response");

const metadataRoute = read("src/app/api/metadata/route.ts");
assert(metadataRoute.includes("og:title"), "Metadata route must extract Open Graph title");
assert(metadataRoute.includes("og:image"), "Metadata route must extract Open Graph image");
assert(metadataRoute.includes("AbortController"), "Metadata route must use timeout control");
assert(metadataRoute.includes("UrlMetadataResponse"), "Metadata route must return typed metadata response");

const localStorage = read("src/lib/local-storage.ts");
assert(localStorage.includes("project-library:v0.1.0-alpha.5"), "localStorage key must be alpha.5 project library key");
assert(localStorage.includes("active-project:v0.1.0-alpha.4"), "localStorage must migrate alpha.4 active project key");
assert(localStorage.includes("loadProjectLibrary"), "localStorage must expose loadProjectLibrary");
assert(localStorage.includes("persistProjectLibrary"), "localStorage must expose persistProjectLibrary");

const project = read("src/lib/project.ts");
assert(project.includes("createProjectLibrary"), "project.ts must create project libraries");
assert(project.includes("normalizeLibrary"), "project.ts must normalize project libraries");
assert(project.includes("duplicateProject"), "project.ts must duplicate projects");
assert(project.includes("removeProject"), "project.ts must remove projects safely");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes('export_schema_version: "0.1.0-alpha.5"'), "JSON export schema must be alpha.5");
assert(exportLib.includes("createTemplateExport"), "export.ts must include createTemplateExport");
assert(exportLib.includes("createProductionBriefExport"), "export.ts must include production brief export");
assert(exportLib.includes("createVisualMoodboardExport"), "export.ts must include visual moodboard export");

const libraryFixture = JSON.parse(read("tests/fixtures/project-library-alpha5.json"));
assert(libraryFixture.schema_version === "0.1.0-alpha.5", "project library fixture must be alpha.5");
assert(Array.isArray(libraryFixture.projects) && libraryFixture.projects.length >= 2, "fixture must include multiple projects");
assert(libraryFixture.projects.some((project) => project.id === libraryFixture.active_project_id), "active project id must resolve to a fixture project");
assert(libraryFixture.projects[0].saved_results[0].section_id === "section_inbox", "fixture saved result must have section_id");

if (failures.length > 0) {
  console.error("QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("QA checks passed for v0.1.0-alpha.5.");
