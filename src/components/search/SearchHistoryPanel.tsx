"use client";

import type { SearchHistoryEntry } from "@/types/research";
import { providerSummary } from "@/lib/project";

interface SearchHistoryPanelProps {
  history: SearchHistoryEntry[];
  onRestoreSnapshot: (snapshotId: string) => void;
}

export function SearchHistoryPanel({ history, onRestoreSnapshot }: SearchHistoryPanelProps) {
  if (history.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm text-slate-400">
        Search history and persistent result snapshots will be stored inside the active project after the first search.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Project search history</p>
          <h2 className="mt-1 text-xl font-bold text-white">{history.length} recorded searches</h2>
        </div>
      </div>
      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        {history.map((entry) => (
          <article key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="line-clamp-1 text-sm font-semibold text-white">{entry.topic}</h3>
                <p className="mt-1 text-xs text-slate-500">{new Date(entry.generated_at).toLocaleString()} · {entry.mode} · {entry.depth}</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{entry.result_count} results</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {entry.query_count} queries · {entry.duplicate_count} duplicates removed · snapshot: {entry.snapshot_id ? "stored" : "missing"}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">{providerSummary(entry.provider_health)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!entry.snapshot_id}
                onClick={() => onRestoreSnapshot(entry.snapshot_id)}
                className="rounded-xl border border-lime-300/30 px-3 py-2 text-xs font-semibold text-lime-100 hover:border-lime-300/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
              >
                Restore snapshot
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
