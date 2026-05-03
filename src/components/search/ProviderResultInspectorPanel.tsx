import type { ProviderResultInspection } from "@/types/research";

interface ProviderResultInspectorPanelProps {
  inspection: ProviderResultInspection;
}

export function ProviderResultInspectorPanel({ inspection }: ProviderResultInspectorPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Real provider result inspector">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Real provider result inspector</p>
          <h2 className="mt-1 text-xl font-bold text-white">{inspection.inspected_result_count} inspected candidates</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {inspection.active_provider_count}/{inspection.provider_count} active providers · {inspection.manual_review_candidate_count} candidates flagged for manual review.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-100">
          Provider inspection is a quality-control layer. It does not verify copyright clearance.
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {inspection.providers.map((provider) => (
          <article key={provider.provider} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold capitalize text-white">{provider.provider}</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">{provider.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <Metric label="Results" value={provider.result_count} />
              <Metric label="Images" value={provider.image_count} />
              <Metric label="Clear license" value={provider.clear_license_count} />
              <Metric label="Review" value={provider.review_candidate_ids.length} />
              <Metric label="Overall" value={`${Math.round(provider.average_overall * 100)}%`} />
              <Metric label="Visual" value={`${Math.round(provider.average_visual_quality * 100)}%`} />
            </div>
            {provider.warnings.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] leading-4 text-amber-100">
                {provider.warnings.slice(0, 3).map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>

      {inspection.warnings.length > 0 && (
        <details className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs text-amber-100">
          <summary className="cursor-pointer font-semibold">Inspection warnings</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {inspection.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </details>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-100">{value}</div>
    </div>
  );
}
