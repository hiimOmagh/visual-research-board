"use client";

import { useEffect, useState } from "react";
import CreatorWorkflowPanel from "./CreatorWorkflowPanel";

export default function CreatorWorkflowHydrationBoundary() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <section
        aria-busy="true"
        data-testid="creator-workflow-hydration-boundary"
        data-hydration-boundary="client-mounted"
        data-workflow="creator-workflow"
        data-hydration-loading="creator-workflow-hydration-loading"
        className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100"
      >
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-lime-300">
            Visual Research Board
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white">
            Loading creator workflow
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Preparing the local-first research workspace. This stable shell prevents
            static-export hydration drift before the interactive board mounts.
          </p>
        </div>
      </section>
    );
  }

  return <CreatorWorkflowPanel />;
}
