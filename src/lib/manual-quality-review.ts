import type { ManualQualityReview, ManualReviewLabel, ManualReviewVerdict, ResearchResult } from "@/types/research";

export const REVIEW_LABELS: Array<{ value: ManualReviewLabel; label: string }> = [
  { value: "unreviewed", label: "Unreviewed" },
  { value: "pass", label: "Pass" },
  { value: "watch", label: "Watch" },
  { value: "fail", label: "Fail" }
];

export const REVIEW_VERDICTS: Array<{ value: ManualReviewVerdict; label: string }> = [
  { value: "unreviewed", label: "Unreviewed" },
  { value: "approved_reference", label: "Approved reference" },
  { value: "use_with_caution", label: "Use with caution" },
  { value: "needs_source_check", label: "Needs source check" },
  { value: "reject", label: "Reject" }
];

export function createDefaultManualReview(): ManualQualityReview {
  return {
    relevance: "unreviewed",
    visual_usefulness: "unreviewed",
    source_trust: "unreviewed",
    license_status: "unreviewed",
    verdict: "unreviewed"
  };
}

export function normalizeManualReview(review?: Partial<ManualQualityReview>): ManualQualityReview {
  return {
    ...createDefaultManualReview(),
    ...review
  };
}

export function applyManualReviewPatch(result: ResearchResult, patch: Partial<ManualQualityReview>): ResearchResult {
  const current = normalizeManualReview(result.manual_review);
  return {
    ...result,
    manual_review: {
      ...current,
      ...patch,
      reviewed_at: new Date().toISOString()
    },
    updated_at: new Date().toISOString()
  };
}

export function manualReviewBadge(review?: Partial<ManualQualityReview>): string {
  const normalized = normalizeManualReview(review);
  if (normalized.verdict === "approved_reference") return "Approved";
  if (normalized.verdict === "use_with_caution") return "Caution";
  if (normalized.verdict === "needs_source_check") return "Source check";
  if (normalized.verdict === "reject") return "Rejected";
  return "Unreviewed";
}

export function summarizeManualReviews(results: ResearchResult[]): Record<ManualReviewVerdict, number> {
  const summary: Record<ManualReviewVerdict, number> = {
    unreviewed: 0,
    approved_reference: 0,
    use_with_caution: 0,
    needs_source_check: 0,
    reject: 0
  };
  results.forEach((item) => {
    const verdict = normalizeManualReview(item.manual_review).verdict;
    summary[verdict] += 1;
  });
  return summary;
}
