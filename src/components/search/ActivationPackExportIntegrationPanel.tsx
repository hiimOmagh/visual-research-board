
"use client";

import type { ReferenceActivationPack } from "@/types/reference-activation-pack";
import { createActivationPackExportIntegrationState } from "@/lib/activation-pack-export-integration";
import { downloadTextFile } from "@/lib/export";

type ActivationPackExportIntegrationPanelProps = {
  pack: ReferenceActivationPack;
};

export function ActivationPackExportIntegrationPanel({ pack }: ActivationPackExportIntegrationPanelProps) {
  const state = createActivationPackExportIntegrationState(pack);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Activation pack export integration
          </p>
          <h2 className="mt-1 text-lg font-semibold">Download metadata / brief text</h2>
          <p className="mt-2 text-sm text-slate-300">
            Export the activation pack as Markdown or JSON using existing text download utilities.
          </p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-2">
          <button
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left text-slate-100 hover:bg-slate-800"
            onClick={() => downloadTextFile(state.markdown.filename, state.markdown.body, state.markdown.mime_type)}
          >
            <span className="block text-xs uppercase tracking-wide text-slate-500">Markdown</span>
            <span className="mt-1 block font-medium">{state.markdown.filename}</span>
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-left text-slate-100 hover:bg-slate-800"
            onClick={() => downloadTextFile(state.json.filename, state.json.body, state.json.mime_type)}
          >
            <span className="block text-xs uppercase tracking-wide text-slate-500">JSON</span>
            <span className="mt-1 block font-medium">{state.json.filename}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">{state.integration_note}</p>

        <ul className="space-y-1 text-xs text-slate-400">
          {state.markdown.constraints.map((constraint) => (
            <li key={constraint}>• {constraint}</li>
          ))}
        </ul>

        <p className="text-xs text-slate-400">
          This integration is metadata/brief-text only. It does not rewrite exports, scrape sources,
          generate images, extract copyrighted text, bypass paywalls, circumvent access controls,
          or rehost source media.
        </p>
      </div>
    </section>
  );
}
