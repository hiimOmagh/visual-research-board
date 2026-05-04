"use client";

import type { SourceClassRoutingTrace } from "@/types/research";

function entries(record: Record<string, number> | undefined): Array<[string, number]> {
  return Object.entries(record ?? {}).sort((a, b) => b[1] - a[1]);
}

export function SourceClassRoutingPanel({ trace }: { trace: SourceClassRoutingTrace }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Source-class routing diagnostics">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">v0.3.1 routing gate</p>
          <h2 className="mt-1 text-xl font-bold text-white">Query expansion + source-class routing</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Query variants are routed by source class so Commons/Openverse receive open-media queries, archives receive historical/document queries, NASA receives science branches, and search engines remain manual reference launchers.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
          <div className="rounded-2xl bg-black/25 p-3"><span className="block text-lg font-black text-white">{trace.query_variant_count}</span>variants</div>
          <div className="rounded-2xl bg-black/25 p-3"><span className="block text-lg font-black text-white">{trace.routed_provider_count}</span>providers</div>
          <div className="rounded-2xl bg-black/25 p-3"><span className="block text-lg font-black text-white">{trace.reference_launcher_count}</span>launchers</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white">Source-class coverage</h3>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            {entries(trace.source_class_counts).map(([label, count]) => (
              <div key={label} className="flex justify-between gap-3"><span>{label}</span><span className="font-semibold text-slate-100">{count}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white">Intent coverage</h3>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            {entries(trace.intent_counts).map(([label, count]) => (
              <div key={label} className="flex justify-between gap-3"><span>{label}</span><span className="font-semibold text-slate-100">{count}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold text-white">Provider query caps</h3>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            {entries(trace.provider_query_counts).map(([label, count]) => (
              <div key={label} className="flex justify-between gap-3"><span>{label}</span><span className="font-semibold text-slate-100">{count}</span></div>
            ))}
          </div>
        </div>
      </div>

      {trace.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-4 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Routing warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {trace.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
