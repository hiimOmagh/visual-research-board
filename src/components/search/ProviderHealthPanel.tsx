"use client";

import type { ProviderHealth } from "@/types/research";

const statusClass: Record<ProviderHealth["status"], string> = {
  active: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  missing_key: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  skipped: "border-slate-300/20 bg-slate-300/5 text-slate-300",
  error: "border-red-400/35 bg-red-400/10 text-red-100",
  timeout: "border-orange-400/35 bg-orange-400/10 text-orange-100"
};

function statusLabel(status: ProviderHealth["status"]): string {
  const labels: Record<ProviderHealth["status"], string> = {
    active: "Active",
    missing_key: "Missing key",
    skipped: "Skipped",
    error: "Error",
    timeout: "Timeout"
  };
  return labels[status];
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
        <p className="text-xs text-slate-400">Missing keys are expected unless you add them in .env.local.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {health.map((item) => (
          <article key={item.provider} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold capitalize text-white">{item.provider}</h3>
              <span className={`rounded-full border px-2 py-1 text-[11px] ${statusClass[item.status]}`}>
                {statusLabel(item.status)}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="rounded-xl bg-white/5 p-2">
                <dt className="text-slate-500">Results</dt>
                <dd className="font-semibold text-slate-100">{item.result_count}</dd>
              </div>
              <div className="rounded-xl bg-white/5 p-2">
                <dt className="text-slate-500">Time</dt>
                <dd className="font-semibold text-slate-100">{item.duration_ms} ms</dd>
              </div>
            </dl>
            {item.message && <p className="mt-3 text-xs leading-5 text-slate-400">{item.message}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
