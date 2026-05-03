import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const baseUrl = (process.env.VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const fixturePath = process.env.VISUAL_RESEARCH_BOARD_CALIBRATION_TOPICS_FILE || "tests/fixtures/retrieval-quality-calibration-topics.json";
const requireCreatorGate = ["1", "true", "yes", "on"].includes(String(process.env.VISUAL_RESEARCH_BOARD_REQUIRE_CREATOR_GATE || "").toLowerCase());
const topics = JSON.parse(readFileSync(join(root, fixturePath), "utf8"));

async function fetchJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 500) }; }
  return { ok: response.ok, status: response.status, json };
}

async function runCase(testCase) {
  const request = {
    topic: testCase.topic,
    mode: testCase.mode,
    depth: testCase.depth,
    provider_toggles: { mock: true, wikimedia: true, brave: true, tavily: true }
  };

  const response = await fetchJson("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    return { id: testCase.id, request, status: "failed", http_status: response.status, error: response.json?.error || response.json?.raw || "Search endpoint failed." };
  }

  const diagnostics = response.json?.diagnostics;
  const calibration = diagnostics?.quality_calibration;
  const evidence = diagnostics?.retrieval_evidence;
  const passesCreatorGate = calibration?.verdict === "passes_creator_gate";
  const status = passesCreatorGate ? "passed" : "warning";

  return {
    id: testCase.id,
    request,
    status,
    result_count: Array.isArray(response.json?.results) ? response.json.results.length : 0,
    retrieval_evidence: evidence,
    quality_calibration: calibration,
    provider_health: diagnostics?.provider_health,
    warnings: [
      ...(evidence?.warnings || []),
      ...(calibration?.warnings || [])
    ]
  };
}

const startedAt = new Date().toISOString();
const cases = [];
for (const testCase of topics) cases.push(await runCase(testCase));

const summary = {
  generated_at: new Date().toISOString(),
  started_at: startedAt,
  base_url: baseUrl,
  require_creator_gate: requireCreatorGate,
  case_count: cases.length,
  passed_count: cases.filter((item) => item.status === "passed").length,
  warning_count: cases.filter((item) => item.status === "warning").length,
  failed_count: cases.filter((item) => item.status === "failed").length,
  average_calibration_score: Number((cases.reduce((sum, item) => sum + (item.quality_calibration?.calibration_score || 0), 0) / Math.max(1, cases.length)).toFixed(2)),
  cases
};

mkdirSync(join(root, "artifacts"), { recursive: true });
const outPath = join(root, "artifacts/retrieval-quality-calibration.json");
writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Retrieval quality calibration written to ${outPath}`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Passed: ${summary.passed_count} · Warnings: ${summary.warning_count} · Failed: ${summary.failed_count} · Avg score: ${summary.average_calibration_score}`);

if (summary.failed_count > 0) process.exit(1);
if (requireCreatorGate && summary.warning_count > 0) process.exit(1);
