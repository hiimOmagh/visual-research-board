import type { BroadDiscoveryMode } from "@/types/broad-discovery";
import { createBroadDiscoveryQueryPlan, describeBroadDiscoveryMode } from "@/lib/broad-discovery";

type BroadDiscoveryModePanelProps = {
  query: string;
  mode?: BroadDiscoveryMode;
};

export function BroadDiscoveryModePanel({ query, mode = "broad" }: BroadDiscoveryModePanelProps) {
  const plan = createBroadDiscoveryQueryPlan(query, mode);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Broad web + image discovery
          </p>
          <h2 className="mt-1 text-lg font-semibold">{describeBroadDiscoveryMode(mode)}</h2>
          <p className="mt-2 text-sm text-slate-300">
            This mode plans broad discovery and maps candidates into broad reference results. It does not add
            providers, scraping, dedicated social search, book search, generation, or export changes.
          </p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Query</p>
            <p className="mt-1 font-medium">{plan.query || "No query yet"}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Safe/open only</p>
            <p className="mt-1 font-medium">{plan.safe_open_only ? "Yes" : "No"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Target source classes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {plan.target_source_classes.map((sourceClass) => (
              <span key={sourceClass} className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-200">
                {sourceClass}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Discovery remains broad by default. Risk/access labels inform review; they do not block discovery.
        </p>
      </div>
    </section>
  );
}
