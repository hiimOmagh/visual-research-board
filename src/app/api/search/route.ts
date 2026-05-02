import { NextResponse } from "next/server";
import { createSearchPlan } from "@/lib/query-planner";
import { normalizeResults } from "@/lib/result-normalizer";
import { searchMockProvider } from "@/lib/providers/mock";
import { searchBraveImages, searchBraveWeb } from "@/lib/providers/brave";
import { searchTavily } from "@/lib/providers/tavily";
import { searchWikimediaCommons } from "@/lib/providers/wikimedia";
import type { ResearchMode, ResearchRequest, SearchDepth } from "@/types/research";

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

  const providerResults = await Promise.allSettled([
    searchMockProvider(searchPlan),
    searchWikimediaCommons(searchPlan),
    searchBraveImages(searchPlan),
    searchBraveWeb(searchPlan),
    searchTavily(searchPlan)
  ]);

  const rawResults = providerResults.flatMap((entry) => entry.status === "fulfilled" ? entry.value : []);
  const results = normalizeResults(rawResults);

  return NextResponse.json({
    request: validRequest,
    search_plan: searchPlan,
    results
  });
}
