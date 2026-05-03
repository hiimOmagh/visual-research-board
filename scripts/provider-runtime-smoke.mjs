import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const baseUrl = (process.env.VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const requireRealProviders = ["1", "true", "yes", "on"].includes(String(process.env.VISUAL_RESEARCH_BOARD_REQUIRE_REAL_PROVIDERS || "").toLowerCase());
const fixturePath = process.env.VISUAL_RESEARCH_BOARD_RUNTIME_TOPICS_FILE || "tests/fixtures/provider-runtime-topics.json";
const topics = JSON.parse(readFileSync(join(root, fixturePath), "utf8"));

function providerStatusCounts(providerHealth = []) {
  return providerHealth.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function activeRealProviders(providerHealth = []) {
  return providerHealth.filter((item) => item.provider !== "mock" && item.status === "active").map((item) => item.provider);
}

async function fetchJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { ok: response.ok, status: response.status, json };
}

async function runCase(testCase) {
  const request = {
    topic: testCase.topic,
    mode: testCase.mode,
    depth: testCase.depth,
    provider_toggles: {
      mock: true,
      wikimedia: true,
      brave: true,
      tavily: true
    }
  };

  const response = await fetchJson("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    return {
      id: testCase.id,
      request,
      status: "failed",
      http_status: response.status,
      error: response.json?.error || response.json?.raw || "Search endpoint failed."
    };
  }

  const diagnostics = response.json?.diagnostics;
  const evidence = diagnostics?.retrieval_evidence;
  const providerHealth = diagnostics?.provider_health || [];
  const activeReal = activeRealProviders(providerHealth);
  const statusCounts = providerStatusCounts(providerHealth);
  const passesCandidateGate = evidence?.total_candidates >= evidence?.target_candidate_count;
  const passesRealProviderGate = !requireRealProviders || activeReal.length > 0;

  return {
    id: testCase.id,
    request,
    status: passesCandidateGate && passesRealProviderGate ? "passed" : "warning",
    provider_status_counts: statusCounts,
    active_real_providers: activeReal,
    retrieval_evidence: evidence,
    runtime_report: diagnostics?.runtime_report,
    result_count: Array.isArray(response.json?.results) ? response.json.results.length : 0,
    warnings: [
      ...(evidence?.warnings || []),
      ...(!passesRealProviderGate ? ["No real provider was active. Add keys or verify deployment runtime."] : [])
    ]
  };
}

const startedAt = new Date().toISOString();
const runtime = await fetchJson("/api/provider-runtime", { method: "GET" }).catch((error) => ({ ok: false, status: 0, json: { error: error.message } }));
const cases = [];

for (const testCase of topics) {
  cases.push(await runCase(testCase));
}

const summary = {
  generated_at: new Date().toISOString(),
  started_at: startedAt,
  base_url: baseUrl,
  require_real_providers: requireRealProviders,
  runtime_endpoint: runtime,
  case_count: cases.length,
  passed_count: cases.filter((item) => item.status === "passed").length,
  warning_count: cases.filter((item) => item.status === "warning").length,
  failed_count: cases.filter((item) => item.status === "failed").length,
  cases
};

mkdirSync(join(root, "artifacts"), { recursive: true });
const outPath = join(root, "artifacts/provider-runtime-evidence.json");
writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`Provider runtime evidence written to ${outPath}`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Passed: ${summary.passed_count} · Warnings: ${summary.warning_count} · Failed: ${summary.failed_count}`);

if (summary.failed_count > 0) process.exit(1);
if (requireRealProviders && summary.warning_count > 0) process.exit(1);
