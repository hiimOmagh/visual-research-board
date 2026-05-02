"use client";

import { useMemo, useState } from "react";
import type { BoardSection, ExportTemplateId, LicenseDetected, ResearchProject, ResearchResult, ResultType, UrlMetadataResponse } from "@/types/research";
import { EXPORT_TEMPLATES, LICENSE_TYPES, RESULT_TYPES } from "@/types/research";
import { createAttributionExport, createCsvExport, createJsonExport, createMarkdownExport, createSingleAttribution, createTemplateExport, downloadTextFile } from "@/lib/export";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { createManualUrlResult, isValidHttpUrl } from "@/lib/manual-import";
import { INBOX_SECTION_ID } from "@/lib/project";

interface SavedBoardProps {
  project: ResearchProject;
  saved: ResearchResult[];
  sections: BoardSection[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateSection: (id: string, sectionId: string) => void;
  onAddSection: (name: string) => void;
  onManualImport: (result: ResearchResult) => void;
}

export function SavedBoard({ project, saved, sections, onRemove, onClear, onUpdateNotes, onUpdateSection, onAddSection, onManualImport }: SavedBoardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplateId>("source_audit");

  const groupedSaved = useMemo(() => {
    const grouped = new Map<string, ResearchResult[]>();
    for (const section of sections) grouped.set(section.id, []);
    grouped.set("unassigned", []);
    saved.forEach((item) => {
      const key = item.section_id && grouped.has(item.section_id) ? item.section_id : "unassigned";
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    });
    return grouped;
  }, [saved, sections]);

  const exportJson = () => {
    downloadTextFile("visual-research-board-export.json", createJsonExport(saved, project), "application/json");
  };

  const exportMarkdown = () => {
    downloadTextFile("visual-research-board-export.md", createMarkdownExport(saved, project), "text/markdown");
  };

  const exportCsv = () => {
    downloadTextFile("visual-research-board-export.csv", createCsvExport(saved), "text/csv");
  };

  const exportAttribution = () => {
    downloadTextFile("visual-research-board-attribution-pack.md", createAttributionExport(saved, project), "text/markdown");
  };

  const exportSelectedTemplate = () => {
    downloadTextFile(`visual-research-board-${selectedTemplate}.md`, createTemplateExport(selectedTemplate, saved, project), "text/markdown");
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

  const addSection = () => {
    if (!sectionName.trim()) return;
    onAddSection(sectionName.trim());
    setSectionName("");
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
          <p className="mt-1 text-xs text-slate-500">Project: {project.name}</p>
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

      <section className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Board sections</p>
        <div className="mt-3 flex gap-2">
          <input
            value={sectionName}
            onChange={(event) => setSectionName(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
            placeholder="Add section"
          />
          <button
            type="button"
            onClick={addSection}
            className="rounded-xl border border-lime-300/30 px-3 py-2 text-xs font-semibold text-lime-100 hover:border-lime-300/70"
          >
            Add
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
          {sections.map((section) => (
            <span key={section.id} className="rounded-full bg-white/5 px-2 py-1">
              {section.name}: {groupedSaved.get(section.id)?.length ?? 0}
            </span>
          ))}
        </div>
      </section>

      <ManualImportForm onManualImport={onManualImport} />

      <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Export templates</p>
        <div className="mt-3 grid gap-2">
          <select
            value={selectedTemplate}
            onChange={(event) => setSelectedTemplate(event.target.value as ExportTemplateId)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
          >
            {EXPORT_TEMPLATES.map((template) => <option key={template.value} value={template.value}>{template.label}</option>)}
          </select>
          <p className="text-xs leading-5 text-slate-500">
            {EXPORT_TEMPLATES.find((template) => template.value === selectedTemplate)?.description}
          </p>
          <button
            type="button"
            onClick={exportSelectedTemplate}
            disabled={saved.length === 0}
            className="rounded-xl border border-lime-300/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:border-lime-300/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
          >
            Export selected template
          </button>
        </div>
      </section>

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

      <div className="mt-5 max-h-[48rem] space-y-5 overflow-y-auto pr-1">
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
            Saved references will persist inside the active project using localStorage. You can also import a URL manually above.
          </p>
        ) : (
          sections.map((section) => {
            const items = groupedSaved.get(section.id) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={section.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-white">{section.name}</h3>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-400">{items.length}</span>
                </div>
                {items.map((item) => (
                  <SavedItem
                    key={item.id}
                    item={item}
                    sections={sections}
                    copiedId={copiedId}
                    onRemove={onRemove}
                    onUpdateNotes={onUpdateNotes}
                    onUpdateSection={onUpdateSection}
                    onCopyAttribution={copyAttribution}
                  />
                ))}
              </section>
            );
          })
        )}
      </div>
    </aside>
  );
}

function SavedItem({
  item,
  sections,
  copiedId,
  onRemove,
  onUpdateNotes,
  onUpdateSection,
  onCopyAttribution
}: {
  item: ResearchResult;
  sections: BoardSection[];
  copiedId: string | null;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateSection: (id: string, sectionId: string) => void;
  onCopyAttribution: (item: ResearchResult) => void;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-3">
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
        <span className="mb-1 block text-xs font-semibold text-slate-400">Section</span>
        <select
          value={item.section_id ?? INBOX_SECTION_ID}
          onChange={(event) => onUpdateSection(item.id, event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-lime-300/40 focus:ring-4"
        >
          {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
        </select>
      </label>

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
          onClick={() => onCopyAttribution(item)}
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
  );
}

function ManualImportForm({ onManualImport }: { onManualImport: (result: ResearchResult) => void }) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResultType>("web");
  const [licenseDetected, setLicenseDetected] = useState<LicenseDetected>("unknown");
  const [notes, setNotes] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [metadataStatus, setMetadataStatus] = useState<string | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const fetchMetadata = async () => {
    const cleanUrl = sourceUrl.trim();
    if (!isValidHttpUrl(cleanUrl)) {
      setError("Enter a valid http or https URL before fetching metadata.");
      return;
    }

    setIsFetchingMetadata(true);
    setError(null);
    setMetadataStatus(null);

    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl })
      });
      if (!response.ok) throw new Error("Metadata request failed.");
      const metadata = await response.json() as UrlMetadataResponse;
      if (metadata.title && !title.trim()) setTitle(metadata.title);
      if (metadata.description && !description.trim()) setDescription(metadata.description);
      if (metadata.thumbnail_url && !thumbnailUrl.trim()) setThumbnailUrl(metadata.thumbnail_url);
      setMetadataStatus(metadata.status === "error" ? `Metadata fallback: ${metadata.message ?? "source unavailable"}` : "Metadata extracted. Verify it before publishing.");
    } catch (metadataError) {
      setError(metadataError instanceof Error ? metadataError.message : "Unknown metadata extraction error.");
    } finally {
      setIsFetchingMetadata(false);
    }
  };

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
      thumbnailUrl,
      description
    });

    onManualImport(result);
    setSourceUrl("");
    setTitle("");
    setDescription("");
    setType("web");
    setLicenseDetected("unknown");
    setNotes("");
    setThumbnailUrl("");
    setError(null);
    setMetadataStatus(null);
  };

  return (
    <section className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-lime-200">Manual URL import</p>
      <div className="mt-3 space-y-3">
        <div className="flex gap-2">
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
            placeholder="https://source-page.example/..."
          />
          <button
            type="button"
            onClick={fetchMetadata}
            disabled={isFetchingMetadata}
            className="rounded-xl border border-lime-300/30 px-3 py-2 text-xs font-semibold text-lime-100 hover:border-lime-300/70 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
          >
            {isFetchingMetadata ? "Fetching…" : "Fetch metadata"}
          </button>
        </div>
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
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Optional source description / metadata summary"
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
        {metadataStatus && <p className="rounded-xl border border-lime-300/20 bg-lime-300/10 p-2 text-xs text-lime-100">{metadataStatus}</p>}
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
