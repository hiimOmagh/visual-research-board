const rawStaticBasePath = process.env.VISUAL_RESEARCH_BOARD_BASE_PATH?.trim() ?? "";
const vrbStaticBasePath =
  rawStaticBasePath && rawStaticBasePath !== "/" ? rawStaticBasePath.replace(/\/$/, "") : "";
const isStaticExport =
  process.env.VISUAL_RESEARCH_BOARD_STATIC_EXPORT === "true" ||
  process.env.NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_STATIC_DEMO === "true";

function vrbRouteHref(href: string): string {
  if (!href.startsWith("/")) {
    return href;
  }

  if (!vrbStaticBasePath || vrbStaticBasePath === "/") {
    return href;
  }

  if (href === vrbStaticBasePath || href.startsWith(`${vrbStaticBasePath}/`)) {
    return href;
  }

  return href === "/" ? `${vrbStaticBasePath}/` : `${vrbStaticBasePath}${href}`;
}

const routeSurface = [
  {
    route: "/",
    purpose: "Landing page and product entry point",
    runtimeOnly: false,
  },
  {
    route: "/creator-workflow",
    purpose: "End-to-end creator research workflow",
    runtimeOnly: false,
  },
  {
    route: "/api/search",
    purpose: "Local-first search endpoint with transparent fixture/demo or provider mode",
    runtimeOnly: true,
  },
  {
    route: "/api/export",
    purpose: "Evidence pack export endpoint",
    runtimeOnly: true,
  },
  {
    route: "/api/metadata",
    purpose: "URL metadata helper endpoint",
    runtimeOnly: true,
  },
  {
    route: "/api/provider-runtime",
    purpose: "Provider runtime status endpoint",
    runtimeOnly: true,
  },
];

function RuntimeOnlyBadge() {
  return (
    <span className="mt-3 inline-flex rounded-full border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-200">
      Server/runtime route — not linked in GitHub Pages static export
    </span>
  );
}

export default function HomePage() {
  return (
    <main
      data-testid="visual-research-board-landing"
      className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100"
    >
      <section className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Visual Research Board v2.4.0
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          Creator research workflow, with route surface integrity.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
          Build a project brief, preview the query plan, review discovery results,
          save references into board sections, and prepare an evidence pack export.
          The workflow stays local-first and avoids fake live claims. When real
          providers are unavailable, fixture/demo mode must be transparent.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={vrbRouteHref("/creator-workflow")}
            className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Open Creator Workflow
          </a>
          {isStaticExport ? (
            <span
              aria-disabled="true"
              className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-400"
              title="Provider runtime API is available only in server/runtime builds."
            >
              Provider Runtime: server/runtime only
            </span>
          ) : (
            <a
              href={vrbRouteHref("/api/provider-runtime")}
              className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100"
            >
              Check Provider Runtime
            </a>
          )}
        </div>
      </section>

      <section
        aria-label="Route Surface Integrity"
        className="mx-auto mt-8 max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Route Surface Integrity
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Protected product routes</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            v2.4.0 keeps the creator workflow visible from the landing page and
            restores the expected API route surface without adding packaging gates.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {routeSurface.map((item) => {
            const cardContent = (
              <>
                <div className="font-mono text-sm text-cyan-200">{item.route}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{item.purpose}</div>
                {isStaticExport && item.runtimeOnly ? <RuntimeOnlyBadge /> : null}
              </>
            );

            if (isStaticExport && item.runtimeOnly) {
              return (
                <div
                  key={item.route}
                  data-route-surface-card="runtime-only"
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <a
                key={item.route}
                href={vrbRouteHref(item.route)}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-300/60"
              >
                {cardContent}
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
