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

export type ProviderName = "brave" | "tavily" | "wikimedia" | "mock" | "manual";

export type SourceGroup =
  | "commons_open_access"
  | "institutional_archive"
  | "official_academic"
  | "news_media"
  | "commercial_stock"
  | "search_or_social"
  | "general_web"
  | "unknown";

export type ResultSortMode = "overall" | "relevance" | "visual_quality" | "source_credibility" | "license_clarity" | "production_usefulness" | "newest";
export type SearchProviderName = Exclude<ProviderName, "manual">;

export type ProviderStatus = "active" | "no_results" | "missing_key" | "skipped" | "error" | "timeout";

export type ProviderToggleMap = Record<SearchProviderName, boolean>;

export type ExportTemplateId =
  | "source_audit"
  | "production_brief"
  | "visual_moodboard"
  | "attribution_pack";

export interface ResearchRequest {
  topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  provider_toggles?: ProviderToggleMap;
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
  source_group?: SourceGroup;
  quality_reasons?: string[];
  duplicate_group_key?: string;
  notes?: string;
  section_id?: string;
  collected_at: string;
  updated_at?: string;
}

export interface SearchPlan {
  original_topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  queries: string[];
  source_targets: Array<"web" | "image" | "news" | "archive" | "commons">;
}

export interface ProviderHealth {
  provider: SearchProviderName;
  status: ProviderStatus;
  enabled: boolean;
  result_count: number;
  result_type_counts: Partial<Record<ResultType, number>>;
  duration_ms: number;
  queries_used: number;
  query_sample: string[];
  endpoint_sample?: string[];
  missing_env?: string;
  message?: string;
}

export interface SearchDiagnostics {
  generated_at: string;
  total_raw_results: number;
  total_normalized_results: number;
  total_deduped_results: number;
  duplicate_count: number;
  provider_health: ProviderHealth[];
  provider_toggles: ProviderToggleMap;
  mock_only: boolean;
}

export interface ResearchResponse {
  request: ResearchRequest;
  search_plan: SearchPlan;
  results: ResearchResult[];
  diagnostics: SearchDiagnostics;
}

export interface BoardSection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SearchResultSnapshot {
  id: string;
  request: ResearchRequest;
  search_plan: SearchPlan;
  diagnostics: SearchDiagnostics;
  results: ResearchResult[];
  created_at: string;
  label: string;
}

export interface SearchHistoryEntry {
  id: string;
  snapshot_id: string;
  topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  generated_at: string;
  query_count: number;
  result_count: number;
  duplicate_count: number;
  provider_health: ProviderHealth[];
  provider_toggles: ProviderToggleMap;
}

export interface ResearchProject {
  schema_version: "0.1.0";
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  board_sections: BoardSection[];
  saved_results: ResearchResult[];
  search_history: SearchHistoryEntry[];
  result_snapshots: SearchResultSnapshot[];
}

export interface ProjectLibrary {
  schema_version: "0.1.0";
  active_project_id: string;
  projects: ResearchProject[];
  updated_at: string;
}

export interface LibraryImportSummary {
  status: "ok" | "merged" | "rejected";
  imported_count: number;
  renamed_count: number;
  remapped_count: number;
  rejected_count: number;
  total_projects_after_import: number;
  active_project_changed: boolean;
  rejected_reasons: string[];
  message: string;
}

export interface UrlMetadataRequest {
  url: string;
}

export interface UrlMetadataResponse {
  url: string;
  source_domain: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  fetched_at: string;
  status: "ok" | "partial" | "error";
  message?: string;
}

export const DEFAULT_PROVIDER_TOGGLES: ProviderToggleMap = {
  mock: true,
  wikimedia: true,
  brave: true,
  tavily: true
};

export const EXPORT_TEMPLATES: Array<{ value: ExportTemplateId; label: string; description: string }> = [
  {
    value: "source_audit",
    label: "Source Audit",
    description: "Structured verification view with source, license, risk, and notes."
  },
  {
    value: "production_brief",
    label: "Production Brief",
    description: "Creator-facing pack grouped for scripts, thumbnails, and editorial planning."
  },
  {
    value: "visual_moodboard",
    label: "Visual Moodboard",
    description: "Compact visual reference board with thumbnails, tags, and production notes."
  },
  {
    value: "attribution_pack",
    label: "Attribution Pack",
    description: "Draft attribution lines that still require manual verification."
  }
];

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
  { value: "quick", label: "Quick", description: "Fast broad sample: fewer branches, still image-first." },
  { value: "standard", label: "Standard", description: "Balanced broad retrieval across several query branches." },
  { value: "deep", label: "Deep", description: "Maximum local breadth: more query branches, larger provider result windows, stronger dedupe." }
];

export const SEARCH_PROVIDERS: SearchProviderName[] = ["mock", "wikimedia", "brave", "tavily"];
export const PROVIDERS: ProviderName[] = ["mock", "manual", "wikimedia", "brave", "tavily"];
export const RESULT_TYPES: ResultType[] = ["image", "web", "news", "archive"];
export const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "reference_only", "avoid"];
export const LICENSE_TYPES: LicenseDetected[] = ["public_domain", "creative_commons", "copyrighted", "unknown", "unclear"];
