"use client";

import type { UxReliabilityAudit, UxReadinessStatus } from "@/lib/ux-reliability";

const statusClass: Record<UxReadinessStatus, string> = {
  ready: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  needs_action: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  blocked: "border-red-400/30 bg-red-400/10 text-red-100"
};

const statusLabel: Record<UxReadinessStatus, string> = {
  ready: "Ready",
  needs_action: "Needs action",
  blocked: "Blocked"
};

interface UXReliabilityPanelProps {
  audit: UxReliabilityAudit;
  onLoadDemoProject: () => void;
  onSearchDemoTopic: () => void;
}

export function UXReliabilityPanel({ audit, onLoadDemoProject, onSearchDemoTopic }: UXReliabilityPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft" aria-label="UX reliability and onboarding">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">UX reliability</p>
          <h2 className="mt-1 text-xl font-bold text-white">Workflow readiness</h2>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
            v2.0.5 tracks the full demo path: project → providers → search → reference launchers → saved board → review → claims → coverage → export.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[audit.status]}`}>{statusLabel[audit.status]}</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">{audit.readiness_score}% ready</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Projects" value={audit.project_count} />
        <Metric label="Saved" value={audit.saved_count} />
        <Metric label="Claims" value={audit.claim_count} />
        <Metric label="Reviewed" value={audit.reviewed_count} />
        <Metric label="Free-core on" value={audit.provider_setup.free_core_enabled_count} />
        <Metric label="Active providers" value={audit.provider_setup.active_provider_count} />
        <Metric label="Reference launchers" value={audit.reference_launcher_count || 9} />
        <Metric label="Exportable" value={audit.exportable_count} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">Guided workflow checklist</h3>
            <span className="text-[11px] text-slate-500">{audit.steps.filter((step) => step.status === "ready").length}/{audit.steps.length} complete</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {audit.steps.map((step) => (
              <article key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{step.label}</h4>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${statusClass[step.status]}`}>{statusLabel[step.status]}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
                {step.status !== "ready" && <p className="mt-2 text-[11px] leading-5 text-amber-100">Next: {step.next_action}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-4">
            <h3 className="text-sm font-bold text-lime-100">Start fast</h3>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Load a deterministic sample board or run a safe demo topic. This gives first-time users a visible workflow without requiring external keys.
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={onLoadDemoProject}
                className="rounded-xl bg-lime-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
              >
                Load demo project
              </button>
              <button
                type="button"
                onClick={onSearchDemoTopic}
                className="rounded-xl border border-lime-300/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:border-lime-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
              >
                Use demo search topic
              </button>
            </div>
          </div>

          {(audit.empty_states.length > 0 || audit.warnings.length > 0) && (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
              <h3 className="text-sm font-bold text-amber-50">Reliability notes</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-100">
                {[...audit.empty_states, ...audit.warnings].slice(0, 7).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-bold text-white">Next actions</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-5 text-slate-400">
              {audit.next_actions.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
