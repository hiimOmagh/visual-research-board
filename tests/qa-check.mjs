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
  "src/components/search/ProviderHealthPanel.tsx",
  "src/lib/export.ts",
  "src/lib/local-storage.ts",
  "src/app/api/metadata/route.ts",
  "src/app/api/search/route.ts",
  "src/types/research.ts",
  "tests/fixtures/project-library-alpha6.json",
  "tests/fixtures/normalization-alpha6.json",
  "tests/normalization-check.mjs",
  "tests/e2e-fixture-check.mjs"
];

requiredFiles.forEach((file) => assert(existsSync(join(root, file)), `Missing required file: ${file}`));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.1.0-alpha.6", "package.json version must be 0.1.0-alpha.6");
assert(Boolean(pkg.scripts?.qa), "package.json must define npm run qa");
assert(Boolean(pkg.scripts?.["normalization:test"]), "package.json must define npm run normalization:test");
assert(Boolean(pkg.scripts?.["e2e:fixtures"]), "package.json must define npm run e2e:fixtures");
assert(Boolean(pkg.scripts?.["test:ci:no-browser"]), "package.json must define npm run test:ci:no-browser");

const types = read("src/types/research.ts");
assert(types.includes("ProjectLibrary"), "ProjectLibrary type must exist");
assert(types.includes("ResearchProject"), "ResearchProject type must exist");
assert(types.includes("SearchResultSnapshot"), "SearchResultSnapshot type must exist");
assert(types.includes("result_snapshots"), "ResearchProject must include result_snapshots");
assert(types.includes("ProviderStatus = \"active\" | \"no_results\""), "ProviderStatus must include no_results");
assert(types.includes("query_sample: string[]"), "ProviderHealth must include query_sample");
assert(types.includes('schema_version: "0.1.0-alpha.6"'), "Project schema must be alpha.6");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("createSearchSnapshot"), "SearchPanel must create persistent snapshots");
assert(searchPanel.includes("restoreSnapshot"), "SearchPanel must restore persistent snapshots");
assert(searchPanel.includes("createProjectLibraryExport"), "SearchPanel must export project libraries");
assert(searchPanel.includes("importLibraryFile"), "SearchPanel must import project libraries");
assert(searchPanel.includes("provider_toggles"), "SearchPanel must send provider_toggles to API");
assert(searchPanel.includes("v0.1.0-alpha.6"), "SearchPanel header must show alpha.6");

const projectLibraryPanel = read("src/components/search/ProjectLibraryPanel.tsx");
assert(projectLibraryPanel.includes("Export library"), "ProjectLibraryPanel must expose export library action");
assert(projectLibraryPanel.includes("Import library"), "ProjectLibraryPanel must expose import library action");
assert(projectLibraryPanel.includes("Snapshots"), "ProjectLibraryPanel must expose snapshot count");

const searchHistoryPanel = read("src/components/search/SearchHistoryPanel.tsx");
assert(searchHistoryPanel.includes("Restore snapshot"), "SearchHistoryPanel must expose restore snapshot action");
assert(searchHistoryPanel.includes("snapshot_id"), "SearchHistoryPanel must use snapshot_id");

const providerHealthPanel = read("src/components/search/ProviderHealthPanel.tsx");
assert(providerHealthPanel.includes("no_results"), "ProviderHealthPanel must render no_results status");
assert(providerHealthPanel.includes("query_sample"), "ProviderHealthPanel must show query samples");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("no_results"), "search route must return no_results status for empty provider responses");
assert(searchRoute.includes("provider_toggles: toggles"), "search route diagnostics must persist provider toggles");
assert(searchRoute.includes("query_sample"), "search route provider health must include query samples");

const localStorage = read("src/lib/local-storage.ts");
assert(localStorage.includes("project-library:v0.1.0-alpha.6"), "localStorage key must be alpha.6 project library key");
assert(localStorage.includes("project-library:v0.1.0-alpha.5"), "localStorage must migrate alpha.5 project library key");
assert(localStorage.includes("active-project:v0.1.0-alpha.4"), "localStorage must migrate alpha.4 active project key");

const project = read("src/lib/project.ts");
assert(project.includes("createSearchSnapshot"), "project.ts must create search snapshots");
assert(project.includes("MAX_RESULT_SNAPSHOTS"), "project.ts must cap result snapshots");
assert(project.includes("normalizeSnapshot"), "project.ts must normalize snapshots");
assert(project.includes("duplicateProject"), "project.ts must duplicate projects");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes('export_schema_version: "0.1.0-alpha.6"'), "JSON export schema must be alpha.6");
assert(exportLib.includes("createProjectLibraryExport"), "export.ts must include project library export");
assert(exportLib.includes("result_snapshot_count"), "library export audit must include snapshot count");

const libraryFixture = JSON.parse(read("tests/fixtures/project-library-alpha6.json"));
assert(libraryFixture.schema_version === "0.1.0-alpha.6", "project library fixture must be alpha.6");
assert(Array.isArray(libraryFixture.projects) && libraryFixture.projects.length >= 2, "fixture must include multiple projects");
assert(libraryFixture.projects.some((project) => project.id === libraryFixture.active_project_id), "active project id must resolve to a fixture project");
assert(libraryFixture.projects[0].saved_results[0].section_id === "section_inbox", "fixture saved result must have section_id");
assert(libraryFixture.projects[0].result_snapshots.length >= 1, "fixture must include result snapshots");
assert(libraryFixture.projects[0].search_history[0].snapshot_id === libraryFixture.projects[0].result_snapshots[0].id, "fixture history must link to snapshot");

if (failures.length > 0) {
  console.error("QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("QA checks passed for v0.1.0-alpha.6.");
