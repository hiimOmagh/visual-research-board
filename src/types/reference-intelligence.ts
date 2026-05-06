export const REFERENCE_USE_AS_OPTIONS = [
  "visual_inspiration",
  "composition_reference",
  "style_reference",
  "color_reference",
  "historical_context",
  "topic_context",
  "claim_support",
  "generation_seed",
  "moodboard_item",
  "research_anchor"
] as const;

export type ReferenceUseAs = (typeof REFERENCE_USE_AS_OPTIONS)[number];

export const REFERENCE_EVIDENCE_ROLE_OPTIONS = [
  "inspiration",
  "context",
  "claim_support",
  "visual_context",
  "contradiction",
  "bibliography",
  "generation_direction"
] as const;

export type ReferenceEvidenceRole = (typeof REFERENCE_EVIDENCE_ROLE_OPTIONS)[number];

export const REFERENCE_ACCESS_STATUS_OPTIONS = [
  "open",
  "preview_only",
  "platform_restricted",
  "paywalled",
  "owned_or_user_supplied",
  "unknown"
] as const;

export type ReferenceAccessStatus = (typeof REFERENCE_ACCESS_STATUS_OPTIONS)[number];

export const REFERENCE_RIGHTS_STATUS_OPTIONS = [
  "public_domain",
  "open_license",
  "likely_copyrighted",
  "unclear",
  "unknown"
] as const;

export type ReferenceRightsStatus = (typeof REFERENCE_RIGHTS_STATUS_OPTIONS)[number];

export const REFERENCE_RISK_LEVEL_OPTIONS = [
  "low",
  "medium",
  "high",
  "unknown"
] as const;

export type ReferenceRiskLevel = (typeof REFERENCE_RISK_LEVEL_OPTIONS)[number];

export type ReferenceIntelligence = {
  use_as: ReferenceUseAs[];
  evidence_role: ReferenceEvidenceRole;
  access_status: ReferenceAccessStatus;
  rights_status: ReferenceRightsStatus;
  risk_level: ReferenceRiskLevel;
  interpretation_note?: string;
  generation_note?: string;
  confidence: "low" | "medium" | "high";
};

export type ReferenceIntelligenceSummary = {
  strongest_use: ReferenceUseAs | "unclassified";
  evidence_role: ReferenceEvidenceRole;
  risk_level: ReferenceRiskLevel;
  confidence: "low" | "medium" | "high";
  activation_ready: boolean;
};
