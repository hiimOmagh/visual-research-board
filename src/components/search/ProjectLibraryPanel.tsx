"use client";

import { useRef } from "react";
import type { ProjectLibrary, ResearchProject } from "@/types/research";

interface ProjectLibraryPanelProps {
  library: ProjectLibrary;
  activeProject: ResearchProject;
  onSelectProject: (projectId: string) => void;
  onRenameActiveProject: (name: string) => void;
  onNewProject: () => void;
  onDuplicateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onExportLibrary: () => void;
  onImportLibraryFile: (file: File) => void;
}

export function ProjectLibraryPanel({
  library,
  activeProject,
  onSelectProject,
  onRenameActiveProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
  onExportLibrary,
  onImportLibraryFile
}: ProjectLibraryPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sortedProjects = [...library.projects].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const totalSnapshots = library.projects.reduce((total, project) => total + project.result_snapshots.length, 0);

  return (
    <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-soft">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_auto_auto_auto_auto] xl:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Project library</span>
          <select
            value={activeProject.id}
            onChange={(event) => onSelectProject(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-lime-300/40 focus:ring-4"
            aria-label="Active project selector"
          >
            {sortedProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} · {project.saved_results.length} saved · {project.search_history.length} searches · {project.result_snapshots.length} snapshots
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Active project name</span>
          <input
            value={activeProject.name}
            onChange={(event) => onRenameActiveProject(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none ring-lime-300/40 placeholder:text-slate-500 focus:ring-4"
            placeholder="Project name"
            aria-label="Active project name"
          />
        </label>

        <ProjectStat label="Projects" value={library.projects.length} />
        <ProjectStat label="Saved" value={activeProject.saved_results.length} />
        <ProjectStat label="Searches" value={activeProject.search_history.length} />
        <ProjectStat label="Snapshots" value={totalSnapshots} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onNewProject}
          className="rounded-2xl border border-lime-300/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:border-lime-300/70"
        >
          New project
        </button>
        <button
          type="button"
          onClick={onDuplicateProject}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/60"
        >
          Duplicate active
        </button>
        <button
          type="button"
          onClick={onExportLibrary}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/60"
        >
          Export library
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-lime-300/60"
        >
          Import library
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportLibraryFile(file);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => onDeleteProject(activeProject.id)}
          disabled={library.projects.length <= 1}
          className="rounded-2xl border border-red-300/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-300/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
        >
          Delete active
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Alpha.8 stores a local multi-project library with persistent result snapshots and conflict-safe import/export bundles in browser localStorage. Existing projects are never overwritten by an import.
      </p>
    </section>
  );
}

function ProjectStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
      <span className="block text-xs text-slate-500">{label}</span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}
