import type { CoverageBiasAudit } from "@/types/research";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function topEntries(counts: Record<string, number> | undefined, limit = 5): Array<[string, number]> {
  return Object.entries(counts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function Metric({ label, value, help }: { label: string; value: string | number; help?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
      {help && <p className="mt-1 text-xs leading-5 text-slate-400">{help}</p>}
    </div>
  );
}

function CountList({ title, counts }: { title: string; counts: Record<string, number> | undefined }) {
  const entries = topEntries(counts);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {entries.map(([key, count]) => (
            <li key={key} className="flex items-center justify-between gap-3">
              <span className="truncate">{key}</span>
              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-xs text-slate-200">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CoverageBiasAuditPanel({ audit }: { audit: CoverageBiasAudit }) {
  const warningLevel = audit.warnings.length >= 4 ? "high" : audit.warnings.length >= 2 ? "medium" : "low";
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Coverage and bias audit</p>
          <h2 className="mt-1 text-xl font-bold text-white">Source diversity, rights risk, and claim coverage</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            v0.4.0 coverage gate: detects provider/domain concentration, reference-only overload, rights-risk accumulation, and unsupported or uncountered claims.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${warningLevel === "high" ? "border-red-300/30 bg-red-300/10 text-red-100" : warningLevel === "medium" ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-lime-300/30 bg-lime-300/10 text-lime-100"}`}>
          {audit.warnings.length} warning{audit.warnings.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Saved items" value={audit.total_saved_count} help={`${audit.provider_count} providers · ${audit.domain_count} domains`} />
        <Metric label="Dominant provider" value={audit.dominant_provider} help={`${percent(audit.dominant_provider_share)} concentration`} />
        <Metric label="Reusable candidates" value={audit.reusable_candidate_count} help={`${audit.public_domain_or_open_count} public-domain/open-license`} />
        <Metric label="Claim gaps" value={audit.claims_without_support_count + audit.claims_without_counter_count} help={`${audit.claims_without_support_count} no support · ${audit.claims_without_counter_count} no counter`} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <CountList title="Providers" counts={audit.provider_counts as Record<string, number>} />
        <CountList title="Domains" counts={audit.domain_counts} />
        <CountList title="Source groups" counts={audit.source_group_counts as Record<string, number>} />
        <CountList title="Rights status" counts={audit.rights_status_counts as Record<string, number>} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Reference only" value={audit.reference_only_count} />
        <Metric label="Check required" value={audit.check_required_count} />
        <Metric label="High reuse risk" value={audit.high_reuse_risk_count} />
      </div>

      {audit.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Audit warnings</p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-50">
            {audit.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
