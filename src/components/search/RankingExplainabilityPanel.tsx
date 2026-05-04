"use client";

import type { RankingExplainabilityAudit } from "@/types/research";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function RankingExplainabilityPanel({ audit }: { audit: RankingExplainabilityAudit }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Ranking explainability and calibration audit">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">v0.3.1 ranking gate</p>
          <h2 className="mt-1 text-xl font-bold text-white">Ranking explainability + calibration audit</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Every ranked candidate now carries an explicit score breakdown, review-evidence delta, confidence label, and warning trail.
          </p>
        </div>
        <span className="w-fit rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-semibold text-lime-100">
          {audit.explained_result_count} explained · {audit.review_adjusted_result_count} review-adjusted
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Explained results" value={String(audit.explained_result_count)} />
        <Metric label="Top explained" value={String(audit.top_explained_count)} />
        <Metric label="Strong/moderate" value={`${audit.strong_explanation_count}/${audit.moderate_explanation_count}`} />
        <Metric label="Weak/conflicting" value={`${audit.weak_explanation_count}/${audit.conflicting_explanation_count}`} />
        <Metric label="Review adjusted" value={String(audit.review_adjusted_result_count)} />
        <Metric label="Positive review deltas" value={String(audit.positive_review_delta_count)} />
        <Metric label="Negative review deltas" value={String(audit.negative_review_delta_count)} />
        <Metric label="Avg abs review delta" value={pct(audit.average_absolute_review_delta)} />
      </dl>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold text-slate-200">Review evidence state</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full border px-3 py-1 ${audit.sparse_review_evidence ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-lime-300/30 bg-lime-300/10 text-lime-100"}`}>
              sparse review evidence: {audit.sparse_review_evidence ? "yes" : "no"}
            </span>
            <span className={`rounded-full border px-3 py-1 ${audit.conflicting_review_evidence ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-lime-300/30 bg-lime-300/10 text-lime-100"}`}>
              conflicting review evidence: {audit.conflicting_review_evidence ? "yes" : "no"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold text-slate-200">Top explained IDs</p>
          <p className="mt-2 break-words text-xs leading-5 text-slate-400">{audit.top_result_ids.join(" · ") || "No ranked results yet."}</p>
        </div>
      </div>

      {audit.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Calibration audit warnings:</p>
          <ul className="mt-1 list-disc pl-5">
            {audit.warnings.map((warning) => <li key={warning}>{warning}</li>)}
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
