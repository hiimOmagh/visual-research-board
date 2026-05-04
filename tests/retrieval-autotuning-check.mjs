import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(relativePath) { return readFileSync(join(root, relativePath), "utf8"); }

const requiredFiles = [
  "src/lib/retrieval-autotuning.ts",
  "src/components/search/RetrievalAutoTuningPanel.tsx",
  "docs/retrieval-weak-case-auto-tuning.md"
];

for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing auto-tuning file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.3.1", "package.json version must be 0.3.1");
assert(Boolean(pkg.scripts?.["retrieval:autotune:check"]), "package.json must define npm run retrieval:autotune:check");
assert(pkg.scripts?.qa?.includes("retrieval-autotuning-check"), "npm run qa must include retrieval-autotuning-check");

const types = read("src/types/research.ts");
assert(types.includes("RetrievalAutoTuningTrace"), "types must define RetrievalAutoTuningTrace");
assert(types.includes("RetrievalAutoTuningAction"), "types must define RetrievalAutoTuningAction");
assert(types.includes("auto_tuning?: RetrievalAutoTuningTrace"), "SearchDiagnostics must include auto_tuning");

const autoTune = read("src/lib/retrieval-autotuning.ts");
assert(autoTune.includes("buildRetrievalAutoTunePlan"), "auto-tuning lib must export buildRetrievalAutoTunePlan");
assert(autoTune.includes("applyAutoTunedRanking"), "auto-tuning lib must export applyAutoTunedRanking");
assert(autoTune.includes("completeAutoTuningTrace"), "auto-tuning lib must export completeAutoTuningTrace");
assert(autoTune.includes("increase_visual_branches"), "auto-tuning must react to weak visual coverage");
assert(autoTune.includes("increase_commons_archive_bias"), "auto-tuning must bias Commons/archive sources when needed");
assert(autoTune.includes("increase_real_provider_bias"), "auto-tuning must distinguish real-provider evidence from mock evidence");
assert(autoTune.includes("diversityAwareSort"), "auto-tuning must include diversity-aware reranking");
assert(autoTune.includes("provider_weights"), "auto-tuning trace must expose provider weights");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("buildRetrievalAutoTunePlan"), "search route must build an auto-tuned plan");
assert(searchRoute.includes("executeProviderRuns"), "search route must isolate provider execution for baseline and tuned passes");
assert(searchRoute.includes("combineHealth"), "search route must combine baseline and tuned provider health");
assert(searchRoute.includes("applyAutoTunedRanking"), "search route must apply auto-tuned ranking");
assert(searchRoute.includes("auto_tuning: autoTuning"), "search route diagnostics must attach auto_tuning");
assert(searchRoute.includes("VISUAL_RESEARCH_BOARD_DISABLE_AUTO_TUNING"), "search route must support disabling auto-tuning");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("buildRetrievalAutoTunePlan"), "client static fallback must build auto-tuning trace");
assert(clientSearch.includes("auto_tuning: autoTuning"), "client static fallback diagnostics must attach auto_tuning");
assert(clientSearch.includes("client-side reranking"), "static fallback must disclose limited client-side reranking");

const panel = read("src/components/search/RetrievalAutoTuningPanel.tsx");
assert(panel.includes("Retrieval weak-case correction"), "auto-tuning panel must render weak-case correction heading");
assert(panel.includes("Provider weights"), "auto-tuning panel must show provider weights");
assert(panel.includes("Auto-added query branches"), "auto-tuning panel must show added query branches");
assert(panel.includes("Signals used for tuning"), "auto-tuning panel must show tuning signals");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("RetrievalAutoTuningPanel"), "SearchPanel must render RetrievalAutoTuningPanel");
assert(searchPanel.includes("v0.3.1"), "SearchPanel header must show v0.3.1");
assert(searchPanel.includes("visual-research-board-library-v0.3.1.json"), "library export filename must use v0.3.1");

const docs = read("docs/retrieval-weak-case-auto-tuning.md");
assert(docs.includes("v0.3.1"), "auto-tuning docs must identify v0.3.1");
assert(docs.includes("VISUAL_RESEARCH_BOARD_DISABLE_AUTO_TUNING"), "auto-tuning docs must document disable env var");
assert(docs.includes("apply_diversity_rerank"), "auto-tuning docs must document diversity reranking action");

if (failures.length) {
  console.error("Retrieval auto-tuning checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Retrieval auto-tuning checks passed for v0.3.1.");
