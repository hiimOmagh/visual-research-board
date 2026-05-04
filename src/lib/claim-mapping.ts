import type {
  ClaimConfidence,
  ClaimEvidenceRelation,
  ClaimMappingAudit,
  ClaimSourceLink,
  ClaimStatus,
  ResearchClaim,
  ResearchProject,
  ResearchResult
} from "@/types/research";

export const CLAIM_MAPPING_SCHEMA_VERSION = "0.3.3" as const;

export const CLAIM_RELATION_LABELS: Record<ClaimEvidenceRelation, string> = {
  supports: "Supports",
  weakens: "Weakens",
  contradicts: "Contradicts",
  contextual: "Contextual",
  visual_reference_only: "Visual reference only"
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  under_supported: "Under-supported",
  supported: "Supported",
  contested: "Contested",
  needs_verification: "Needs verification"
};

export const CLAIM_CONFIDENCE_LABELS: Record<ClaimConfidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export const CLAIM_RELATION_OPTIONS: Array<{ value: ClaimEvidenceRelation; label: string }> = [
  { value: "supports", label: CLAIM_RELATION_LABELS.supports },
  { value: "weakens", label: CLAIM_RELATION_LABELS.weakens },
  { value: "contradicts", label: CLAIM_RELATION_LABELS.contradicts },
  { value: "contextual", label: CLAIM_RELATION_LABELS.contextual },
  { value: "visual_reference_only", label: CLAIM_RELATION_LABELS.visual_reference_only }
];

export const CLAIM_STATUS_OPTIONS: Array<{ value: ClaimStatus; label: string }> = [
  { value: "under_supported", label: CLAIM_STATUS_LABELS.under_supported },
  { value: "supported", label: CLAIM_STATUS_LABELS.supported },
  { value: "contested", label: CLAIM_STATUS_LABELS.contested },
  { value: "needs_verification", label: CLAIM_STATUS_LABELS.needs_verification }
];

export const CLAIM_CONFIDENCE_OPTIONS: Array<{ value: ClaimConfidence; label: string }> = [
  { value: "low", label: CLAIM_CONFIDENCE_LABELS.low },
  { value: "medium", label: CLAIM_CONFIDENCE_LABELS.medium },
  { value: "high", label: CLAIM_CONFIDENCE_LABELS.high }
];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function isClaimRelation(value: unknown): value is ClaimEvidenceRelation {
  return ["supports", "weakens", "contradicts", "contextual", "visual_reference_only"].includes(String(value));
}

function isClaimStatus(value: unknown): value is ClaimStatus {
  return ["under_supported", "supported", "contested", "needs_verification"].includes(String(value));
}

function isClaimConfidence(value: unknown): value is ClaimConfidence {
  return ["low", "medium", "high"].includes(String(value));
}

function normalizeLink(link: Partial<ClaimSourceLink>, savedIds: Set<string>, generatedAt: string): ClaimSourceLink | null {
  const resultId = cleanText(link.result_id);
  if (!resultId || !savedIds.has(resultId)) return null;
  return {
    result_id: resultId,
    relation: isClaimRelation(link.relation) ? link.relation : "contextual",
    note: cleanText(link.note) || undefined,
    linked_at: cleanText(link.linked_at, generatedAt)
  };
}

export function inferClaimStatus(links: ClaimSourceLink[], currentStatus?: ClaimStatus): ClaimStatus {
  if (links.some((link) => link.relation === "contradicts" || link.relation === "weakens")) return "contested";
  const supportCount = links.filter((link) => link.relation === "supports").length;
  if (supportCount >= 2) return "supported";
  if (supportCount === 1 || links.length > 0) return currentStatus === "supported" ? "needs_verification" : "needs_verification";
  return "under_supported";
}

export function createResearchClaim(statement: string): ResearchClaim {
  const createdAt = nowIso();
  return {
    id: createId("claim"),
    statement: statement.trim() || "Untitled claim",
    description: undefined,
    confidence: "medium",
    status: "under_supported",
    tags: [],
    source_links: [],
    created_at: createdAt,
    updated_at: createdAt
  };
}

export function normalizeResearchClaim(claim: Partial<ResearchClaim>, savedResults: ResearchResult[] = []): ResearchClaim | null {
  const statement = cleanText(claim.statement);
  if (!statement) return null;
  const generatedAt = nowIso();
  const savedIds = new Set(savedResults.map((result) => result.id));
  const links = (claim.source_links ?? [])
    .map((link) => normalizeLink(link, savedIds, generatedAt))
    .filter((link): link is ClaimSourceLink => Boolean(link));
  const status = isClaimStatus(claim.status) ? claim.status : inferClaimStatus(links);
  return {
    id: cleanText(claim.id, createId("claim")),
    statement,
    description: cleanText(claim.description) || undefined,
    confidence: isClaimConfidence(claim.confidence) ? claim.confidence : "medium",
    status,
    tags: Array.isArray(claim.tags) ? claim.tags.map((tag) => cleanText(tag)).filter(Boolean).slice(0, 12) : [],
    source_links: links,
    created_at: cleanText(claim.created_at, generatedAt),
    updated_at: cleanText(claim.updated_at, generatedAt)
  };
}

export function normalizeResearchClaims(claims: Array<Partial<ResearchClaim>> | undefined, savedResults: ResearchResult[] = []): ResearchClaim[] {
  return (claims ?? [])
    .map((claim) => normalizeResearchClaim(claim, savedResults))
    .filter((claim): claim is ResearchClaim => Boolean(claim));
}

export function linkSourceToClaim(claims: ResearchClaim[], claimId: string, resultId: string, relation: ClaimEvidenceRelation, note?: string): ResearchClaim[] {
  const linkedAt = nowIso();
  return claims.map((claim) => {
    if (claim.id !== claimId) return claim;
    const existing = claim.source_links.find((link) => link.result_id === resultId);
    const source_links = existing
      ? claim.source_links.map((link) => link.result_id === resultId ? { ...link, relation, note: note?.trim() || link.note, linked_at: link.linked_at || linkedAt } : link)
      : [...claim.source_links, { result_id: resultId, relation, note: note?.trim() || undefined, linked_at: linkedAt }];
    return {
      ...claim,
      source_links,
      status: inferClaimStatus(source_links, claim.status),
      updated_at: linkedAt
    };
  });
}

export function unlinkSourceFromClaim(claims: ResearchClaim[], claimId: string, resultId: string): ResearchClaim[] {
  const updatedAt = nowIso();
  return claims.map((claim) => {
    if (claim.id !== claimId) return claim;
    const source_links = claim.source_links.filter((link) => link.result_id !== resultId);
    return {
      ...claim,
      source_links,
      status: inferClaimStatus(source_links, claim.status),
      updated_at: updatedAt
    };
  });
}

export function removeResultFromAllClaims(claims: ResearchClaim[], resultId: string): ResearchClaim[] {
  const updatedAt = nowIso();
  return claims.map((claim) => {
    if (!claim.source_links.some((link) => link.result_id === resultId)) return claim;
    const source_links = claim.source_links.filter((link) => link.result_id !== resultId);
    return {
      ...claim,
      source_links,
      status: inferClaimStatus(source_links, claim.status),
      updated_at: updatedAt
    };
  });
}

export function updateClaimMetadata(claims: ResearchClaim[], claimId: string, patch: Partial<Pick<ResearchClaim, "statement" | "description" | "confidence" | "status">>): ResearchClaim[] {
  const updatedAt = nowIso();
  return claims.map((claim) => {
    if (claim.id !== claimId) return claim;
    const statement = patch.statement !== undefined ? patch.statement.trim() : claim.statement;
    return {
      ...claim,
      statement: statement || claim.statement,
      description: patch.description !== undefined ? patch.description.trim() || undefined : claim.description,
      confidence: patch.confidence && isClaimConfidence(patch.confidence) ? patch.confidence : claim.confidence,
      status: patch.status && isClaimStatus(patch.status) ? patch.status : claim.status,
      updated_at: updatedAt
    };
  });
}

export function buildClaimMappingAudit(project: Pick<ResearchProject, "claims" | "saved_results">): ClaimMappingAudit {
  const claims = normalizeResearchClaims(project.claims, project.saved_results);
  const savedIds = new Set(project.saved_results.map((item) => item.id));
  const linkedSourceIds = new Set<string>();
  let sourceLinkCount = 0;
  let supportLinkCount = 0;
  let contradictionLinkCount = 0;
  let contextLinkCount = 0;
  let visualReferenceLinkCount = 0;

  for (const claim of claims) {
    for (const link of claim.source_links) {
      sourceLinkCount += 1;
      linkedSourceIds.add(link.result_id);
      if (link.relation === "supports") supportLinkCount += 1;
      if (link.relation === "contradicts" || link.relation === "weakens") contradictionLinkCount += 1;
      if (link.relation === "contextual") contextLinkCount += 1;
      if (link.relation === "visual_reference_only") visualReferenceLinkCount += 1;
    }
  }

  const warnings: string[] = [];
  const unlinkedSavedCount = Array.from(savedIds).filter((id) => !linkedSourceIds.has(id)).length;
  const underSupportedClaimCount = claims.filter((claim) => claim.status === "under_supported").length;
  const needsVerificationClaimCount = claims.filter((claim) => claim.status === "needs_verification").length;
  const contestedClaimCount = claims.filter((claim) => claim.status === "contested").length;
  const claimWithoutSupportCount = claims.filter((claim) => !claim.source_links.some((link) => link.relation === "supports")).length;

  if (claims.length === 0 && project.saved_results.length > 0) warnings.push("Saved sources exist, but no research claims have been created yet.");
  if (unlinkedSavedCount > 0) warnings.push(`${unlinkedSavedCount} saved source${unlinkedSavedCount === 1 ? " is" : "s are"} not linked to any claim.`);
  if (claimWithoutSupportCount > 0) warnings.push(`${claimWithoutSupportCount} claim${claimWithoutSupportCount === 1 ? " has" : "s have"} no direct supporting source.`);
  if (contestedClaimCount > 0) warnings.push(`${contestedClaimCount} claim${contestedClaimCount === 1 ? " is" : "s are"} contested by weakening or contradicting evidence.`);
  if (visualReferenceLinkCount > supportLinkCount && claims.length > 0) warnings.push("Visual-reference links outnumber supporting evidence links; verify factual support before export.");

  return {
    schema_version: CLAIM_MAPPING_SCHEMA_VERSION,
    generated_at: nowIso(),
    claim_count: claims.length,
    linked_claim_count: claims.filter((claim) => claim.source_links.length > 0).length,
    source_link_count: sourceLinkCount,
    support_link_count: supportLinkCount,
    contradiction_link_count: contradictionLinkCount,
    context_link_count: contextLinkCount,
    visual_reference_link_count: visualReferenceLinkCount,
    supported_claim_count: claims.filter((claim) => claim.status === "supported").length,
    contested_claim_count: contestedClaimCount,
    under_supported_claim_count: underSupportedClaimCount,
    needs_verification_claim_count: needsVerificationClaimCount,
    claim_without_support_count: claimWithoutSupportCount,
    unlinked_saved_count: unlinkedSavedCount,
    warnings
  };
}

export function claimsForResult(claims: ResearchClaim[], resultId: string): Array<{ claim: ResearchClaim; link: ClaimSourceLink }> {
  return claims.flatMap((claim) => claim.source_links
    .filter((link) => link.result_id === resultId)
    .map((link) => ({ claim, link })));
}
