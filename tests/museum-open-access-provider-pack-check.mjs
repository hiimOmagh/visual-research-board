import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";


function hasVersionDeep(value, expectedVersion, seen = new Set()) {
  if (value === expectedVersion) return true;
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);

  const directKeys = [
    "appVersion",
    "app_version",
    "applicationVersion",
    "application_version",
    "packageVersion",
    "package_version",
    "version"
  ];

  for (const key of directKeys) {
    if (value[key] === expectedVersion) return true;
  }

  for (const nested of Object.values(value)) {
    if (hasVersionDeep(nested, expectedVersion, seen)) return true;
  }

  return false;
}

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (path) => readFileSync(join(root, path), "utf8");

assert(typeof hasVersionDeep === "function", "hasVersionDeep helper must remain available");
const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.11", "package.json version must be 2.1.11");
assert(Boolean(pkg.scripts?.["museum:providers:check"]), "package.json must define npm run museum:providers:check");
assert((pkg.scripts?.qa?.includes("museum-open-access-provider-pack-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include museum-open-access-provider-pack-check");

const requiredFiles = [
  "src/lib/providers/museum-open-access.ts",
  "docs/museum-open-access-provider-pack.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing v2.1.11 file: ${file}`);

const providerTokens = [
  "met",
  "artic",
  "cleveland_museum",
  "rijksmuseum",
  "wellcome",
  "bhl",
  "gallica",
  "nypl",
  "nara",
  "dpla"
];

const types = read("src/types/research.ts");
for (const token of providerTokens) {
  assert(types.includes(`"${token}"`), `ProviderName/SEARCH_PROVIDERS must include ${token}`);
}
for (const token of [
  "met: true",
  "artic: true",
  "cleveland_museum: true",
  "wellcome: true",
  "bhl: true",
  "gallica: true",
  "nara: true",
  "rijksmuseum: false",
  "nypl: false",
  "dpla: false"
]) assert(types.includes(token), `DEFAULT_PROVIDER_TOGGLES must include ${token}`);

const providerLib = read("src/lib/providers/museum-open-access.ts");
for (const token of [
  "searchMetMuseum",
  "searchArtInstituteChicago",
  "searchClevelandMuseum",
  "searchRijksmuseum",
  "searchWellcomeCollection",
  "searchBiodiversityHeritageLibrary",
  "searchGallicaBnf",
  "searchNyplDigitalCollections",
  "searchNaraCatalog",
  "searchDpla",
  "fetchTextWithTimeout",
  "publicDomainLicense",
  "checkRequiredLicense"
]) assert(providerLib.includes(token), `museum provider pack must implement ${token}`);

const queryPlanner = read("src/lib/query-planner.ts");
for (const token of providerTokens) assert(queryPlanner.includes(`${token}:`), `query planner must route ${token}`);
for (const token of ["museum open access", "digital collection", "national archives", "museum/open-access provider pack branch"]) {
  assert(queryPlanner.includes(token), `query planner must include ${token}`);
}

const route = read("src/app/api/search/route.ts");
for (const token of [
  "searchMetMuseum",
  "searchArtInstituteChicago",
  "searchClevelandMuseum",
  "searchRijksmuseum",
  "searchWellcomeCollection",
  "searchBiodiversityHeritageLibrary",
  "searchGallicaBnf",
  "searchNyplDigitalCollections",
  "searchNaraCatalog",
  "searchDpla"
]) assert(route.includes(token), `search route must call ${token}`);
for (const env of ["RIJKSMUSEUM_API_KEY", "NYPL_API_KEY", "DPLA_API_KEY"]) assert(route.includes(env), `search route must gate ${env}`);
assert(!route.includes("const { results: rankedResults, audit: rankingExplainability } = buildRankingExplainability({\n  const { results"), "search route must not contain duplicated ranking declaration");

const runtime = read("src/lib/provider-runtime.ts");
assert(runtime.includes('APP_VERSION = "2.1.11"'), "provider runtime report must expose app version 2.1.11");
for (const token of [...providerTokens, "RIJKSMUSEUM_API_KEY", "NYPL_API_KEY", "DPLA_API_KEY"]) {
  assert(runtime.includes(token), `provider runtime must include ${token}`);
}

const runtimeRoute = read("src/app/api/provider-runtime/route.ts");
assert(runtimeRoute.includes("getProviderKeyPresenceFromEnv"), "provider runtime route must inspect free-key env readiness through security helper");

const toggles = read("src/components/search/ProviderTogglePanel.tsx");
for (const label of ["Met Museum", "Art Institute Chicago", "Cleveland Museum", "Rijksmuseum", "Wellcome", "BHL", "Gallica / BnF", "NYPL", "NARA", "DPLA"]) {
  assert(toggles.includes(label), `ProviderTogglePanel must show ${label}`);
}
assert(toggles.includes("RIJKSMUSEUM_API_KEY"), "ProviderTogglePanel must show Rijksmuseum env");
assert(toggles.includes("NYPL_API_KEY"), "ProviderTogglePanel must show NYPL env");
assert(toggles.includes("DPLA_API_KEY"), "ProviderTogglePanel must show DPLA env");

const normalizer = read("src/lib/result-normalizer.ts");
for (const token of ["cleveland_museum", "wellcome", "gallica", "backend_free_key_required", "archive_open_access"]) {
  assert(normalizer.includes(token), `normalizer must classify ${token}`);
}

const resultQuality = read("src/lib/result-quality.ts");
for (const domain of ["artic.edu", "clevelandart.org", "rijksmuseum.nl", "wellcomecollection.org", "biodiversitylibrary.org", "catalog.archives.gov", "dp.la"]) {
  assert(resultQuality.includes(domain), `result-quality must classify ${domain}`);
}

const env = read(".env.example");
for (const key of ["RIJKSMUSEUM_API_KEY", "NYPL_API_KEY", "DPLA_API_KEY"]) assert(env.includes(key), `.env.example must document ${key}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("v2.1.11"), "SearchPanel header must show v2.1.11");
assert(searchPanel.includes("visual-research-board-library-v2.1.11.json"), "library export filename must use v2.1.11");

const docs = read("docs/museum-open-access-provider-pack.md");
for (const token of ["v2.1.11", "Met Museum", "Art Institute of Chicago", "Cleveland Museum", "Wellcome Collection", "Biodiversity Heritage Library", "Gallica", "NARA", "npm run museum:providers:check"]) {
  assert(docs.includes(token), `docs must include ${token}`);
}

if (failures.length) {
  console.error("Museum/Open-Access Provider Pack checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Museum/Open-Access Provider Pack checks passed for v2.1.11.");
process.exit(0);
