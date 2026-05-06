import type { BroadReferenceResult } from "@/types/broad-reference-result";
import { summarizeBroadReferenceResult } from "@/lib/broad-reference-result";
import { SourceClassBadge } from "@/components/search/SourceClassBadge";

type BroadReferenceResultPanelProps = {
  result: BroadReferenceResult;
};

export function BroadReferenceResultPanel({ result }: BroadReferenceResultPanelProps) {
  const summary = summarizeBroadReferenceResult(result);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Broad reference result
            </p>
            <h2 className="mt-1 text-lg font-semibold">{result.title ?? "Untitled reference"}</h2>
          </div>
          <SourceClassBadge sourceClass={result.source_class} />
        </div>

        {result.description ? <p className="text-sm text-slate-300">{result.description}</p> : null}

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Access</p>
            <p className="mt-1 font-medium">{summary.access_status}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Rights</p>
            <p className="mt-1 font-medium">{summary.rights_status}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Review</p>
            <p className="mt-1 font-medium">{summary.needs_review ? "Needs review" : "Low friction"}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Broad reference results are source-classified discovery objects. Labels add context; they do not block discovery.
        </p>
      </div>
    </section>
  );
}
