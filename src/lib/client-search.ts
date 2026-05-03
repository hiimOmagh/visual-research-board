import type { ProviderHealth, ResearchRequest, ResearchResponse, ResearchResult, SearchDiagnostics, SearchProviderName } from "@/types/research";
import { DEFAULT_PROVIDER_TOGGLES } from "@/types/research";
import { createSearchPlan } from "@/lib/query-planner";
import { normalizeResults } from "@/lib/result-normalizer";
import { searchMockProvider } from "@/lib/providers/mock";
import { buildRetrievalEvidence } from "@/lib/retrieval-evidence";
import { buildRetrievalQualityCalibration } from "@/lib/retrieval-calibration";
import { buildProviderRuntimeReport } from "@/lib/provider-runtime";
import { applyAutoTunedRanking, buildRetrievalAutoTunePlan, completeAutoTuningTrace } from "@/lib/retrieval-autotuning";
import { applyEvidenceDrivenRanking, buildEvidenceDrivenTuningPlan, completeEvidenceDrivenTuningTrace } from "@/lib/evidence-driven-tuning";

function emptyTypeCounts(): ProviderHealth["result_type_counts"] {
  return { image: 0, web: 0, news: 0, archive: 0 };
}

function countResultTypes(results: ResearchResult[]): ProviderHealth["result_type_counts"] {
  return results.reduce<ProviderHealth["result_type_counts"]>((counts, result) => {
    counts[result.type] = (counts[result.type] ?? 0) + 1;
    return counts;
  }, emptyTypeCounts());
}

function skippedHealth(provider: SearchProviderName, message: string): ProviderHealth {
  return {
    provider,
    status: "skipped",
    enabled: false,
    result_count: 0,
    result_type_counts: emptyTypeCounts(),
    duration_ms: 0,
    queries_used: 0,
    query_sample: [],
    message
  };
}

export function isStaticClientDemo(): boolean {
  return process.env.NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_STATIC_DEMO === "true";
}

export async function createClientMockResearchResponse(request: ResearchRequest): Promise<ResearchResponse> {
  const startedAt = Date.now();
  const searchPlan = createSearchPlan(request);
  const rawMockResults = await searchMockProvider(searchPlan);
  const normalized = normalizeResults(rawMockResults, {
    topic: searchPlan.original_topic,
    mode: searchPlan.mode
  });

  const providerToggles = {
    ...DEFAULT_PROVIDER_TOGGLES,
    ...request.provider_toggles,
    mock: true,
    wikimedia: false,
    brave: false,
    tavily: false
  };

  const mockHealth: ProviderHealth = {
    provider: "mock",
    status: normalized.results.length > 0 ? "active" : "no_results",
    enabled: true,
    result_count: normalized.results.length,
    result_type_counts: countResultTypes(normalized.results),
    duration_ms: Date.now() - startedAt,
    queries_used: searchPlan.queries.length,
    query_sample: searchPlan.queries.slice(0, 3),
    endpoint_sample: ["client/mock"],
    message: "Client-side mock search is active. This mode works on static hosts such as GitHub Pages but does not call real provider APIs."
  };

  const providerHealth = [
    mockHealth,
    skippedHealth("wikimedia", "Skipped in client-side static demo mode. Use a Next.js runtime deployment for Wikimedia provider calls."),
    skippedHealth("brave", "Skipped in client-side static demo mode. Use a Next.js runtime deployment for Brave provider calls."),
    skippedHealth("tavily", "Skipped in client-side static demo mode. Use a Next.js runtime deployment for Tavily provider calls.")
  ];

  const generatedAt = new Date().toISOString();
  const initialEvidence = buildRetrievalEvidence({ plan: searchPlan, results: normalized.results, providerHealth });
  const initialCalibration = buildRetrievalQualityCalibration({ mode: searchPlan.mode, depth: searchPlan.depth, results: normalized.results, providerHealth });
  const { plan: autoTunedPlan, trace: initialAutoTuneTrace } = buildRetrievalAutoTunePlan({
    plan: searchPlan,
    evidence: initialEvidence,
    calibration: initialCalibration,
    providerHealth
  });
  const { plan: tunedPlan, trace: initialEvidenceTuningTrace } = buildEvidenceDrivenTuningPlan({
    plan: autoTunedPlan,
    evidence: initialEvidence,
    calibration: initialCalibration,
    providerHealth
  });
  const autoRankedResults = applyAutoTunedRanking(normalized.results, {
    ...initialAutoTuneTrace,
    applied: initialAutoTuneTrace.applied,
    reason: initialAutoTuneTrace.applied
      ? "Static demo mode cannot call live providers, so auto-tuning is limited to client-side reranking and weak-case query visibility."
      : initialAutoTuneTrace.reason
  });
  const rankedResults = applyEvidenceDrivenRanking(autoRankedResults, {
    ...initialEvidenceTuningTrace,
    reason: initialEvidenceTuningTrace.applied
      ? "Static demo mode cannot call live providers, so evidence-driven tuning is limited to client-side reranking and query-hint visibility."
      : initialEvidenceTuningTrace.reason
  }, tunedPlan.original_topic);
  const finalEvidence = buildRetrievalEvidence({ plan: tunedPlan, results: rankedResults, providerHealth });
  const finalCalibration = buildRetrievalQualityCalibration({ mode: tunedPlan.mode, depth: tunedPlan.depth, results: rankedResults, providerHealth });
  const autoTuning = completeAutoTuningTrace({
    trace: {
      ...initialAutoTuneTrace,
      reason: initialAutoTuneTrace.applied
        ? "Static demo mode cannot call live providers, so auto-tuning is limited to client-side reranking and weak-case query visibility."
        : initialAutoTuneTrace.reason
    },
    finalEvidence,
    finalCalibration
  });
  const evidenceTuning = completeEvidenceDrivenTuningTrace({
    trace: {
      ...initialEvidenceTuningTrace,
      reason: initialEvidenceTuningTrace.applied
        ? "Static demo mode cannot call live providers, so evidence-driven tuning is limited to client-side reranking and query-hint visibility."
        : initialEvidenceTuningTrace.reason
    },
    finalEvidence,
    finalCalibration
  });

  const diagnostics: SearchDiagnostics = {
    generated_at: generatedAt,
    total_raw_results: normalized.stats.raw_count,
    total_normalized_results: normalized.stats.normalized_count,
    total_deduped_results: rankedResults.length,
    duplicate_count: normalized.stats.duplicate_count,
    provider_health: providerHealth,
    provider_toggles: providerToggles,
    mock_only: true,
    retrieval_evidence: finalEvidence,
    quality_calibration: finalCalibration,
    auto_tuning: autoTuning,
    evidence_tuning: evidenceTuning,
    runtime_report: buildProviderRuntimeReport({
      mockOnly: true,
      staticDemo: true,
      braveKeyPresent: false,
      tavilyKeyPresent: false,
      generatedAt
    })
  };

  return {
    request: { ...request, provider_toggles: providerToggles },
    search_plan: tunedPlan,
    results: rankedResults,
    diagnostics
  };
}
