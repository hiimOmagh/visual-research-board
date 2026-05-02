import { NextResponse } from "next/server";
import { createSearchPlan } from "@/lib/query-planner";
import { normalizeResults } from "@/lib/result-normalizer";
import { searchMockProvider } from "@/lib/providers/mock";
import { searchBraveImages, searchBraveWeb } from "@/lib/providers/brave";
import { searchTavily } from "@/lib/providers/tavily";
import { searchWikimediaCommons } from "@/lib/providers/wikimedia";
import { querySlice } from "@/lib/providers/provider-utils";
import type { ProviderHealth, ResearchMode, ResearchRequest, SearchDepth, SearchPlan, SearchProviderName } from "@/types/research";
import { DEFAULT_PROVIDER_TOGGLES, SEARCH_PROVIDERS } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";

const validModes: ResearchMode[] = [
  "person_reference",
  "historical_topic",
  "youtube_documentary",
  "thumbnail_inspiration",
  "public_domain",
  "news_event",
  "design_moodboard",
  "academic_source_pack"
];

const validDepths: SearchDepth[] = ["quick", "standard", "deep"];

function validateResearchRequest(body: unknown): ResearchRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const candidate = body as Partial<ResearchRequest>;
  if (typeof candidate.topic !== "string" || candidate.topic.trim().length < 2) return null;
  if (!candidate.mode || !validModes.includes(candidate.mode)) return null;
  if (!candidate.depth || !validDepths.includes(candidate.depth)) return null;
  const providedToggles: Partial<Record<SearchProviderName, boolean>> =
    typeof candidate.provider_toggles === "object" && candidate.provider_toggles !== null
      ? candidate.provider_toggles
      : {};

  const provider_toggles = SEARCH_PROVIDERS.reduce((acc, provider) => {
    const requested = providedToggles[provider];
    acc[provider] = typeof requested === "boolean" ? requested : DEFAULT_PROVIDER_TOGGLES[provider];
    return acc;
  }, { ...DEFAULT_PROVIDER_TOGGLES });

  if (!provider_toggles.mock && !provider_toggles.wikimedia && !provider_toggles.brave && !provider_toggles.tavily) {
    provider_toggles.mock = true;
  }

  return {
    topic: candidate.topic.trim(),
    mode: candidate.mode,
    depth: candidate.depth,
    provider_toggles
  };
}

function providerQueries(plan: SearchPlan): string[] {
  return querySlice(plan.queries, plan.depth);
}

async function runProvider(params: {
  provider: SearchProviderName;
  enabled: boolean;
  skippedMessage?: string;
  missingKey?: boolean;
  plan: SearchPlan;
  run: () => Promise<RawProviderResult[]>;
}): Promise<{ results: RawProviderResult[]; health: ProviderHealth }> {
  const startedAt = Date.now();
  const query_sample = providerQueries(params.plan);

  if (!params.enabled) {
    return {
      results: [],
      health: {
        provider: params.provider,
        status: "skipped",
        enabled: false,
        result_count: 0,
        duration_ms: 0,
        queries_used: 0,
        query_sample,
        message: params.skippedMessage ?? "Provider disabled or not targeted by this research mode."
      }
    };
  }

  if (params.missingKey) {
    return {
      results: [],
      health: {
        provider: params.provider,
        status: "missing_key",
        enabled: false,
        result_count: 0,
        duration_ms: 0,
        queries_used: 0,
        query_sample,
        message: "Missing API key. Mock data still keeps the app usable."
      }
    };
  }

  try {
    const results = await params.run();
    const duration_ms = Date.now() - startedAt;
    if (results.length === 0) {
      return {
        results,
        health: {
          provider: params.provider,
          status: "no_results",
          enabled: true,
          result_count: 0,
          duration_ms,
          queries_used: query_sample.length,
          query_sample,
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
        duration_ms,
        queries_used: query_sample.length,
        query_sample
      }
    };
  } catch (error) {
    return {
      results: [],
      health: {
        provider: params.provider,
        status: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "error",
        enabled: true,
        result_count: 0,
        duration_ms: Date.now() - startedAt,
        queries_used: query_sample.length,
        query_sample,
        message: error instanceof Error ? error.message : "Unknown provider error."
      }
    };
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validRequest = validateResearchRequest(body);

  if (!validRequest) {
    return NextResponse.json(
      { error: "Invalid request. Provide topic, mode, and depth." },
      { status: 400 }
    );
  }

  const searchPlan = createSearchPlan(validRequest);
  const toggles = validRequest.provider_toggles ?? DEFAULT_PROVIDER_TOGGLES;

  const providerRuns = await Promise.all([
    runProvider({
      provider: "mock",
      enabled: toggles.mock,
      plan: searchPlan,
      run: () => searchMockProvider(searchPlan)
    }),
    runProvider({
      provider: "wikimedia",
      enabled: Boolean(toggles.wikimedia) && searchPlan.source_targets.includes("commons"),
      skippedMessage: "Wikimedia is disabled or this mode did not request Commons targets.",
      plan: searchPlan,
      run: () => searchWikimediaCommons(searchPlan)
    }),
    runProvider({
      provider: "brave",
      enabled: Boolean(toggles.brave) && (searchPlan.source_targets.includes("image") || searchPlan.source_targets.includes("web")),
      skippedMessage: "Brave is disabled or this mode did not request image/web targets.",
      missingKey: !process.env.BRAVE_SEARCH_API_KEY,
      plan: searchPlan,
      run: async () => {
        const [images, web] = await Promise.all([
          searchBraveImages(searchPlan),
          searchBraveWeb(searchPlan)
        ]);
        return [...images, ...web];
      }
    }),
    runProvider({
      provider: "tavily",
      enabled: Boolean(toggles.tavily) && searchPlan.source_targets.includes("web"),
      skippedMessage: "Tavily is disabled or this mode did not request web targets.",
      missingKey: !process.env.TAVILY_API_KEY,
      plan: searchPlan,
      run: () => searchTavily(searchPlan)
    })
  ]);

  const rawResults = providerRuns.flatMap((entry) => entry.results);
  const normalized = normalizeResults(rawResults);

  return NextResponse.json({
    request: validRequest,
    search_plan: searchPlan,
    results: normalized.results,
    diagnostics: {
      generated_at: new Date().toISOString(),
      total_raw_results: normalized.stats.raw_count,
      total_normalized_results: normalized.stats.normalized_count,
      total_deduped_results: normalized.stats.deduped_count,
      duplicate_count: normalized.stats.duplicate_count,
      provider_health: providerRuns.map((entry) => entry.health),
      provider_toggles: toggles
    }
  });
}
