import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.0.1", "package.json version must be 2.0.1");
assert(Boolean(pkg.scripts?.["ranking:explain:check"]), "package.json must define npm run ranking:explain:check");
assert((pkg.scripts?.qa?.includes("ranking-explainability-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include ranking-explainability-check");

for (const file of [
  "src/lib/ranking-explainability.ts",
  "src/components/search/RankingExplainabilityPanel.tsx",
  "docs/ranking-explainability-calibration-audit.md"
]) assert(existsSync(join(root, file)), `Missing v0.3.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "RankingExplanationFactor",
  "RankingExplanation",
  "RankingExplainabilityAudit",
  "ranking_explanation?: RankingExplanation",
  "ranking_explainability?: RankingExplainabilityAudit",
  "schema_version: \"0.3.1\""
]) assert(types.includes(token), `types must include ${token}`);

const lib = read("src/lib/ranking-explainability.ts");
for (const token of [
  "buildRankingExplainability",
  "reviewSignalValue",
  "metadataCompletenessSignal",
  "providerHealthSignal",
  "rights/reuse signal",
  "review-evidence delta",
  "calibration_confidence",
  "score_delta_from_baseline",
  "sparse_review_evidence",
  "conflicting_review_evidence"
]) assert(lib.includes(token), `ranking explainability lib must include ${token}`);

const route = read("src/app/api/search/route.ts");
for (const token of [
  "buildRankingExplainability",
  "baselineResults: evidenceRankedResults",
  "ranking_explainability: rankingExplainability",
  "reviewRankedResults"
]) assert(route.includes(token), `search route must include ${token}`);

const client = read("src/lib/client-search.ts");
for (const token of [
  "buildRankingExplainability",
  "baselineResults: evidenceRankedResults",
  "ranking_explainability: rankingExplainability"
]) assert(client.includes(token), `client fallback must include ${token}`);

const panel = read("src/components/search/RankingExplainabilityPanel.tsx");
for (const token of [
  "v0.3.1 ranking gate",
  "Ranking explainability + calibration audit",
  "sparse review evidence",
  "conflicting review evidence",
  "Avg abs review delta"
]) assert(panel.includes(token), `RankingExplainabilityPanel must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v2.0.1",
  "RankingExplainabilityPanel",
  "diagnostics?.ranking_explainability",
  "visual-research-board-library-v2.0.1.json"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const resultCard = read("src/components/search/ResultCard.tsx");
for (const token of ["rank #", "Review delta", "dominant_factors", "calibration_confidence"]) {
  assert(resultCard.includes(token), `ResultCard must expose ${token}`);
}

const detail = read("src/components/search/ResultDetailPanel.tsx");
for (const token of ["Ranking explanation", "Dominant:", "Review delta", "factor.contribution"]) {
  assert(detail.includes(token), `ResultDetailPanel must expose ${token}`);
}

const exportLib = read("src/lib/export.ts");
for (const token of ["ranking_explained_count", "ranking_confidence_counts", "Dominant ranking factors", "Ranking explanation: rank #"]) {
  assert(exportLib.includes(token), `export lib must include ${token}`);
}

const docs = read("docs/ranking-explainability-calibration-audit.md");
assert(docs.includes("v0.3.1"), "docs must identify v0.3.1");
assert(docs.includes("npm run ranking:explain:check"), "docs must document validation command");

if (failures.length) {
  console.error("Ranking explainability checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Ranking explainability checks passed for v0.3.1.");
process.exit(0);
