import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(relativePath) { return readFileSync(join(root, relativePath), "utf8"); }

const requiredFiles = [
  "src/lib/evidence-driven-tuning.ts",
  "src/components/search/EvidenceDrivenTuningPanel.tsx",
  "scripts/evidence-driven-tuning-report.mjs",
  "docs/evidence-driven-ranking-query-tuning.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing evidence-driven tuning file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.1.0", "package.json version must be 1.1.0");
assert(Boolean(pkg.scripts?.["evidence:tuning:test"]), "package.json must define npm run evidence:tuning:test");
assert(Boolean(pkg.scripts?.["evidence:tuning:check"]), "package.json must define npm run evidence:tuning:check");
assert((pkg.scripts?.qa?.includes("evidence-driven-tuning-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include evidence-driven-tuning-check");

const types = read("src/types/research.ts");
assert(types.includes("EvidenceDrivenTuningTrace"), "types must define EvidenceDrivenTuningTrace");
assert(types.includes("EvidenceDrivenTuningAction"), "types must define EvidenceDrivenTuningAction");
assert(types.includes("evidence_tuning?: EvidenceDrivenTuningTrace"), "SearchDiagnostics must include evidence_tuning");
assert(types.includes("boost_topic_exactness"), "EvidenceDrivenTuningAction must include boost_topic_exactness");
assert(types.includes("rebalance_top_results_by_source"), "EvidenceDrivenTuningAction must include source rebalancing");

const lib = read("src/lib/evidence-driven-tuning.ts");
assert(lib.includes("buildEvidenceDrivenTuningPlan"), "evidence tuning lib must export buildEvidenceDrivenTuningPlan");
assert(lib.includes("applyEvidenceDrivenRanking"), "evidence tuning lib must export applyEvidenceDrivenRanking");
assert(lib.includes("completeEvidenceDrivenTuningTrace"), "evidence tuning lib must export completeEvidenceDrivenTuningTrace");
assert(lib.includes("topicExactness"), "evidence tuning must measure topic exactness");
assert(lib.includes("score_weight_profile"), "evidence tuning trace must expose score_weight_profile");
assert(lib.includes("provider_bias"), "evidence tuning trace must expose provider_bias");
assert(lib.includes("penalize_stock_and_social"), "evidence tuning must penalize weak source groups");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("buildEvidenceDrivenTuningPlan"), "search route must build evidence-driven tuning plan");
assert(searchRoute.includes("applyEvidenceDrivenRanking"), "search route must apply evidence-driven ranking");
assert(searchRoute.includes("evidence_tuning: evidenceTuning"), "search route diagnostics must attach evidence_tuning");
assert(searchRoute.includes("VISUAL_RESEARCH_BOARD_DISABLE_EVIDENCE_TUNING"), "search route must support disabling evidence-driven tuning");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("buildEvidenceDrivenTuningPlan"), "static fallback must build evidence-driven tuning plan");
assert(clientSearch.includes("applyEvidenceDrivenRanking"), "static fallback must apply evidence-driven ranking");
assert(clientSearch.includes("evidence_tuning: evidenceTuning"), "static fallback diagnostics must attach evidence_tuning");

const panel = read("src/components/search/EvidenceDrivenTuningPanel.tsx");
assert(panel.includes("Evidence-driven ranking/query tuning"), "evidence tuning panel must render heading");
assert(panel.includes("Score weight profile"), "evidence tuning panel must show score weights");
assert(panel.includes("Provider bias"), "evidence tuning panel must show provider bias");
assert(panel.includes("Evidence query hints"), "evidence tuning panel must show query hints");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("EvidenceDrivenTuningPanel"), "SearchPanel must render EvidenceDrivenTuningPanel");
assert(searchPanel.includes("v1.1.0"), "SearchPanel header must show v1.1.0");
assert(searchPanel.includes("visual-research-board-library-v1.1.0.json"), "library export filename must use v1.1.0");

const matrixScript = read("scripts/real-topic-test-matrix.mjs");
assert(matrixScript.includes("evidence_tuning"), "topic matrix script must capture evidence_tuning trace");
assert(matrixScript.includes("evidence_tuning_trace_present"), "topic matrix script must validate evidence_tuning trace presence");

const evidenceScript = read("scripts/evidence-driven-tuning-report.mjs");
assert(evidenceScript.includes("VISUAL_RESEARCH_BOARD_TOPIC_MATRIX_ARTIFACT"), "evidence report script must support alternate topic matrix artifact path");
assert(evidenceScript.includes("artifacts/evidence-driven-tuning-report.json"), "evidence report script must write evidence-driven tuning artifact");
assert(evidenceScript.includes("recommended_actions"), "evidence report must summarize recommended actions");

const docs = read("docs/evidence-driven-ranking-query-tuning.md");
assert(docs.includes("v0.3.1"), "evidence tuning docs must identify v0.3.1");
assert(docs.includes("npm run evidence:tuning:test"), "evidence tuning docs must document the evidence report command");
assert(docs.includes("VISUAL_RESEARCH_BOARD_DISABLE_EVIDENCE_TUNING"), "evidence tuning docs must document disable env var");

if (failures.length) {
  console.error("Evidence-driven tuning checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Evidence-driven tuning checks passed for v0.3.1.");
