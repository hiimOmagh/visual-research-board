
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";
import type {
  ActivationPackExportPreview,
  ActivationPackExportPreviewFormat,
  ActivationPackExportPreviewInput
} from "@/types/activation-pack-export-preview";

export function createActivationPackExportPreview(
  input: ActivationPackExportPreviewInput
): ActivationPackExportPreview {
  const format = input.format ?? "markdown";
  const body = format === "json"
    ? createActivationPackJsonPreview(input.pack)
    : createActivationPackMarkdownPreview(input.pack);

  return {
    id: createStableActivationPackPreviewId(input.pack.id, format),
    pack_id: input.pack.id,
    format,
    title: `${input.pack.title} (${format} preview)`,
    body,
    line_count: body.split("\n").length,
    character_count: body.length,
    source_count: input.pack.source_roles.length,
    constraints: [
      "Preview only; no file download expansion is added in this milestone.",
      "No broad export system rewrite is performed.",
      "No scraping, image generation, copyrighted text extraction, paywall bypass, or access circumvention is performed.",
      "Review rights/access notes before publication, reuse, generation workflows, or production use."
    ]
  };
}

export function createActivationPackMarkdownPreview(pack: ReferenceActivationPack): string {
  const sourceLines = pack.source_roles.map((source, index) => {
    return `${index + 1}. ${source.title ?? source.source_url} — ${source.role}\n   - URL: ${source.source_url}\n   - Use: ${source.use_note}\n   - Risk/access: ${source.risk_access_note}`;
  });

  const riskLines = pack.risk_access_notes.map((note) => `- ${note}`);
  const nextStepLines = pack.activation_next_steps.map((step) => `- ${step}`);
  const constraintLines = pack.constraints.map((constraint) => `- ${constraint}`);

  return [
    `# ${pack.title}`,
    "",
    `Query: ${pack.query}`,
    `Pack type: ${pack.pack_type}`,
    `References: ${pack.created_from_result_count}`,
    "",
    "## Summary",
    pack.summary,
    "",
    `## ${pack.visual_direction.title}`,
    pack.visual_direction.body,
    "",
    `## ${pack.research_context.title}`,
    pack.research_context.body,
    "",
    "## Source roles",
    sourceLines.length > 0 ? sourceLines.join("\n") : "No source roles available.",
    "",
    "## Risk/access notes",
    riskLines.length > 0 ? riskLines.join("\n") : "- No risk/access notes available.",
    "",
    "## Activation next steps",
    nextStepLines.length > 0 ? nextStepLines.join("\n") : "- No next steps available.",
    "",
    "## Constraints",
    constraintLines.join("\n"),
    "",
    "Preview only. No file download expansion, scraping, image generation, copyrighted text extraction, paywall bypass, or access circumvention is performed."
  ].join("\n");
}

export function createActivationPackJsonPreview(pack: ReferenceActivationPack): string {
  return JSON.stringify(
    {
      schema: "activation_pack_export_preview",
      mode: "preview_only",
      pack,
      constraints: [
        "Preview only",
        "No broad export system rewrite",
        "No new download behavior",
        "No scraping",
        "No image generation",
        "No copyrighted text extraction",
        "No paywall bypass",
        "No access circumvention"
      ]
    },
    null,
    2
  );
}

export function listActivationPackPreviewFormats(): ActivationPackExportPreviewFormat[] {
  return ["markdown", "json"];
}

function createStableActivationPackPreviewId(packId: string, format: ActivationPackExportPreviewFormat): string {
  const seed = `${packId}:${format}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 43 + seed.charCodeAt(i)) >>> 0;
  }
  return "activation_preview_" + hash.toString(16);
}
