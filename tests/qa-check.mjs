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
  "src/components/search/EmptyState.tsx",
  "src/components/search/ExportPreviewDrawer.tsx",
  "src/lib/export.ts",
  "src/lib/local-storage.ts",
  "src/lib/result-quality.ts",
  "src/app/api/metadata/route.ts",
  "src/app/api/search/route.ts",
  "src/types/research.ts",
  "tests/fixtures/project-library-alpha10.json",
  "tests/fixtures/project-library-conflict-alpha10.json",
  "tests/fixtures/provider-smoke-alpha10.json",
  "tests/fixtures/normalization-alpha10.json",
  "tests/normalization-check.mjs",
  "tests/e2e-fixture-check.mjs",
  "tests/provider-smoke-check.mjs",
  "tests/library-conflict-check.mjs",
  "docs/browser-qa-checklist.md"
];

requiredFiles.forEach((file) => assert(existsSync(join(root, file)), `Missing required file: ${file}`));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.1.0-alpha.10", "package.json version must be 0.1.0-alpha.10");
assert(Boolean(pkg.scripts?.qa), "package.json must define npm run qa");
assert(Boolean(pkg.scripts?.["normalization:test"]), "package.json must define npm run normalization:test");
assert(Boolean(pkg.scripts?.["e2e:fixtures"]), "package.json must define npm run e2e:fixtures");
assert(Boolean(pkg.scripts?.["test:ci:no-browser"]), "package.json must define npm run test:ci:no-browser");
assert(Boolean(pkg.scripts?.["provider:smoke"]), "package.json must define npm run provider:smoke");

const types = read("src/types/research.ts");
assert(types.includes("ProjectLibrary"), "ProjectLibrary type must exist");
assert(types.includes("ResearchProject"), "ResearchProject type must exist");
assert(types.includes("SearchResultSnapshot"), "SearchResultSnapshot type must exist");
assert(types.includes("LibraryImportSummary"), "LibraryImportSummary type must exist");
assert(types.includes("result_snapshots"), "ResearchProject must include result_snapshots");
assert(types.includes("ProviderStatus = \"active\" | \"no_results\""), "ProviderStatus must include no_results");
assert(types.includes("query_sample: string[]"), "ProviderHealth must include query_sample");
assert(types.includes("SourceGroup"), "types must include SourceGroup");
assert(types.includes("ResultSortMode"), "types must include ResultSortMode");
assert(types.includes("quality_reasons"), "ResearchResult must include quality_reasons");
assert(types.includes("source_group"), "ResearchResult must include source_group");
assert(types.includes('schema_version: "0.1.0-alpha.10"'), "Project schema must be alpha.10");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("createSearchSnapshot"), "SearchPanel must create persistent snapshots");
assert(searchPanel.includes("restoreSnapshot"), "SearchPanel must restore persistent snapshots");
assert(searchPanel.includes("createProjectLibraryExport"), "SearchPanel must export project libraries");
assert(searchPanel.includes("importLibraryFile"), "SearchPanel must import project libraries");
assert(searchPanel.includes("mergeLibraries"), "SearchPanel must use conflict-safe library merge import");
assert(searchPanel.includes("provider_toggles"), "SearchPanel must send provider_toggles to API");
assert(searchPanel.includes("v0.1.0-alpha.10"), "SearchPanel header must show alpha.10");
assert(searchPanel.includes("importSummary"), "SearchPanel must surface import summary state");
assert(searchPanel.includes("aria-live"), "SearchPanel must announce import status to assistive tech");
assert(searchPanel.includes("filters.savedFirst"), "SearchPanel must support saved-first result sorting");
assert(searchPanel.includes("filters.sortBy"), "SearchPanel must support selectable result sorting");

const projectLibraryPanel = read("src/components/search/ProjectLibraryPanel.tsx");
assert(projectLibraryPanel.includes("Export library"), "ProjectLibraryPanel must expose export library action");
assert(projectLibraryPanel.includes("Import library"), "ProjectLibraryPanel must expose import library action");
assert(projectLibraryPanel.includes("Snapshots"), "ProjectLibraryPanel must expose snapshot count");
assert(projectLibraryPanel.includes("aria-label"), "ProjectLibraryPanel inputs must have accessible names");

const searchHistoryPanel = read("src/components/search/SearchHistoryPanel.tsx");
assert(searchHistoryPanel.includes("Restore snapshot"), "SearchHistoryPanel must expose restore snapshot action");
assert(searchHistoryPanel.includes("snapshot_id"), "SearchHistoryPanel must use snapshot_id");
assert(searchHistoryPanel.includes("EmptyState"), "SearchHistoryPanel must use the reusable EmptyState component");

const resultQuality = read("src/lib/result-quality.ts");
assert(resultQuality.includes("classifySourceDomain"), "result-quality.ts must classify source domains");
assert(resultQuality.includes("buildQualityReasons"), "result-quality.ts must explain why a result was kept");
assert(resultQuality.includes("SOURCE_GROUP_ORDER"), "result-quality.ts must define source group ordering");

const resultGrid = read("src/components/search/ResultGrid.tsx");
assert(resultGrid.includes("sourceGroupLabel"), "ResultGrid must group results by source group");

const resultCard = read("src/components/search/ResultCard.tsx");
assert(resultCard.includes("Why this result"), "ResultCard must expose a why-this-result explanation");

const resultFilters = read("src/components/search/ResultFilters.tsx");
assert(resultFilters.includes("Sort by"), "ResultFilters must expose sort mode control");
assert(resultFilters.includes("Saved items first"), "ResultFilters must expose saved-first control");

const providerHealthPanel = read("src/components/search/ProviderHealthPanel.tsx");
assert(providerHealthPanel.includes("no_results"), "ProviderHealthPanel must render no_results status");
assert(providerHealthPanel.includes("query_sample"), "ProviderHealthPanel must show query samples");

const emptyState = read("src/components/search/EmptyState.tsx");
assert(emptyState.includes("role=\"region\""), "EmptyState must render as a region");
assert(emptyState.includes("aria-label"), "EmptyState must have an accessible name");

const exportPreviewDrawer = read("src/components/search/ExportPreviewDrawer.tsx");
assert(exportPreviewDrawer.includes("aria-modal=\"true\""), "ExportPreviewDrawer must be an aria-modal dialog");
assert(exportPreviewDrawer.includes("aria-labelledby"), "ExportPreviewDrawer must label its dialog");
assert(exportPreviewDrawer.includes("Escape"), "ExportPreviewDrawer must support Escape to close");
assert(exportPreviewDrawer.includes("createTemplateExport"), "ExportPreviewDrawer must preview template exports");

const savedBoard = read("src/components/search/SavedBoard.tsx");
assert(savedBoard.includes("ExportPreviewDrawer"), "SavedBoard must mount the export preview drawer");
assert(savedBoard.includes("Preview JSON"), "SavedBoard must expose JSON preview action");
assert(savedBoard.includes("Preview Markdown"), "SavedBoard must expose Markdown preview action");
assert(savedBoard.includes("Preview template"), "SavedBoard must expose template preview action");
assert(savedBoard.includes("EmptyState"), "SavedBoard must use the reusable EmptyState component");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("no_results"), "search route must return no_results status for empty provider responses");
assert(searchRoute.includes("provider_toggles: runtimeToggles"), "search route diagnostics must persist provider toggles");
assert(searchRoute.includes("query_sample"), "search route provider health must include query samples");

const localStorage = read("src/lib/local-storage.ts");
assert(localStorage.includes("project-library:v0.1.0-alpha.10"), "localStorage key must be alpha.10 project library key");
assert(localStorage.includes("project-library:v0.1.0-alpha.9"), "localStorage must migrate alpha.9 project library key");
assert(localStorage.includes("project-library:v0.1.0-alpha.6"), "localStorage must migrate alpha.6 project library key");
assert(localStorage.includes("project-library:v0.1.0-alpha.5"), "localStorage must migrate alpha.5 project library key");
assert(localStorage.includes("active-project:v0.1.0-alpha.4"), "localStorage must migrate alpha.4 active project key");

const project = read("src/lib/project.ts");
assert(project.includes("createSearchSnapshot"), "project.ts must create search snapshots");
assert(project.includes("MAX_RESULT_SNAPSHOTS"), "project.ts must cap result snapshots");
assert(project.includes("normalizeSnapshot"), "project.ts must normalize snapshots");
assert(project.includes("duplicateProject"), "project.ts must duplicate projects");
assert(project.includes("mergeLibraries"), "project.ts must export mergeLibraries for conflict-safe import");
assert(project.includes("ensureResultQuality"), "project.ts must hydrate quality metadata for migrated results");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes('export_schema_version: "0.1.0-alpha.10"'), "JSON export schema must be alpha.10");
assert(exportLib.includes("createProjectLibraryExport"), "export.ts must include project library export");
assert(exportLib.includes("result_snapshot_count"), "library export audit must include snapshot count");
assert(exportLib.includes("by_source_group"), "export audit must include source group counts");

const libraryFixture = JSON.parse(read("tests/fixtures/project-library-alpha10.json"));
assert(libraryFixture.schema_version === "0.1.0-alpha.10", "project library fixture must be alpha.10");
assert(Array.isArray(libraryFixture.projects) && libraryFixture.projects.length >= 2, "fixture must include multiple projects");
assert(libraryFixture.projects.some((p) => p.id === libraryFixture.active_project_id), "active project id must resolve to a fixture project");
assert(libraryFixture.projects[0].saved_results[0].section_id === "section_inbox", "fixture saved result must have section_id");
assert(libraryFixture.projects[0].saved_results[0].source_group, "fixture saved result must include source_group");
assert(Array.isArray(libraryFixture.projects[0].saved_results[0].quality_reasons), "fixture saved result must include quality_reasons");
assert(libraryFixture.projects[0].result_snapshots.length >= 1, "fixture must include result snapshots");
assert(libraryFixture.projects[0].search_history[0].snapshot_id === libraryFixture.projects[0].result_snapshots[0].id, "fixture history must link to snapshot");

const conflictFixture = JSON.parse(read("tests/fixtures/project-library-conflict-alpha10.json"));
assert(Array.isArray(conflictFixture.projects), "conflict fixture must contain projects");
assert(conflictFixture.projects.some((p) => p?.id === "project_fixture_alpha10_main"), "conflict fixture must reuse a duplicate id");
assert(conflictFixture.projects.some((p) => p?.name === "Secondary fixture project"), "conflict fixture must reuse a duplicate name");

const smokeFixture = JSON.parse(read("tests/fixtures/provider-smoke-alpha10.json"));
assert(Object.keys(smokeFixture.providers ?? {}).length === 4, "provider smoke fixture must cover all four providers");
["mock", "wikimedia", "brave", "tavily"].forEach((providerName) => {
  const entry = smokeFixture.providers?.[providerName];
  assert(entry && Array.isArray(entry.raw_results) && entry.raw_results.length > 0, `provider smoke fixture must include raw results for ${providerName}`);
});

if (failures.length > 0) {
  console.error("QA failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("QA checks passed for v0.1.0-alpha.10.");
