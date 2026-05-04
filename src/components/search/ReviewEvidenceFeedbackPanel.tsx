"use client";

import type { ReviewEvidenceCalibrationTrace } from "@/types/research";

function pct(value?: number): string {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

function delta(before?: number, after?: number): string {
  if (typeof before !== "number" || typeof after !== "number") return "—";
  const value = Math.round((after - before) * 100);
  return `${value > 0 ? "+" : ""}${value} pts`;
}

export function ReviewEvidenceFeedbackPanel({ trace }: { trace: ReviewEvidenceCalibrationTrace }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Review-evidence feedback calibration">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Review feedback</p>
          <h2 className="mt-1 text-xl font-bold text-white">Review-evidence feedback into ranking calibration</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Converts saved-board manual reviews into conservative ranking signals for repeated domains, source groups, providers, and exact sources.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${trace.applied ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : "border-slate-300/20 bg-slate-300/10 text-slate-200"}`}>
          {trace.applied ? "Applied" : "Observed"} · {pct(trace.feedback_confidence)} confidence
        </span>
      </div>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-300">
        {trace.reason}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Reviewed" value={String(trace.reviewed_result_count)} />
        <Metric label="Approved/rejected" value={`${trace.approved_count}/${trace.rejected_count}`} />
        <Metric label="Adjusted results" value={String(trace.adjusted_result_count)} />
        <Metric label="Exact matches" value={String(trace.exact_source_matches)} />
        <Metric label="Positive hits" value={String(trace.positive_bias_hits)} />
        <Metric label="Negative hits" value={String(trace.negative_bias_hits)} />
        <Metric label="Calibration delta" value={delta(trace.before.calibration_score, trace.after.calibration_score)} />
        <Metric label="Strong candidates" value={`${trace.before.strong_candidates ?? "—"} → ${trace.after.strong_candidates ?? "—"}`} />
        <Metric label="Top-10 overall" value={`${pct(trace.before.top10_average_overall)} → ${pct(trace.after.top10_average_overall)}`} />
        <Metric label="Top-10 diversity" value={`${trace.before.top10_source_diversity ?? "—"} → ${trace.after.top10_source_diversity ?? "—"}`} />
        <Metric label="Top-10 approved signal" value={String(trace.top10_approved_signal_count)} />
        <Metric label="Top-10 rejected signal" value={String(trace.top10_rejected_signal_count)} />
      </dl>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <BiasList title="Domain bias" entries={trace.domain_bias} />
        <BiasList title="Source-group bias" entries={trace.source_group_bias} />
        <BiasList title="Provider bias" entries={trace.provider_bias} />
      </div>

      {trace.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Review feedback limits:</p>
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

function BiasList({ title, entries }: { title: string; entries: ReviewEvidenceCalibrationTrace["domain_bias"] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-semibold text-slate-200">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">No stable signal yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          {entries.slice(0, 6).map((entry) => (
            <li key={entry.key} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate">{entry.label}</span>
              <span className={entry.weight >= 0 ? "text-lime-200" : "text-amber-200"}>{entry.weight.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
