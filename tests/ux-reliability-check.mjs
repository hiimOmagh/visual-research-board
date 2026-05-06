import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.8.3", "package.json version must be 0.8.3");
assert(Boolean(pkg.scripts?.["ux:reliability:check"]), "package.json must define npm run ux:reliability:check");
assert((pkg.scripts?.qa?.includes("ux-reliability-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include ux-reliability-check");

for (const file of [
  "src/lib/ux-reliability.ts",
  "src/lib/demo-project.ts",
  "src/components/search/UXReliabilityPanel.tsx",
  "src/components/search/ResultGrid.tsx",
  "src/components/search/SearchPanel.tsx",
  "docs/ux-reliability-empty-state-polish.md"
]) assert(existsSync(join(root, file)), `Missing v0.8.3 file: ${file}`);

const ux = read("src/lib/ux-reliability.ts");
for (const token of [
  "UxReliabilityAudit",
  "schema_version: \"0.8.3\"",
  "app_version: \"0.8.3\"",
  "buildUxReliabilityAudit",
  "workflow_ready",
  "readiness_score",
  "ProviderSetupSummary",
  "empty_states",
  "next_actions",
  "Reference Search Hub",
  "manual launcher",
  "free_core_enabled_count",
  "optional_paid_enabled_count"
]) assert(ux.includes(token), `ux-reliability lib must include ${token}`);

const demo = read("src/lib/demo-project.ts");
for (const token of [
  "createDemoProject",
  "Demo — Carthage Visual Evidence Board",
  "demo_carthage_map_commons",
  "demo_claim_rights",
  "manual_reference_only",
  "reference_only",
  "visual_reference_only",
  "approved_reference"
]) assert(demo.includes(token), `demo project must include ${token}`);

const panel = read("src/components/search/UXReliabilityPanel.tsx");
for (const token of [
  "UX reliability",
  "Workflow readiness",
  "Guided workflow checklist",
  "Load demo project",
  "Use demo search topic",
  "Reliability notes",
  "Next actions",
  "readiness_score"
]) assert(panel.includes(token), `UXReliabilityPanel must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v0.8.3",
  "UXReliabilityPanel",
  "buildUxReliabilityAudit",
  "createDemoProject",
  "loadDemoProject",
  "useDemoSearchTopic",
  "visual-research-board-library-v0.8.3.json",
  "guided onboarding",
  "workflow-specific empty states"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const resultGrid = read("src/components/search/ResultGrid.tsx");
for (const token of [
  "Run a search to populate the visual evidence grid",
  "Filters are hiding all available results",
  "Reset filters",
  "No results returned for this search",
  "Reference Search Hub",
  "onResetFilters"
]) assert(resultGrid.includes(token), `ResultGrid must include ${token}`);

const providerToggle = read("src/components/search/ProviderTogglePanel.tsx");
assert(providerToggle.includes("v0.8.3 keeps provider setup explicit"), "ProviderTogglePanel must mention v0.8.3 provider setup clarity");

const projectLibrary = read("src/components/search/ProjectLibraryPanel.tsx");
assert(projectLibrary.includes("guided demo/onboarding support"), "ProjectLibraryPanel must document guided demo/onboarding support");

const docs = read("docs/ux-reliability-empty-state-polish.md");
assert(docs.includes("v0.8.3"), "docs must identify v0.8.3");
assert(docs.includes("npm run ux:reliability:check"), "docs must document validation command");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v0.8.3"), "PATCH_MANIFEST must identify v0.8.3");
assert(manifest.includes("UX Reliability + Empty State Polish"), "PATCH_MANIFEST must identify the feature");

if (failures.length) {
  console.error("UX Reliability checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("UX Reliability + Empty State Polish checks passed for v0.8.3.");
process.exit(0);
