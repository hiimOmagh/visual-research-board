import type {
  BroadDiscoveryCandidate,
  BroadDiscoveryMode,
  BroadDiscoveryNormalizationResult,
  BroadDiscoveryQueryPlan
} from "@/types/broad-discovery";
import type { BroadReferenceResult, BroadReferenceSourceClass } from "@/types/broad-reference-result";
import {
  createBroadReferenceResult,
  inferBroadReferenceRiskLevel,
  inferBroadReferenceSourceClass
} from "@/lib/broad-reference-result";

const modeTargets: Record<BroadDiscoveryMode, BroadReferenceSourceClass[]> = {
  broad: ["web_image", "web_page", "archive", "museum", "stock", "video", "unknown"],
  web: ["web_page", "web_image", "archive", "museum", "video", "unknown"],
  image: ["web_image", "stock", "museum", "archive", "unknown"],
  visual: ["web_image", "stock", "museum", "archive", "video", "unknown"],
  safe_open: ["web_image", "web_page", "archive", "museum", "stock", "unknown"]
};

export function createBroadDiscoveryQueryPlan(
  query: string,
  mode: BroadDiscoveryMode = "broad"
): BroadDiscoveryQueryPlan {
  return {
    query: query.trim(),
    mode,
    target_source_classes: modeTargets[mode],
    include_uncertain_rights: mode !== "safe_open",
    safe_open_only: mode === "safe_open",
    notes: [
      "Discovery-first mode: classify and label results without blocking useful references.",
      mode === "safe_open"
        ? "Safe/open mode asks for lower-risk sources, but it is still not legal clearance."
        : "Broad mode includes uncertain rights and access states for later user review."
    ]
  };
}

export function normalizeBroadDiscoveryCandidate(
  candidate: BroadDiscoveryCandidate,
  mode: BroadDiscoveryMode = "broad"
): BroadDiscoveryNormalizationResult {
  const inferredSourceClass =
    candidate.source_class_hint ??
    inferBroadReferenceSourceClass({
      url: candidate.source_url,
      title: candidate.title,
      platform: candidate.platform,
      mime_type: candidate.image_url ? "image/unknown" : undefined
    });

  const accessStatus = "unknown";
  const rightsStatus = "unknown";
  const riskLevel = inferBroadReferenceRiskLevel(accessStatus, rightsStatus);

  const result: BroadReferenceResult = createBroadReferenceResult({
    id: candidate.id ?? createStableReferenceId(candidate.source_url),
    query: candidate.query,
    title: candidate.title,
    description: candidate.description,
    image_url: candidate.image_url,
    source_url: candidate.source_url,
    display_url: candidate.display_url,
    source_class: inferredSourceClass,
    platform: candidate.platform,
    creator_or_author: candidate.creator_or_author,
    publisher: candidate.publisher,
    date: candidate.date,
    access_status: accessStatus,
    rights_status: rightsStatus,
    risk_level: riskLevel,
    relevance_score: candidate.relevance_score,
    evidence_notes: [
      "Normalized from broad web/image discovery candidate.",
      "Rights and access labels require user review."
    ]
  });

  return {
    result,
    mode,
    discovery_notes: createBroadDiscoveryQueryPlan(candidate.query, mode).notes
  };
}

export function filterBroadDiscoveryResultsByMode(
  results: BroadReferenceResult[],
  mode: BroadDiscoveryMode
): BroadReferenceResult[] {
  const allowed = new Set(modeTargets[mode]);

  return results.filter((result) => {
    if (!allowed.has(result.source_class)) return false;
    if (mode === "safe_open") {
      return result.rights_status === "public_domain" || result.rights_status === "open_license";
    }
    return true;
  });
}

export function describeBroadDiscoveryMode(mode: BroadDiscoveryMode): string {
  const labels: Record<BroadDiscoveryMode, string> = {
    broad: "Broad discovery",
    web: "Web discovery",
    image: "Image discovery",
    visual: "Visual reference discovery",
    safe_open: "Safe/open discovery"
  };

  return labels[mode];
}

function createStableReferenceId(sourceUrl: string): string {
  let hash = 0;
  for (let i = 0; i < sourceUrl.length; i += 1) {
    hash = (hash * 31 + sourceUrl.charCodeAt(i)) >>> 0;
  }
  return `ref_${hash.toString(16)}`;
}
