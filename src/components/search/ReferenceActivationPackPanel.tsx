
import type { ReferenceActivationPack } from "@/types/reference-activation-pack";

type ReferenceActivationPackPanelProps = {
  pack: ReferenceActivationPack;
};

export function ReferenceActivationPackPanel({ pack }: ReferenceActivationPackPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Reference activation pack
          </p>
          <h2 className="mt-1 text-lg font-semibold">{pack.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{pack.summary}</p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pack type</p>
            <p className="mt-1 font-medium">{pack.pack_type}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">References</p>
            <p className="mt-1 font-medium">{pack.created_from_result_count}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Mode</p>
            <p className="mt-1 font-medium">Metadata / brief text</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl bg-slate-900/70 p-3">
            <h3 className="text-sm font-semibold">{pack.visual_direction.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{pack.visual_direction.body}</p>
          </article>

          <article className="rounded-xl bg-slate-900/70 p-3">
            <h3 className="text-sm font-semibold">{pack.research_context.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{pack.research_context.body}</p>
          </article>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Source roles</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {pack.source_roles.map((source) => (
              <li key={source.result_id} className="rounded-xl bg-slate-900/70 p-3">
                <span className="font-medium text-slate-100">{source.title ?? source.source_url}</span>
                <span className="ml-2 text-xs text-slate-500">({source.role})</span>
                <p className="mt-1 text-xs text-slate-400">{source.use_note}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-400">
          This pack does not perform image generation, scraping, copyrighted text extraction, paywall bypass,
          or broad export expansion. It organizes gathered references into structured activation notes.
        </p>
      </div>
    </section>
  );
}
