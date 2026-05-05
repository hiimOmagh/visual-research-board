import { PUBLIC_DEMO_RELEASE_CANDIDATE } from "@/lib/public-demo-release-candidate";

export function PublicDemoReleaseCandidatePanel() {
  return (
    <section
      aria-label="Public demo release candidate status"
      className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-100 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            {PUBLIC_DEMO_RELEASE_CANDIDATE.releaseLabel}
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            Demo-safe public release candidate
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            This demo is safe to inspect without private credentials. It does not
            imply live scraping, production OAuth, legal clearance, or
            source-verification guarantees.
          </p>
        </div>

        <ul className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
          {PUBLIC_DEMO_RELEASE_CANDIDATE.limitations.map((limitation) => (
            <li key={limitation} className="rounded-xl bg-slate-900/70 p-3">
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
