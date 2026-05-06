import type { ReferenceIntelligence } from "@/types/reference-intelligence";

export const BROAD_REFERENCE_SOURCE_CLASSES = [
  "web_image",
  "web_page",
  "social_media",
  "book",
  "archive",
  "museum",
  "stock",
  "video",
  "unknown"
] as const;

export type BroadReferenceSourceClass = (typeof BROAD_REFERENCE_SOURCE_CLASSES)[number];

export const BROAD_REFERENCE_ACCESS_STATUSES = [
  "open",
  "preview_only",
  "platform_restricted",
  "paywalled",
  "owned_or_user_supplied",
  "unknown"
] as const;

export type BroadReferenceAccessStatus = (typeof BROAD_REFERENCE_ACCESS_STATUSES)[number];

export const BROAD_REFERENCE_RIGHTS_STATUSES = [
  "public_domain",
  "open_license",
  "likely_copyrighted",
  "unclear",
  "unknown"
] as const;

export type BroadReferenceRightsStatus = (typeof BROAD_REFERENCE_RIGHTS_STATUSES)[number];

export const BROAD_REFERENCE_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "unknown"
] as const;

export type BroadReferenceRiskLevel = (typeof BROAD_REFERENCE_RISK_LEVELS)[number];

export type BroadReferenceResult = {
  id: string;
  query: string;
  title?: string;
  description?: string;
  image_url?: string;
  source_url: string;
  display_url?: string;
  source_class: BroadReferenceSourceClass;
  platform?: string;
  creator_or_author?: string;
  publisher?: string;
  date?: string;
  access_status: BroadReferenceAccessStatus;
  rights_status: BroadReferenceRightsStatus;
  risk_level: BroadReferenceRiskLevel;
  relevance_score?: number;
  evidence_notes?: string[];
  reference_intelligence?: Partial<ReferenceIntelligence>;
};

export type BroadReferenceResultSummary = {
  id: string;
  source_class: BroadReferenceSourceClass;
  access_status: BroadReferenceAccessStatus;
  rights_status: BroadReferenceRightsStatus;
  risk_level: BroadReferenceRiskLevel;
  has_visual: boolean;
  has_source_url: boolean;
  needs_review: boolean;
};
