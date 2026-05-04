import type { ProjectReviewEvidenceMemory, ProjectReviewEvidenceMemoryAudit } from "@/types/research";

interface ProjectReviewMemoryPanelProps {
  memory: ProjectReviewEvidenceMemory;
  audit: ProjectReviewEvidenceMemoryAudit;
  onReset: () => void;
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function statusTone(status: ProjectReviewEvidenceMemoryAudit["status"]): string {
  if (status === "current") return "border-lime-300/30 bg-lime-300/10 text-lime-100";
  if (status === "conflicting") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (status === "stale") return "border-sky-300/30 bg-sky-300/10 text-sky-100";
  if (status === "reset") return "border-violet-300/30 bg-violet-300/10 text-violet-100";
  return "border-white/10 bg-white/[0.04] text-slate-200";
}

export function ProjectReviewMemoryPanel({ memory, audit, onReset }: ProjectReviewMemoryPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">v0.3.1 project gate</p>
          <h2 className="mt-1 text-xl font-bold text-white">Project-specific review evidence memory</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Review calibration is isolated to this project via <span className="font-mono text-slate-200">{memory.isolation_key}</span>. Search ranking uses only this project&apos;s included review labels, with reset and stale-memory diagnostics.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-amber-300/30 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
        >
          Reset memory
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className={`rounded-2xl border px-4 py-3 ${statusTone(audit.status)}`}>
          <span className="block text-xs uppercase tracking-[0.18em] opacity-70">Status</span>
          <strong className="mt-1 block text-lg text-white">{audit.status}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Included reviews</span>
          <strong className="text-white">{audit.included_review_count}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Ignored pre-reset</span>
          <strong className="text-white">{audit.ignored_pre_reset_review_count}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Memory confidence</span>
          <strong className="text-white">{pct(audit.memory_confidence)}</strong>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Domain bias</span>
          <strong className="text-white">{audit.domain_bias_count}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Source-group bias</span>
          <strong className="text-white">{audit.source_group_bias_count}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Provider bias</span>
          <strong className="text-white">{audit.provider_bias_count}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Fingerprint</span>
          <strong className="break-all text-xs text-white">{memory.source_fingerprint}</strong>
        </div>
      </div>

      {audit.reset_at && (
        <p className="mt-4 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-3 text-sm text-violet-100">
          Reset marker: {audit.reset_at}. Earlier review labels are ignored until refreshed.
        </p>
      )}

      {audit.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          <p className="font-semibold text-white">Memory warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {audit.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
