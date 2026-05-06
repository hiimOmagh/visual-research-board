
import type { BroadReferenceResult } from "@/types/broad-reference-result";
import type {
  ReferenceActivationPack,
  ReferenceActivationPackType
} from "@/types/reference-activation-pack";

export const ACTIVATION_PACK_UI_MODES = [
  "board",
  "selected",
  "empty",
  "review"
] as const;

export type ActivationPackUiMode = (typeof ACTIVATION_PACK_UI_MODES)[number];

export type ActivationPackUiInput = {
  title: string;
  query: string;
  results: BroadReferenceResult[];
  pack_type?: ReferenceActivationPackType;
  mode?: ActivationPackUiMode;
  selected_result_ids?: string[];
};

export type ActivationPackUiModel = {
  mode: ActivationPackUiMode;
  pack: ReferenceActivationPack | null;
  selected_results: BroadReferenceResult[];
  available_count: number;
  empty_state: string | null;
  primary_action_label: string;
  guidance_notes: string[];
};
