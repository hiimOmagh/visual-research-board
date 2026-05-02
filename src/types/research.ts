export type ResearchMode =
  | "person_reference"
  | "historical_topic"
  | "youtube_documentary"
  | "thumbnail_inspiration"
  | "public_domain"
  | "news_event"
  | "design_moodboard"
  | "academic_source_pack";

export type SearchDepth = "quick" | "standard" | "deep";

export type ResultType = "image" | "web" | "news" | "archive";

export type RiskLevel = "low" | "medium" | "high" | "reference_only" | "avoid";

export type LicenseDetected =
  | "public_domain"
  | "creative_commons"
  | "copyrighted"
  | "unknown"
  | "unclear";

export type ProviderName = "brave" | "tavily" | "wikimedia" | "mock";

export type ProviderStatus = "active" | "missing_key" | "skipped" | "error" | "timeout";

export interface ResearchRequest {
  topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
}

export interface ResultScores {
  relevance: number;
  visual_quality: number;
  source_credibility: number;
  license_clarity: number;
  uniqueness: number;
  production_usefulness: number;
  overall: number;
}

export interface ResearchResult {
  id: string;
  type: ResultType;
  title: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  source_url: string;
  source_domain: string;
  provider: ProviderName;
  width?: number;
  height?: number;
  license_detected: LicenseDetected;
  license_confidence: number;
  license_url?: string;
  risk_level: RiskLevel;
  tags: string[];
  scores: ResultScores;
  notes?: string;
  collected_at: string;
}

export interface SearchPlan {
  original_topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  queries: string[];
  source_targets: Array<"web" | "image" | "news" | "archive" | "commons">;
}

export interface ProviderHealth {
  provider: ProviderName;
  status: ProviderStatus;
  enabled: boolean;
  result_count: number;
  duration_ms: number;
  queries_used: number;
  message?: string;
}

export interface SearchDiagnostics {
  generated_at: string;
  total_raw_results: number;
  total_normalized_results: number;
  total_deduped_results: number;
  duplicate_count: number;
  provider_health: ProviderHealth[];
}

export interface ResearchResponse {
  request: ResearchRequest;
  search_plan: SearchPlan;
  results: ResearchResult[];
  diagnostics: SearchDiagnostics;
}

export const RESEARCH_MODES: Array<{ value: ResearchMode; label: string; description: string }> = [
  {
    value: "person_reference",
    label: "Person Reference",
    description: "Portraits, angles, outfits, public appearances, and source links."
  },
  {
    value: "historical_topic",
    label: "Historical Topic",
    description: "Maps, paintings, artifacts, timelines, and archive-oriented sources."
  },
  {
    value: "youtube_documentary",
    label: "YouTube Documentary",
    description: "Visual sources, thumbnail references, source links, and production notes."
  },
  {
    value: "thumbnail_inspiration",
    label: "Thumbnail Inspiration",
    description: "High-impact compositions, contrast patterns, and visual hooks."
  },
  {
    value: "public_domain",
    label: "Public Domain",
    description: "Safer candidates from Commons, museums, archives, and public institutions."
  },
  {
    value: "news_event",
    label: "News/Event",
    description: "Recent visuals, timelines, source comparison, and risk visibility."
  },
  {
    value: "design_moodboard",
    label: "Design Moodboard",
    description: "Style, lighting, color, composition, typography, and mood references."
  },
  {
    value: "academic_source_pack",
    label: "Academic Source Pack",
    description: "Official documents, expert commentary, books, papers, and source links."
  }
];

export const SEARCH_DEPTHS: Array<{ value: SearchDepth; label: string; description: string }> = [
  { value: "quick", label: "Quick", description: "Small, fast result set." },
  { value: "standard", label: "Standard", description: "Balanced breadth and speed." },
  { value: "deep", label: "Deep", description: "More query branches and sources." }
];

export const PROVIDERS: ProviderName[] = ["mock", "wikimedia", "brave", "tavily"];
export const RESULT_TYPES: ResultType[] = ["image", "web", "news", "archive"];
export const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "reference_only", "avoid"];
export const LICENSE_TYPES: LicenseDetected[] = ["public_domain", "creative_commons", "copyrighted", "unknown", "unclear"];
