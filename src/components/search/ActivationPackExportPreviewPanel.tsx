
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";
import type { ActivationPackExportPreviewFormat } from "@/types/activation-pack-export-preview";
import { createActivationPackExportPreview } from "@/lib/activation-pack-export-preview";

type ActivationPackExportPreviewPanelProps = {
  pack: ReferenceActivationPack;
  format?: ActivationPackExportPreviewFormat;
};

export function ActivationPackExportPreviewPanel({
  pack,
  format = "markdown"
}: ActivationPackExportPreviewPanelProps) {
  const preview = createActivationPackExportPreview({ pack, format });

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Activation pack export preview
          </p>
          <h2 className="mt-1 text-lg font-semibold">{preview.title}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Preview the activation pack as structured Markdown or JSON text before any future export workflow.
          </p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Format</p>
            <p className="mt-1 font-medium">{preview.format}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sources</p>
            <p className="mt-1 font-medium">{preview.source_count}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Lines</p>
            <p className="mt-1 font-medium">{preview.line_count}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Characters</p>
            <p className="mt-1 font-medium">{preview.character_count}</p>
          </div>
        </div>

        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900/70 p-3 text-xs text-slate-300">
          {preview.body}
        </pre>

        <ul className="space-y-1 text-xs text-slate-400">
          {preview.constraints.map((constraint) => (
            <li key={constraint}>• {constraint}</li>
          ))}
        </ul>

        <p className="text-xs text-slate-400">
          This panel is preview-only. It does not add file downloads, rewrite exports, scrape sources,
          generate images, extract copyrighted text, bypass paywalls, or circumvent access controls.
        </p>
      </div>
    </section>
  );
}
