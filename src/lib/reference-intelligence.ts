import type {
  ReferenceAccessStatus,
  ReferenceEvidenceRole,
  ReferenceIntelligence,
  ReferenceIntelligenceSummary,
  ReferenceRightsStatus,
  ReferenceRiskLevel,
  ReferenceUseAs
} from "@/types/reference-intelligence";

export const DEFAULT_REFERENCE_INTELLIGENCE: ReferenceIntelligence = {
  use_as: ["research_anchor"],
  evidence_role: "context",
  access_status: "unknown",
  rights_status: "unknown",
  risk_level: "unknown",
  confidence: "low"
};

const lowRiskAccessStatuses: ReferenceAccessStatus[] = ["open", "owned_or_user_supplied"];
const highRiskAccessStatuses: ReferenceAccessStatus[] = ["platform_restricted", "paywalled"];
const lowRiskRightsStatuses: ReferenceRightsStatus[] = ["public_domain", "open_license"];
const highRiskRightsStatuses: ReferenceRightsStatus[] = ["likely_copyrighted", "unclear"];

export function createReferenceIntelligence(input: Partial<ReferenceIntelligence> = {}): ReferenceIntelligence {
  const useAs = input.use_as && input.use_as.length > 0 ? input.use_as : DEFAULT_REFERENCE_INTELLIGENCE.use_as;

  return {
    ...DEFAULT_REFERENCE_INTELLIGENCE,
    ...input,
    use_as: [...new Set(useAs)]
  };
}

export function inferReferenceRiskLevel(
  accessStatus: ReferenceAccessStatus,
  rightsStatus: ReferenceRightsStatus
): ReferenceRiskLevel {
  if (lowRiskAccessStatuses.includes(accessStatus) && lowRiskRightsStatuses.includes(rightsStatus)) {
    return "low";
  }

  if (highRiskAccessStatuses.includes(accessStatus) || highRiskRightsStatuses.includes(rightsStatus)) {
    return "high";
  }

  if (accessStatus === "unknown" || rightsStatus === "unknown") {
    return "unknown";
  }

  return "medium";
}

export function summarizeReferenceIntelligence(
  intelligence: Partial<ReferenceIntelligence> | undefined
): ReferenceIntelligenceSummary {
  const normalized = createReferenceIntelligence(intelligence);
  const strongestUse: ReferenceUseAs | "unclassified" = normalized.use_as[0] ?? "unclassified";

  return {
    strongest_use: strongestUse,
    evidence_role: normalized.evidence_role,
    risk_level: normalized.risk_level,
    confidence: normalized.confidence,
    activation_ready:
      normalized.use_as.length > 0 &&
      normalized.confidence !== "low" &&
      normalized.risk_level !== "high"
  };
}

export function describeReferenceUse(useAs: ReferenceUseAs): string {
  const labels: Record<ReferenceUseAs, string> = {
    visual_inspiration: "Visual inspiration",
    composition_reference: "Composition reference",
    style_reference: "Style reference",
    color_reference: "Color reference",
    historical_context: "Historical context",
    topic_context: "Topic context",
    claim_support: "Claim support",
    generation_seed: "Generation seed",
    moodboard_item: "Moodboard item",
    research_anchor: "Research anchor"
  };

  return labels[useAs];
}

export function describeEvidenceRole(role: ReferenceEvidenceRole): string {
  const labels: Record<ReferenceEvidenceRole, string> = {
    inspiration: "Inspiration",
    context: "Context",
    claim_support: "Claim support",
    visual_context: "Visual context",
    contradiction: "Contradiction",
    bibliography: "Bibliography",
    generation_direction: "Generation direction"
  };

  return labels[role];
}
