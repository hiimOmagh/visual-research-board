"use client";

import type { ProviderHealth } from "@/types/research";

const statusClass: Record<ProviderHealth["status"], string> = {
  active: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  no_results: "border-blue-300/35 bg-blue-300/10 text-blue-100",
  missing_key: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  skipped: "border-slate-300/20 bg-slate-300/5 text-slate-300",
  error: "border-red-400/35 bg-red-400/10 text-red-100",
  timeout: "border-orange-400/35 bg-orange-400/10 text-orange-100"
};

function statusLabel(status: ProviderHealth["status"]): string {
  const labels: Record<ProviderHealth["status"], string> = {
    active: "Active",
    no_results: "No results",
    missing_key: "Missing key",
    skipped: "Skipped",
    error: "Error",
    timeout: "Timeout"
  };
  return labels[status];
}

function typeSummary(item: ProviderHealth): string {
  const entries = Object.entries(item.result_type_counts ?? {}).filter(([, count]) => Number(count) > 0);
  if (entries.length === 0) return "No typed results";
  return entries.map(([type, count]) => `${type}: ${count}`).join(" · ");
}

export function ProviderHealthPanel({ health }: { health: ProviderHealth[] }) {
  if (health.length === 0) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Provider health</p>
          <h2 className="mt-1 text-xl font-bold text-white">Search adapters</h2>
        </div>
        <p className="text-xs text-slate-400">Alpha.9 records endpoint samples, missing keys, typed counts, and provider-specific failures.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {health.map((item) => (
          <article key={item.provider} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold capitalize text-white">{item.provider}</h3>
              <span className={`rounded-full border px-2 py-1 text-[11px] ${statusClass[item.status]}`}>{statusLabel(item.status)}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="rounded-xl bg-white/5 p-2"><dt className="text-slate-500">Results</dt><dd className="font-semibold text-slate-100">{item.result_count}</dd></div>
              <div className="rounded-xl bg-white/5 p-2"><dt className="text-slate-500">Time</dt><dd className="font-semibold text-slate-100">{item.duration_ms} ms</dd></div>
              <div className="rounded-xl bg-white/5 p-2"><dt className="text-slate-500">Queries</dt><dd className="font-semibold text-slate-100">{item.queries_used}</dd></div>
              <div className="rounded-xl bg-white/5 p-2"><dt className="text-slate-500">Enabled</dt><dd className="font-semibold text-slate-100">{item.enabled ? "Yes" : "No"}</dd></div>
            </dl>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">{typeSummary(item)}</p>
            {item.missing_env && <p className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-[11px] leading-5 text-amber-100">Missing environment variable: <span className="font-semibold">{item.missing_env}</span></p>}
            {item.endpoint_sample && item.endpoint_sample.length > 0 && <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-slate-500">Endpoints: {item.endpoint_sample.join(" · ")}</p>}
            {item.query_sample.length > 0 && <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">Queries: {item.query_sample.join(" · ")}</p>}
            {item.message && <p className="mt-3 text-xs leading-5 text-slate-400">{item.message}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
