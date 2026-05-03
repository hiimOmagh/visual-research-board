import { NextResponse } from "next/server";
import { createSearchPlan } from "@/lib/query-planner";
import { normalizeResults } from "@/lib/result-normalizer";
import { searchMockProvider } from "@/lib/providers/mock";
import { searchBraveImages, searchBraveWeb } from "@/lib/providers/brave";
import { searchTavily } from "@/lib/providers/tavily";
import { searchWikimediaCommons } from "@/lib/providers/wikimedia";
import { ProviderFetchError, querySlice } from "@/lib/providers/provider-utils";
import type { ProviderHealth, ResearchMode, ResearchRequest, ResultType, SearchDepth, SearchPlan, SearchProviderName } from "@/types/research";
import { DEFAULT_PROVIDER_TOGGLES, SEARCH_PROVIDERS } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { buildRetrievalEvidence } from "@/lib/retrieval-evidence";
import { buildRetrievalQualityCalibration } from "@/lib/retrieval-calibration";
import { buildProviderRuntimeReport } from "@/lib/provider-runtime";
import { applyAutoTunedRanking, buildRetrievalAutoTunePlan, completeAutoTuningTrace } from "@/lib/retrieval-autotuning";
import { applyEvidenceDrivenRanking, buildEvidenceDrivenTuningPlan, completeEvidenceDrivenTuningTrace } from "@/lib/evidence-driven-tuning";

const validModes: ResearchMode[] = ["person_reference", "historical_topic", "youtube_documentary", "thumbnail_inspiration", "public_domain", "news_event", "design_moodboard", "academic_source_pack"];
const validDepths: SearchDepth[] = ["quick", "standard", "deep"];
const MOCK_ONLY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);
const DISABLE_AUTOTUNE_VALUES = new Set(["1", "true", "yes", "on"]);
const DISABLE_EVIDENCE_TUNING_VALUES = new Set(["1", "true", "yes", "on"]);

function isMockOnlyMode(): boolean {
  return MOCK_ONLY_ENV_VALUES.has(String(process.env.VISUAL_RESEARCH_BOARD_MOCK_ONLY ?? "").trim().toLowerCase());
}

function isAutoTuneDisabled(): boolean {
  return DISABLE_AUTOTUNE_VALUES.has(String(process.env.VISUAL_RESEARCH_BOARD_DISABLE_AUTO_TUNING ?? "").trim().toLowerCase());
}

function isEvidenceTuningDisabled(): boolean {
  return DISABLE_EVIDENCE_TUNING_VALUES.has(String(process.env.VISUAL_RESEARCH_BOARD_DISABLE_EVIDENCE_TUNING ?? "").trim().toLowerCase());
}

function validateResearchRequest(body: unknown): ResearchRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const candidate = body as Partial<ResearchRequest>;
  if (typeof candidate.topic !== "string" || candidate.topic.trim().length < 2) return null;
  if (!candidate.mode || !validModes.includes(candidate.mode)) return null;
  if (!candidate.depth || !validDepths.includes(candidate.depth)) return null;
  const providedToggles: Partial<Record<SearchProviderName, boolean>> = typeof candidate.provider_toggles === "object" && candidate.provider_toggles !== null ? candidate.provider_toggles : {};
  const provider_toggles = SEARCH_PROVIDERS.reduce((acc, provider) => {
    const requested = providedToggles[provider];
    acc[provider] = typeof requested === "boolean" ? requested : DEFAULT_PROVIDER_TOGGLES[provider];
    return acc;
  }, { ...DEFAULT_PROVIDER_TOGGLES });
  if (!provider_toggles.mock && !provider_toggles.wikimedia && !provider_toggles.brave && !provider_toggles.tavily) provider_toggles.mock = true;
  return { topic: candidate.topic.trim(), mode: candidate.mode, depth: candidate.depth, provider_toggles };
}

function providerQueries(plan: SearchPlan): string[] {
  return querySlice(plan.queries, plan.depth);
}

function countResultTypes(results: RawProviderResult[]): Partial<Record<ResultType, number>> {
  return results.reduce<Partial<Record<ResultType, number>>>((acc, result) => {
    acc[result.type] = (acc[result.type] ?? 0) + 1;
    return acc;
  }, {});
}

function emptyTypeCounts(): Partial<Record<ResultType, number>> {
  return {};
}

async function runProvider(params: {
  provider: SearchProviderName;
  enabled: boolean;
  skippedMessage?: string;
  missingEnv?: string;
  missingKeyMessage?: string;
  endpointSample?: string[];
  plan: SearchPlan;
  run: () => Promise<RawProviderResult[]>;
}): Promise<{ results: RawProviderResult[]; health: ProviderHealth }> {
  const startedAt = Date.now();
  const query_sample = providerQueries(params.plan);
  const endpoint_sample = params.endpointSample ?? [];
  if (!params.enabled) {
    return {
      results: [],
      health: {
        provider: params.provider,
        status: "skipped",
        enabled: false,
        result_count: 0,
        result_type_counts: emptyTypeCounts(),
        duration_ms: 0,
        queries_used: 0,
        query_sample,
        endpoint_sample,
        message: params.skippedMessage ?? "Provider disabled or not targeted by this research mode."
      }
    };
  }
  if (params.missingEnv) {
    return {
      results: [],
      health: {
        provider: params.provider,
        status: "missing_key",
        enabled: true,
        result_count: 0,
        result_type_counts: emptyTypeCounts(),
        duration_ms: 0,
        queries_used: 0,
        query_sample,
        endpoint_sample,
        missing_env: params.missingEnv,
        message: params.missingKeyMessage ?? `Missing ${params.missingEnv}. Add it to .env.local or disable this provider.`
      }
    };
  }
  try {
    const results = await params.run();
    const duration_ms = Date.now() - startedAt;
    const result_type_counts = countResultTypes(results);
    if (results.length === 0) {
      return {
        results,
        health: {
          provider: params.provider,
          status: "no_results",
          enabled: true,
          result_count: 0,
          result_type_counts,
          duration_ms,
          queries_used: query_sample.length,
          query_sample,
          endpoint_sample,
          message: "Provider responded but returned no usable normalized candidates for this plan."
        }
      };
    }
    return {
      results,
      health: {
        provider: params.provider,
        status: "active",
        enabled: true,
        result_count: results.length,
        result_type_counts,
        duration_ms,
        queries_used: query_sample.length,
        query_sample,
        endpoint_sample
      }
    };
  } catch (error) {
    const providerStatus = error instanceof ProviderFetchError ? error.status : "error";
    return {
      results: [],
      health: {
        provider: params.provider,
        status: providerStatus,
        enabled: true,
        result_count: 0,
        result_type_counts: emptyTypeCounts(),
        duration_ms: Date.now() - startedAt,
        queries_used: query_sample.length,
        query_sample,
        endpoint_sample,
        message: error instanceof Error ? error.message : "Unknown provider error."
      }
    };
  }
}

async function executeProviderRuns(params: {
  searchPlan: SearchPlan;
  runtimeToggles: Record<SearchProviderName, boolean>;
  mockOnly: boolean;
}): Promise<Array<{ results: RawProviderResult[]; health: ProviderHealth }>> {
  const { searchPlan, runtimeToggles, mockOnly } = params;
  return Promise.all([
    runProvider({
      provider: "mock",
      enabled: runtimeToggles.mock,
      endpointSample: ["local/mock"],
      plan: searchPlan,
      run: () => searchMockProvider(searchPlan)
    }),
    runProvider({
      provider: "wikimedia",
      enabled: Boolean(runtimeToggles.wikimedia) && searchPlan.source_targets.includes("commons"),
      skippedMessage: mockOnly ? "Mock-only safe mode is active; Wikimedia was intentionally skipped." : "Wikimedia is disabled or this mode did not request Commons targets.",
      endpointSample: ["commons.wikimedia.org/w/api.php"],
      plan: searchPlan,
      run: () => searchWikimediaCommons(searchPlan)
    }),
    runProvider({
      provider: "brave",
      enabled: Boolean(runtimeToggles.brave) && (searchPlan.source_targets.includes("image") || searchPlan.source_targets.includes("web")),
      skippedMessage: mockOnly ? "Mock-only safe mode is active; Brave was intentionally skipped." : "Brave is disabled or this mode did not request image/web targets.",
      missingEnv: runtimeToggles.brave && !process.env.BRAVE_SEARCH_API_KEY ? "BRAVE_SEARCH_API_KEY" : undefined,
      missingKeyMessage: "Brave Search is enabled but BRAVE_SEARCH_API_KEY is missing. Add it to .env.local, disable Brave, or enable VISUAL_RESEARCH_BOARD_MOCK_ONLY=true.",
      endpointSample: ["api.search.brave.com/res/v1/images/search", "api.search.brave.com/res/v1/web/search"],
      plan: searchPlan,
      run: async () => {
        const [images, web] = await Promise.all([searchBraveImages(searchPlan), searchBraveWeb(searchPlan)]);
        return [...images, ...web];
      }
    }),
    runProvider({
      provider: "tavily",
      enabled: Boolean(runtimeToggles.tavily) && searchPlan.source_targets.includes("web"),
      skippedMessage: mockOnly ? "Mock-only safe mode is active; Tavily was intentionally skipped." : "Tavily is disabled or this mode did not request web targets.",
      missingEnv: runtimeToggles.tavily && !process.env.TAVILY_API_KEY ? "TAVILY_API_KEY" : undefined,
      missingKeyMessage: "Tavily is enabled but TAVILY_API_KEY is missing. Add it to .env.local, disable Tavily, or enable VISUAL_RESEARCH_BOARD_MOCK_ONLY=true.",
      endpointSample: ["api.tavily.com/search"],
      plan: searchPlan,
      run: () => searchTavily(searchPlan)
    })
  ]);
}

function mergeResultTypeCounts(a: Partial<Record<ResultType, number>>, b: Partial<Record<ResultType, number>>): Partial<Record<ResultType, number>> {
  const merged: Partial<Record<ResultType, number>> = { ...a };
  for (const [type, count] of Object.entries(b) as Array<[ResultType, number]>) {
    merged[type] = (merged[type] ?? 0) + count;
  }
  return merged;
}

function combineHealth(first: ProviderHealth[], second: ProviderHealth[]): ProviderHealth[] {
  return SEARCH_PROVIDERS.map((provider) => {
    const a = first.find((entry) => entry.provider === provider);
    const b = second.find((entry) => entry.provider === provider);
    if (!a) return b as ProviderHealth;
    if (!b) return a;
    const status = a.status === "active" || b.status === "active"
      ? "active"
      : b.status === "missing_key" || a.status === "missing_key"
        ? "missing_key"
        : b.status === "timeout" || a.status === "timeout"
          ? "timeout"
          : b.status === "error" || a.status === "error"
            ? "error"
            : b.status === "no_results" || a.status === "no_results"
              ? "no_results"
              : "skipped";
    return {
      ...b,
      status,
      enabled: a.enabled || b.enabled,
      result_count: a.result_count + b.result_count,
      result_type_counts: mergeResultTypeCounts(a.result_type_counts, b.result_type_counts),
      duration_ms: a.duration_ms + b.duration_ms,
      queries_used: a.queries_used + b.queries_used,
      query_sample: Array.from(new Set([...a.query_sample, ...b.query_sample])).slice(0, 10),
      endpoint_sample: Array.from(new Set([...(a.endpoint_sample ?? []), ...(b.endpoint_sample ?? [])])),
      message: status === "active"
        ? "Auto-tuning merged baseline and tuned provider evidence."
        : b.message ?? a.message
    };
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validRequest = validateResearchRequest(body);
  if (!validRequest) return NextResponse.json({ error: "Invalid request. Provide topic, mode, and depth." }, { status: 400 });

  const mockOnly = isMockOnlyMode();
  const baseSearchPlan = createSearchPlan(validRequest);
  const requestedToggles = validRequest.provider_toggles ?? DEFAULT_PROVIDER_TOGGLES;
  const runtimeToggles = mockOnly ? { mock: true, wikimedia: false, brave: false, tavily: false } : requestedToggles;
  const effectiveRequest: ResearchRequest = { ...validRequest, provider_toggles: runtimeToggles };

  const firstProviderRuns = await executeProviderRuns({ searchPlan: baseSearchPlan, runtimeToggles, mockOnly });
  const firstRawResults = firstProviderRuns.flatMap((entry) => entry.results);
  const firstProviderHealth = firstProviderRuns.map((entry) => entry.health);
  const firstNormalized = normalizeResults(firstRawResults, { topic: baseSearchPlan.original_topic, mode: baseSearchPlan.mode });
  const firstEvidence = buildRetrievalEvidence({ plan: baseSearchPlan, results: firstNormalized.results, providerHealth: firstProviderHealth });
  const firstCalibration = buildRetrievalQualityCalibration({ mode: baseSearchPlan.mode, depth: baseSearchPlan.depth, results: firstNormalized.results, providerHealth: firstProviderHealth });
  const { plan: autoTunedPlan, trace: initialAutoTuneTrace } = buildRetrievalAutoTunePlan({
    plan: baseSearchPlan,
    evidence: firstEvidence,
    calibration: firstCalibration,
    providerHealth: firstProviderHealth
  });
  const { plan: evidenceTunedPlan, trace: initialEvidenceTuningTrace } = buildEvidenceDrivenTuningPlan({
    plan: autoTunedPlan,
    evidence: firstEvidence,
    calibration: firstCalibration,
    providerHealth: firstProviderHealth
  });

  const shouldRunTunedPass = (initialAutoTuneTrace.applied && !isAutoTuneDisabled()) || (initialEvidenceTuningTrace.applied && !isEvidenceTuningDisabled());
  const tunedPlan = shouldRunTunedPass ? evidenceTunedPlan : baseSearchPlan;
  const secondProviderRuns = shouldRunTunedPass
    ? await executeProviderRuns({ searchPlan: tunedPlan, runtimeToggles, mockOnly })
    : [];
  const rawResults = shouldRunTunedPass
    ? [...firstRawResults, ...secondProviderRuns.flatMap((entry) => entry.results)]
    : firstRawResults;
  const providerHealth = shouldRunTunedPass
    ? combineHealth(firstProviderHealth, secondProviderRuns.map((entry) => entry.health))
    : firstProviderHealth;

  const normalized = normalizeResults(rawResults, { topic: tunedPlan.original_topic, mode: tunedPlan.mode });
  const autoRankedResults = applyAutoTunedRanking(normalized.results, initialAutoTuneTrace);
  const rankedResults = applyEvidenceDrivenRanking(autoRankedResults, initialEvidenceTuningTrace, tunedPlan.original_topic);
  const generatedAt = new Date().toISOString();
  const retrievalEvidence = buildRetrievalEvidence({ plan: tunedPlan, results: rankedResults, providerHealth });
  const qualityCalibration = buildRetrievalQualityCalibration({ mode: tunedPlan.mode, depth: tunedPlan.depth, results: rankedResults, providerHealth });
  const autoTuning = completeAutoTuningTrace({
    trace: shouldRunTunedPass
      ? initialAutoTuneTrace
      : { ...initialAutoTuneTrace, applied: false, reason: isAutoTuneDisabled() ? "Auto-tuning was recommended but disabled by VISUAL_RESEARCH_BOARD_DISABLE_AUTO_TUNING." : initialAutoTuneTrace.reason },
    finalEvidence: retrievalEvidence,
    finalCalibration: qualityCalibration
  });
  const evidenceTuning = completeEvidenceDrivenTuningTrace({
    trace: shouldRunTunedPass
      ? initialEvidenceTuningTrace
      : { ...initialEvidenceTuningTrace, applied: false, reason: isEvidenceTuningDisabled() ? "Evidence-driven tuning was recommended but disabled by VISUAL_RESEARCH_BOARD_DISABLE_EVIDENCE_TUNING." : initialEvidenceTuningTrace.reason },
    finalEvidence: retrievalEvidence,
    finalCalibration: qualityCalibration
  });
  const runtimeReport = buildProviderRuntimeReport({
    mockOnly,
    staticDemo: false,
    braveKeyPresent: Boolean(process.env.BRAVE_SEARCH_API_KEY),
    tavilyKeyPresent: Boolean(process.env.TAVILY_API_KEY),
    generatedAt
  });

  return NextResponse.json({
    request: effectiveRequest,
    search_plan: tunedPlan,
    results: rankedResults,
    diagnostics: {
      generated_at: generatedAt,
      total_raw_results: rawResults.length,
      total_normalized_results: normalized.stats.normalized_count,
      total_deduped_results: rankedResults.length,
      duplicate_count: normalized.stats.duplicate_count,
      provider_health: providerHealth,
      provider_toggles: runtimeToggles,
      mock_only: mockOnly,
      retrieval_evidence: retrievalEvidence,
      quality_calibration: qualityCalibration,
      auto_tuning: autoTuning,
      evidence_tuning: evidenceTuning,
      runtime_report: runtimeReport
    }
  });
}
