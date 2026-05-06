import type { BroadReferenceResult, BroadReferenceSourceClass } from "@/types/broad-reference-result";

export const BROAD_DISCOVERY_MODES = [
  "broad",
  "web",
  "image",
  "visual",
  "safe_open"
] as const;

export type BroadDiscoveryMode = (typeof BROAD_DISCOVERY_MODES)[number];

export type BroadDiscoveryQueryPlan = {
  query: string;
  mode: BroadDiscoveryMode;
  target_source_classes: BroadReferenceSourceClass[];
  include_uncertain_rights: boolean;
  safe_open_only: boolean;
  notes: string[];
};

export type BroadDiscoveryCandidate = {
  id?: string;
  query: string;
  title?: string;
  description?: string;
  image_url?: string;
  source_url: string;
  display_url?: string;
  platform?: string;
  creator_or_author?: string;
  publisher?: string;
  date?: string;
  source_class_hint?: BroadReferenceSourceClass;
  relevance_score?: number;
};

export type BroadDiscoveryNormalizationResult = {
  result: BroadReferenceResult;
  mode: BroadDiscoveryMode;
  discovery_notes: string[];
};
