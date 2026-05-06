
import type {
  ActivationPackExportIntegrationInput,
  ActivationPackExportIntegrationState,
  ActivationPackExportPayload
} from "@/types/activation-pack-export-integration";
import type { ActivationPackExportPreviewFormat } from "@/types/activation-pack-export-preview";
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";
import { createActivationPackExportPreview } from "@/lib/activation-pack-export-preview";

export function createActivationPackExportPayload(
  input: ActivationPackExportIntegrationInput
): ActivationPackExportPayload {
  const format = input.format ?? "markdown";
  const preview = createActivationPackExportPreview({ pack: input.pack, format });
  const extension = format === "json" ? "json" : "md";
  const mimeType = format === "json" ? "application/json;charset=utf-8" : "text/markdown;charset=utf-8";
  const filename = createActivationPackExportFilename(input.pack, extension, input.filename_prefix);

  return {
    filename,
    mime_type: mimeType,
    format,
    body: preview.body,
    preview_id: preview.id,
    pack_id: input.pack.id,
    constraints: [
      "Metadata/brief-text export only.",
      "Uses existing text download utilities; no broad export system rewrite is performed.",
      "Markdown and JSON only.",
      "No scraping, image generation, copyrighted text extraction, paywall bypass, access circumvention, or source media rehosting is performed.",
      "Review rights/access notes before publication, reuse, generation workflows, or production use."
    ]
  };
}

export function createActivationPackExportIntegrationState(
  pack: ReferenceActivationPack
): ActivationPackExportIntegrationState {
  return {
    markdown: createActivationPackExportPayload({ pack, format: "markdown" }),
    json: createActivationPackExportPayload({ pack, format: "json" }),
    available_formats: ["markdown", "json"],
    integration_note:
      "Activation pack export integration connects preview text to existing download helpers without rewriting the export system."
  };
}

export function createActivationPackExportFilename(
  pack: ReferenceActivationPack,
  extension: "md" | "json",
  prefix = "activation-pack"
): string {
  const safeTitle = sanitizeFilenamePart(pack.title);
  return `${prefix}-${safeTitle}-${pack.id}.${extension}`;
}

export function listActivationPackExportFormats(): ActivationPackExportPreviewFormat[] {
  return ["markdown", "json"];
}

function sanitizeFilenamePart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "untitled";
}
