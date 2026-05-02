"use client";

import type { ProviderToggleMap, SearchProviderName } from "@/types/research";
import { SEARCH_PROVIDERS } from "@/types/research";

const providerCopy: Record<SearchProviderName, { label: string; description: string }> = {
  mock: {
    label: "Mock",
    description: "Always available deterministic demo results."
  },
  wikimedia: {
    label: "Wikimedia",
    description: "Commons-oriented public-domain / CC candidates."
  },
  brave: {
    label: "Brave",
    description: "Image and web search when API key is present."
  },
  tavily: {
    label: "Tavily",
    description: "Research/web extraction provider when API key is present."
  }
};

interface ProviderTogglePanelProps {
  toggles: ProviderToggleMap;
  onChange: (next: ProviderToggleMap) => void;
}

export function ProviderTogglePanel({ toggles, onChange }: ProviderTogglePanelProps) {
  const toggleProvider = (provider: SearchProviderName) => {
    const next = { ...toggles, [provider]: !toggles[provider] };
    if (!next.mock && !next.wikimedia && !next.brave && !next.tavily) {
      next.mock = true;
    }
    onChange(next);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Provider toggles</p>
        <h2 className="mt-1 text-xl font-bold text-white">Search sources</h2>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Disable noisy providers while testing. If every provider is switched off, mock is re-enabled so the workflow remains usable.
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SEARCH_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => toggleProvider(provider)}
            className={`rounded-2xl border p-4 text-left transition ${toggles[provider] ? "border-lime-300/40 bg-lime-300/10" : "border-white/10 bg-black/20 hover:border-white/25"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white">{providerCopy[provider].label}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] ${toggles[provider] ? "bg-lime-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>
                {toggles[provider] ? "On" : "Off"}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{providerCopy[provider].description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
