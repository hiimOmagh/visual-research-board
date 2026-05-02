"use client";

import type { ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";

interface ResultDetailPanelProps {
  result: ResearchResult | null;
  onClose: () => void;
}

export function ResultDetailPanel({ result, onClose }: ResultDetailPanelProps) {
  if (!result) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-soft backdrop-blur md:w-[32rem]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-lime-300">Result detail</p>
          <h2 className="mt-2 text-xl font-bold text-white">{result.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-lime-300/50"
        >
          Close
        </button>
      </div>

      {result.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={result.thumbnail_url} alt={result.title} className="mb-5 h-64 w-full rounded-2xl object-cover" />
      )}

      <div className="space-y-4 text-sm text-slate-300">
        <Field label="Source domain" value={result.source_domain} />
        <Field label="Provider" value={result.provider} />
        <Field label="Type" value={result.type} />
        <Field label="License label" value={licenseLabel(result.license_detected)} />
        <Field label="License confidence" value={`${Math.round(result.license_confidence * 100)}%`} />
        <Field label="Risk label" value={riskLabel(result.risk_level)} />
        {result.width && result.height && <Field label="Dimensions" value={`${result.width} × ${result.height}`} />}
        {result.description && <Field label="Description" value={result.description} />}
        <Field label="Tags" value={result.tags.join(", ") || "none"} />

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
          License labels are candidates only. Verify the source page and license terms before direct use, publication, or commercial work.
        </div>

        <a
          href={result.source_url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl bg-lime-300 px-4 py-3 text-center font-semibold text-slate-950 hover:bg-lime-200"
        >
          Open original source
        </a>
      </div>
    </aside>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 break-words text-slate-100">{value}</div>
    </div>
  );
}
