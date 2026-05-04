import type {
  ProviderHealth,
  RankingExplainabilityAudit,
  RankingExplanation,
  RankingExplanationFactor,
  RankingSignalStrength,
  ResearchResult,
  ReviewEvidenceCalibrationTrace,
  ReviewEvidenceFeedback
} from "@/types/research";

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, round2(value)));
}

function factor(params: {
  key: string;
  label: string;
  value: number;
  weight: number;
  description: string;
}): RankingExplanationFactor {
  const value = clamp01(params.value);
  const contribution = round2(value * params.weight);
  const polarity = contribution >= 0.12 ? "positive" : contribution <= 0.05 ? "negative" : "neutral";
  return {
    key: params.key,
    label: params.label,
    value,
    weight: round2(params.weight),
    contribution,
    polarity,
    description: params.description
  };
}

// rights/reuse signal
function riskSignal(result: ResearchResult): number {
  if (result.reuse_risk === "low" || result.risk_level === "low") return 0.88;
  if (result.rights_status === "public_domain" || result.rights_status === "open_license") return 0.84;
  if (result.rights_status === "likely_reusable") return 0.72;
  if (result.rights_status === "reference_only" || result.risk_level === "reference_only") return 0.42;
  if (result.rights_status === "restricted" || result.risk_level === "avoid") return 0.12;
  if (result.reuse_risk === "high" || result.risk_level === "high") return 0.22;
  return 0.52;
}

function accessSignal(result: ResearchResult): number {
  if (result.source_access_mode === "backend_free_no_key") return 0.9;
  if (result.source_access_mode === "archive_open_access") return 0.86;
  if (result.source_access_mode === "backend_free_key_required") return 0.76;
  if (result.source_access_mode === "stock_illustrative") return 0.58;
  if (result.source_access_mode === "manual_reference_only") return 0.38;
  return 0.46;
}

function metadataCompletenessSignal(result: ResearchResult): number {
  const gaps = result.metadata_gaps?.length ?? 0;
  const hasVisual = Boolean(result.thumbnail_url || result.image_url);
  const hasDescription = Boolean(result.description?.trim());
  const hasLicenseContext = Boolean(result.license_url || result.license_detected !== "unknown");
  const base = 0.42 + (hasVisual ? 0.2 : 0) + (hasDescription ? 0.14 : 0) + (hasLicenseContext ? 0.16 : 0);
  return clamp01(base - Math.min(0.32, gaps * 0.08));
}

function providerHealthSignal(result: ResearchResult, providerHealth: ProviderHealth[]): number {
  const health = providerHealth.find((entry) => entry.provider === result.provider);
  if (!health) return result.provider === "manual" ? 0.58 : 0.44;
  if (health.status === "active") return 0.86;
  if (health.status === "no_results") return 0.52;
  if (health.status === "missing_key" || health.status === "skipped") return 0.4;
  return 0.24;
}

// review-evidence delta
function reviewSignalValue(delta: number, feedback?: ReviewEvidenceFeedback): number {
  if (!feedback || feedback.reviewed_result_count === 0) return 0.5;
  const directional = 0.5 + Math.max(-0.35, Math.min(0.35, delta * 2.2));
  const confidenceDamped = 0.5 + ((directional - 0.5) * Math.max(0.25, feedback.confidence));
  return clamp01(confidenceDamped);
}

function explainConfidence(params: {
  result: ResearchResult;
  delta: number;
  feedback?: ReviewEvidenceFeedback;
  reviewTrace?: ReviewEvidenceCalibrationTrace;
}): RankingSignalStrength {
  const gaps = params.result.metadata_gaps?.length ?? 0;
  const rightsWeak = ["unknown", "reference_only", "check_required", "restricted"].includes(params.result.rights_status);
  const sparseReview = Boolean(params.feedback && params.feedback.reviewed_result_count > 0 && params.feedback.confidence < 0.35);
  const negativeTopSignal = Boolean(params.reviewTrace && params.reviewTrace.top10_rejected_signal_count > 0 && params.result.scores.overall >= 0.68 && params.delta < 0);
  const conflictingBias = Boolean(params.feedback && [
    ...params.feedback.domain_bias,
    ...params.feedback.source_group_bias,
    ...params.feedback.provider_bias
  ].some((entry) => entry.positive_count > 0 && entry.negative_count > 0));

  if (negativeTopSignal || conflictingBias) return "conflicting";
  if (gaps >= 3 || rightsWeak || sparseReview) return "weak";
  if (params.result.scores.overall >= 0.72 && gaps === 0 && params.result.reuse_risk !== "high") return "strong";
  return "moderate";
}

function warningsForResult(params: {
  result: ResearchResult;
  delta: number;
  feedback?: ReviewEvidenceFeedback;
  reviewTrace?: ReviewEvidenceCalibrationTrace;
}): string[] {
  const warnings: string[] = [];
  const { result, delta, feedback, reviewTrace } = params;

  if (["reference_only", "check_required", "restricted", "unknown"].includes(result.rights_status)) {
    warnings.push(`Rights status is ${result.rights_status.replaceAll("_", " ")}; verify before publication.`);
  }
  if (result.reuse_risk === "high" || result.risk_level === "high" || result.risk_level === "avoid") {
    warnings.push("Reuse risk is elevated; treat this result as reference or verification material only.");
  }
  if (result.metadata_gaps?.length) {
    warnings.push(`Metadata gaps: ${result.metadata_gaps.map((gap) => gap.replaceAll("_", " ")).join(", ")}.`);
  }
  if (feedback && feedback.reviewed_result_count > 0 && feedback.confidence < 0.35) {
    warnings.push("Review-evidence confidence is sparse; ranking impact is intentionally conservative.");
  }
  if (Math.abs(delta) >= 0.04 && feedback && feedback.confidence < 0.5) {
    warnings.push("Review adjustment is visible but based on limited feedback density.");
  }
  if (reviewTrace?.top10_rejected_signal_count && delta < 0 && result.scores.overall >= 0.65) {
    warnings.push("A high-ranked result still carries negative review feedback; inspect before saving.");
  }

  return Array.from(new Set(warnings)).slice(0, 6);
}

function buildFactors(params: {
  result: ResearchResult;
  baselineOverall: number;
  providerHealth: ProviderHealth[];
  feedback?: ReviewEvidenceFeedback;
}): RankingExplanationFactor[] {
  const { result, baselineOverall, providerHealth, feedback } = params;
  const reviewDelta = result.scores.overall - baselineOverall;
  return [
    factor({ key: "relevance", label: "Topic relevance", value: result.scores.relevance, weight: 0.22, description: "Direct text/tag/domain match against the research topic and mode." }),
    factor({ key: "visual_quality", label: "Visual quality", value: result.scores.visual_quality, weight: 0.15, description: "Image availability, estimated resolution, and visual production usefulness." }),
    factor({ key: "source_credibility", label: "Source credibility", value: result.scores.source_credibility, weight: 0.16, description: "Institutional/source-group credibility and domain risk heuristics." }),
    factor({ key: "license_clarity", label: "License clarity", value: result.scores.license_clarity, weight: 0.14, description: "Public-domain/open-license clarity and license-confidence signal." }),
    factor({ key: "production_usefulness", label: "Production usefulness", value: result.scores.production_usefulness, weight: 0.11, description: "Combined signal for creator workflow usefulness after risk penalties." }),
    factor({ key: "rights_reuse", label: "Rights/reuse signal", value: riskSignal(result), weight: 0.1, description: "Rights status and reuse-risk classification from provider/manual metadata." }),
    factor({ key: "source_access", label: "Source access mode", value: accessSignal(result), weight: 0.05, description: "Preference for free/open backend sources over reference-only entries." }),
    factor({ key: "metadata_completeness", label: "Metadata completeness", value: metadataCompletenessSignal(result), weight: 0.04, description: "Presence of source URL, visual asset, description, dimensions, and license context." }),
    factor({ key: "provider_health", label: "Provider runtime signal", value: providerHealthSignal(result, providerHealth), weight: 0.03, description: "Whether this provider was active, skipped, missing-key, or degraded during the run." }),
    factor({ key: "review_evidence", label: "Review-evidence delta", value: reviewSignalValue(reviewDelta, feedback), weight: 0.08, description: "Manual review feedback from saved board items, confidence-damped when sparse or conflicting." })
  ];
}

export function buildRankingExplainability(params: {
  finalResults: ResearchResult[];
  baselineResults: ResearchResult[];
  providerHealth: ProviderHealth[];
  reviewFeedback?: ReviewEvidenceFeedback;
  reviewTrace?: ReviewEvidenceCalibrationTrace;
  generatedAt?: string;
}): { results: ResearchResult[]; audit: RankingExplainabilityAudit } {
  const generatedAt = params.generatedAt ?? new Date().toISOString();
  const baselineById = new Map(params.baselineResults.map((result) => [result.id, result]));
  const explained = params.finalResults.map((result, index) => {
    const baselineOverall = baselineById.get(result.id)?.scores.overall ?? result.scores.overall;
    const delta = round2(result.scores.overall - baselineOverall);
    const factors = buildFactors({ result, baselineOverall, providerHealth: params.providerHealth, feedback: params.reviewFeedback });
    const dominantFactors = [...factors]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 4)
      .map((entry) => entry.key);
    const calibrationConfidence = explainConfidence({ result, delta, feedback: params.reviewFeedback, reviewTrace: params.reviewTrace });
    const explanation: RankingExplanation = {
      schema_version: "0.3.0",
      result_id: result.id,
      final_rank: index + 1,
      baseline_overall: round2(baselineOverall),
      final_overall: round2(result.scores.overall),
      score_delta_from_baseline: delta,
      calibration_confidence: calibrationConfidence,
      dominant_factors: dominantFactors,
      factors,
      warnings: warningsForResult({ result, delta, feedback: params.reviewFeedback, reviewTrace: params.reviewTrace })
    };
    return {
      ...result,
      ranking_explanation: explanation,
      quality_reasons: Array.from(new Set([
        ...(result.quality_reasons ?? []),
        `Ranking explanation: rank #${index + 1}; dominant factors ${dominantFactors.join(", ")}; confidence ${calibrationConfidence}.`
      ])).slice(0, 8)
    };
  });

  const explanations = explained.map((result) => result.ranking_explanation as RankingExplanation);
  const deltas = explanations.map((entry) => entry.score_delta_from_baseline);
  const conflictingReviewEvidence = Boolean(params.reviewFeedback && [
    ...params.reviewFeedback.domain_bias,
    ...params.reviewFeedback.source_group_bias,
    ...params.reviewFeedback.provider_bias
  ].some((entry) => entry.positive_count > 0 && entry.negative_count > 0));
  const sparseReviewEvidence = Boolean(params.reviewFeedback && params.reviewFeedback.reviewed_result_count > 0 && params.reviewFeedback.confidence < 0.35);
  const warnings = [
    ...(sparseReviewEvidence ? ["Review feedback is present but sparse; ranking explanations mark confidence conservatively."] : []),
    ...(conflictingReviewEvidence ? ["Review feedback contains conflicting positive/negative bias entries; explanation confidence can be conflicting."] : []),
    ...(params.reviewTrace?.top10_rejected_signal_count ? [`${params.reviewTrace.top10_rejected_signal_count} top-10 result(s) still carry rejected/source-check review signals.`] : []),
    ...(explained.some((result) => result.ranking_explanation?.warnings.length) ? ["Some result-level explanations include rights, metadata, or review-confidence warnings."] : [])
  ];

  const audit: RankingExplainabilityAudit = {
    schema_version: "0.3.0",
    generated_at: generatedAt,
    explained_result_count: explained.length,
    top_explained_count: Math.min(10, explained.length),
    strong_explanation_count: explanations.filter((entry) => entry.calibration_confidence === "strong").length,
    moderate_explanation_count: explanations.filter((entry) => entry.calibration_confidence === "moderate").length,
    weak_explanation_count: explanations.filter((entry) => entry.calibration_confidence === "weak").length,
    conflicting_explanation_count: explanations.filter((entry) => entry.calibration_confidence === "conflicting").length,
    review_adjusted_result_count: deltas.filter((delta) => Math.abs(delta) >= 0.005).length,
    positive_review_delta_count: deltas.filter((delta) => delta > 0.005).length,
    negative_review_delta_count: deltas.filter((delta) => delta < -0.005).length,
    average_absolute_review_delta: round2(deltas.reduce((sum, delta) => sum + Math.abs(delta), 0) / Math.max(1, deltas.length)),
    sparse_review_evidence: sparseReviewEvidence,
    conflicting_review_evidence: conflictingReviewEvidence,
    top_result_ids: explained.slice(0, 10).map((result) => result.id),
    warnings: Array.from(new Set(warnings)).slice(0, 10)
  };

  return { results: explained, audit };
}
