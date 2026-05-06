import type { ReferenceIntelligence } from "@/types/reference-intelligence";
import {
  createReferenceIntelligence,
  describeEvidenceRole,
  describeReferenceUse,
  summarizeReferenceIntelligence
} from "@/lib/reference-intelligence";

type ReferenceIntelligencePanelProps = {
  intelligence?: Partial<ReferenceIntelligence>;
  title?: string;
};

export function ReferenceIntelligencePanel({
  intelligence,
  title = "Reference intelligence"
}: ReferenceIntelligencePanelProps) {
  const normalized = createReferenceIntelligence(intelligence);
  const summary = summarizeReferenceIntelligence(normalized);

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            {title}
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            Use this result as a structured reference
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Reference intelligence classifies why a result matters. It does not block discovery; it adds role,
            access, rights, and risk context so the user can decide how to use the result.
          </p>
        </div>

        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Primary use</p>
            <p className="mt-1 font-medium">
              {summary.strongest_use === "unclassified"
                ? "Unclassified"
                : describeReferenceUse(summary.strongest_use)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Evidence role</p>
            <p className="mt-1 font-medium">{describeEvidenceRole(summary.evidence_role)}</p>
          </div>

          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Risk level</p>
            <p className="mt-1 font-medium">{summary.risk_level}</p>
          </div>

          <div className="rounded-xl bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Activation ready</p>
            <p className="mt-1 font-medium">{summary.activation_ready ? "Yes" : "Needs review"}</p>
          </div>
        </div>

        {normalized.use_as.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Reference roles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {normalized.use_as.map((useAs) => (
                <span key={useAs} className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-200">
                  {describeReferenceUse(useAs)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {normalized.interpretation_note ? (
          <p className="rounded-xl bg-slate-900/70 p-3 text-sm text-slate-300">
            {normalized.interpretation_note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
