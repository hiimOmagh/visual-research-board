"use client";

import type { ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { buildQualityReasons, classifySourceDomain, sourceGroupLabel } from "@/lib/result-quality";

interface ResultDetailPanelProps {
  result: ResearchResult | null;
  onClose: () => void;
}

export function ResultDetailPanel({ result, onClose }: ResultDetailPanelProps) {
  if (!result) return null;

  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  const reasons = result.quality_reasons?.length ? result.quality_reasons : buildQualityReasons({ ...result, source_group: sourceGroup });

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-soft backdrop-blur md:w-[32rem]" aria-label="Result detail panel">
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
        <section className="rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-lime-300">Why this result</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-lime-50">
            {reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </section>

        <Field label="Source domain" value={result.source_domain} />
        <Field label="Source group" value={sourceGroupLabel(sourceGroup)} />
        <Field label="Provider" value={result.provider} />
        <Field label="Type" value={result.type} />
        <Field label="License label" value={licenseLabel(result.license_detected)} />
        <Field label="License confidence" value={`${Math.round(result.license_confidence * 100)}%`} />
        {result.license_url && <Field label="License URL" value={result.license_url} />}
        <Field label="Risk label" value={riskLabel(result.risk_level)} />
        <Field label="Overall score" value={`${Math.round(result.scores.overall * 100)}%`} />
        <Field label="Relevance score" value={`${Math.round(result.scores.relevance * 100)}%`} />
        <Field label="Source credibility" value={`${Math.round(result.scores.source_credibility * 100)}%`} />
        <Field label="Visual quality" value={`${Math.round(result.scores.visual_quality * 100)}%`} />
        <Field label="Production usefulness" value={`${Math.round(result.scores.production_usefulness * 100)}%`} />
        {result.width && result.height && <Field label="Dimensions" value={`${result.width} × ${result.height}`} />}
        {result.description && <Field label="Description" value={result.description} />}
        <Field label="Tags" value={result.tags.join(", ") || "none"} />
        <Field label="Collected at" value={result.collected_at} />

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
