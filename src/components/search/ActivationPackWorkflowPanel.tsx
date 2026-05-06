
import type { ActivationPackUiInput } from "@/types/activation-pack-ui";
import { createActivationPackUiModel } from "@/lib/activation-pack-ui";
import { ReferenceActivationPackPanel } from "@/components/search/ReferenceActivationPackPanel";
import { ActivationPackExportIntegrationPanel } from "@/components/search/ActivationPackExportIntegrationPanel";

type ActivationPackWorkflowPanelProps = ActivationPackUiInput;

export function ActivationPackWorkflowPanel(props: ActivationPackWorkflowPanelProps) {
  const model = createActivationPackUiModel(props);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Activation pack workflow
          </p>
          <h2 className="mt-1 text-lg font-semibold">Activation-ready board workflow</h2>
          <p className="mt-2 text-sm text-slate-300">
            Turn gathered references into a structured activation pack with source roles, visual direction,
            research context, risk/access notes, and next steps.
          </p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Mode</p>
            <p className="mt-1 font-medium">{model.mode}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available</p>
            <p className="mt-1 font-medium">{model.available_count}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Selected</p>
            <p className="mt-1 font-medium">{model.selected_results.length}</p>
          </div>
        </div>

        {model.empty_state ? (
          <div className="rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
            {model.empty_state}
          </div>
        ) : null}

        <ul className="space-y-1 text-xs text-slate-400">
          {model.guidance_notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>

        {model.pack ? <ReferenceActivationPackPanel pack={model.pack} /> : null}

        {model.pack ? <ActivationPackExportIntegrationPanel pack={model.pack} /> : null}

        <p className="text-xs text-slate-400">
          This UI integration does not generate images, scrape sources, extract copyrighted text, bypass paywalls,
          circumvent access controls, or expand exports. It only organizes existing board references.
        </p>
      </div>
    </section>
  );
}
