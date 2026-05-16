"use client";

/* v2.3.0 provider setup clarity */


import type { ResearchResult, SourceGroup } from "@/types/research";
import { ResultCard } from "@/components/search/ResultCard";
import { EmptyState } from "@/components/search/EmptyState";
import { classifySourceDomain, SOURCE_GROUP_ORDER, sourceGroupLabel } from "@/lib/result-quality";

interface ResultGridProps {
  results: ResearchResult[];
  totalCount?: number;
  hasSearched?: boolean;
  filtersActive?: boolean;
  savedIds: Set<string>;
  onSave: (result: ResearchResult) => void;
  onInspect: (result: ResearchResult) => void;
  onResetFilters?: () => void;
}

function getSourceGroup(result: ResearchResult): SourceGroup {
  return result.source_group ?? classifySourceDomain(result.source_domain);
}

export function ResultGrid({ results, totalCount = results.length, hasSearched = totalCount > 0, filtersActive = false, savedIds, onSave, onInspect, onResetFilters }: ResultGridProps) {
  if (results.length === 0) {
    if (!hasSearched) {
      return (
        <EmptyState
          eyebrow="Search results"
          title="Run a search to populate the visual evidence grid"
          description="Use the topic field, free-core provider toggles, and Reference Search Hub. First-time users can load the demo project from the UX reliability panel."
        />
      );
    }

    if (filtersActive && totalCount > 0) {
      return (
        <EmptyState
          eyebrow="Filtered results"
          title="Filters are hiding all available results"
          description={`${totalCount} result${totalCount === 1 ? "" : "s"} exist in the latest search state, but none match the current filter combination.`}
          action={onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-xl border border-lime-300/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:border-lime-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
            >
              Reset filters
            </button>
          ) : undefined}
        />
      );
    }

    return (
      <EmptyState
        eyebrow="Search results"
        title="No results returned for this search"
        description="Try a broader topic, use Standard or Deep depth, enable free-core providers, or use the Reference Search Hub to manually import external source URLs."
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
