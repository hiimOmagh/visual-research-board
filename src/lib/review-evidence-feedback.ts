import type {
  ManualQualityReview,
  ManualReviewLabel,
  ManualReviewVerdict,
  ProviderName,
  ResearchResult,
  RetrievalQualityCalibration,
  ReviewEvidenceBiasEntry,
  ReviewEvidenceCalibrationTrace,
  ReviewEvidenceFeedback,
  ReviewEvidenceSourceSignal,
  SourceGroup
} from "@/types/research";
import { normalizeManualReview } from "@/lib/manual-quality-review";
import { classifySourceDomain, sourceGroupLabel } from "@/lib/result-quality";

interface BiasAccumulator {
  label: string;
  count: number;
  positive_count: number;
  negative_count: number;
  score_sum: number;
}

interface AdjustmentStats {
  exact_source_matches: number;
  positive_bias_hits: number;
  negative_bias_hits: number;
  adjusted_result_count: number;
  top10_rejected_signal_count: number;
  top10_approved_signal_count: number;
}

const MAX_BIAS_ENTRIES = 14;
const MAX_REVIEWED_SOURCES = 80;

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(round2(value), 0, 1);
}

function labelSignal(label: ManualReviewLabel): number {
  if (label === "pass") return 0.18;
  if (label === "watch") return -0.04;
  if (label === "fail") return -0.22;
  return 0;
}

function verdictSignal(verdict: ManualReviewVerdict): number {
  if (verdict === "approved_reference") return 0.78;
  if (verdict === "use_with_caution") return 0.24;
  if (verdict === "needs_source_check") return -0.34;
  if (verdict === "reject") return -0.86;
  return 0;
}

function reviewSignal(review: ManualQualityReview): number {
  const labelScore = (
    labelSignal(review.relevance) +
    labelSignal(review.visual_usefulness) +
    labelSignal(review.source_trust) +
    labelSignal(review.license_status)
  );
  return clamp(verdictSignal(review.verdict) + labelScore, -1, 1);
}

function hasReviewSignal(review: ManualQualityReview): boolean {
  return review.verdict !== "unreviewed" ||
    review.relevance !== "unreviewed" ||
    review.visual_usefulness !== "unreviewed" ||
    review.source_trust !== "unreviewed" ||
    review.license_status !== "unreviewed";
}

function addBias(map: Map<string, BiasAccumulator>, key: string, label: string, signal: number): void {
  const current = map.get(key) ?? { label, count: 0, positive_count: 0, negative_count: 0, score_sum: 0 };
  current.count += 1;
  current.score_sum += signal;
  if (signal > 0.12) current.positive_count += 1;
  if (signal < -0.12) current.negative_count += 1;
  map.set(key, current);
}

function toBiasEntries(map: Map<string, BiasAccumulator>): ReviewEvidenceBiasEntry[] {
  return Array.from(map.entries())
    .map(([key, entry]) => ({
      key,
      label: entry.label,
      count: entry.count,
      positive_count: entry.positive_count,
      negative_count: entry.negative_count,
      weight: round2(clamp(entry.score_sum / Math.max(1, entry.count), -1, 1))
    }))
    .filter((entry) => Math.abs(entry.weight) >= 0.05)
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight) || b.count - a.count)
    .slice(0, MAX_BIAS_ENTRIES);
}

function countReviewLabels(results: ResearchResult[], target: ManualReviewLabel): number {
  return results.reduce((count, result) => {
    const review = normalizeManualReview(result.manual_review);
    return count + [review.relevance, review.visual_usefulness, review.source_trust, review.license_status].filter((label) => label === target).length;
  }, 0);
}

function reviewedOnly(results: ResearchResult[]): Array<{ result: ResearchResult; review: ManualQualityReview; signal: number }> {
  return results
    .map((result) => ({ result, review: normalizeManualReview(result.manual_review) }))
    .filter(({ review }) => hasReviewSignal(review))
    .map(({ result, review }) => ({ result, review, signal: reviewSignal(review) }));
}

export function buildReviewEvidenceFeedback(results: ResearchResult[], generatedAt = new Date().toISOString()): ReviewEvidenceFeedback {
  const reviewed = reviewedOnly(results);
  const domainMap = new Map<string, BiasAccumulator>();
  const sourceGroupMap = new Map<string, BiasAccumulator>();
  const providerMap = new Map<string, BiasAccumulator>();
  const reviewedSources: ReviewEvidenceSourceSignal[] = [];

  for (const { result, review, signal } of reviewed) {
    const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
    addBias(domainMap, result.source_domain, result.source_domain, signal);
    addBias(sourceGroupMap, sourceGroup, sourceGroupLabel(sourceGroup), signal);
    addBias(providerMap, result.provider, result.provider, signal);
    if (review.verdict !== "unreviewed") {
      reviewedSources.push({
        source_url: result.source_url,
        source_domain: result.source_domain,
        verdict: review.verdict,
        weight: round2(signal)
      });
    }
  }

  const approvedCount = reviewed.filter(({ review }) => review.verdict === "approved_reference").length;
  const cautionCount = reviewed.filter(({ review }) => review.verdict === "use_with_caution").length;
  const sourceCheckCount = reviewed.filter(({ review }) => review.verdict === "needs_source_check").length;
  const rejectedCount = reviewed.filter(({ review }) => review.verdict === "reject").length;
  const conflictCount = toBiasEntries(domainMap).filter((entry) => entry.positive_count > 0 && entry.negative_count > 0).length;
  const evidenceDensity = Math.min(1, reviewed.length / 10);
  const conflictPenalty = Math.min(0.35, conflictCount * 0.08);
  const confidence = clamp01(evidenceDensity - conflictPenalty);
  const warnings: string[] = [];

  if (reviewed.length === 0) warnings.push("No reviewed saved references yet; ranking calibration will ignore review feedback.");
  if (reviewed.length > 0 && reviewed.length < 3) warnings.push(`Only ${reviewed.length} reviewed reference${reviewed.length === 1 ? "" : "s"}; feedback confidence remains low.`);
  if (conflictCount > 0) warnings.push(`${conflictCount} domain feedback conflict${conflictCount === 1 ? "" : "s"}; domain-level bias was damped by confidence.`);
  if (rejectedCount > approvedCount + cautionCount && reviewed.length >= 3) warnings.push("Rejected references dominate the review set; next searches may be conservative until more approved examples exist.");

  return {
    schema_version: "0.2.9",
    generated_at: generatedAt,
    reviewed_result_count: reviewed.length,
    approved_count: approvedCount,
    caution_count: cautionCount,
    source_check_count: sourceCheckCount,
    rejected_count: rejectedCount,
    pass_label_count: countReviewLabels(results, "pass"),
    watch_label_count: countReviewLabels(results, "watch"),
    fail_label_count: countReviewLabels(results, "fail"),
    confidence,
    domain_bias: toBiasEntries(domainMap),
    source_group_bias: toBiasEntries(sourceGroupMap),
    provider_bias: toBiasEntries(providerMap),
    reviewed_sources: reviewedSources
      .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
      .slice(0, MAX_REVIEWED_SOURCES),
    warnings
  };
}

export function hasReviewEvidenceSignal(feedback?: ReviewEvidenceFeedback): boolean {
  return Boolean(feedback && feedback.reviewed_result_count > 0 && feedback.confidence > 0);
}

function biasWeight(entries: ReviewEvidenceBiasEntry[], key: string): number {
  return entries.find((entry) => entry.key === key)?.weight ?? 0;
}

function sourceSignal(feedback: ReviewEvidenceFeedback, sourceUrl: string): ReviewEvidenceSourceSignal | undefined {
  return feedback.reviewed_sources.find((entry) => entry.source_url === sourceUrl);
}

function resultReviewAdjustment(result: ResearchResult, feedback: ReviewEvidenceFeedback): number {
  const confidence = feedback.confidence;
  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  const exact = sourceSignal(feedback, result.source_url)?.weight ?? 0;
  const domain = biasWeight(feedback.domain_bias, result.source_domain);
  const group = biasWeight(feedback.source_group_bias, sourceGroup);
  const provider = biasWeight(feedback.provider_bias, result.provider);
  const adjustment = exact * 0.12 + domain * 0.1 * confidence + group * 0.055 * confidence + provider * 0.04 * confidence;
  return round2(clamp(adjustment, -0.16, 0.14));
}

function buildAdjustmentStats(results: ResearchResult[], feedback?: ReviewEvidenceFeedback): AdjustmentStats {
  if (!hasReviewEvidenceSignal(feedback)) {
    return {
      exact_source_matches: 0,
      positive_bias_hits: 0,
      negative_bias_hits: 0,
      adjusted_result_count: 0,
      top10_rejected_signal_count: 0,
      top10_approved_signal_count: 0
    };
  }

  const activeFeedback = feedback as ReviewEvidenceFeedback;
  const top10 = results.slice(0, 10);
  return {
    exact_source_matches: results.filter((result) => Boolean(sourceSignal(activeFeedback, result.source_url))).length,
    positive_bias_hits: results.filter((result) => resultReviewAdjustment(result, activeFeedback) > 0).length,
    negative_bias_hits: results.filter((result) => resultReviewAdjustment(result, activeFeedback) < 0).length,
    adjusted_result_count: results.filter((result) => Math.abs(resultReviewAdjustment(result, activeFeedback)) >= 0.005).length,
    top10_rejected_signal_count: top10.filter((result) => (sourceSignal(activeFeedback, result.source_url)?.weight ?? resultReviewAdjustment(result, activeFeedback)) < -0.12).length,
    top10_approved_signal_count: top10.filter((result) => (sourceSignal(activeFeedback, result.source_url)?.weight ?? resultReviewAdjustment(result, activeFeedback)) > 0.12).length
  };
}

export function applyReviewEvidenceRanking(results: ResearchResult[], feedback?: ReviewEvidenceFeedback): ResearchResult[] {
  const scoreSorted = [...results].sort((a, b) => b.scores.overall - a.scores.overall);
  if (!hasReviewEvidenceSignal(feedback)) return scoreSorted;

  const activeFeedback = feedback as ReviewEvidenceFeedback;
  return scoreSorted
    .map((result) => {
      const adjustment = resultReviewAdjustment(result, activeFeedback);
      if (Math.abs(adjustment) < 0.005) return result;
      const overall = clamp01(result.scores.overall + adjustment);
      return {
        ...result,
        tags: Array.from(new Set([...result.tags, "review-evidence-calibrated"])),
        scores: {
          ...result.scores,
          overall
        },
        quality_reasons: Array.from(new Set([
          ...(result.quality_reasons ?? []),
          adjustment > 0
            ? "Review-evidence rank boost from previously approved domains, source groups, providers, or exact sources."
            : "Review-evidence rank penalty from previously rejected or source-check domains, source groups, providers, or exact sources."
        ])).slice(0, 6)
      };
    })
    .sort((a, b) => b.scores.overall - a.scores.overall);
}

export function buildReviewEvidenceCalibrationTrace(params: {
  feedback?: ReviewEvidenceFeedback;
  rankedResults: ResearchResult[];
  beforeCalibration?: RetrievalQualityCalibration;
  afterCalibration?: RetrievalQualityCalibration;
}): ReviewEvidenceCalibrationTrace {
  const feedback = params.feedback;
  const hasSignal = hasReviewEvidenceSignal(feedback);
  const stats = buildAdjustmentStats(params.rankedResults, feedback);
  const applied = hasSignal && stats.adjusted_result_count > 0;

  return {
    enabled: true,
    applied,
    reason: !hasSignal
      ? "No usable manual review evidence was available, so ranking calibration stayed provider/evidence-only."
      : applied
        ? "Saved-board manual review evidence was converted into source, domain, provider, and exact-source ranking calibration."
        : "Manual review evidence was present, but no current result matched the learned feedback signals strongly enough to change ranking.",
    feedback_confidence: feedback?.confidence ?? 0,
    reviewed_result_count: feedback?.reviewed_result_count ?? 0,
    approved_count: feedback?.approved_count ?? 0,
    rejected_count: feedback?.rejected_count ?? 0,
    exact_source_matches: stats.exact_source_matches,
    positive_bias_hits: stats.positive_bias_hits,
    negative_bias_hits: stats.negative_bias_hits,
    adjusted_result_count: stats.adjusted_result_count,
    top10_rejected_signal_count: stats.top10_rejected_signal_count,
    top10_approved_signal_count: stats.top10_approved_signal_count,
    domain_bias: feedback?.domain_bias.slice(0, 8) ?? [],
    source_group_bias: feedback?.source_group_bias.slice(0, 8) ?? [],
    provider_bias: feedback?.provider_bias.slice(0, 8) ?? [],
    before: {
      calibration_score: params.beforeCalibration?.calibration_score,
      strong_candidates: params.beforeCalibration?.strong_candidates,
      top10_average_overall: params.beforeCalibration?.top10_average_overall,
      top10_source_diversity: params.beforeCalibration?.top10_source_diversity
    },
    after: {
      calibration_score: params.afterCalibration?.calibration_score,
      strong_candidates: params.afterCalibration?.strong_candidates,
      top10_average_overall: params.afterCalibration?.top10_average_overall,
      top10_source_diversity: params.afterCalibration?.top10_source_diversity
    },
    warnings: [
      ...(feedback?.warnings ?? []),
      ...(stats.top10_rejected_signal_count > 0 ? [`${stats.top10_rejected_signal_count} top-10 result${stats.top10_rejected_signal_count === 1 ? "" : "s"} still carry negative review feedback.`] : []),
      ...(hasSignal && (feedback?.confidence ?? 0) < 0.35 ? ["Review feedback confidence is low; calibration is intentionally conservative."] : [])
    ].filter((warning, index, all) => all.indexOf(warning) === index).slice(0, 10)
  };
}

export function reviewEvidenceBiasSummary(feedback: ReviewEvidenceFeedback): string {
  const domain = feedback.domain_bias[0]?.label ?? "none";
  const group = feedback.source_group_bias[0]?.label ?? "none";
  const provider = feedback.provider_bias[0]?.label ?? "none";
  return `${feedback.reviewed_result_count} reviewed · confidence ${Math.round(feedback.confidence * 100)}% · top domain ${domain} · top group ${group} · top provider ${provider}`;
}
