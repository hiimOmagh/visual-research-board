"use client";

import type { EvidenceDrivenTuningTrace } from "@/types/research";

function pct(value?: number): string {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

function delta(before?: number, after?: number): string {
  if (typeof before !== "number" || typeof after !== "number") return "—";
  const value = Math.round((after - before) * 100);
  return `${value > 0 ? "+" : ""}${value} pts`;
}

export function EvidenceDrivenTuningPanel({ trace }: { trace: EvidenceDrivenTuningTrace }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Evidence-driven ranking and query tuning">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Evidence tuning</p>
          <h2 className="mt-1 text-xl font-bold text-white">Evidence-driven ranking/query tuning</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Converts real-topic matrix, retrieval evidence, creator-gate, source, license, and provider signals into query hints and ranking weights.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${trace.applied ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : "border-slate-300/20 bg-slate-300/10 text-slate-200"}`}>
          {trace.verdict.replaceAll("_", " ")}
        </span>
      </div>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-300">
        {trace.reason}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Mode/depth" value={`${trace.mode_profile} · ${trace.depth_profile}`} />
        <Metric label="Candidates" value={`${trace.before.candidate_count} → ${trace.after.candidate_count}`} />
        <Metric label="Calibration delta" value={delta(trace.before.calibration_score, trace.after.calibration_score)} />
        <Metric label="Source diversity" value={`${trace.before.source_diversity} → ${trace.after.source_diversity}`} />
        <Metric label="Image share" value={`${pct(trace.before.image_share)} → ${pct(trace.after.image_share)}`} />
        <Metric label="Real-provider share" value={`${pct(trace.before.real_provider_share)} → ${pct(trace.after.real_provider_share)}`} />
        <Metric label="Weak metrics" value={trace.weak_metrics.length ? String(trace.weak_metrics.length) : "none"} />
        <Metric label="Query hints" value={String(trace.query_hints.length)} />
      </dl>

      {trace.actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          {trace.actions.map((action) => (
            <span key={action} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {action.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold text-slate-200">Score weight profile</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
            {Object.entries(trace.score_weight_profile).map(([key, value]) => (
              <span key={key}>{key.replaceAll("_", " ")}: {value.toFixed(2)}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold text-slate-200">Provider bias</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
            {Object.entries(trace.provider_bias).map(([provider, value]) => (
              <span key={provider}>{provider}: {Number(value).toFixed(2)}</span>
            ))}
          </div>
        </div>
      </div>

      {trace.query_hints.length > 0 && (
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
          <summary className="cursor-pointer font-semibold text-slate-200">Evidence query hints ({trace.query_hints.length})</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {trace.query_hints.slice(0, 14).map((hint) => <li key={hint}>{hint}</li>)}
          </ul>
        </details>
      )}

      {trace.weak_metrics.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Weak metrics corrected:</p>
          <ul className="mt-1 list-disc pl-5">
            {trace.weak_metrics.map((metric) => <li key={metric}>{metric.replaceAll("_", " ")}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-white">{value}</dd>
    </div>
  );
}
