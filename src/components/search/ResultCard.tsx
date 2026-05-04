"use client";

import type { ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { buildQualityReasons, classifySourceDomain, qualityBucket, sourceGroupLabel } from "@/lib/result-quality";

interface ResultCardProps {
  result: ResearchResult;
  isSaved: boolean;
  onSave: (result: ResearchResult) => void;
  onInspect: (result: ResearchResult) => void;
}

const riskClass: Record<ResearchResult["risk_level"], string> = {
  low: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  medium: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  high: "border-red-400/40 bg-red-400/10 text-red-100",
  reference_only: "border-blue-300/40 bg-blue-300/10 text-blue-100",
  avoid: "border-zinc-400/40 bg-zinc-400/10 text-zinc-100"
};

const bucketLabel = {
  strong: "Strong candidate",
  usable: "Usable candidate",
  review: "Needs review",
  risky: "Risky / low signal"
};

export function ResultCard({ result, isSaved, onSave, onInspect }: ResultCardProps) {
  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  const reasons = result.quality_reasons?.length ? result.quality_reasons : buildQualityReasons({ ...result, source_group: sourceGroup });
  const bucket = qualityBucket(result);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-soft transition hover:border-lime-300/50">
      <button
        type="button"
        onClick={() => onInspect(result)}
        className="block h-44 w-full bg-slate-950 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-300/40"
        aria-label={`Inspect ${result.title}`}
      >
        {result.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.thumbnail_url}
            alt={result.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 px-6 text-center text-sm text-slate-400">
            No thumbnail · web/source result
          </div>
        )}
      </button>

      <div className="space-y-3 p-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-lime-100">{bucketLabel[bucket]}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-200">{sourceGroupLabel(sourceGroup)}</span>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold text-white">{result.title}</h3>
          <p className="mt-1 text-xs text-slate-400">{result.source_domain} · {result.provider} · {result.type}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-200">
            {licenseLabel(result.license_detected)}
          </span>
          <span className={`rounded-full border px-2 py-1 ${riskClass[result.risk_level]}`}>
            {riskLabel(result.risk_level)}
          </span>
          <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-2 py-1 text-blue-100">
            {result.rights_status.replaceAll("_", " ")}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300">
            {result.source_access_mode.replaceAll("_", " ")}
          </span>
          {(result.duplicate_group_size ?? 1) > 1 && (
            <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-2 py-1 text-purple-100">
              merged ×{result.duplicate_group_size}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-300">
          <Score label="Overall" value={result.scores.overall} />
          <Score label="Rel" value={result.scores.relevance} />
          <Score label="Visual" value={result.scores.visual_quality} />
          <Score label="Source" value={result.scores.source_credibility} />
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Why this result</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">{reasons[0]}</p>
          {result.metadata_gaps?.length ? (
            <p className="mt-2 text-[11px] text-amber-100">Metadata gaps: {result.metadata_gaps.slice(0, 3).map((gap) => gap.replaceAll("_", " ")).join(", ")}</p>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave(result)}
            disabled={isSaved}
            className="flex-1 rounded-xl bg-lime-300 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => onInspect(result)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:border-lime-300/50"
          >
            Inspect
          </button>
          <a
            href={result.source_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:border-lime-300/50"
          >
            Source
          </a>
        </div>
      </div>
    </article>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-black/20 px-2 py-1">
      <div className="text-slate-500">{label}</div>
      <div className="font-semibold text-slate-100">{Math.round(value * 100)}%</div>
    </div>
  );
}
