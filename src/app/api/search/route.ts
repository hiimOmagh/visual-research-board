import { NextResponse } from "next/server";
import { createSearchPlan } from "@/lib/query-planner";
import { normalizeResults } from "@/lib/result-normalizer";
import { searchMockProvider } from "@/lib/providers/mock";
import { searchBraveImages, searchBraveWeb } from "@/lib/providers/brave";
import { searchTavily } from "@/lib/providers/tavily";
import { searchWikimediaCommons } from "@/lib/providers/wikimedia";
import type { ProviderHealth, ProviderName, ResearchMode, ResearchRequest, SearchDepth, SearchPlan } from "@/types/research";
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
  return {
    topic: candidate.topic.trim(),
    mode: candidate.mode,
    depth: candidate.depth
  };
}

async function runProvider(params: {
  provider: ProviderName;
  enabled: boolean;
  missingKey?: boolean;
  plan: SearchPlan;
  run: () => Promise<RawProviderResult[]>;
}): Promise<{ results: RawProviderResult[]; health: ProviderHealth }> {
  const startedAt = Date.now();

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
        message: "Provider not targeted by this research mode."
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
        message: "Missing API key. Mock data still keeps the app usable."
      }
    };
  }

  try {
    const results = await params.run();
    return {
      results,
      health: {
        provider: params.provider,
        status: "active",
        enabled: true,
        result_count: results.length,
        duration_ms: Date.now() - startedAt,
        queries_used: params.plan.depth === "quick" ? 1 : params.plan.depth === "standard" ? 2 : 3
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
        queries_used: 0,
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

  const providerRuns = await Promise.all([
    runProvider({
      provider: "mock",
      enabled: true,
      plan: searchPlan,
      run: () => searchMockProvider(searchPlan)
    }),
    runProvider({
      provider: "wikimedia",
      enabled: searchPlan.source_targets.includes("commons"),
      plan: searchPlan,
      run: () => searchWikimediaCommons(searchPlan)
    }),
    runProvider({
      provider: "brave",
      enabled: searchPlan.source_targets.includes("image") || searchPlan.source_targets.includes("web"),
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
      enabled: searchPlan.source_targets.includes("web"),
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
      provider_health: providerRuns.map((entry) => entry.health)
    }
  });
}
