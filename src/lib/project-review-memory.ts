import type {
  ManualQualityReview,
  ProjectReviewEvidenceMemory,
  ProjectReviewEvidenceMemoryAudit,
  ProjectReviewEvidenceMemoryStatus,
  ResearchProject,
  ResearchResult
} from "@/types/research";
import { normalizeManualReview } from "@/lib/manual-quality-review";
import { buildReviewEvidenceFeedback } from "@/lib/review-evidence-feedback";
import { canonicalUrl, normalizeKey } from "@/lib/result-normalizer";

const EMPTY_PROJECT_ID = "unknown_project";

function nowIso(): string {
  return new Date().toISOString();
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fp_${(hash >>> 0).toString(36)}`;
}

function reviewTimestamp(result: ResearchResult, review: ManualQualityReview): string {
  return review.reviewed_at ?? result.updated_at ?? result.collected_at ?? "";
}

function hasReviewSignal(review: ManualQualityReview): boolean {
  return review.verdict !== "unreviewed" ||
    review.relevance !== "unreviewed" ||
    review.visual_usefulness !== "unreviewed" ||
    review.source_trust !== "unreviewed" ||
    review.license_status !== "unreviewed";
}

function isBeforeReset(timestamp: string, resetAt?: string): boolean {
  if (!resetAt || !timestamp) return false;
  const timestampMs = Date.parse(timestamp);
  const resetMs = Date.parse(resetAt);
  if (!Number.isFinite(timestampMs) || !Number.isFinite(resetMs)) return false;
  return timestampMs < resetMs;
}

function fingerprintResults(results: ResearchResult[]): string {
  const serial = results
    .map((result) => {
      const review = normalizeManualReview(result.manual_review);
      return [
        result.id,
        canonicalUrl(result.source_url),
        normalizeKey(result.source_domain),
        result.provider,
        review.verdict,
        review.relevance,
        review.visual_usefulness,
        review.source_trust,
        review.license_status,
        review.reviewed_at ?? result.updated_at ?? ""
      ].join("|");
    })
    .sort()
    .join("::");
  return stableHash(serial);
}

function statusFor(params: {
  reviewedCount: number;
  ignoredPreResetCount: number;
  confidence: number;
  warnings: string[];
  resetAt?: string;
}): ProjectReviewEvidenceMemoryStatus {
  if (params.reviewedCount === 0 && params.resetAt && params.ignoredPreResetCount > 0) return "reset";
  if (params.reviewedCount === 0) return "empty";
  if (params.warnings.some((warning) => warning.toLowerCase().includes("conflict"))) return "conflicting";
  return "current";
}

// Isolation shape: project:<project_id>
export function projectReviewIsolationKey(projectId?: string): string {
  return `project:${projectId || EMPTY_PROJECT_ID}`;
}

export function buildProjectReviewEvidenceMemory(
  project: Pick<ResearchProject, "id" | "saved_results" | "review_evidence_memory">,
  generatedAt = nowIso()
): ProjectReviewEvidenceMemory {
  const previous = project.review_evidence_memory;
  const resetAt = previous?.reset_at;
  const reviewed = project.saved_results
    .map((result) => ({ result, review: normalizeManualReview(result.manual_review) }))
    .filter(({ review }) => hasReviewSignal(review));
  const ignoredPreReset = reviewed.filter(({ result, review }) => isBeforeReset(reviewTimestamp(result, review), resetAt));
  const included = reviewed
    .filter(({ result, review }) => !isBeforeReset(reviewTimestamp(result, review), resetAt))
    .map(({ result }) => result);
  const feedback = buildReviewEvidenceFeedback(included, generatedAt);
  const warnings = [...feedback.warnings];

  if (resetAt) warnings.unshift(`Review memory was reset at ${resetAt}; older review labels are ignored until they are reviewed again.`);
  if (ignoredPreReset.length > 0) warnings.push(`${ignoredPreReset.length} reviewed reference${ignoredPreReset.length === 1 ? "" : "s"} ignored because they predate the reset.`);
  if (included.length > 0 && included.length < 3) warnings.push("Project-specific memory is sparse; ranking feedback remains damped.");

  const status = statusFor({
    reviewedCount: included.length,
    ignoredPreResetCount: ignoredPreReset.length,
    confidence: feedback.confidence,
    warnings,
    resetAt
  });

  return {
    schema_version: "0.3.1",
    project_id: project.id,
    isolation_key: projectReviewIsolationKey(project.id),
    generated_at: generatedAt,
    reset_at: resetAt,
    source_fingerprint: fingerprintResults(included),
    reviewed_result_count: included.length,
    included_result_ids: included.map((result) => result.id),
    ignored_pre_reset_review_count: ignoredPreReset.length,
    feedback,
    confidence: feedback.confidence,
    status,
    warnings
  };
}

export function resetProjectReviewEvidenceMemory(project: ResearchProject, resetAt = nowIso()): ProjectReviewEvidenceMemory {
  const resetProject: Pick<ResearchProject, "id" | "saved_results" | "review_evidence_memory"> = {
    id: project.id,
    saved_results: project.saved_results,
    review_evidence_memory: {
      schema_version: "0.3.1",
      project_id: project.id,
      isolation_key: projectReviewIsolationKey(project.id),
      generated_at: resetAt,
      reset_at: resetAt,
      source_fingerprint: "fp_reset",
      reviewed_result_count: 0,
      included_result_ids: [],
      ignored_pre_reset_review_count: 0,
      feedback: buildReviewEvidenceFeedback([], resetAt),
      confidence: 0,
      status: "reset",
      warnings: [`Review memory was reset at ${resetAt}.`]
    }
  };
  return buildProjectReviewEvidenceMemory(resetProject, resetAt);
}

export function isProjectReviewEvidenceMemoryStale(project: Pick<ResearchProject, "saved_results" | "review_evidence_memory">): boolean {
  const memory = project.review_evidence_memory;
  if (!memory) return false;
  const resetAt = memory.reset_at;
  const currentIncluded = project.saved_results.filter((result) => {
    const review = normalizeManualReview(result.manual_review);
    return hasReviewSignal(review) && !isBeforeReset(reviewTimestamp(result, review), resetAt);
  });
  return memory.source_fingerprint !== fingerprintResults(currentIncluded);
}

export function buildProjectReviewEvidenceMemoryAudit(params: {
  memory?: ProjectReviewEvidenceMemory;
  stale?: boolean;
  usedForSearch: boolean;
  generatedAt?: string;
}): ProjectReviewEvidenceMemoryAudit {
  const generatedAt = params.generatedAt ?? nowIso();
  const memory = params.memory;
  if (!memory) {
    return {
      schema_version: "0.3.1",
      generated_at: generatedAt,
      enabled: false,
      used_for_search: false,
      status: "empty",
      stale: false,
      memory_confidence: 0,
      included_review_count: 0,
      ignored_pre_reset_review_count: 0,
      feedback_confidence: 0,
      domain_bias_count: 0,
      source_group_bias_count: 0,
      provider_bias_count: 0,
      reviewed_source_count: 0,
      warnings: ["No project-specific review memory was supplied."]
    };
  }

  const warnings = [...memory.warnings];
  if (params.stale) warnings.unshift("Stored project review memory is stale relative to current saved-review labels; refresh before relying on it.");
  if (!params.usedForSearch) warnings.push("Project review memory was available but not used for this search.");

  return {
    schema_version: "0.3.1",
    generated_at: generatedAt,
    enabled: true,
    used_for_search: params.usedForSearch,
    project_id: memory.project_id,
    isolation_key: memory.isolation_key,
    status: params.stale ? "stale" : memory.status,
    stale: Boolean(params.stale),
    reset_at: memory.reset_at,
    memory_confidence: memory.confidence,
    included_review_count: memory.reviewed_result_count,
    ignored_pre_reset_review_count: memory.ignored_pre_reset_review_count,
    feedback_confidence: memory.feedback.confidence,
    domain_bias_count: memory.feedback.domain_bias.length,
    source_group_bias_count: memory.feedback.source_group_bias.length,
    provider_bias_count: memory.feedback.provider_bias.length,
    reviewed_source_count: memory.feedback.reviewed_sources.length,
    warnings
  };
}
