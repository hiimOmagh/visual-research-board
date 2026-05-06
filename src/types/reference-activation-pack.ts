
import type { BroadReferenceResult } from "@/types/broad-reference-result";

export const REFERENCE_ACTIVATION_PACK_TYPES = [
  "research_brief",
  "visual_direction",
  "creative_brief",
  "source_map",
  "production_notes",
  "moodboard_brief",
  "claim_context_pack"
] as const;

export type ReferenceActivationPackType = (typeof REFERENCE_ACTIVATION_PACK_TYPES)[number];

export const REFERENCE_ACTIVATION_SOURCE_ROLES = [
  "context_anchor",
  "visual_reference",
  "claim_support",
  "bibliography",
  "trend_signal",
  "contradiction",
  "moodboard_asset",
  "style_direction",
  "risk_note"
] as const;

export type ReferenceActivationSourceRole = (typeof REFERENCE_ACTIVATION_SOURCE_ROLES)[number];

export type ReferenceActivationSource = {
  result_id: string;
  source_url: string;
  title?: string;
  source_class: BroadReferenceResult["source_class"];
  role: ReferenceActivationSourceRole;
  use_note: string;
  risk_access_note: string;
};

export type ReferenceActivationPackSection = {
  id: string;
  title: string;
  body: string;
  source_ids: string[];
};

export type ReferenceActivationPack = {
  id: string;
  title: string;
  query: string;
  pack_type: ReferenceActivationPackType;
  summary: string;
  visual_direction: ReferenceActivationPackSection;
  research_context: ReferenceActivationPackSection;
  source_roles: ReferenceActivationSource[];
  risk_access_notes: string[];
  activation_next_steps: string[];
  constraints: string[];
  created_from_result_count: number;
};

export type ReferenceActivationPackInput = {
  id?: string;
  title: string;
  query: string;
  pack_type?: ReferenceActivationPackType;
  results: BroadReferenceResult[];
  summary?: string;
};
