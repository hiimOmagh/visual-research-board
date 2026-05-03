"use client";

import type { ProviderToggleMap, SearchProviderName } from "@/types/research";
import { SEARCH_PROVIDERS } from "@/types/research";

const providerCopy: Record<SearchProviderName, { label: string; description: string; env?: string }> = {
  mock: { label: "Mock", description: "Always available deterministic demo results. Keep this on for safe local validation." },
  wikimedia: { label: "Wikimedia", description: "Commons-oriented public-domain / CC candidates. No API key required." },
  brave: { label: "Brave", description: "Image and web search when the Brave Search API key is present.", env: "BRAVE_SEARCH_API_KEY" },
  tavily: { label: "Tavily", description: "Research/web extraction provider when the Tavily API key is present.", env: "TAVILY_API_KEY" }
};

interface ProviderTogglePanelProps { toggles: ProviderToggleMap; onChange: (next: ProviderToggleMap) => void; }

export function ProviderTogglePanel({ toggles, onChange }: ProviderTogglePanelProps) {
  const toggleProvider = (provider: SearchProviderName) => {
    const next = { ...toggles, [provider]: !toggles[provider] };
    if (!next.mock && !next.wikimedia && !next.brave && !next.tavily) next.mock = true;
    onChange(next);
  };
  const enableMockOnly = () => onChange({ mock: true, wikimedia: false, brave: false, tavily: false });
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Provider toggles</p>
          <h2 className="mt-1 text-xl font-bold text-white">Search sources</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Disable noisy providers while testing. If every provider is switched off, mock is re-enabled so the workflow remains usable.</p>
        </div>
        <button type="button" onClick={enableMockOnly} className="rounded-2xl border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-xs font-semibold text-lime-100 transition hover:border-lime-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60">Mock-only safe mode</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SEARCH_PROVIDERS.map((provider) => (
          <button key={provider} type="button" onClick={() => toggleProvider(provider)} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60 ${toggles[provider] ? "border-lime-300/40 bg-lime-300/10" : "border-white/10 bg-black/20 hover:border-white/25"}`} aria-pressed={toggles[provider]}>
            <div className="flex items-center justify-between gap-3"><span className="font-semibold text-white">{providerCopy[provider].label}</span><span className={`rounded-full px-2 py-1 text-[11px] ${toggles[provider] ? "bg-lime-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>{toggles[provider] ? "On" : "Off"}</span></div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{providerCopy[provider].description}</p>
            {providerCopy[provider].env && <p className="mt-2 text-[11px] leading-5 text-amber-100">Requires {providerCopy[provider].env}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}
