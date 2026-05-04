import type { ResearchMode, ResearchResult, SourceGroup } from "@/types/research";

const institutionalArchiveHints = [
  "loc.gov",
  "archives.gov",
  "archive.org",
  "europeana.eu",
  "openverse.org",
  "images.nasa.gov",
  "nasa.gov",
  "api.si.edu",
  "si.edu",
  "metmuseum.org",
  "getty.edu",
  "si.edu",
  "britishmuseum.org",
  "bnf.fr",
  "gallica.bnf.fr",
  "nationalarchives",
  "library"
];

const commonsHints = ["commons.wikimedia.org", "wikimedia", "wikipedia.org", "wikidata.org", "openverse.org"];
const officialAcademicHints = [".gov", ".edu", ".ac.", "who.int", "un.org", "worldbank.org", "oecd.org", "jstor.org", "springer.com", "nature.com", "sciencedirect.com"];
const newsHints = ["reuters", "apnews", "bbc.", "cnn.", "nytimes", "guardian", "aljazeera", "dw.com", "lemonde", "politico", "ft.com", "bloomberg"];
const commercialStockHints = ["shutterstock", "alamy", "gettyimages", "istockphoto", "adobestock", "depositphotos"];
const searchSocialHints = ["search.brave.com", "google.com", "bing.com", "youtube.com", "x.com", "twitter.com", "instagram.com", "tiktok.com", "pinterest.", "reddit.com"];

export const SOURCE_GROUP_ORDER: SourceGroup[] = [
  "commons_open_access",
  "institutional_archive",
  "official_academic",
  "news_media",
  "commercial_stock",
  "search_or_social",
  "general_web",
  "unknown"
];

export function classifySourceDomain(sourceDomain: string): SourceGroup {
  const domain = sourceDomain.toLowerCase().trim();
  if (!domain || domain === "unknown-source") return "unknown";
  if (commonsHints.some((hint) => domain.includes(hint))) return "commons_open_access";
  if (institutionalArchiveHints.some((hint) => domain.includes(hint))) return "institutional_archive";
  if (officialAcademicHints.some((hint) => domain.includes(hint))) return "official_academic";
  if (commercialStockHints.some((hint) => domain.includes(hint))) return "commercial_stock";
  if (newsHints.some((hint) => domain.includes(hint))) return "news_media";
  if (searchSocialHints.some((hint) => domain.includes(hint))) return "search_or_social";
  return "general_web";
}

export function sourceGroupLabel(group?: SourceGroup): string {
  switch (group) {
    case "commons_open_access":
      return "Commons / open-access candidate";
    case "institutional_archive":
      return "Institutional archive";
    case "official_academic":
      return "Official / academic source";
    case "news_media":
      return "News / media source";
    case "commercial_stock":
      return "Commercial stock source";
    case "search_or_social":
      return "Search / social discovery";
    case "general_web":
      return "General web source";
    case "unknown":
    default:
      return "Unknown source class";
  }
}

export function sourceGroupWeight(group: SourceGroup): number {
  switch (group) {
    case "commons_open_access":
      return 0.88;
    case "institutional_archive":
      return 0.9;
    case "official_academic":
      return 0.86;
    case "news_media":
      return 0.66;
    case "commercial_stock":
      return 0.48;
    case "search_or_social":
      return 0.4;
    case "general_web":
      return 0.56;
    case "unknown":
    default:
      return 0.25;
  }
}

const modeKeywords: Record<ResearchMode, string[]> = {
  person_reference: ["portrait", "profile", "appearance", "face", "outfit", "person", "public"],
  historical_topic: ["map", "archive", "historical", "painting", "artifact", "timeline", "museum"],
  youtube_documentary: ["documentary", "explainer", "timeline", "visual", "source", "archive", "thumbnail"],
  thumbnail_inspiration: ["thumbnail", "composition", "dramatic", "contrast", "cinematic", "poster", "visual"],
  public_domain: ["public", "domain", "commons", "cc0", "archive", "open", "museum"],
  news_event: ["news", "latest", "event", "timeline", "official", "report", "media"],
  design_moodboard: ["moodboard", "style", "color", "lighting", "composition", "design", "palette"],
  academic_source_pack: ["paper", "report", "academic", "official", "source", "bibliography", "study"]
};

function normalizeTokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !["the", "and", "for", "with", "from", "wiki", "file", "image"].includes(token));
}

export function topicRelevanceSignal(params: {
  topic?: string;
  mode?: ResearchMode;
  title: string;
  description?: string;
  tags: string[];
  sourceDomain: string;
}): number {
  const haystack = normalizeTokens(`${params.title} ${params.description ?? ""} ${params.tags.join(" ")} ${params.sourceDomain}`);
  const haystackSet = new Set(haystack);
  const topicTokens = normalizeTokens(params.topic ?? "");
  const directHits = topicTokens.length === 0
    ? 0.55
    : topicTokens.filter((token) => haystackSet.has(token)).length / topicTokens.length;
  const modeTokens = params.mode ? modeKeywords[params.mode] : [];
  const modeHits = modeTokens.filter((token) => haystackSet.has(token)).length;
  const modeBoost = Math.min(0.16, modeHits * 0.04);
  return Math.max(0.34, Math.min(0.96, 0.46 + directHits * 0.42 + modeBoost));
}

export function buildQualityReasons(result: ResearchResult): string[] {
  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  const reasons: string[] = [];

  if (result.scores.relevance >= 0.78) reasons.push("Strong topic/mode match from title, tags, or source context.");
  if (result.type === "image" && result.scores.visual_quality >= 0.78) reasons.push("High visual-utility signal from image dimensions/aspect ratio.");
  if (["commons_open_access", "institutional_archive", "official_academic"].includes(sourceGroup)) reasons.push(`Higher-trust source class: ${sourceGroupLabel(sourceGroup)}.`);
  if (result.license_detected === "public_domain" || result.license_detected === "creative_commons") reasons.push("License signal is clearer than unknown/copyrighted results, but still requires manual verification.");
  if (result.risk_level === "reference_only" || result.risk_level === "high" || result.risk_level === "avoid") reasons.push("Useful as reference material only unless rights and usage terms are verified.");
  if (result.scores.production_usefulness >= 0.72) reasons.push("Ranks well for production usefulness after risk, source, visual, and license weighting.");
  if (result.provider === "manual") reasons.push("Manually imported source; metadata should be checked against the original page.");

  if (reasons.length === 0) {
    reasons.push("Kept because it preserves a source URL and passed normalization; evaluate manually before using.");
  }

  return Array.from(new Set(reasons)).slice(0, 4);
}

export function qualityBucket(result: ResearchResult): "strong" | "usable" | "review" | "risky" {
  if (result.risk_level === "avoid" || result.scores.overall < 0.45) return "risky";
  if (result.scores.overall >= 0.78 && result.risk_level !== "high") return "strong";
  if (result.scores.overall >= 0.62) return "usable";
  return "review";
}
