"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExportTemplateId, ResearchProject, ResearchResult } from "@/types/research";
import { EXPORT_TEMPLATES } from "@/types/research";
import {
  createCsvExport,
  createJsonExport,
  createMarkdownExport,
  createTemplateExport,
  downloadTextFile
} from "@/lib/export";

export type ExportPreviewFormat = "json" | "markdown" | "csv" | "template";

interface ExportPreviewDrawerProps {
  open: boolean;
  format: ExportPreviewFormat;
  templateId: ExportTemplateId;
  saved: ResearchResult[];
  project: ResearchProject;
  onClose: () => void;
}

const PREVIEW_LIMIT = 8000;

function formatLabel(format: ExportPreviewFormat, templateId: ExportTemplateId): string {
  if (format === "json") return "JSON export";
  if (format === "markdown") return "Markdown export";
  if (format === "csv") return "CSV export";
  return EXPORT_TEMPLATES.find((entry) => entry.value === templateId)?.label ?? "Template export";
}

function buildExportBody(format: ExportPreviewFormat, templateId: ExportTemplateId, saved: ResearchResult[], project: ResearchProject): string {
  if (format === "json") return createJsonExport(saved, project);
  if (format === "markdown") return createMarkdownExport(saved, project);
  if (format === "csv") return createCsvExport(saved);
  return createTemplateExport(templateId, saved, project);
}

function buildFilename(format: ExportPreviewFormat, templateId: ExportTemplateId): string {
  if (format === "json") return "visual-research-board-export.json";
  if (format === "markdown") return "visual-research-board-export.md";
  if (format === "csv") return "visual-research-board-export.csv";
  return `visual-research-board-${templateId}.md`;
}

function mimeType(format: ExportPreviewFormat): string {
  if (format === "json") return "application/json";
  if (format === "csv") return "text/csv";
  return "text/markdown";
}

export function ExportPreviewDrawer({ open, format, templateId, saved, project, onClose }: ExportPreviewDrawerProps) {
  const [copied, setCopied] = useState(false);

  const body = useMemo(() => {
    if (!open) return "";
    return buildExportBody(format, templateId, saved, project);
  }, [open, format, templateId, saved, project]);

  useEffect(() => {
    setCopied(false);
  }, [body]);

  // Close drawer on Escape so it never traps keyboard focus.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = body.length > PREVIEW_LIMIT ? `${body.slice(0, PREVIEW_LIMIT)}\n\n…\n[Preview truncated. The downloaded file contains the full export.]` : body;
  const lineCount = body ? body.split("\n").length : 0;

  const onDownload = () => {
    downloadTextFile(buildFilename(format, templateId), body, mimeType(format));
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-preview-title"
    >
      <button
        type="button"
        aria-label="Close export preview"
        onClick={onClose}
        className="flex-1 cursor-default focus:outline-none"
      />
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-slate-950 p-6 shadow-soft md:w-[40rem]">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Export preview</p>
            <h2 id="export-preview-title" className="mt-1 text-xl font-bold text-white">{formatLabel(format, templateId)}</h2>
            <p className="mt-1 text-xs text-slate-400">
              {saved.length} saved item{saved.length === 1 ? "" : "s"} · {lineCount.toLocaleString()} line{lineCount === 1 ? "" : "s"} · {body.length.toLocaleString()} characters
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-lime-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
          >
            Close
          </button>
        </header>

        {body.length === 0 ? (
          <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100" role="status">
            The current export would be empty. Save at least one result before exporting.
          </p>
        ) : (
          <pre
            className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-slate-100"
            tabIndex={0}
            aria-label="Export preview content"
          >
            {trimmed}
          </pre>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={body.length === 0}
            className="rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            Download
          </button>
          <button
            type="button"
            onClick={onCopy}
            disabled={body.length === 0}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {copied ? "Copied" : "Copy to clipboard"}
          </button>
        </div>

        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          License labels and attribution lines are candidates only. Verify all sources before publication or commercial use.
        </p>
      </aside>
    </div>
  );
}
