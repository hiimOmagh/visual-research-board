
import type { BookReferenceCandidate } from "@/types/book-reference";
import {
  createBibliographyLabel,
  normalizeBookReferenceCandidate
} from "@/lib/book-bibliographic-discovery";
import { SourceClassBadge } from "@/components/search/SourceClassBadge";

type BookBibliographicDiscoveryPanelProps = {
  candidate: BookReferenceCandidate;
};

export function BookBibliographicDiscoveryPanel({ candidate }: BookBibliographicDiscoveryPanelProps) {
  const normalized = normalizeBookReferenceCandidate(candidate);
  const bibliographyLabel = createBibliographyLabel(candidate);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Book / bibliographic discovery
            </p>
            <h2 className="mt-1 text-lg font-semibold">{candidate.title}</h2>
            <p className="mt-2 text-sm text-slate-300">
              Book references are metadata-first discovery objects for ISBN records, catalog entries,
              previews, open-access scans, archive links, and bibliography context. This layer does not
              enable copyrighted text extraction, full-text scraping, paywall bypass, or access circumvention.
            </p>
          </div>
          <SourceClassBadge sourceClass="book" />
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Source type</p>
            <p className="mt-1 font-medium">{normalized.source_type}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Access state</p>
            <p className="mt-1 font-medium">{normalized.access_state}</p>
          </div>
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Bibliography</p>
            <p className="mt-1 font-medium">Metadata only</p>
          </div>
        </div>

        <p className="rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
          {bibliographyLabel}
        </p>

        <ul className="space-y-1 text-xs text-slate-400">
          {normalized.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
