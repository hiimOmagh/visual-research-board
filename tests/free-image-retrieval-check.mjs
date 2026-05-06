import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (path) => readFileSync(join(root, path), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.6.0", "package.json version must be 1.6.0");
assert(Boolean(pkg.scripts?.["free:image:check"]), "package.json must define npm run free:image:check");
assert((pkg.scripts?.qa?.includes("free-image-retrieval-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include free-image-retrieval-check");

const requiredFiles = [
  "src/lib/providers/openverse.ts",
  "src/lib/providers/loc.ts",
  "src/lib/providers/internet-archive.ts",
  "src/lib/providers/nasa.ts",
  "src/lib/providers/smithsonian.ts",
  "src/lib/providers/europeana.ts",
  "src/lib/reference-search.ts",
  "src/components/search/ReferenceSearchHub.tsx",
  "docs/free-image-retrieval-reference-hub.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing v0.3.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of ["SourceAccessMode", "RightsStatus", "ReuseRisk", "ReferenceSearchEngine", "ReferenceSearchLink", "openverse", "loc", "internet_archive", "smithsonian", "nasa", "europeana"]) {
  assert(types.includes(token), `types must include ${token}`);
}
assert(types.includes('brave: false'), "Brave must be disabled by default in the free-only core");
assert(types.includes('tavily: false'), "Tavily must be disabled by default in the free-only core");

const route = read("src/app/api/search/route.ts");
for (const token of ["searchOpenverse", "searchLibraryOfCongress", "searchInternetArchive", "searchNasaImages", "searchSmithsonianOpenAccess", "searchEuropeana", "reference_searches", "buildReferenceSearchLinks"]) {
  assert(route.includes(token), `search route must include ${token}`);
}
assert(route.includes("SMITHSONIAN_API_KEY"), "search route must gate Smithsonian with its free key env");
assert(route.includes("EUROPEANA_API_KEY"), "search route must gate Europeana with its free key env");

const normalizer = read("src/lib/result-normalizer.ts");
assert(normalizer.includes("source_access_mode"), "normalizer must carry source_access_mode");
assert(normalizer.includes("rights_status"), "normalizer must carry rights_status");
assert(normalizer.includes("reuse_risk"), "normalizer must carry reuse_risk");
assert(normalizer.includes("manual_reference_only"), "manual/reference mode must be represented");

const reference = read("src/lib/reference-search.ts");
for (const engine of ["google_images", "bing_images", "duckduckgo_images", "yandex_images", "startpage_images", "qwant_images", "mojeek_images", "pinterest", "youtube"]) {
  assert(reference.includes(engine), `Reference Search Hub must include ${engine}`);
}
assert(reference.includes("fetched_by_tool: false"), "reference search links must explicitly avoid backend scraping");
assert(reference.includes("reference_only"), "reference search links must be rights-labeled as reference_only");

const panel = read("src/components/search/ReferenceSearchHub.tsx");
assert(panel.includes("Manual search launchers"), "ReferenceSearchHub must display manual launcher wording");
assert(panel.includes("does not scrape"), "ReferenceSearchHub must state no-scraping policy");

const providerToggle = read("src/components/search/ProviderTogglePanel.tsx");
assert(providerToggle.includes("Free backend sources"), "ProviderTogglePanel must be reframed around free backend sources");
assert(providerToggle.includes("Free-core sources"), "ProviderTogglePanel must provide a free-core preset");
assert(providerToggle.includes("Optional API"), "ProviderTogglePanel must label optional paid/API providers separately");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("ReferenceSearchHub"), "SearchPanel must render ReferenceSearchHub");
assert(searchPanel.includes("v1.6.0"), "SearchPanel header must show v1.6.0");
assert(searchPanel.includes("visual-research-board-library-v1.6.0.json"), "library export filename must use v1.6.0");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes("by_rights_status"), "JSON export audit must include rights status counts");
assert(exportLib.includes("source_access_mode"), "exports must include source access mode");
assert(exportLib.includes("reuse_risk"), "exports must include reuse risk");

const docs = read("docs/free-image-retrieval-reference-hub.md");
assert(docs.includes("v0.3.1"), "v0.3.1 docs must identify the version");
assert(docs.includes("no automated Google/Bing/Yandex scraping"), "docs must state no automated search-engine scraping");
assert(docs.includes("npm run free:image:check"), "docs must document validation command");

if (failures.length) {
  console.error("Free image retrieval checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Free image retrieval + Reference Search Hub checks passed for v0.3.1.");
process.exit(0);
