"use client";

import type { ResearchProject } from "@/types/research";

interface ProjectPanelProps {
  project: ResearchProject;
  onRename: (name: string) => void;
  onNewProject: () => void;
}

export function ProjectPanel({ project, onRename, onNewProject }: ProjectPanelProps) {
  return (
    <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Active project</span>
          <input
            value={project.name}
            onChange={(event) => onRename(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none ring-lime-300/40 placeholder:text-slate-500 focus:ring-4"
            placeholder="Project name"
          />
        </label>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Saved</span>
          <strong className="text-white">{project.saved_results.length}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <span className="block text-xs text-slate-500">Searches</span>
          <strong className="text-white">{project.search_history.length}</strong>
        </div>
        <button
          type="button"
          onClick={onNewProject}
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-lime-300/60"
        >
          New project
        </button>
      </div>
    </section>
  );
}
