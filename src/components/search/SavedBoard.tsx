"use client";

import type { ResearchResult } from "@/types/research";
import { createCsvExport, createJsonExport, createMarkdownExport, downloadTextFile } from "@/lib/export";
import { licenseLabel, riskLabel } from "@/lib/risk";

interface SavedBoardProps {
  saved: ResearchResult[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function SavedBoard({ saved, onRemove, onClear }: SavedBoardProps) {
  const exportJson = () => {
    downloadTextFile("visual-research-board-export.json", createJsonExport(saved), "application/json");
  };

  const exportMarkdown = () => {
    downloadTextFile("visual-research-board-export.md", createMarkdownExport(saved), "text/markdown");
  };

  const exportCsv = () => {
    downloadTextFile("visual-research-board-export.csv", createCsvExport(saved), "text/csv");
  };

  const lowRiskCount = saved.filter((item) => item.risk_level === "low").length;
  const highRiskCount = saved.filter((item) => ["high", "avoid"].includes(item.risk_level)).length;

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Saved board</p>
          <h2 className="mt-1 text-lg font-bold text-white">{saved.length} saved items</h2>
          {saved.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">{lowRiskCount} low-risk candidate · {highRiskCount} high-risk/avoid</p>
          )}
        </div>
        {saved.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-red-300/20 px-3 py-2 text-xs text-red-100 hover:border-red-300/50"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={exportJson}
          disabled={saved.length === 0}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={exportMarkdown}
          disabled={saved.length === 0}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/50 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          Export Markdown
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={saved.length === 0}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/50 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-5 max-h-[36rem] space-y-3 overflow-y-auto pr-1">
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
            Saved references will persist after refresh using localStorage.
          </p>
        ) : (
          saved.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex gap-3">
                {item.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail_url} alt="" className="h-16 w-20 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.source_domain} · {Math.round(item.scores.overall * 100)}%</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="rounded-full bg-white/5 px-2 py-1">{licenseLabel(item.license_detected)}</span>
                <span className="rounded-full bg-white/5 px-2 py-1">{riskLabel(item.risk_level)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-lime-300/50"
                >
                  Source
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-red-300/50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
