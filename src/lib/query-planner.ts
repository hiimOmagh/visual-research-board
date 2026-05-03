import type { ResearchRequest, SearchPlan } from "@/types/research";

const modeQueryExpansions: Record<ResearchRequest["mode"], string[]> = {
  person_reference: [
    "official portrait source",
    "public appearance high resolution",
    "profile image source",
    "interview photo reference",
    "outfit reference public domain",
    "Wikimedia Commons portrait",
    "archive image"
  ],
  historical_topic: [
    "historical map archive",
    "museum collection image",
    "public domain illustration",
    "primary source document",
    "timeline visual source",
    "artifact image archive",
    "Library of Congress"
  ],
  youtube_documentary: [
    "documentary visual references",
    "explainer map source",
    "timeline source images",
    "archive footage still reference",
    "thumbnail composition reference",
    "public domain visuals",
    "official source background"
  ],
  thumbnail_inspiration: [
    "thumbnail composition reference",
    "dramatic editorial image",
    "high contrast visual reference",
    "cinematic poster composition",
    "before after thumbnail style",
    "face expression reference",
    "bold background contrast"
  ],
  public_domain: [
    "public domain image",
    "Wikimedia Commons public domain",
    "CC0 image archive",
    "Library of Congress public domain",
    "museum open access image",
    "government archive image",
    "Europeana public domain"
  ],
  news_event: [
    "latest official source",
    "news timeline source",
    "press release images",
    "agency photo reference",
    "explainer background source",
    "official statement",
    "live updates context"
  ],
  design_moodboard: [
    "visual style reference",
    "color palette moodboard",
    "lighting reference image",
    "composition reference",
    "typography style reference",
    "cinematic mood reference",
    "editorial layout inspiration"
  ],
  academic_source_pack: [
    "official report pdf",
    "academic paper source",
    "institutional publication",
    "expert analysis source",
    "dataset source",
    "bibliography references",
    "primary source document"
  ]
};

const depthCounts: Record<ResearchRequest["depth"], number> = {
  quick: 4,
  standard: 6,
  deep: 9
};

function uniqueQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  return queries.filter((query) => {
    const key = query.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createSearchPlan(request: ResearchRequest): SearchPlan {
  const topic = request.topic.trim();
  const expansions = modeQueryExpansions[request.mode] ?? [];
  const baseQueries = uniqueQueries([
    topic,
    ...expansions.map((term) => `${topic} ${term}`)
  ]);

  const sourceTargets: SearchPlan["source_targets"] = (() => {
    if (request.mode === "public_domain") return ["commons", "archive", "image", "web"];
    if (request.mode === "news_event") return ["news", "image", "web", "archive"];
    if (request.mode === "academic_source_pack") return ["web", "archive", "commons"];
    if (request.mode === "historical_topic") return ["commons", "archive", "image", "web"];
    if (request.mode === "thumbnail_inspiration" || request.mode === "design_moodboard") return ["image", "web", "commons"];
    return ["image", "web", "commons", "archive"];
  })();

  return {
    original_topic: topic,
    mode: request.mode,
    depth: request.depth,
    queries: baseQueries.slice(0, depthCounts[request.depth]),
    source_targets: sourceTargets
  };
}
