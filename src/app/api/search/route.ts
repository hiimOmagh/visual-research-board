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

const validModes: ResearchMode[] = ["person_reference", "historical_topic", "youtube_documentary", "thumbnail_inspiration", "public_domain", "news_event", "design_moodboard", "academic_source_pack"];
const validDepths: SearchDepth[] = ["quick", "standard", "deep"];
const MOCK_ONLY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);

function isMockOnlyMode(): boolean { return MOCK_ONLY_ENV_VALUES.has(String(process.env.VISUAL_RESEARCH_BOARD_MOCK_ONLY ?? "").trim().toLowerCase()); }

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

function providerQueries(plan: SearchPlan): string[] { return querySlice(plan.queries, plan.depth); }
function countResultTypes(results: RawProviderResult[]): Partial<Record<ResultType, number>> { return results.reduce<Partial<Record<ResultType, number>>>((acc, result) => { acc[result.type] = (acc[result.type] ?? 0) + 1; return acc; }, {}); }
function emptyTypeCounts(): Partial<Record<ResultType, number>> { return {}; }

async function runProvider(params: { provider: SearchProviderName; enabled: boolean; skippedMessage?: string; missingEnv?: string; missingKeyMessage?: string; endpointSample?: string[]; plan: SearchPlan; run: () => Promise<RawProviderResult[]>; }): Promise<{ results: RawProviderResult[]; health: ProviderHealth }> {
  const startedAt = Date.now();
  const query_sample = providerQueries(params.plan);
  const endpoint_sample = params.endpointSample ?? [];
  if (!params.enabled) return { results: [], health: { provider: params.provider, status: "skipped", enabled: false, result_count: 0, result_type_counts: emptyTypeCounts(), duration_ms: 0, queries_used: 0, query_sample, endpoint_sample, message: params.skippedMessage ?? "Provider disabled or not targeted by this research mode." } };
  if (params.missingEnv) return { results: [], health: { provider: params.provider, status: "missing_key", enabled: true, result_count: 0, result_type_counts: emptyTypeCounts(), duration_ms: 0, queries_used: 0, query_sample, endpoint_sample, missing_env: params.missingEnv, message: params.missingKeyMessage ?? `Missing ${params.missingEnv}. Add it to .env.local or disable this provider.` } };
  try {
    const results = await params.run();
    const duration_ms = Date.now() - startedAt;
    const result_type_counts = countResultTypes(results);
    if (results.length === 0) return { results, health: { provider: params.provider, status: "no_results", enabled: true, result_count: 0, result_type_counts, duration_ms, queries_used: query_sample.length, query_sample, endpoint_sample, message: "Provider responded but returned no usable normalized candidates for this plan." } };
    return { results, health: { provider: params.provider, status: "active", enabled: true, result_count: results.length, result_type_counts, duration_ms, queries_used: query_sample.length, query_sample, endpoint_sample } };
  } catch (error) {
    const providerStatus = error instanceof ProviderFetchError ? error.status : "error";
    return { results: [], health: { provider: params.provider, status: providerStatus, enabled: true, result_count: 0, result_type_counts: emptyTypeCounts(), duration_ms: Date.now() - startedAt, queries_used: query_sample.length, query_sample, endpoint_sample, message: error instanceof Error ? error.message : "Unknown provider error." } };
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validRequest = validateResearchRequest(body);
  if (!validRequest) return NextResponse.json({ error: "Invalid request. Provide topic, mode, and depth." }, { status: 400 });
  const mockOnly = isMockOnlyMode();
  const searchPlan = createSearchPlan(validRequest);
  const requestedToggles = validRequest.provider_toggles ?? DEFAULT_PROVIDER_TOGGLES;
  const runtimeToggles = mockOnly ? { mock: true, wikimedia: false, brave: false, tavily: false } : requestedToggles;
  const effectiveRequest: ResearchRequest = { ...validRequest, provider_toggles: runtimeToggles };
  const providerRuns = await Promise.all([
    runProvider({ provider: "mock", enabled: runtimeToggles.mock, endpointSample: ["local/mock"], plan: searchPlan, run: () => searchMockProvider(searchPlan) }),
    runProvider({ provider: "wikimedia", enabled: Boolean(runtimeToggles.wikimedia) && searchPlan.source_targets.includes("commons"), skippedMessage: mockOnly ? "Mock-only safe mode is active; Wikimedia was intentionally skipped." : "Wikimedia is disabled or this mode did not request Commons targets.", endpointSample: ["commons.wikimedia.org/w/api.php"], plan: searchPlan, run: () => searchWikimediaCommons(searchPlan) }),
    runProvider({ provider: "brave", enabled: Boolean(runtimeToggles.brave) && (searchPlan.source_targets.includes("image") || searchPlan.source_targets.includes("web")), skippedMessage: mockOnly ? "Mock-only safe mode is active; Brave was intentionally skipped." : "Brave is disabled or this mode did not request image/web targets.", missingEnv: runtimeToggles.brave && !process.env.BRAVE_SEARCH_API_KEY ? "BRAVE_SEARCH_API_KEY" : undefined, missingKeyMessage: "Brave Search is enabled but BRAVE_SEARCH_API_KEY is missing. Add it to .env.local, disable Brave, or enable VISUAL_RESEARCH_BOARD_MOCK_ONLY=true.", endpointSample: ["api.search.brave.com/res/v1/images/search", "api.search.brave.com/res/v1/web/search"], plan: searchPlan, run: async () => { const [images, web] = await Promise.all([searchBraveImages(searchPlan), searchBraveWeb(searchPlan)]); return [...images, ...web]; } }),
    runProvider({ provider: "tavily", enabled: Boolean(runtimeToggles.tavily) && searchPlan.source_targets.includes("web"), skippedMessage: mockOnly ? "Mock-only safe mode is active; Tavily was intentionally skipped." : "Tavily is disabled or this mode did not request web targets.", missingEnv: runtimeToggles.tavily && !process.env.TAVILY_API_KEY ? "TAVILY_API_KEY" : undefined, missingKeyMessage: "Tavily is enabled but TAVILY_API_KEY is missing. Add it to .env.local, disable Tavily, or enable VISUAL_RESEARCH_BOARD_MOCK_ONLY=true.", endpointSample: ["api.tavily.com/search"], plan: searchPlan, run: () => searchTavily(searchPlan) })
  ]);
  const rawResults = providerRuns.flatMap((entry) => entry.results);
  const normalized = normalizeResults(rawResults, { topic: searchPlan.original_topic, mode: searchPlan.mode });
  return NextResponse.json({ request: effectiveRequest, search_plan: searchPlan, results: normalized.results, diagnostics: { generated_at: new Date().toISOString(), total_raw_results: normalized.stats.raw_count, total_normalized_results: normalized.stats.normalized_count, total_deduped_results: normalized.stats.deduped_count, duplicate_count: normalized.stats.duplicate_count, provider_health: providerRuns.map((entry) => entry.health), provider_toggles: runtimeToggles, mock_only: mockOnly } });
}
