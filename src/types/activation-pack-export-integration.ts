
import type { ActivationPackExportPreviewFormat } from "@/types/activation-pack-export-preview";
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";

export const ACTIVATION_PACK_EXPORT_INTEGRATION_FORMATS = [
  "markdown",
  "json"
] as const;

export type ActivationPackExportIntegrationFormat = (typeof ACTIVATION_PACK_EXPORT_INTEGRATION_FORMATS)[number];

export type ActivationPackExportPayload = {
  filename: string;
  mime_type: "text/markdown;charset=utf-8" | "application/json;charset=utf-8";
  format: ActivationPackExportIntegrationFormat;
  body: string;
  preview_id: string;
  pack_id: string;
  constraints: string[];
};

export type ActivationPackExportIntegrationInput = {
  pack: ReferenceActivationPack;
  format?: ActivationPackExportPreviewFormat;
  filename_prefix?: string;
};

export type ActivationPackExportIntegrationState = {
  markdown: ActivationPackExportPayload;
  json: ActivationPackExportPayload;
  available_formats: ActivationPackExportIntegrationFormat[];
  integration_note: string;
};
