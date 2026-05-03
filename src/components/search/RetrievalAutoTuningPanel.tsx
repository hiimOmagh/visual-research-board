"use client";

import type { RetrievalAutoTuningTrace } from "@/types/research";

function percentDelta(value?: number): string {
  if (typeof value !== "number") return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value * 100)} pts`;
}

function candidateDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

export function RetrievalAutoTuningPanel({ trace }: { trace: RetrievalAutoTuningTrace }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Retrieval weak-case auto-tuning">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Auto-tuning</p>
          <h2 className="mt-1 text-xl font-bold text-white">Retrieval weak-case correction</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Uses retrieval and creator-gate failures to expand query branches, bias stronger providers/sources, and rerank with source diversity.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${trace.applied ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : "border-slate-300/20 bg-slate-300/10 text-slate-200"}`}>
          {trace.applied ? "Applied" : "Not applied"}
        </span>
      </div>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-300">
        {trace.reason}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Candidate delta" value={candidateDelta(trace.candidate_delta)} />
        <Metric label="Initial candidates" value={String(trace.initial_candidate_count)} />
        <Metric label="Final candidates" value={String(trace.final_candidate_count)} />
        <Metric label="Calibration delta" value={percentDelta(trace.calibration_delta)} />
        <Metric label="Initial quality" value={trace.initial_quality_verdict ?? "—"} />
        <Metric label="Final quality" value={trace.final_quality_verdict ?? "—"} />
        <Metric label="Initial retrieval" value={trace.initial_evidence_verdict ?? "—"} />
        <Metric label="Final retrieval" value={trace.final_evidence_verdict ?? "—"} />
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
          <p className="text-xs font-semibold text-slate-200">Provider weights</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
            {Object.entries(trace.provider_weights).map(([provider, weight]) => (
              <span key={provider}>{provider}: {weight.toFixed(2)}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold text-slate-200">Tuned source targets</p>
          <p className="mt-2 text-xs text-slate-400">{trace.source_targets.join(" · ")}</p>
          <p className="mt-2 text-xs text-slate-500">Rerank profile: {trace.rerank_profile}</p>
        </div>
      </div>

      {trace.added_queries.length > 0 && (
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
          <summary className="cursor-pointer font-semibold text-slate-200">Auto-added query branches ({trace.added_queries.length})</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {trace.added_queries.slice(0, 12).map((query) => <li key={query}>{query}</li>)}
          </ul>
        </details>
      )}

      {trace.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Signals used for tuning:</p>
          <ul className="mt-1 list-disc pl-5">
            {trace.warnings.map((warning) => <li key={warning}>{warning}</li>)}
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
