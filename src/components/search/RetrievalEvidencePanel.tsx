"use client";

import type { RetrievalEvidence } from "@/types/research";

function verdictLabel(verdict: RetrievalEvidence["verdict"]): string {
  const labels: Record<RetrievalEvidence["verdict"], string> = {
    passes_mvp_gate: "Passes MVP gate",
    needs_more_results: "Needs more results",
    needs_more_source_diversity: "Needs more source diversity",
    needs_better_ranking: "Needs better ranking",
    needs_review: "Needs review"
  };
  return labels[verdict];
}

function verdictClass(verdict: RetrievalEvidence["verdict"]): string {
  if (verdict === "passes_mvp_gate") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (verdict === "needs_more_results") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  return "border-blue-300/30 bg-blue-300/10 text-blue-100";
}

export function RetrievalEvidencePanel({ evidence }: { evidence: RetrievalEvidence }) {
  const sourceGroupEntries = Object.entries(evidence.source_group_counts)
    .filter(([, count]) => Number(count) > 0)
    .sort(([, a], [, b]) => Number(b) - Number(a));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Retrieval evidence gate">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Retrieval evidence</p>
          <h2 className="mt-1 text-xl font-bold text-white">Broad retrieval gate</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Measures whether the current search produced enough diverse, image-heavy, source-preserved candidates for creator curation.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${verdictClass(evidence.verdict)}`}>
          {verdictLabel(evidence.verdict)} · {(evidence.broad_retrieval_score * 100).toFixed(0)}%
        </span>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Candidates</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.total_candidates}/{evidence.target_candidate_count}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Images</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.image_candidates}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Saveable</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.saveable_candidates}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Source diversity</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.source_group_diversity} groups</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Active providers</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.active_provider_count}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Query branches</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.depth_branch_count}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Plan queries</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.query_count}</dd></div>
        <div className="rounded-2xl bg-black/20 p-3"><dt className="text-xs text-slate-500">Web context</dt><dd className="mt-1 text-lg font-bold text-white">{evidence.web_context_candidates}</dd></div>
      </dl>
      {sourceGroupEntries.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          {sourceGroupEntries.map(([group, count]) => (
            <span key={group} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {group.replaceAll("_", " ")}: {count}
            </span>
          ))}
        </div>
      )}
      {evidence.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
          <p className="font-semibold">Failure signals to correct:</p>
          <ul className="mt-1 list-disc pl-5">
            {evidence.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
