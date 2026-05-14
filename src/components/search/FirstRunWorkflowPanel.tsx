
import {
  FIRST_RUN_WORKFLOW_VERSION,
  firstRunBoundaryCopy,
  firstRunEmptyStateGuidance,
  firstRunPrimaryNextAction,
  firstRunValueProposition,
  firstRunWorkflowSteps
} from "@/lib/first-run-workflow";

export function FirstRunWorkflowPanel() {
  return (
    <section
      aria-label="First-run workflow guidance"
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm"
      data-testid="first-run-workflow-panel"
      data-release={FIRST_RUN_WORKFLOW_VERSION}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          First-run workflow
        </p>
        <h2 className="text-lg font-semibold text-slate-100">
          From search results to a source-aware activation pack
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          {firstRunValueProposition}
        </p>
        <p className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
          Next action: {firstRunPrimaryNextAction}
        </p>
      </div>

      <ol className="mt-4 grid gap-3 md:grid-cols-5">
        {firstRunWorkflowSteps.map((step, index) => (
          <li key={step.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100">
                {index + 1}
              </span>
              <h3 className="text-sm font-semibold text-slate-100">{step.title}</h3>
            </div>
            <p className="text-xs leading-5 text-slate-300">{step.action}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{step.outcome}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <h3 className="text-sm font-semibold text-slate-100">When the board is empty</h3>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
            {firstRunEmptyStateGuidance.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <h3 className="text-sm font-semibold text-slate-100">Boundaries</h3>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
            {firstRunBoundaryCopy.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
