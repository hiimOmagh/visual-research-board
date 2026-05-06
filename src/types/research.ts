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

export type SearchSourceTarget = "web" | "image" | "news" | "archive" | "commons";

export type QueryIntent =
  | "exact"
  | "visual"
  | "public_domain"
  | "archive"
  | "museum"
  | "science"
  | "news"
  | "academic"
  | "stock"
  | "reference"
  | "web";

export type SourceClass =
  | "open_media"
  | "archive"
  | "museum"
  | "science"
  | "stock"
  | "manual_reference"
  | "news_reference"
  | "web_context"
  | "academic_context";


export type BoardSectionKind =
  | "inbox"
  | "background"
  | "primary_evidence"
  | "counter_evidence"
  | "visual_reference"
  | "public_domain_candidate"
  | "check_required"
  | "rejected"
  | "custom";

export interface BoardOrganizationAudit {
  schema_version: "0.3.2";
  generated_at: string;
  total_saved_count: number;
  section_count: number;
  populated_section_count: number;
  unassigned_count: number;
  notes_count: number;
  tagged_count: number;
  manual_reviewed_count: number;
  rejected_count: number;
  check_required_count: number;
  reference_only_count: number;
  section_counts: Record<string, number>;
  tag_counts: Record<string, number>;
  warnings: string[];
}


export type ClaimEvidenceRelation =
  | "supports"
  | "weakens"
  | "contradicts"
  | "contextual"
  | "visual_reference_only";

export type ClaimConfidence = "low" | "medium" | "high";

export type ClaimStatus =
  | "under_supported"
  | "supported"
  | "contested"
  | "needs_verification";

export interface ClaimSourceLink {
  result_id: string;
  relation: ClaimEvidenceRelation;
  note?: string;
  linked_at: string;
}

export interface ResearchClaim {
  id: string;
  statement: string;
  description?: string;
  confidence: ClaimConfidence;
  status: ClaimStatus;
  tags: string[];
  source_links: ClaimSourceLink[];
  created_at: string;
  updated_at: string;
}

export interface ClaimMappingAudit {
  schema_version: "0.3.3";
  generated_at: string;
  claim_count: number;
  linked_claim_count: number;
  source_link_count: number;
  support_link_count: number;
  contradiction_link_count: number;
  context_link_count: number;
  visual_reference_link_count: number;
  supported_claim_count: number;
  contested_claim_count: number;
  under_supported_claim_count: number;
  needs_verification_claim_count: number;
  claim_without_support_count: number;
  unlinked_saved_count: number;
  warnings: string[];
}


export interface CoverageBiasAudit {
  schema_version: "0.3.4";
  generated_at: string;
  total_saved_count: number;
  provider_count: number;
  domain_count: number;
  source_group_count: number;
  section_count: number;
  claim_count: number;
  provider_counts: Partial<Record<ProviderName, number>>;
  domain_counts: Record<string, number>;
  source_group_counts: Partial<Record<SourceGroup, number>>;
  rights_status_counts: Partial<Record<RightsStatus, number>>;
  reuse_risk_counts: Partial<Record<ReuseRisk, number>>;
  section_counts: Record<string, number>;
  dominant_provider: string;
  dominant_provider_share: number;
  dominant_domain: string;
  dominant_domain_share: number;
  dominant_source_group: string;
  dominant_source_group_share: number;
  reference_only_count: number;
  check_required_count: number;
  high_reuse_risk_count: number;
  reusable_candidate_count: number;
  public_domain_or_open_count: number;
  metadata_gap_item_count: number;
  support_link_count: number;
  contradiction_link_count: number;
  contextual_link_count: number;
  visual_reference_link_count: number;
  unlinked_saved_count: number;
  claims_without_support_count: number;
  claims_without_counter_count: number;
  under_supported_claim_count: number;
  contested_claim_count: number;
  warnings: string[];
}


export type EvidencePackBucketId =
  | "reusable"
  | "check_required"
  | "reference_only"
  | "restricted_or_rejected";

export interface EvidencePackLinkedClaim {
  claim_id: string;
  statement: string;
  relation: ClaimEvidenceRelation;
  relation_label: string;
  note?: string;
}

export interface EvidencePackItem {
  id: string;
  bucket: EvidencePackBucketId;
  bucket_label: string;
  title: string;
  source_url: string;
  source_domain: string;
  image_url?: string;
  thumbnail_url?: string;
  provider: ProviderName;
  source_group: SourceGroup;
  source_group_label: string;
  section_id?: string;
  section_name: string;
  section_kind: string;
  license_detected: LicenseDetected;
  license_label: string;
  license_url?: string;
  rights_status: RightsStatus;
  source_access_mode: SourceAccessMode;
  reuse_risk: ReuseRisk;
  risk_level: RiskLevel;
  risk_label: string;
  score: number;
  production_usefulness: number;
  tags: string[];
  notes?: string;
  manual_review: ManualQualityReview;
  linked_claims: EvidencePackLinkedClaim[];
  attribution_line: string;
  warnings: string[];
}

export interface EvidencePackAudit {
  schema_version: "0.4.1";
  generated_at: string;
  total_items: number;
  reusable_count: number;
  check_required_count: number;
  reference_only_count: number;
  restricted_or_rejected_count: number;
  claim_linked_count: number;
  attribution_ready_count: number;
  bucket_counts: Record<EvidencePackBucketId, number>;
  warnings: string[];
}


export type AttributionFormat =
  | "simple"
  | "creator_title_source_license"
  | "markdown_citation"
  | "video_description"
  | "article_source_list"
  | "rough_bibliography";

export type AttributionClearance =
  | "attribution_ready_candidate"
  | "verify_before_use"
  | "reference_only"
  | "do_not_use";

export interface AttributionEntry {
  schema_version: "0.4.1";
  generated_at: string;
  result_id: string;
  title: string;
  format: AttributionFormat;
  format_label: string;
  text: string;
  markdown: string;
  creator: string;
  source_domain: string;
  source_url: string;
  image_url?: string;
  license_label: string;
  license_url?: string;
  rights_status: RightsStatus;
  reuse_risk: ReuseRisk;
  risk_level: RiskLevel;
  source_access_mode: SourceAccessMode;
  clearance: AttributionClearance;
  clearance_label: string;
  warnings: string[];
}

export interface AttributionAudit {
  schema_version: "0.4.1";
  generated_at: string;
  total_items: number;
  attribution_ready_candidate_count: number;
  verify_before_use_count: number;
  reference_only_count: number;
  do_not_use_count: number;
  unknown_license_count: number;
  missing_license_url_count: number;
  warning_count: number;
  warnings: string[];
}

export type SourceAccessMode =
  | "backend_free_no_key"
  | "backend_free_key_required"
  | "manual_reference_only"
  | "stock_illustrative"
  | "archive_open_access"
  | "rights_check_required";

export type RightsStatus =
  | "public_domain"
  | "open_license"
  | "likely_reusable"
  | "reference_only"
  | "check_required"
  | "restricted"
  | "unknown";

export type ReuseRisk = "low" | "medium" | "high";

export type DuplicateMatchReason =
  | "source_url"
  | "image_url"
  | "thumbnail_url"
  | "title_domain"
  | "image_asset"
  | "visual_shape";

export type MetadataGap =
  | "missing_visual_asset"
  | "missing_description"
  | "missing_dimensions"
  | "missing_license_url"
  | "unclear_license"
  | "unclear_rights_status"
  | "unknown_source_domain";

export interface DuplicateProviderSource {
  id: string;
  provider: ProviderName;
  source_url: string;
  image_url?: string;
  thumbnail_url?: string;
  rights_status: RightsStatus;
  reuse_risk: ReuseRisk;
  score: number;
}

export interface DuplicateGroupTrace {
  group_key: string;
  survivor_id: string;
  duplicate_count: number;
  match_reasons: DuplicateMatchReason[];
  member_ids: string[];
  provider_sources: DuplicateProviderSource[];
}

export interface NormalizationDedupeTrace {
  schema_version: "0.2.10";
  raw_count: number;
  normalized_count: number;
  deduped_count: number;
  duplicate_count: number;
  duplicate_group_count: number;
  merged_duplicate_count: number;
  unique_canonical_source_count: number;
  unique_canonical_image_count: number;
  metadata_gap_count: number;
  metadata_gap_counts: Partial<Record<MetadataGap, number>>;
  duplicate_groups: DuplicateGroupTrace[];
  warnings: string[];
}

export type ReferenceSearchEngine =
  | "google_images"
  | "bing_images"
  | "duckduckgo_images"
  | "yandex_images"
  | "startpage_images"
  | "qwant_images"
  | "mojeek_images"
  | "pinterest"
  | "youtube";

export type RiskLevel = "low" | "medium" | "high" | "reference_only" | "avoid";

export type LicenseDetected =
  | "public_domain"
  | "creative_commons"
  | "copyrighted"
  | "unknown"
  | "unclear";

export type ProviderName =
  | "mock"
  | "manual"
  | "wikimedia"
  | "openverse"
  | "loc"
  | "internet_archive"
  | "smithsonian"
  | "nasa"
  | "europeana"
  | "met"
  | "artic"
  | "cleveland_museum"
  | "rijksmuseum"
  | "wellcome"
  | "bhl"
  | "gallica"
  | "nypl"
  | "nara"
  | "dpla"
  | "pixabay"
  | "pexels"
  | "unsplash"
  | "brave"
  | "tavily";

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

export type RetrievalEvidenceVerdict =
  | "passes_mvp_gate"
  | "needs_more_results"
  | "needs_more_source_diversity"
  | "needs_better_ranking"
  | "needs_review";

export type RetrievalQualityVerdict =
  | "passes_creator_gate"
  | "needs_more_relevance"
  | "needs_more_visuals"
  | "needs_stronger_sources"
  | "needs_license_clarity"
  | "needs_real_provider_evidence"
  | "needs_manual_review";

export type RetrievalAutoTuningAction =
  | "expand_queries"
  | "increase_visual_branches"
  | "increase_commons_archive_bias"
  | "increase_source_diversity"
  | "increase_license_clarity_bias"
  | "increase_relevance_precision"
  | "increase_real_provider_bias"
  | "apply_diversity_rerank";

export type EvidenceDrivenTuningAction =
  | "boost_topic_exactness"
  | "boost_image_density"
  | "boost_open_license_sources"
  | "boost_institutional_sources"
  | "penalize_stock_and_social"
  | "penalize_mock_when_real_available"
  | "rebalance_top_results_by_source"
  | "add_precision_query_hints";

export type EvidenceDrivenTuningVerdict =
  | "evidence_tuned"
  | "evidence_observed_no_change"
  | "needs_live_matrix_artifact";


export type ManualReviewLabel = "unreviewed" | "pass" | "watch" | "fail";

export type ManualReviewVerdict =
  | "approved_reference"
  | "use_with_caution"
  | "needs_source_check"
  | "reject"
  | "unreviewed";

export interface ManualQualityReview {
  relevance: ManualReviewLabel;
  visual_usefulness: ManualReviewLabel;
  source_trust: ManualReviewLabel;
  license_status: ManualReviewLabel;
  verdict: ManualReviewVerdict;
  reviewer_note?: string;
  reviewed_at?: string;
}


export interface ReviewEvidenceBiasEntry {
  key: string;
  label: string;
  count: number;
  positive_count: number;
  negative_count: number;
  weight: number;
}

export interface ReviewEvidenceSourceSignal {
  source_url: string;
  source_domain: string;
  verdict: ManualReviewVerdict;
  weight: number;
}

export interface ReviewEvidenceFeedback {
  schema_version: "0.2.10";
  generated_at: string;
  reviewed_result_count: number;
  approved_count: number;
  caution_count: number;
  source_check_count: number;
  rejected_count: number;
  pass_label_count: number;
  watch_label_count: number;
  fail_label_count: number;
  confidence: number;
  domain_bias: ReviewEvidenceBiasEntry[];
  source_group_bias: ReviewEvidenceBiasEntry[];
  provider_bias: ReviewEvidenceBiasEntry[];
  reviewed_sources: ReviewEvidenceSourceSignal[];
  warnings: string[];
}

export interface ReviewEvidenceCalibrationTrace {
  enabled: boolean;
  applied: boolean;
  reason: string;
  feedback_confidence: number;
  reviewed_result_count: number;
  approved_count: number;
  rejected_count: number;
  exact_source_matches: number;
  positive_bias_hits: number;
  negative_bias_hits: number;
  adjusted_result_count: number;
  top10_rejected_signal_count: number;
  top10_approved_signal_count: number;
  domain_bias: ReviewEvidenceBiasEntry[];
  source_group_bias: ReviewEvidenceBiasEntry[];
  provider_bias: ReviewEvidenceBiasEntry[];
  before: {
    calibration_score?: number;
    strong_candidates?: number;
    top10_average_overall?: number;
    top10_source_diversity?: number;
  };
  after: {
    calibration_score?: number;
    strong_candidates?: number;
    top10_average_overall?: number;
    top10_source_diversity?: number;
  };
  warnings: string[];
}

export type ProjectReviewEvidenceMemoryStatus = "empty" | "current" | "stale" | "reset" | "conflicting";

export interface ProjectReviewEvidenceMemory {
  schema_version: "0.3.1";
  project_id: string;
  isolation_key: string;
  generated_at: string;
  reset_at?: string;
  source_fingerprint: string;
  reviewed_result_count: number;
  included_result_ids: string[];
  ignored_pre_reset_review_count: number;
  feedback: ReviewEvidenceFeedback;
  confidence: number;
  status: ProjectReviewEvidenceMemoryStatus;
  warnings: string[];
}

export interface ProjectReviewEvidenceMemoryAudit {
  schema_version: "0.3.1";
  generated_at: string;
  enabled: boolean;
  used_for_search: boolean;
  project_id?: string;
  isolation_key?: string;
  status: ProjectReviewEvidenceMemoryStatus;
  stale: boolean;
  reset_at?: string;
  memory_confidence: number;
  included_review_count: number;
  ignored_pre_reset_review_count: number;
  feedback_confidence: number;
  domain_bias_count: number;
  source_group_bias_count: number;
  provider_bias_count: number;
  reviewed_source_count: number;
  warnings: string[];
}

export interface ProviderResultInspectionEntry {
  provider: SearchProviderName;
  status: ProviderStatus;
  enabled: boolean;
  result_count: number;
  image_count: number;
  web_context_count: number;
  clear_license_count: number;
  low_risk_count: number;
  high_risk_count: number;
  average_overall: number;
  average_relevance: number;
  average_visual_quality: number;
  average_source_credibility: number;
  top_result_ids: string[];
  review_candidate_ids: string[];
  warnings: string[];
}

export interface ProviderResultInspection {
  generated_at: string;
  provider_count: number;
  active_provider_count: number;
  inspected_result_count: number;
  manual_review_candidate_count: number;
  providers: ProviderResultInspectionEntry[];
  global_review_candidate_ids: string[];
  warnings: string[];
}

export type ProviderStatus = "active" | "no_results" | "missing_key" | "skipped" | "error" | "timeout";

export type ProviderRuntimeHost = "nextjs_runtime" | "static_client_demo";

export type ProviderKeyExposure = "server_only" | "public_env_leak_detected";

export type ProviderKeyClass = "free_key_backend" | "stock_illustrative" | "optional_legacy_api";

export interface ProviderKeySecurityEntry {
  provider: SearchProviderName;
  required_env: string;
  configured: boolean;
  server_only: boolean;
  client_exposed: boolean;
  exposure: ProviderKeyExposure;
  redacted_value: "configured:redacted" | "missing";
  provider_class: ProviderKeyClass;
  message: string;
}

export interface ProviderKeySecurityReport {
  schema_version: "1.8.0";
  app_version: string;
  generated_at: string;
  secret_source: "server_env_only";
  configured_key_count: number;
  missing_key_count: number;
  public_env_leak_count: number;
  entries: ProviderKeySecurityEntry[];
  warnings: string[];
}

export type ProviderRuntimeReadiness =
  | "configured"
  | "missing_key"
  | "available_no_key_needed"
  | "free_reference_launcher"
  | "forced_mock_disabled"
  | "static_demo_disabled"
  | "optional_paid_disabled";

export type ProviderToggleMap = Record<SearchProviderName, boolean>;

export type ExportTemplateId =
  | "source_audit"
  | "production_brief"
  | "visual_moodboard"
  | "attribution_pack"
  | "quality_review"
  | "claim_evidence"
  | "coverage_audit"
  | "evidence_pack";

export interface ResearchRequest {
  topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  provider_toggles?: ProviderToggleMap;
  review_evidence_feedback?: ReviewEvidenceFeedback;
  project_review_evidence_memory?: ProjectReviewEvidenceMemory;
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



export type RankingSignalStrength = "strong" | "moderate" | "weak" | "conflicting";

export type RankingFactorPolarity = "positive" | "neutral" | "negative";

export interface RankingExplanationFactor {
  key: string;
  label: string;
  value: number;
  weight: number;
  contribution: number;
  polarity: RankingFactorPolarity;
  description: string;
}

export interface RankingExplanation {
  schema_version: "0.3.0";
  result_id: string;
  final_rank: number;
  baseline_overall: number;
  final_overall: number;
  score_delta_from_baseline: number;
  calibration_confidence: RankingSignalStrength;
  dominant_factors: string[];
  factors: RankingExplanationFactor[];
  warnings: string[];
}

export interface RankingExplainabilityAudit {
  schema_version: "0.3.0";
  generated_at: string;
  explained_result_count: number;
  top_explained_count: number;
  strong_explanation_count: number;
  moderate_explanation_count: number;
  weak_explanation_count: number;
  conflicting_explanation_count: number;
  review_adjusted_result_count: number;
  positive_review_delta_count: number;
  negative_review_delta_count: number;
  average_absolute_review_delta: number;
  sparse_review_evidence: boolean;
  conflicting_review_evidence: boolean;
  top_result_ids: string[];
  warnings: string[];
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
  source_access_mode: SourceAccessMode;
  rights_status: RightsStatus;
  reuse_risk: ReuseRisk;
  risk_level: RiskLevel;
  tags: string[];
  scores: ResultScores;
  source_group?: SourceGroup;
  canonical_source_url?: string;
  canonical_image_url?: string;
  canonical_thumbnail_url?: string;
  normalized_title_key?: string;
  duplicate_keys?: string[];
  duplicate_group_key?: string;
  duplicate_group_size?: number;
  duplicate_group_members?: string[];
  duplicate_match_reasons?: DuplicateMatchReason[];
  provider_sources?: DuplicateProviderSource[];
  metadata_gaps?: MetadataGap[];
  quality_reasons?: string[];
  notes?: string;
  section_id?: string;
  collected_at: string;
  updated_at?: string;
  manual_review?: ManualQualityReview;
  ranking_explanation?: RankingExplanation;
}

export interface QueryVariant {
  id: string;
  query: string;
  intent: QueryIntent;
  source_classes: SourceClass[];
  provider_targets: SearchProviderName[];
  language_hint?: "en" | "ar" | "fr" | "de" | "mixed";
  priority: number;
  reason: string;
}

export interface ProviderRoutingPlanEntry {
  provider: SearchProviderName;
  source_classes: SourceClass[];
  query_ids: string[];
  queries: string[];
  max_queries: number;
  routing_reason: string;
}

export interface SourceClassRoutingTrace {
  schema_version: "0.3.0";
  original_topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  query_variant_count: number;
  routed_provider_count: number;
  source_class_counts: Partial<Record<SourceClass, number>>;
  intent_counts: Partial<Record<QueryIntent, number>>;
  provider_query_counts: Partial<Record<SearchProviderName, number>>;
  provider_source_classes: Partial<Record<SearchProviderName, SourceClass[]>>;
  reference_launcher_count: number;
  warnings: string[];
}

export interface SearchPlan {
  original_topic: string;
  mode: ResearchMode;
  depth: SearchDepth;
  queries: string[];
  source_targets: SearchSourceTarget[];
  query_variants?: QueryVariant[];
  provider_routing?: Partial<Record<SearchProviderName, ProviderRoutingPlanEntry>>;
  source_class_routing?: SourceClassRoutingTrace;
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
  routed_query_count?: number;
  source_classes?: SourceClass[];
  routing_reason?: string;
  endpoint_sample?: string[];
  missing_env?: string;
  message?: string;
}

export interface ProviderRuntimeEntry {
  provider: SearchProviderName;
  readiness: ProviderRuntimeReadiness;
  requires_key: boolean;
  required_env?: string;
  endpoint_sample: string[];
  access_mode?: SourceAccessMode;
  message: string;
}

export interface ProviderRuntimeReport {
  app_version: string;
  generated_at: string;
  runtime_host: ProviderRuntimeHost;
  mock_only: boolean;
  live_provider_ready_count: number;
  providers: ProviderRuntimeEntry[];
  recommended_next_steps: string[];
  key_security?: ProviderKeySecurityReport;
}

export interface RetrievalEvidence {
  target_candidate_count: number;
  total_candidates: number;
  image_candidates: number;
  web_context_candidates: number;
  saveable_candidates: number;
  active_provider_count: number;
  source_group_diversity: number;
  source_group_counts: Partial<Record<SourceGroup, number>>;
  query_count: number;
  depth_branch_count: number;
  broad_retrieval_score: number;
  verdict: RetrievalEvidenceVerdict;
  warnings: string[];
}

export interface RetrievalQualityCalibrationExpectations {
  relevant_target: number;
  strong_candidate_target: number;
  image_share_target: number;
  source_diversity_target: number;
  real_provider_share_target: number;
}

export interface RetrievalQualityCalibration {
  target_relevant_candidates: number;
  relevant_candidates: number;
  high_visual_candidates: number;
  strong_source_candidates: number;
  clear_license_candidates: number;
  low_risk_candidates: number;
  strong_candidates: number;
  top10_average_overall: number;
  top10_average_relevance: number;
  top10_average_visual_quality: number;
  top10_source_diversity: number;
  real_provider_result_count: number;
  mock_result_count: number;
  real_provider_share: number;
  image_share: number;
  calibration_score: number;
  verdict: RetrievalQualityVerdict;
  warnings: string[];
  top_candidate_ids: string[];
  expectations: RetrievalQualityCalibrationExpectations;
}

export interface EvidenceDrivenTuningTrace {
  enabled: boolean;
  applied: boolean;
  verdict: EvidenceDrivenTuningVerdict;
  reason: string;
  actions: EvidenceDrivenTuningAction[];
  mode_profile: ResearchMode;
  depth_profile: SearchDepth;
  query_hints: string[];
  score_weight_profile: {
    relevance: number;
    visual_quality: number;
    source_credibility: number;
    license_clarity: number;
    production_usefulness: number;
    diversity: number;
  };
  weak_metrics: string[];
  provider_bias: Partial<Record<SearchProviderName, number>>;
  before: {
    candidate_count: number;
    calibration_score?: number;
    source_diversity: number;
    image_share?: number;
    real_provider_share?: number;
  };
  after: {
    candidate_count: number;
    calibration_score?: number;
    source_diversity: number;
    image_share?: number;
    real_provider_share?: number;
  };
  warnings: string[];
}

export interface RetrievalAutoTuningTrace {
  enabled: boolean;
  applied: boolean;
  reason: string;
  initial_evidence_verdict?: RetrievalEvidenceVerdict;
  initial_quality_verdict?: RetrievalQualityVerdict;
  final_evidence_verdict?: RetrievalEvidenceVerdict;
  final_quality_verdict?: RetrievalQualityVerdict;
  actions: RetrievalAutoTuningAction[];
  added_queries: string[];
  provider_weights: Record<SearchProviderName, number>;
  rerank_profile: string;
  initial_candidate_count: number;
  final_candidate_count: number;
  candidate_delta: number;
  initial_calibration_score?: number;
  final_calibration_score?: number;
  calibration_delta?: number;
  source_targets: SearchPlan["source_targets"];
  warnings: string[];
}

export interface SearchDiagnostics {
  generated_at: string;
  total_raw_results: number;
  total_normalized_results: number;
  total_deduped_results: number;
  duplicate_count: number;
  normalization_dedupe?: NormalizationDedupeTrace;
  source_class_routing?: SourceClassRoutingTrace;
  provider_health: ProviderHealth[];
  provider_toggles: ProviderToggleMap;
  reference_searches?: ReferenceSearchLink[];
  mock_only: boolean;
  retrieval_evidence: RetrievalEvidence;
  quality_calibration?: RetrievalQualityCalibration;
  auto_tuning?: RetrievalAutoTuningTrace;
  evidence_tuning?: EvidenceDrivenTuningTrace;
  review_evidence_calibration?: ReviewEvidenceCalibrationTrace;
  project_review_memory?: ProjectReviewEvidenceMemoryAudit;
  ranking_explainability?: RankingExplainabilityAudit;
  claim_mapping?: ClaimMappingAudit;
  coverage_bias?: CoverageBiasAudit;
  evidence_pack?: EvidencePackAudit;
  attribution_generator?: AttributionAudit;
  provider_result_inspection?: ProviderResultInspection;
  runtime_report?: ProviderRuntimeReport;
  key_security?: ProviderKeySecurityReport;
}

export interface ReferenceSearchLink {
  engine: ReferenceSearchEngine;
  label: string;
  query: string;
  search_url: string;
  purpose: "reference_discovery";
  fetched_by_tool: false;
  rights_status: "reference_only";
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
  kind?: BoardSectionKind;
  created_at: string;
  updated_at?: string;
  locked?: boolean;
  export_priority?: number;
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
  normalization_dedupe?: NormalizationDedupeTrace;
  source_class_routing?: SourceClassRoutingTrace;
  provider_health: ProviderHealth[];
  provider_toggles: ProviderToggleMap;
  reference_searches?: ReferenceSearchLink[];
}

export interface ResearchProject {
  schema_version: "0.1.0";
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  board_sections: BoardSection[];
  saved_results: ResearchResult[];
  claims: ResearchClaim[];
  review_evidence_memory?: ProjectReviewEvidenceMemory;
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
  openverse: true,
  loc: true,
  internet_archive: true,
  nasa: true,
  smithsonian: false,
  europeana: false,
  met: true,
  artic: true,
  cleveland_museum: true,
  rijksmuseum: false,
  wellcome: true,
  bhl: true,
  gallica: true,
  nypl: false,
  nara: true,
  dpla: false,
  pixabay: false,
  pexels: false,
  unsplash: false,
  brave: false,
  tavily: false
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
    label: "Attribution Generator",
    description: "License-aware attribution drafts for simple, creator/title/source/license, Markdown, video description, article source list, and rough bibliography formats."
  },
  {
    value: "quality_review",
    label: "Quality Review",
    description: "Manual review loop evidence with relevance, visual usefulness, source trust, license status, and reviewer verdicts."
  },
  {
    value: "claim_evidence",
    label: "Claim Evidence",
    description: "Claim cards with linked support, contradiction, context, and visual-reference sources."
  },
  {
    value: "coverage_audit",
    label: "Coverage Audit",
    description: "Coverage and bias review with provider/domain concentration, rights risk, and claim-evidence gaps."
  },
  {
    value: "evidence_pack",
    label: "Evidence Pack v1",
    description: "Complete production-ready export view grouped into reusable, check-required, reference-only, and restricted/rejected buckets."
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

export const SEARCH_PROVIDERS: SearchProviderName[] = ["mock", "wikimedia", "openverse", "loc", "internet_archive", "nasa", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla", "pixabay", "pexels", "unsplash", "brave", "tavily"];
export const PROVIDERS: ProviderName[] = ["mock", "manual", "wikimedia", "openverse", "loc", "internet_archive", "nasa", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla", "pixabay", "pexels", "unsplash", "brave", "tavily"];
export const RESULT_TYPES: ResultType[] = ["image", "web", "news", "archive"];
export const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "reference_only", "avoid"];
export const LICENSE_TYPES: LicenseDetected[] = ["public_domain", "creative_commons", "copyrighted", "unknown", "unclear"];
