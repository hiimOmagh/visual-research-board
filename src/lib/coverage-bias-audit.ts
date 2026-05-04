import type {
  BoardSection,
  ClaimEvidenceRelation,
  CoverageBiasAudit,
  ResearchClaim,
  ResearchProject,
  ResearchResult,
  ReuseRisk,
  RightsStatus,
  SourceGroup
} from "@/types/research";
import { normalizeResearchClaims } from "@/lib/claim-mapping";
import { classifySourceDomain } from "@/lib/result-quality";

export const COVERAGE_BIAS_AUDIT_SCHEMA_VERSION = "0.3.4" as const;

const DOMINANCE_PROVIDER_THRESHOLD = 0.45;
const DOMINANCE_DOMAIN_THRESHOLD = 0.35;
const DOMINANCE_SOURCE_GROUP_THRESHOLD = 0.55;

function nowIso(): string {
  return new Date().toISOString();
}

function safeDomain(value: string | undefined): string {
  return value?.trim().toLowerCase() || "unknown";
}

function sectionName(sections: BoardSection[] | undefined, sectionId?: string): string {
  if (!sectionId) return "unassigned";
  return sections?.find((section) => section.id === sectionId)?.name ?? sectionId;
}

function countBy<T extends string>(items: ResearchResult[], getKey: (item: ResearchResult) => T): Record<T, number> {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function topEntry(counts: Record<string, number>): { key: string; count: number; share: number } {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (!entries.length || total === 0) return { key: "none", count: 0, share: 0 };
  const [key, count] = entries[0];
  return { key, count, share: count / total };
}

function relationCount(claims: ResearchClaim[], relation: ClaimEvidenceRelation): number {
  return claims.reduce((total, claim) => total + claim.source_links.filter((link) => link.relation === relation).length, 0);
}

function hasRelation(claim: ResearchClaim, relations: ClaimEvidenceRelation[]): boolean {
  return claim.source_links.some((link) => relations.includes(link.relation));
}

function roundShare(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function buildCoverageBiasAudit(projectOrResults: Pick<ResearchProject, "saved_results" | "claims" | "board_sections"> | ResearchResult[]): CoverageBiasAudit {
  const isResultArray = Array.isArray(projectOrResults);
  const saved = isResultArray ? projectOrResults : projectOrResults.saved_results;
  const sections = isResultArray ? [] : projectOrResults.board_sections;
  const claims = isResultArray ? [] : normalizeResearchClaims(projectOrResults.claims, saved);
  const warnings: string[] = [];

  const providerCounts = countBy(saved, (item) => item.provider);
  const domainCounts = countBy(saved, (item) => safeDomain(item.source_domain));
  const sourceGroupCounts = countBy(saved, (item) => (item.source_group ?? classifySourceDomain(item.source_domain)) as SourceGroup);
  const rightsStatusCounts = countBy(saved, (item) => item.rights_status as RightsStatus);
  const reuseRiskCounts = countBy(saved, (item) => item.reuse_risk as ReuseRisk);
  const sectionCounts = countBy(saved, (item) => sectionName(sections, item.section_id));

  const dominantProvider = topEntry(providerCounts);
  const dominantDomain = topEntry(domainCounts);
  const dominantSourceGroup = topEntry(sourceGroupCounts);

  const referenceOnlyCount = saved.filter((item) => item.rights_status === "reference_only" || item.risk_level === "reference_only").length;
  const checkRequiredCount = saved.filter((item) => item.rights_status === "check_required" || item.rights_status === "unknown").length;
  const highReuseRiskCount = saved.filter((item) => item.reuse_risk === "high" || item.risk_level === "high" || item.risk_level === "avoid").length;
  const reusableCount = saved.filter((item) => item.rights_status === "public_domain" || item.rights_status === "open_license" || item.rights_status === "likely_reusable").length;
  const publicDomainOrOpenCount = saved.filter((item) => item.rights_status === "public_domain" || item.rights_status === "open_license").length;
  const metadataGapItemCount = saved.filter((item) => (item.metadata_gaps?.length ?? 0) > 0).length;

  const supportLinkCount = relationCount(claims, "supports");
  const contradictionLinkCount = relationCount(claims, "contradicts") + relationCount(claims, "weakens");
  const contextualLinkCount = relationCount(claims, "contextual");
  const visualReferenceLinkCount = relationCount(claims, "visual_reference_only");
  const linkedSourceIds = new Set(claims.flatMap((claim) => claim.source_links.map((link) => link.result_id)));
  const unlinkedSavedCount = saved.filter((item) => !linkedSourceIds.has(item.id)).length;
  const claimsWithoutSupportCount = claims.filter((claim) => !hasRelation(claim, ["supports"])).length;
  const claimsWithoutCounterCount = claims.filter((claim) => !hasRelation(claim, ["contradicts", "weakens"])).length;
  const underSupportedClaimCount = claims.filter((claim) => claim.status === "under_supported" || claim.status === "needs_verification").length;
  const contestedClaimCount = claims.filter((claim) => claim.status === "contested" || hasRelation(claim, ["contradicts", "weakens"])).length;

  if (saved.length === 0) {
    warnings.push("No saved sources are available for coverage and bias audit.");
  }
  if (saved.length > 0 && Object.keys(providerCounts).length < 2) {
    warnings.push("Provider diversity is weak; saved evidence comes from fewer than two providers.");
  }
  if (saved.length > 0 && dominantProvider.share >= DOMINANCE_PROVIDER_THRESHOLD) {
    warnings.push(`Provider concentration risk: ${dominantProvider.key} supplies ${Math.round(dominantProvider.share * 100)}% of saved items.`);
  }
  if (saved.length > 2 && dominantDomain.key !== "unknown" && dominantDomain.share >= DOMINANCE_DOMAIN_THRESHOLD) {
    warnings.push(`Domain concentration risk: ${dominantDomain.key} supplies ${Math.round(dominantDomain.share * 100)}% of saved items.`);
  }
  if (saved.length > 0 && dominantSourceGroup.share >= DOMINANCE_SOURCE_GROUP_THRESHOLD) {
    warnings.push(`Source-group concentration risk: ${dominantSourceGroup.key} supplies ${Math.round(dominantSourceGroup.share * 100)}% of saved items.`);
  }
  if (referenceOnlyCount > saved.length * 0.4) {
    warnings.push("Reference-only items dominate the board; separate inspiration/reference material from publishable candidates.");
  }
  if (checkRequiredCount > 0) {
    warnings.push(`${checkRequiredCount} saved item(s) still require rights/source verification.`);
  }
  if (highReuseRiskCount > 0) {
    warnings.push(`${highReuseRiskCount} saved item(s) are high reuse-risk or avoid-grade; keep them out of reusable export sets.`);
  }
  if (saved.length >= 3 && publicDomainOrOpenCount === 0) {
    warnings.push("No public-domain or open-license candidates are currently saved.");
  }
  if (metadataGapItemCount > saved.length * 0.35) {
    warnings.push("Metadata gaps are common; review missing license, dimension, or source-page fields before export.");
  }
  if (claims.length > 0 && claimsWithoutSupportCount > 0) {
    warnings.push(`${claimsWithoutSupportCount} claim(s) have no supporting source link.`);
  }
  if (claims.length > 0 && claimsWithoutCounterCount === claims.length) {
    warnings.push("No claim has weakening or contradictory evidence; add counter-evidence before high-confidence publication.");
  } else if (claimsWithoutCounterCount > 0) {
    warnings.push(`${claimsWithoutCounterCount} claim(s) have no weakening or contradictory source link.`);
  }
  if (claims.length > 0 && unlinkedSavedCount > saved.length * 0.5) {
    warnings.push("Most saved items are not mapped to claims; coverage cannot be defended at claim level yet.");
  }
  if (visualReferenceLinkCount > supportLinkCount && claims.length > 0) {
    warnings.push("Visual-reference claim links outnumber factual support links; separate aesthetics from evidence.");
  }

  return {
    schema_version: COVERAGE_BIAS_AUDIT_SCHEMA_VERSION,
    generated_at: nowIso(),
    total_saved_count: saved.length,
    provider_count: Object.keys(providerCounts).length,
    domain_count: Object.keys(domainCounts).length,
    source_group_count: Object.keys(sourceGroupCounts).length,
    section_count: Object.keys(sectionCounts).length,
    claim_count: claims.length,
    provider_counts: providerCounts,
    domain_counts: domainCounts,
    source_group_counts: sourceGroupCounts,
    rights_status_counts: rightsStatusCounts,
    reuse_risk_counts: reuseRiskCounts,
    section_counts: sectionCounts,
    dominant_provider: dominantProvider.key,
    dominant_provider_share: roundShare(dominantProvider.share),
    dominant_domain: dominantDomain.key,
    dominant_domain_share: roundShare(dominantDomain.share),
    dominant_source_group: dominantSourceGroup.key,
    dominant_source_group_share: roundShare(dominantSourceGroup.share),
    reference_only_count: referenceOnlyCount,
    check_required_count: checkRequiredCount,
    high_reuse_risk_count: highReuseRiskCount,
    reusable_candidate_count: reusableCount,
    public_domain_or_open_count: publicDomainOrOpenCount,
    metadata_gap_item_count: metadataGapItemCount,
    support_link_count: supportLinkCount,
    contradiction_link_count: contradictionLinkCount,
    contextual_link_count: contextualLinkCount,
    visual_reference_link_count: visualReferenceLinkCount,
    unlinked_saved_count: unlinkedSavedCount,
    claims_without_support_count: claimsWithoutSupportCount,
    claims_without_counter_count: claimsWithoutCounterCount,
    under_supported_claim_count: underSupportedClaimCount,
    contested_claim_count: contestedClaimCount,
    warnings
  };
}
