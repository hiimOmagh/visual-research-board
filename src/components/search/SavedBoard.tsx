"use client";

import { useState } from "react";
import type { LicenseDetected, ResearchResult, ResultType } from "@/types/research";
import { LICENSE_TYPES, RESULT_TYPES } from "@/types/research";
import { createAttributionExport, createCsvExport, createJsonExport, createMarkdownExport, createSingleAttribution, downloadTextFile } from "@/lib/export";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { createManualUrlResult, isValidHttpUrl } from "@/lib/manual-import";

interface SavedBoardProps {
  saved: ResearchResult[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onManualImport: (result: ResearchResult) => void;
}

export function SavedBoard({ saved, onRemove, onClear, onUpdateNotes, onManualImport }: SavedBoardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const exportJson = () => {
    downloadTextFile("visual-research-board-export.json", createJsonExport(saved), "application/json");
  };

  const exportMarkdown = () => {
    downloadTextFile("visual-research-board-export.md", createMarkdownExport(saved), "text/markdown");
  };

  const exportCsv = () => {
    downloadTextFile("visual-research-board-export.csv", createCsvExport(saved), "text/csv");
  };

  const exportAttribution = () => {
    downloadTextFile("visual-research-board-attribution-pack.md", createAttributionExport(saved), "text/markdown");
  };

  const copyAttribution = async (item: ResearchResult) => {
    try {
      await navigator.clipboard.writeText(createSingleAttribution(item));
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  const lowRiskCount = saved.filter((item) => item.risk_level === "low").length;
  const highRiskCount = saved.filter((item) => ["high", "avoid"].includes(item.risk_level)).length;
  const manualCount = saved.filter((item) => item.provider === "manual").length;

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Saved board</p>
          <h2 className="mt-1 text-lg font-bold text-white">{saved.length} saved items</h2>
          {saved.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {lowRiskCount} low-risk · {highRiskCount} high-risk/avoid · {manualCount} manual
            </p>
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

      <ManualImportForm onManualImport={onManualImport} />

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
        <button
          type="button"
          onClick={exportAttribution}
          disabled={saved.length === 0}
          className="rounded-xl border border-lime-300/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:border-lime-300/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
        >
          Attribution Pack
        </button>
      </div>

      <div className="mt-5 max-h-[48rem] space-y-3 overflow-y-auto pr-1">
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
            Saved references will persist after refresh using localStorage. You can also import a URL manually above.
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
                <span className="rounded-full bg-white/5 px-2 py-1">{item.provider}</span>
              </div>

              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-semibold text-slate-400">Notes</span>
                <textarea
                  value={item.notes ?? ""}
                  onChange={(event) => onUpdateNotes(item.id, event.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100 outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
                  placeholder="Add production note, usage idea, verification status, or attribution reminder..."
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
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
                  onClick={() => copyAttribution(item)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:border-lime-300/50"
                >
                  {copiedId === item.id ? "Copied" : "Copy attribution"}
                </button>
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

function ManualImportForm({ onManualImport }: { onManualImport: (result: ResearchResult) => void }) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResultType>("web");
  const [licenseDetected, setLicenseDetected] = useState<LicenseDetected>("unknown");
  const [notes, setNotes] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const cleanUrl = sourceUrl.trim();
    if (!isValidHttpUrl(cleanUrl)) {
      setError("Enter a valid http or https URL.");
      return;
    }

    if (thumbnailUrl.trim() && !isValidHttpUrl(thumbnailUrl.trim())) {
      setError("Thumbnail URL must be a valid http or https URL, or left empty.");
      return;
    }

    const result = createManualUrlResult({
      sourceUrl: cleanUrl,
      title,
      type,
      licenseDetected,
      notes,
      thumbnailUrl
    });

    onManualImport(result);
    setSourceUrl("");
    setTitle("");
    setType("web");
    setLicenseDetected("unknown");
    setNotes("");
    setThumbnailUrl("");
    setError(null);
  };

  return (
    <section className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-lime-200">Manual URL import</p>
      <div className="mt-3 space-y-3">
        <input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="https://source-page.example/..."
        />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Optional title"
        />
        <input
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Optional thumbnail/image URL"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ResultType)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
          >
            {RESULT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={licenseDetected}
            onChange={(event) => setLicenseDetected(event.target.value as LicenseDetected)}
            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
          >
            {LICENSE_TYPES.map((item) => <option key={item} value={item}>{licenseLabel(item)}</option>)}
          </select>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Optional note"
        />
        {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-2 text-xs text-red-100">{error}</p>}
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-lime-200"
        >
          Add manual source
        </button>
      </div>
    </section>
  );
}
