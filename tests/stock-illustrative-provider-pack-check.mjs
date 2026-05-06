import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (path) => readFileSync(join(root, path), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.5.0", "package.json version must be 1.5.0");
assert(Boolean(pkg.scripts?.["stock:providers:check"]), "package.json must define npm run stock:providers:check");
assert((pkg.scripts?.qa?.includes("stock-illustrative-provider-pack-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include stock-illustrative-provider-pack-check");

const requiredFiles = [
  "src/lib/providers/stock-illustrative.ts",
  "docs/stock-illustrative-provider-pack.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing v1.5.0 file: ${file}`);

const providerTokens = ["pixabay", "pexels", "unsplash"];
const envTokens = ["PIXABAY_API_KEY", "PEXELS_API_KEY", "UNSPLASH_ACCESS_KEY"];

const types = read("src/types/research.ts");
for (const token of providerTokens) {
  assert(types.includes(`"${token}"`), `ProviderName/SEARCH_PROVIDERS must include ${token}`);
  assert(types.includes(`${token}: false`), `DEFAULT_PROVIDER_TOGGLES must keep ${token} disabled by default`);
}
assert(types.includes('"stock_illustrative"'), "types must include stock_illustrative source access mode");

const providerLib = read("src/lib/providers/stock-illustrative.ts");
for (const token of ["searchPixabay", "searchPexels", "searchUnsplash", "stockLicense", "stock_illustrative", "likely_reusable", "medium"]) {
  assert(providerLib.includes(token), `stock provider pack must implement ${token}`);
}
for (const env of envTokens) assert(providerLib.includes(env), `stock provider pack must gate ${env}`);
for (const endpoint of ["pixabay.com/api", "api.pexels.com/v1/search", "api.unsplash.com/search/photos"]) {
  assert(providerLib.includes(endpoint), `stock provider pack must include endpoint ${endpoint}`);
}

const queryPlanner = read("src/lib/query-planner.ts");
for (const token of providerTokens) assert(queryPlanner.includes(`${token}:`), `query planner must route ${token}`);
for (const token of ["stock/illustrative provider branch", "editorial stock reference branch", "background/thumbnail stock branch"]) {
  assert(queryPlanner.includes(token), `query planner must include ${token}`);
}

const route = read("src/app/api/search/route.ts");
for (const token of ["searchPixabay", "searchPexels", "searchUnsplash", ...envTokens]) {
  assert(route.includes(token), `search route must include ${token}`);
}
assert(!route.includes("const coverageBias = buildCoverageBiasAudit(rankedResults);\n  const coverageBias"), "search route must not duplicate coverageBias declaration");

const runtime = read("src/lib/provider-runtime.ts");
assert(runtime.includes('APP_VERSION = "1.5.0"'), "provider runtime report must expose app version 1.5.0");
for (const token of [...providerTokens, ...envTokens, "stock_illustrative"]) {
  assert(runtime.includes(token), `provider runtime must include ${token}`);
}

const runtimeRoute = read("src/app/api/provider-runtime/route.ts");
assert(runtimeRoute.includes("getProviderKeyPresenceFromEnv"), "provider runtime route must inspect stock key readiness through security helper");

const toggles = read("src/components/search/ProviderTogglePanel.tsx");
for (const label of ["Pixabay", "Pexels", "Unsplash", "Stock / illustrative", "Stock illustrative"]) {
  assert(toggles.includes(label), `ProviderTogglePanel must show ${label}`);
}
for (const env of envTokens) assert(toggles.includes(env), `ProviderTogglePanel must show ${env}`);

const normalizer = read("src/lib/result-normalizer.ts");
assert(normalizer.includes('["pixabay", "pexels", "unsplash"]'), "normalizer must classify stock providers as stock_illustrative");
assert(normalizer.includes('return "stock_illustrative"'), "normalizer must return stock_illustrative for stock providers/domains");

const resultQuality = read("src/lib/result-quality.ts");
for (const domain of ["pixabay", "pexels", "unsplash"]) {
  assert(resultQuality.includes(domain), `result-quality must classify ${domain} as stock/commercial source class`);
}

const autoTune = read("src/lib/retrieval-autotuning.ts");
for (const provider of providerTokens) assert(autoTune.includes(`${provider}: 0.72`), `auto-tuning must assign conservative base weight to ${provider}`);

const evidenceTuning = read("src/lib/evidence-driven-tuning.ts");
for (const provider of providerTokens) assert(evidenceTuning.includes(`${provider}: 0.84`), `evidence tuning must assign conservative bias to ${provider}`);

const env = read(".env.example");
for (const key of envTokens) assert(env.includes(key), `.env.example must document ${key}`);
assert(env.includes("Optional stock/illustrative providers"), ".env.example must label stock providers as optional illustrative sources");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("v1.5.0"), "SearchPanel header must show v1.5.0");
assert(searchPanel.includes("visual-research-board-library-v1.5.0.json"), "library export filename must use v1.5.0");
assert(searchPanel.includes("visual-research-board-backup-v1.5.0.json"), "backup export filename must use v1.5.0");

const docs = read("docs/stock-illustrative-provider-pack.md");
for (const token of ["v1.5.0", "Pixabay", "Pexels", "Unsplash", "stock_illustrative", "npm run stock:providers:check"]) {
  assert(docs.includes(token), `docs must include ${token}`);
}

if (failures.length) {
  console.error("Stock/Illustrative Provider Pack checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Stock/Illustrative Provider Pack checks passed for v1.5.0.");
process.exit(0);
