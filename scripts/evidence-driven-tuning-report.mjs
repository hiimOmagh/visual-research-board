import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const artifactPath = process.env.VISUAL_RESEARCH_BOARD_TOPIC_MATRIX_ARTIFACT || "artifacts/real-topic-test-matrix.json";
const fixturePath = process.env.VISUAL_RESEARCH_BOARD_TOPIC_MATRIX_FILE || "tests/fixtures/real-topic-test-matrix.json";
const strict = ["1", "true", "yes", "on"].includes(String(process.env.VISUAL_RESEARCH_BOARD_REQUIRE_EVIDENCE_TUNING_PASS || "").toLowerCase());

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

function weakFromCase(testCase) {
  const weakChecks = testCase?.matrix_verdict?.weak_checks || [];
  const calibration = testCase?.quality_calibration || {};
  const evidence = testCase?.retrieval_evidence || {};
  const weak = new Set(weakChecks);
  if (calibration.verdict && calibration.verdict !== "passes_creator_gate") weak.add(calibration.verdict);
  if (evidence.verdict && evidence.verdict !== "passes_mvp_gate") weak.add(evidence.verdict);
  if ((calibration.real_provider_share ?? 1) < (calibration.expectations?.real_provider_share_target ?? 0.2)) weak.add("real_provider_share");
  if ((calibration.image_share ?? 1) < (calibration.expectations?.image_share_target ?? 0.45)) weak.add("image_share");
  if ((evidence.source_group_diversity ?? 99) < 4) weak.add("source_diversity");
  return Array.from(weak);
}

function actionsForWeakSignals(signals) {
  const actions = new Set();
  const text = signals.join(" ");
  if (/relevance|needs_more_relevance/.test(text)) actions.add("boost_topic_exactness");
  if (/image|visual|needs_more_visuals/.test(text)) actions.add("boost_image_density");
  if (/license/.test(text)) actions.add("boost_open_license_sources");
  if (/source|diversity|needs_stronger_sources/.test(text)) actions.add("boost_institutional_sources");
  if (/real_provider/.test(text)) actions.add("penalize_mock_when_real_available");
  actions.add("rebalance_top_results_by_source");
  actions.add("penalize_stock_and_social");
  return Array.from(actions);
}

const input = existsSync(join(root, artifactPath))
  ? { source: artifactPath, kind: "runtime_artifact", data: readJson(artifactPath) }
  : { source: fixturePath, kind: "fixture_only", data: readJson(fixturePath) };

const cases = Array.isArray(input.data) ? input.data.map((item) => ({ id: item.id, request: item, status: "fixture" })) : input.data.cases || [];
const modeSummary = new Map();
for (const item of cases) {
  const mode = item.request?.mode || item.mode || "unknown";
  const entry = modeSummary.get(mode) || { mode, case_count: 0, weak_signals: {}, recommended_actions: {} };
  entry.case_count += 1;
  const weakSignals = weakFromCase(item);
  for (const signal of weakSignals) entry.weak_signals[signal] = (entry.weak_signals[signal] || 0) + 1;
  for (const action of actionsForWeakSignals(weakSignals)) entry.recommended_actions[action] = (entry.recommended_actions[action] || 0) + 1;
  modeSummary.set(mode, entry);
}

const modes = Array.from(modeSummary.values()).map((entry) => ({
  ...entry,
  weak_signal_count: Object.values(entry.weak_signals).reduce((sum, count) => sum + count, 0),
  recommended_action_count: Object.values(entry.recommended_actions).reduce((sum, count) => sum + count, 0)
}));

const report = {
  app_version: "0.2.7",
  generated_at: new Date().toISOString(),
  input_source: input.source,
  input_kind: input.kind,
  strict,
  case_count: cases.length,
  mode_count: modes.length,
  modes,
  artifact_contract: {
    consumed_fields: [
      "retrieval_evidence",
      "quality_calibration",
      "auto_tuning",
      "evidence_tuning",
      "matrix_verdict.weak_checks"
    ],
    generated_output: "artifacts/evidence-driven-tuning-report.json"
  },
  verdict: input.kind === "runtime_artifact" ? "evidence_report_ready" : "needs_runtime_topic_matrix_artifact"
};

mkdirSync(join(root, "artifacts"), { recursive: true });
const outPath = join(root, "artifacts/evidence-driven-tuning-report.json");
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Evidence-driven tuning report written to ${outPath}`);
console.log(`Input: ${input.source} (${input.kind})`);
console.log(`Modes covered: ${report.mode_count} · Cases: ${report.case_count}`);
if (strict && report.verdict !== "evidence_report_ready") process.exit(1);
