
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";

export const ACTIVATION_PACK_EXPORT_PREVIEW_FORMATS = [
  "markdown",
  "json"
] as const;

export type ActivationPackExportPreviewFormat = (typeof ACTIVATION_PACK_EXPORT_PREVIEW_FORMATS)[number];

export type ActivationPackExportPreview = {
  id: string;
  pack_id: string;
  format: ActivationPackExportPreviewFormat;
  title: string;
  body: string;
  line_count: number;
  character_count: number;
  source_count: number;
  constraints: string[];
};

export type ActivationPackExportPreviewInput = {
  pack: ReferenceActivationPack;
  format?: ActivationPackExportPreviewFormat;
};
