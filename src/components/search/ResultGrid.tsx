"use client";

import type { ResearchResult, SourceGroup } from "@/types/research";
import { ResultCard } from "@/components/search/ResultCard";
import { EmptyState } from "@/components/search/EmptyState";
import { classifySourceDomain, SOURCE_GROUP_ORDER, sourceGroupLabel } from "@/lib/result-quality";

interface ResultGridProps {
  results: ResearchResult[];
  savedIds: Set<string>;
  onSave: (result: ResearchResult) => void;
  onInspect: (result: ResearchResult) => void;
}

function getSourceGroup(result: ResearchResult): SourceGroup {
  return result.source_group ?? classifySourceDomain(result.source_domain);
}

export function ResultGrid({ results, savedIds, onSave, onInspect }: ResultGridProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        eyebrow="Results"
        title="No results to display yet"
        description="Run a search above to populate this grid. If filters are active, reset them to view hidden results."
      />
    );
  }

  const grouped = results.reduce((acc, result) => {
    const group = getSourceGroup(result);
    acc[group] = [...(acc[group] ?? []), result];
    return acc;
  }, {} as Partial<Record<SourceGroup, ResearchResult[]>>);

  return (
    <div className="space-y-6">
      {SOURCE_GROUP_ORDER.map((group) => {
        const items = grouped[group] ?? [];
        if (items.length === 0) return null;
        const domains = Array.from(new Set(items.map((item) => item.source_domain))).slice(0, 4);

        return (
          <section key={group} className="space-y-3">
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{sourceGroupLabel(group)}</h2>
                <p className="mt-1 text-xs text-slate-400">{domains.join(" · ")}</p>
              </div>
              <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {items.length} result{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  isSaved={savedIds.has(result.id)}
                  onSave={onSave}
                  onInspect={onInspect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
