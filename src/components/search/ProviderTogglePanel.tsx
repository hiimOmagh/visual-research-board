"use client";

import type { ProviderToggleMap, SearchProviderName } from "@/types/research";
import { SEARCH_PROVIDERS } from "@/types/research";

const providerCopy: Record<SearchProviderName, { label: string; description: string; env?: string; mode: "free" | "free-key" | "optional" | "demo" }> = {
  mock: { label: "Mock", description: "Always available deterministic demo results. Keep this on for safe local validation.", mode: "demo" },
  wikimedia: { label: "Wikimedia", description: "Commons public-domain / Creative Commons candidates. Free backend, no key required.", mode: "free" },
  openverse: { label: "Openverse", description: "Open-license image discovery across many source collections. Free backend, no key required.", mode: "free" },
  loc: { label: "Library of Congress", description: "Historical photos, maps, posters, and archive records. Free backend, no key required.", mode: "free" },
  internet_archive: { label: "Internet Archive", description: "Archive items, scans, media records, and source thumbnails. Free backend, no key required.", mode: "free" },
  nasa: { label: "NASA Images", description: "Science, space, earth, satellite, and aerospace imagery. Free backend, no key required.", mode: "free" },
  smithsonian: { label: "Smithsonian", description: "Open Access museum/science/culture records. Free key required.", env: "SMITHSONIAN_API_KEY", mode: "free-key" },
  europeana: { label: "Europeana", description: "European cultural heritage records. Free key required.", env: "EUROPEANA_API_KEY", mode: "free-key" },
  brave: { label: "Brave", description: "Optional broad web/image API. Disabled by default for the free-only workflow.", env: "BRAVE_SEARCH_API_KEY", mode: "optional" },
  tavily: { label: "Tavily", description: "Optional web research API. Disabled by default for the free-only workflow.", env: "TAVILY_API_KEY", mode: "optional" }
};

interface ProviderTogglePanelProps { toggles: ProviderToggleMap; onChange: (next: ProviderToggleMap) => void; }

function hasAnyEnabled(toggles: ProviderToggleMap): boolean {
  return SEARCH_PROVIDERS.some((provider) => toggles[provider]);
}

function offToggles(): ProviderToggleMap {
  return SEARCH_PROVIDERS.reduce((acc, provider) => ({ ...acc, [provider]: false }), {} as ProviderToggleMap);
}

function modeBadge(mode: (typeof providerCopy)[SearchProviderName]["mode"]): string {
  if (mode === "free") return "Free / no key";
  if (mode === "free-key") return "Free key";
  if (mode === "optional") return "Optional API";
  return "Demo";
}

export function ProviderTogglePanel({ toggles, onChange }: ProviderTogglePanelProps) {
  const toggleProvider = (provider: SearchProviderName) => {
    const next = { ...toggles, [provider]: !toggles[provider] };
    if (!hasAnyEnabled(next)) next.mock = true;
    onChange(next);
  };
  const enableMockOnly = () => onChange({ ...offToggles(), mock: true });
  const enableFreeCore = () => onChange({
    ...offToggles(),
    mock: true,
    wikimedia: true,
    openverse: true,
    loc: true,
    internet_archive: true,
    nasa: true
  });

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Provider toggles</p>
          <h2 className="mt-1 text-xl font-bold text-white">Free backend sources</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">v0.5.1 keeps provider setup explicit: free-core sources, free-key sources, optional APIs, and manual reference launchers remain separated. Google, Bing, Yandex, and similar engines are handled separately as manual reference launchers, not scraped backends.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={enableFreeCore} className="rounded-2xl border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-xs font-semibold text-lime-100 transition hover:border-lime-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60">Free-core sources</button>
          <button type="button" onClick={enableMockOnly} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60">Mock-only safe mode</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {SEARCH_PROVIDERS.map((provider) => (
          <button key={provider} type="button" onClick={() => toggleProvider(provider)} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60 ${toggles[provider] ? "border-lime-300/40 bg-lime-300/10" : "border-white/10 bg-black/20 hover:border-white/25"}`} aria-pressed={toggles[provider]}>
            <div className="flex items-center justify-between gap-3"><span className="font-semibold text-white">{providerCopy[provider].label}</span><span className={`rounded-full px-2 py-1 text-[11px] ${toggles[provider] ? "bg-lime-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>{toggles[provider] ? "On" : "Off"}</span></div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{modeBadge(providerCopy[provider].mode)}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{providerCopy[provider].description}</p>
            {providerCopy[provider].env && <p className="mt-2 text-[11px] leading-5 text-amber-100">Requires {providerCopy[provider].env}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}
