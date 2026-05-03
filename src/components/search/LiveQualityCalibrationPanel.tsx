"use client";

import type { RetrievalQualityCalibration } from "@/types/research";

type Verdict = RetrievalQualityCalibration["verdict"];

const verdictLabels: Record<Verdict, string> = {
  passes_creator_gate: "Passes creator gate",
  needs_more_relevance: "Needs more relevance",
  needs_more_visuals: "Needs more visuals",
  needs_stronger_sources: "Needs stronger sources",
  needs_license_clarity: "Needs license clarity",
  needs_real_provider_evidence: "Needs real-provider evidence",
  needs_manual_review: "Needs manual review"
};

function verdictClass(verdict: Verdict): string {
  if (verdict === "passes_creator_gate") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (verdict === "needs_real_provider_evidence" || verdict === "needs_license_clarity") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  return "border-blue-300/30 bg-blue-300/10 text-blue-100";
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function LiveQualityCalibrationPanel({ calibration }: { calibration: RetrievalQualityCalibration }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Live retrieval quality calibration">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Quality calibration</p>
          <h2 className="mt-1 text-xl font-bold text-white">Live retrieval creator gate</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Measures whether real search output is not only broad, but relevant, visual, source-diverse, and usable for creator curation.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${verdictClass(calibration.verdict)}`}>
          {verdictLabels[calibration.verdict]} · {percent(calibration.calibration_score)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Relevant" value={`${calibration.relevant_candidates}/${calibration.target_relevant_candidates}`} />
        <Metric label="Strong candidates" value={`${calibration.strong_candidates}/${calibration.expectations.strong_candidate_target}`} />
        <Metric label="High visual" value={String(calibration.high_visual_candidates)} />
        <Metric label="Strong sources" value={String(calibration.strong_source_candidates)} />
        <Metric label="Clear license" value={String(calibration.clear_license_candidates)} />
        <Metric label="Top-10 overall" value={percent(calibration.top10_average_overall)} />
        <Metric label="Top-10 relevance" value={percent(calibration.top10_average_relevance)} />
        <Metric label="Top-10 visual" value={percent(calibration.top10_average_visual_quality)} />
        <Metric label="Top-10 diversity" value={`${calibration.top10_source_diversity}/${calibration.expectations.source_diversity_target}`} />
        <Metric label="Real-provider share" value={percent(calibration.real_provider_share)} />
        <Metric label="Image share" value={percent(calibration.image_share)} />
        <Metric label="Mock results" value={String(calibration.mock_result_count)} />
      </dl>

      {calibration.top_candidate_ids.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-300">
          <p className="font-semibold text-slate-200">Top calibrated candidate IDs</p>
          <p className="mt-1 break-words text-slate-400">{calibration.top_candidate_ids.join(" · ")}</p>
        </div>
      )}

      {calibration.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Calibration failure signals:</p>
          <ul className="mt-1 list-disc pl-5">
            {calibration.warnings.map((warning) => <li key={warning}>{warning}</li>)}
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
      <dd className="mt-1 text-lg font-bold text-white">{value}</dd>
    </div>
  );
}
