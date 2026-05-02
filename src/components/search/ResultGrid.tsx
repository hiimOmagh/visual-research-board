"use client";

import type { ResearchResult } from "@/types/research";
import { ResultCard } from "@/components/search/ResultCard";

interface ResultGridProps {
  results: ResearchResult[];
  savedIds: Set<string>;
  onSave: (result: ResearchResult) => void;
  onInspect: (result: ResearchResult) => void;
}

export function ResultGrid({ results, savedIds, onSave, onInspect }: ResultGridProps) {
  if (results.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-slate-400">
        Search results will appear here.
      </section>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((result) => (
        <ResultCard
          key={result.id}
          result={result}
          isSaved={savedIds.has(result.id)}
          onSave={onSave}
          onInspect={onInspect}
        />
      ))}
    </section>
  );
}
