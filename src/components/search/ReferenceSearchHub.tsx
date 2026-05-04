"use client";

import type { ReferenceSearchLink } from "@/types/research";
import { buildReferenceSearchLinks, referenceSearchPolicySummary } from "@/lib/reference-search";

export function ReferenceSearchHub({ topic, links }: { topic: string; links?: ReferenceSearchLink[] }) {
  const searchLinks = links && links.length > 0 ? links : buildReferenceSearchLinks(topic);
  if (searchLinks.length === 0) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="Reference Search Hub">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Reference Search Hub</p>
          <h2 className="mt-1 text-xl font-bold text-white">Manual search launchers</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">{referenceSearchPolicySummary()} This component does not scrape search result pages.</p>
        </div>
        <div className="rounded-2xl border border-blue-300/20 bg-blue-300/[0.06] px-4 py-3 text-xs leading-5 text-blue-100">
          Search engines are reference-only. Verify rights before reuse or publication.
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {searchLinks.map((link) => (
          <a
            key={link.engine}
            href={link.search_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-lime-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
          >
            {link.label}
            <span className="mt-1 block text-[11px] font-normal text-slate-500">Launcher only · fetched_by_tool=false</span>
          </a>
        ))}
      </div>
    </section>
  );
}
