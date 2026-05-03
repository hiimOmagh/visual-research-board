import type {
  ProviderHealth,
  ResearchMode,
  ResearchResult,
  RetrievalQualityCalibration,
  RetrievalQualityCalibrationExpectations,
  SearchDepth,
  SourceGroup
} from "@/types/research";
import { classifySourceDomain } from "@/lib/result-quality";

const RELEVANT_TARGETS: Record<SearchDepth, number> = {
  quick: 6,
  standard: 15,
  deep: 20
};

const STRONG_TARGETS: Record<SearchDepth, number> = {
  quick: 3,
  standard: 8,
  deep: 12
};

const MODE_EXPECTATION_OVERRIDES: Partial<Record<ResearchMode, Partial<RetrievalQualityCalibrationExpectations>>> = {
  public_domain: {
    image_share_target: 0.62,
    source_diversity_target: 3,
    real_provider_share_target: 0.45
  },
  thumbnail_inspiration: {
    image_share_target: 0.72,
    source_diversity_target: 3,
    real_provider_share_target: 0.35
  },
  design_moodboard: {
    image_share_target: 0.7,
    source_diversity_target: 3,
    real_provider_share_target: 0.35
  },
  academic_source_pack: {
    image_share_target: 0.38,
    source_diversity_target: 4,
    real_provider_share_target: 0.45
  },
  news_event: {
    image_share_target: 0.5,
    source_diversity_target: 4,
    real_provider_share_target: 0.45
  }
};

function round2(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function isStrongSourceGroup(group: SourceGroup): boolean {
  return group === "commons_open_access" || group === "institutional_archive" || group === "official_academic" || group === "news_media";
}

function buildExpectations(mode: ResearchMode, depth: SearchDepth): RetrievalQualityCalibrationExpectations {
  const base: RetrievalQualityCalibrationExpectations = {
    relevant_target: RELEVANT_TARGETS[depth],
    strong_candidate_target: STRONG_TARGETS[depth],
    image_share_target: depth === "quick" ? 0.45 : depth === "standard" ? 0.55 : 0.6,
    source_diversity_target: depth === "deep" ? 4 : 3,
    real_provider_share_target: depth === "quick" ? 0.25 : depth === "standard" ? 0.35 : 0.45
  };

  return {
    ...base,
    ...(MODE_EXPECTATION_OVERRIDES[mode] ?? {})
  };
}

export function buildRetrievalQualityCalibration(params: {
  mode: ResearchMode;
  depth: SearchDepth;
  results: ResearchResult[];
  providerHealth: ProviderHealth[];
}): RetrievalQualityCalibration {
  const expectations = buildExpectations(params.mode, params.depth);
  const total = params.results.length;
  const sorted = [...params.results].sort((a, b) => b.scores.overall - a.scores.overall);
  const top10 = sorted.slice(0, 10);
  const topCandidateIds = sorted.slice(0, 12).map((result) => result.id);

  let relevantCandidates = 0;
  let highVisualCandidates = 0;
  let strongSourceCandidates = 0;
  let clearLicenseCandidates = 0;
  let lowRiskCandidates = 0;
  let strongCandidates = 0;
  let imageCandidates = 0;
  let realProviderResultCount = 0;
  let mockResultCount = 0;

  for (const result of params.results) {
    const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
    const realProvider = result.provider !== "mock" && result.provider !== "manual";
    if (result.type === "image") imageCandidates += 1;
    if (realProvider) realProviderResultCount += 1;
    if (result.provider === "mock") mockResultCount += 1;
    if (result.scores.relevance >= 0.68) relevantCandidates += 1;
    if (result.type === "image" && result.scores.visual_quality >= 0.7) highVisualCandidates += 1;
    if (isStrongSourceGroup(sourceGroup) && result.scores.source_credibility >= 0.62) strongSourceCandidates += 1;
    if ((result.license_detected === "public_domain" || result.license_detected === "creative_commons") && result.license_confidence >= 0.5) clearLicenseCandidates += 1;
    if (result.risk_level === "low" || result.risk_level === "medium" || result.risk_level === "reference_only") lowRiskCandidates += 1;
    if (result.scores.overall >= 0.72 && result.scores.relevance >= 0.66 && result.risk_level !== "avoid") strongCandidates += 1;
  }

  const top10Groups = new Set(top10.map((result) => result.source_group ?? classifySourceDomain(result.source_domain)));
  const realProviderShare = total > 0 ? realProviderResultCount / total : 0;
  const imageShare = total > 0 ? imageCandidates / total : 0;
  const relevantScore = Math.min(1, relevantCandidates / Math.max(1, expectations.relevant_target));
  const strongScore = Math.min(1, strongCandidates / Math.max(1, expectations.strong_candidate_target));
  const visualScore = Math.min(1, imageShare / Math.max(0.01, expectations.image_share_target));
  const sourceScore = Math.min(1, strongSourceCandidates / Math.max(1, expectations.strong_candidate_target));
  const licenseScore = Math.min(1, clearLicenseCandidates / Math.max(1, Math.ceil(expectations.strong_candidate_target * 0.6)));
  const realProviderScore = Math.min(1, realProviderShare / Math.max(0.01, expectations.real_provider_share_target));
  const top10Score = top10.length > 0 ? avg(top10.map((result) => result.scores.overall)) : 0;

  const calibrationScore = round2(
    relevantScore * 0.23 +
    strongScore * 0.22 +
    visualScore * 0.16 +
    sourceScore * 0.14 +
    licenseScore * 0.1 +
    realProviderScore * 0.1 +
    top10Score * 0.05
  );

  const warnings: string[] = [];
  if (relevantCandidates < expectations.relevant_target) warnings.push(`Relevant candidates below target: ${relevantCandidates}/${expectations.relevant_target}.`);
  if (strongCandidates < expectations.strong_candidate_target) warnings.push(`Strong candidate pool below creator target: ${strongCandidates}/${expectations.strong_candidate_target}.`);
  if (imageShare < expectations.image_share_target) warnings.push(`Image share below mode target: ${(imageShare * 100).toFixed(0)}%/${(expectations.image_share_target * 100).toFixed(0)}%.`);
  if (top10Groups.size < expectations.source_diversity_target) warnings.push(`Top-10 source diversity is thin: ${top10Groups.size}/${expectations.source_diversity_target} groups.`);
  if (clearLicenseCandidates < Math.ceil(expectations.strong_candidate_target * 0.6)) warnings.push(`License clarity is weak: ${clearLicenseCandidates} clear-license candidates.`);
  if (realProviderShare < expectations.real_provider_share_target) warnings.push(`Real-provider share is low: ${(realProviderShare * 100).toFixed(0)}%/${(expectations.real_provider_share_target * 100).toFixed(0)}%.`);

  const activeRealProviders = params.providerHealth.filter((item) => item.provider !== "mock" && item.status === "active").length;
  const verdict = (() => {
    if (calibrationScore >= 0.78 && warnings.length <= 1) return "passes_creator_gate";
    if (activeRealProviders === 0 && total > 0) return "needs_real_provider_evidence";
    if (relevantCandidates < expectations.relevant_target) return "needs_more_relevance";
    if (imageShare < expectations.image_share_target) return "needs_more_visuals";
    if (strongSourceCandidates < expectations.strong_candidate_target) return "needs_stronger_sources";
    if (clearLicenseCandidates < Math.ceil(expectations.strong_candidate_target * 0.6)) return "needs_license_clarity";
    return "needs_manual_review";
  })();

  return {
    target_relevant_candidates: expectations.relevant_target,
    relevant_candidates: relevantCandidates,
    high_visual_candidates: highVisualCandidates,
    strong_source_candidates: strongSourceCandidates,
    clear_license_candidates: clearLicenseCandidates,
    low_risk_candidates: lowRiskCandidates,
    strong_candidates: strongCandidates,
    top10_average_overall: top10.length > 0 ? avg(top10.map((result) => result.scores.overall)) : 0,
    top10_average_relevance: top10.length > 0 ? avg(top10.map((result) => result.scores.relevance)) : 0,
    top10_average_visual_quality: top10.length > 0 ? avg(top10.map((result) => result.scores.visual_quality)) : 0,
    top10_source_diversity: top10Groups.size,
    real_provider_result_count: realProviderResultCount,
    mock_result_count: mockResultCount,
    real_provider_share: round2(realProviderShare),
    image_share: round2(imageShare),
    calibration_score: calibrationScore,
    verdict,
    warnings,
    top_candidate_ids: topCandidateIds,
    expectations
  };
}
