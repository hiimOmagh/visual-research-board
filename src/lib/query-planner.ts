import type { ResearchRequest, SearchPlan } from "@/types/research";

const modeQueryExpansions: Record<ResearchRequest["mode"], string[]> = {
  person_reference: [
    "portrait reference",
    "public appearance images",
    "outfit reference",
    "profile photos",
    "high resolution image source"
  ],
  historical_topic: [
    "historical map",
    "painting archive",
    "timeline visual",
    "public domain image",
    "museum archive"
  ],
  youtube_documentary: [
    "documentary reference images",
    "explainer visuals",
    "thumbnail inspiration",
    "timeline sources",
    "public domain visuals"
  ],
  thumbnail_inspiration: [
    "thumbnail composition reference",
    "dramatic visual reference",
    "high contrast image",
    "editorial thumbnail style",
    "cinematic reference"
  ],
  public_domain: [
    "public domain",
    "Wikimedia Commons",
    "Library of Congress",
    "museum open access",
    "Creative Commons"
  ],
  news_event: [
    "latest images",
    "news photos",
    "timeline",
    "official source",
    "explainer"
  ],
  design_moodboard: [
    "moodboard",
    "visual style reference",
    "color palette",
    "lighting reference",
    "composition reference"
  ],
  academic_source_pack: [
    "official report",
    "academic paper",
    "expert analysis",
    "source document",
    "bibliography"
  ]
};

const depthCounts: Record<ResearchRequest["depth"], number> = {
  quick: 4,
  standard: 6,
  deep: 9
};

export function createSearchPlan(request: ResearchRequest): SearchPlan {
  const topic = request.topic.trim();
  const expansions = modeQueryExpansions[request.mode] ?? [];
  const baseQueries = [
    topic,
    ...expansions.map((term) => `${topic} ${term}`)
  ];

  const sourceTargets: SearchPlan["source_targets"] = (() => {
    if (request.mode === "public_domain") return ["commons", "archive", "image", "web"];
    if (request.mode === "news_event") return ["news", "image", "web"];
    if (request.mode === "academic_source_pack") return ["web", "archive"];
    if (request.mode === "historical_topic") return ["commons", "archive", "image", "web"];
    return ["image", "web", "commons"];
  })();

  return {
    original_topic: topic,
    mode: request.mode,
    depth: request.depth,
    queries: baseQueries.slice(0, depthCounts[request.depth]),
    source_targets: sourceTargets
  };
}
