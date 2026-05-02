"use client";

import type { ResearchResult, ResultType } from "@/types/research";
import { ResultCard } from "@/components/search/ResultCard";

interface ResultGridProps {
  results: ResearchResult[];
  savedIds: Set<string>;
  onSave: (result: ResearchResult) => void;
  onInspect: (result: ResearchResult) => void;
}

const typeLabels: Record<ResultType, string> = {
  image: "Images",
  web: "Web sources",
  news: "News/media",
  archive: "Archive branches"
};

export function ResultGrid({ results, savedIds, onSave, onInspect }: ResultGridProps) {
  if (results.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-slate-400">
        Search results will appear here. If filters are active, reset them to view hidden results.
      </section>
    );
  }

  const grouped = results.reduce((acc, result) => {
    acc[result.type] = [...(acc[result.type] ?? []), result];
    return acc;
  }, {} as Partial<Record<ResultType, ResearchResult[]>>);

  const groupOrder: ResultType[] = ["image", "web", "news", "archive"];

  return (
    <div className="space-y-6">
      {groupOrder.map((type) => {
        const group = grouped[type] ?? [];
        if (group.length === 0) return null;

        return (
          <section key={type} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">{typeLabels[type]}</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {group.length} results
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.map((result) => (
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
