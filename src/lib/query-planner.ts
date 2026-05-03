import type { ResearchRequest, SearchPlan } from "@/types/research";

const modeQueryExpansions: Record<ResearchRequest["mode"], string[]> = {
  person_reference: [
    "official portrait source",
    "public appearance high resolution",
    "profile image source",
    "interview photo reference",
    "outfit reference public domain",
    "Wikimedia Commons portrait",
    "archive image",
    "press conference photo",
    "headshot profile",
    "editorial portrait reference",
    "historic public appearance",
    "official website photo"
  ],
  historical_topic: [
    "historical map archive",
    "museum collection image",
    "public domain illustration",
    "primary source document",
    "timeline visual source",
    "artifact image archive",
    "Library of Congress",
    "Wikimedia Commons image",
    "old photograph archive",
    "painting engraving illustration",
    "map diagram source",
    "museum open access"
  ],
  youtube_documentary: [
    "documentary visual references",
    "explainer map source",
    "timeline source images",
    "archive footage still reference",
    "thumbnail composition reference",
    "public domain visuals",
    "official source background",
    "high resolution images",
    "news photo reference",
    "infographic visual source",
    "historical image archive",
    "editorial photo source"
  ],
  thumbnail_inspiration: [
    "thumbnail composition reference",
    "dramatic editorial image",
    "high contrast visual reference",
    "cinematic poster composition",
    "before after thumbnail style",
    "face expression reference",
    "bold background contrast",
    "YouTube thumbnail inspiration",
    "dramatic lighting reference",
    "poster layout reference",
    "hero image composition",
    "visual hook reference"
  ],
  public_domain: [
    "public domain image",
    "Wikimedia Commons public domain",
    "CC0 image archive",
    "Library of Congress public domain",
    "museum open access image",
    "government archive image",
    "Europeana public domain",
    "Internet Archive image",
    "Smithsonian open access",
    "Met Museum open access",
    "public domain photograph",
    "creative commons image"
  ],
  news_event: [
    "latest official source",
    "news timeline source",
    "press release images",
    "agency photo reference",
    "explainer background source",
    "official statement",
    "live updates context",
    "recent images",
    "event photos",
    "official photos",
    "news images",
    "background visuals"
  ],
  design_moodboard: [
    "visual style reference",
    "color palette moodboard",
    "lighting reference image",
    "composition reference",
    "typography style reference",
    "cinematic mood reference",
    "editorial layout inspiration",
    "art direction reference",
    "texture background reference",
    "set design reference",
    "visual identity reference",
    "photography style reference"
  ],
  academic_source_pack: [
    "official report pdf",
    "academic paper source",
    "institutional publication",
    "expert analysis source",
    "dataset source",
    "bibliography references",
    "primary source document",
    "university source",
    "government report",
    "research institute source",
    "chart data source",
    "visual evidence source"
  ]
};

const visualQueryExpansions: Record<ResearchRequest["mode"], string[]> = {
  person_reference: ["photos", "images", "portrait", "high resolution", "official image"],
  historical_topic: ["images", "maps", "illustrations", "photographs", "archive visuals"],
  youtube_documentary: ["images", "visual references", "thumbnail references", "maps", "archive images"],
  thumbnail_inspiration: ["images", "thumbnail", "composition", "high contrast", "poster"],
  public_domain: ["public domain images", "open access images", "CC0", "creative commons", "archive images"],
  news_event: ["images", "photos", "official photos", "news images", "press images"],
  design_moodboard: ["moodboard", "images", "style reference", "lighting reference", "composition"],
  academic_source_pack: ["figures", "charts", "source images", "official visuals", "documents"]
};

const depthCounts: Record<ResearchRequest["depth"], number> = {
  quick: 6,
  standard: 10,
  deep: 16
};

function uniqueQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  return queries
    .map((query) => query.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((query) => {
      const key = query.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function createSearchPlan(request: ResearchRequest): SearchPlan {
  const topic = request.topic.trim();
  const expansions = modeQueryExpansions[request.mode] ?? [];
  const visualExpansions = visualQueryExpansions[request.mode] ?? [];
  const sourceTargets: SearchPlan["source_targets"] = (() => {
    if (request.mode === "public_domain") return ["commons", "archive", "image", "web"];
    if (request.mode === "news_event") return ["news", "image", "web", "archive"];
    if (request.mode === "academic_source_pack") return ["web", "archive", "commons", "image"];
    if (request.mode === "historical_topic") return ["commons", "archive", "image", "web"];
    if (request.mode === "thumbnail_inspiration" || request.mode === "design_moodboard") return ["image", "web", "commons"];
    return ["image", "web", "commons", "archive"];
  })();

  const baseQueries = uniqueQueries([
    topic,
    ...visualExpansions.map((term) => `${topic} ${term}`),
    ...expansions.map((term) => `${topic} ${term}`),
    ...(sourceTargets.includes("commons") ? [`${topic} Wikimedia Commons`, `${topic} Creative Commons`] : []),
    ...(sourceTargets.includes("archive") ? [`${topic} archive images`, `${topic} museum archive`] : []),
    ...(sourceTargets.includes("web") ? [`${topic} source reference`, `${topic} visual source`] : [])
  ]);

  return {
    original_topic: topic,
    mode: request.mode,
    depth: request.depth,
    queries: baseQueries.slice(0, depthCounts[request.depth]),
    source_targets: sourceTargets
  };
}
