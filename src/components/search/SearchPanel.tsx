"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResearchRequest, ResearchResponse, ResearchResult, SearchDepth, ResearchMode, SearchDiagnostics, SearchPlan } from "@/types/research";
import { RESEARCH_MODES, SEARCH_DEPTHS } from "@/types/research";
import { ResultGrid } from "@/components/search/ResultGrid";
import { SavedBoard } from "@/components/search/SavedBoard";
import { ResultDetailPanel } from "@/components/search/ResultDetailPanel";
import { ProviderHealthPanel } from "@/components/search/ProviderHealthPanel";
import { ResultFilters, defaultResultFilters, type ResultFilterState } from "@/components/search/ResultFilters";
import { loadSavedResults, persistSavedResults } from "@/lib/local-storage";

export function SearchPanel() {
  const [topic, setTopic] = useState("Hannibal crossing the Alps");
  const [mode, setMode] = useState<ResearchMode>("youtube_documentary");
  const [depth, setDepth] = useState<SearchDepth>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPlan, setSearchPlan] = useState<SearchPlan | null>(null);
  const [diagnostics, setDiagnostics] = useState<SearchDiagnostics | null>(null);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [saved, setSaved] = useState<ResearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);
  const [filters, setFilters] = useState<ResultFilterState>(defaultResultFilters);

  useEffect(() => {
    setSaved(loadSavedResults());
  }, []);

  useEffect(() => {
    persistSavedResults(saved);
  }, [saved]);

  const savedIds = useMemo(() => new Set(saved.map((item) => item.id)), [saved]);

  const filteredResults = useMemo(() => {
    const sourceNeedle = filters.source.trim().toLowerCase();
    return results
      .filter((result) => filters.type === "all" || result.type === filters.type)
      .filter((result) => filters.provider === "all" || result.provider === filters.provider)
      .filter((result) => filters.risk === "all" || result.risk_level === filters.risk)
      .filter((result) => filters.license === "all" || result.license_detected === filters.license)
      .filter((result) => !sourceNeedle || result.source_domain.toLowerCase().includes(sourceNeedle) || result.source_url.toLowerCase().includes(sourceNeedle))
      .filter((result) => !filters.savedOnly || savedIds.has(result.id))
      .filter((result) => result.scores.overall >= filters.minOverall)
      .sort((a, b) => b.scores.overall - a.scores.overall);
  }, [filters, results, savedIds]);

  const submitSearch = async () => {
    const request: ResearchRequest = {
      topic: topic.trim(),
      mode,
      depth
    };

    if (request.topic.length < 2) {
      setError("Enter at least two characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFilters(defaultResultFilters);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error("Search request failed.");
      }

      const data = await response.json() as ResearchResponse;
      setSearchPlan(data.search_plan);
      setDiagnostics(data.diagnostics);
      setResults(data.results);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unknown search error.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveResult = (result: ResearchResult) => {
    setSaved((current) => {
      const exists = current.some((item) => item.id === result.id);
      if (exists) return current;
      return [{ ...result, updated_at: new Date().toISOString() }, ...current];
    });
  };

  const removeSaved = (id: string) => {
    setSaved((current) => current.filter((item) => item.id !== id));
  };

  const updateSavedNotes = (id: string, notes: string) => {
    setSaved((current) => current.map((item) => item.id === id ? { ...item, notes, updated_at: new Date().toISOString() } : item));
  };

  const addManualResult = (result: ResearchResult) => {
    setSaved((current) => {
      const exists = current.some((item) => item.id === result.id || item.source_url === result.source_url);
      if (exists) return current;
      return [result, ...current];
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-lime-300">v0.1.0-alpha.3</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Visual Research Board
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              A source-aware workspace for collecting visual references, preserving source links, editing saved notes, importing manual URLs, and exporting creator-ready research packs.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100 lg:max-w-md">
            License and risk labels are candidates only. Verify source pages before direct use, publication, or commercial work.
          </div>
        </div>
      </header>

      <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.5fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Research topic</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none ring-lime-300/40 placeholder:text-slate-500 focus:ring-4"
              placeholder="Example: Hannibal crossing the Alps"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as ResearchMode)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-lime-300/40 focus:ring-4"
            >
              {RESEARCH_MODES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Depth</span>
            <select
              value={depth}
              onChange={(event) => setDepth(event.target.value as SearchDepth)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-lime-300/40 focus:ring-4"
            >
              {SEARCH_DEPTHS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={submitSearch}
            disabled={isLoading}
            className="rounded-2xl bg-lime-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          {RESEARCH_MODES.find((item) => item.value === mode)?.description}
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_26rem]">
        <div className="space-y-6">
          {searchPlan && <SearchPlanPanel plan={searchPlan} diagnostics={diagnostics} />}
          {diagnostics && <ProviderHealthPanel health={diagnostics.provider_health} />}
          <ResultFilters filters={filters} onChange={setFilters} totalCount={results.length} visibleCount={filteredResults.length} />
          <ResultGrid results={filteredResults} savedIds={savedIds} onSave={saveResult} onInspect={setSelectedResult} />
        </div>
        <SavedBoard
          saved={saved}
          onRemove={removeSaved}
          onClear={() => setSaved([])}
          onUpdateNotes={updateSavedNotes}
          onManualImport={addManualResult}
        />
      </div>

      <ResultDetailPanel result={selectedResult} onClose={() => setSelectedResult(null)} />
    </main>
  );
}

function SearchPlanPanel({ plan, diagnostics }: { plan: SearchPlan; diagnostics: SearchDiagnostics | null }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Generated search plan</p>
          <h2 className="mt-1 text-xl font-bold text-white">{plan.original_topic}</h2>
          {diagnostics && (
            <p className="mt-2 text-xs text-slate-400">
              {diagnostics.total_raw_results} raw · {diagnostics.total_deduped_results} deduped · {diagnostics.duplicate_count} duplicates removed
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          {plan.source_targets.map((target) => (
            <span key={target} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{target}</span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {plan.queries.map((query) => (
          <div key={query} className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
            {query}
          </div>
        ))}
      </div>
    </section>
  );
}
