import type { NormalizationDedupeTrace } from "@/types/research";

interface NormalizationDedupePanelProps {
  trace: NormalizationDedupeTrace;
}

function pct(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function NormalizationDedupePanel({ trace }: NormalizationDedupePanelProps) {
  const topGaps = Object.entries(trace.metadata_gap_counts)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 5);
  const topGroups = trace.duplicate_groups.slice(0, 4);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-labelledby="normalization-dedupe-title">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Provider normalization gate</p>
          <h2 id="normalization-dedupe-title" className="mt-1 text-xl font-bold text-white">Normalization + deduplication</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Canonical URLs, image assets, title/domain fingerprints, and visual-shape keys are used to merge duplicate provider results before ranking/export.
          </p>
        </div>
        <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs font-semibold text-lime-100">
          schema {trace.schema_version}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <Metric label="Raw" value={trace.raw_count} />
        <Metric label="Normalized" value={trace.normalized_count} />
        <Metric label="Deduped" value={trace.deduped_count} />
        <Metric label="Merged duplicates" value={trace.duplicate_count} sub={`${pct(trace.duplicate_count, trace.normalized_count)} of normalized`} />
        <Metric label="Metadata gaps" value={trace.metadata_gap_count} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Metadata gap counts</p>
          {topGaps.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {topGaps.map(([gap, count]) => (
                <li key={gap} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                  <span>{gap.replaceAll("_", " ")}</span>
                  <span className="font-semibold text-white">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No material metadata gaps detected in surviving candidates.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Duplicate groups</p>
          {topGroups.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {topGroups.map((group) => (
                <li key={group.group_key} className="rounded-xl bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-slate-200">{group.group_key}</span>
                    <span className="shrink-0 font-semibold text-white">+{group.duplicate_count}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Matched by {group.match_reasons.join(", ")} · {group.provider_sources.length} source records retained</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No duplicate groups detected in this run.</p>
          )}
        </div>
      </div>

      {trace.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Normalization warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {trace.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
