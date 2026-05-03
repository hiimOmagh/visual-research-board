import type { BoardSection, LibraryImportSummary, ProjectLibrary, ProviderHealth, ResearchProject, ResearchRequest, ResearchResponse, ResearchResult, SearchHistoryEntry, SearchResultSnapshot } from "@/types/research";
import { scoreResult } from "@/lib/scoring";
import { buildQualityReasons, classifySourceDomain } from "@/lib/result-quality";

export const PROJECT_SCHEMA_VERSION = "0.1.0-alpha.10" as const;
export const LIBRARY_SCHEMA_VERSION = "0.1.0-alpha.10" as const;
export const INBOX_SECTION_ID = "section_inbox";
export const PUBLIC_DOMAIN_SECTION_ID = "section_public_domain";
export const THUMBNAIL_SECTION_ID = "section_thumbnail";
export const MAX_SEARCH_HISTORY = 50;
export const MAX_RESULT_SNAPSHOTS = 20;

function nowIso(): string {
  return new Date().toISOString();
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultSections(): BoardSection[] {
  const createdAt = nowIso();
  return [
    {
      id: INBOX_SECTION_ID,
      name: "Inbox",
      description: "Default holding area for newly saved references.",
      created_at: createdAt
    },
    {
      id: PUBLIC_DOMAIN_SECTION_ID,
      name: "Public-domain / CC candidates",
      description: "Items that still require manual license verification.",
      created_at: createdAt
    },
    {
      id: THUMBNAIL_SECTION_ID,
      name: "Thumbnail / production ideas",
      description: "References that may help composition, framing, or visual strategy.",
      created_at: createdAt
    }
  ];
}

export function createEmptyProject(name = "Untitled research project"): ResearchProject {
  const createdAt = nowIso();
  return {
    schema_version: PROJECT_SCHEMA_VERSION,
    id: createId("project"),
    name,
    created_at: createdAt,
    updated_at: createdAt,
    board_sections: createDefaultSections(),
    saved_results: [],
    search_history: [],
    result_snapshots: []
  };
}

export function createProjectLibrary(initialProject = createEmptyProject("Visual research project")): ProjectLibrary {
  return {
    schema_version: LIBRARY_SCHEMA_VERSION,
    active_project_id: initialProject.id,
    projects: [initialProject],
    updated_at: nowIso()
  };
}

export function createSection(name: string): BoardSection {
  return {
    id: createId("section"),
    name: name.trim() || "Untitled section",
    created_at: nowIso()
  };
}

export function ensureResultQuality(result: ResearchResult): ResearchResult {
  const source_group = result.source_group ?? classifySourceDomain(result.source_domain);
  const scores = result.scores ?? scoreResult(result);
  const enriched = {
    ...result,
    source_group,
    scores,
    duplicate_group_key: result.duplicate_group_key ?? result.source_url.toLowerCase()
  };
  return {
    ...enriched,
    quality_reasons: result.quality_reasons?.length ? result.quality_reasons : buildQualityReasons(enriched)
  };
}

export function assignDefaultSection(result: ResearchResult): ResearchResult {
  const enriched = ensureResultQuality(result);
  if (enriched.section_id) return enriched;
  if (enriched.license_detected === "public_domain" || enriched.license_detected === "creative_commons") {
    return { ...enriched, section_id: PUBLIC_DOMAIN_SECTION_ID };
  }
  if (enriched.tags.some((tag) => tag.includes("thumbnail") || tag.includes("composition"))) {
    return { ...enriched, section_id: THUMBNAIL_SECTION_ID };
  }
  return { ...enriched, section_id: INBOX_SECTION_ID };
}

function normalizeProviderHealth(health: ProviderHealth[]): ProviderHealth[] {
  return health.map((item) => ({
    ...item,
    result_type_counts: item.result_type_counts ?? {},
    query_sample: item.query_sample ?? [],
    endpoint_sample: item.endpoint_sample ?? []
  }));
}

function normalizeSnapshot(snapshot: Partial<SearchResultSnapshot>): SearchResultSnapshot | null {
  if (!snapshot || !snapshot.request || !snapshot.search_plan || !snapshot.diagnostics || !Array.isArray(snapshot.results)) return null;
  return {
    id: snapshot.id || createId("snapshot"),
    request: snapshot.request,
    search_plan: snapshot.search_plan,
    diagnostics: {
      ...snapshot.diagnostics,
      provider_toggles: snapshot.diagnostics.provider_toggles ?? snapshot.request.provider_toggles ?? { mock: true, wikimedia: true, brave: true, tavily: true },
      mock_only: snapshot.diagnostics.mock_only ?? false,
      provider_health: normalizeProviderHealth(snapshot.diagnostics.provider_health ?? [])
    },
    results: snapshot.results.map(ensureResultQuality),
    created_at: snapshot.created_at || snapshot.diagnostics.generated_at || nowIso(),
    label: snapshot.label || snapshot.request.topic
  };
}

function normalizeHistoryEntry(entry: Partial<SearchHistoryEntry>): SearchHistoryEntry | null {
  if (!entry || !entry.topic || !entry.mode || !entry.depth || !entry.generated_at) return null;
  return {
    id: entry.id || createId("search"),
    snapshot_id: entry.snapshot_id || "",
    topic: entry.topic,
    mode: entry.mode,
    depth: entry.depth,
    generated_at: entry.generated_at,
    query_count: entry.query_count ?? 0,
    result_count: entry.result_count ?? 0,
    duplicate_count: entry.duplicate_count ?? 0,
    provider_health: normalizeProviderHealth(entry.provider_health ?? []),
    provider_toggles: entry.provider_toggles ?? {
      mock: true,
      wikimedia: true,
      brave: true,
      tavily: true
    }
  };
}

export function normalizeProject(project: Partial<ResearchProject> & { name?: string; id?: string }): ResearchProject {
  const fallback = createEmptyProject(project.name || "Migrated research project");
  const normalizedSnapshots = (project.result_snapshots ?? [])
    .map((snapshot) => normalizeSnapshot(snapshot))
    .filter((snapshot): snapshot is SearchResultSnapshot => Boolean(snapshot));
  const normalizedHistory = (project.search_history ?? [])
    .map((entry) => normalizeHistoryEntry(entry))
    .filter((entry): entry is SearchHistoryEntry => Boolean(entry));

  return {
    ...fallback,
    ...project,
    schema_version: PROJECT_SCHEMA_VERSION,
    id: project.id || fallback.id,
    name: project.name || fallback.name,
    created_at: project.created_at || fallback.created_at,
    updated_at: project.updated_at || nowIso(),
    board_sections: project.board_sections?.length ? project.board_sections : fallback.board_sections,
    saved_results: (project.saved_results ?? []).map(assignDefaultSection),
    search_history: normalizedHistory.slice(0, MAX_SEARCH_HISTORY),
    result_snapshots: normalizedSnapshots.slice(0, MAX_RESULT_SNAPSHOTS)
  };
}

export function normalizeLibrary(library: Partial<ProjectLibrary>): ProjectLibrary {
  const projects = Array.isArray(library.projects) && library.projects.length > 0
    ? library.projects.map(normalizeProject)
    : [createEmptyProject("Visual research project")];

  const activeProjectId = projects.some((project) => project.id === library.active_project_id)
    ? String(library.active_project_id)
    : projects[0].id;

  return {
    schema_version: LIBRARY_SCHEMA_VERSION,
    active_project_id: activeProjectId,
    projects,
    updated_at: library.updated_at || nowIso()
  };
}

export function getActiveProject(library: ProjectLibrary): ResearchProject {
  return library.projects.find((project) => project.id === library.active_project_id) ?? library.projects[0];
}

export function updateActiveProject(library: ProjectLibrary, updater: (project: ResearchProject) => ResearchProject): ProjectLibrary {
  const activeProjectId = library.active_project_id;
  const projects = library.projects.map((project) => {
    if (project.id !== activeProjectId) return project;
    return updater({ ...project, updated_at: nowIso() });
  });

  return {
    ...library,
    projects,
    updated_at: nowIso()
  };
}

export function upsertProject(library: ProjectLibrary, project: ResearchProject): ProjectLibrary {
  const normalized = normalizeProject(project);
  const exists = library.projects.some((entry) => entry.id === normalized.id);
  return {
    ...library,
    active_project_id: normalized.id,
    projects: exists
      ? library.projects.map((entry) => entry.id === normalized.id ? normalized : entry)
      : [normalized, ...library.projects],
    updated_at: nowIso()
  };
}

export function removeProject(library: ProjectLibrary, projectId: string): ProjectLibrary {
  const remaining = library.projects.filter((project) => project.id !== projectId);
  const projects = remaining.length > 0 ? remaining : [createEmptyProject("Visual research project")];
  return {
    schema_version: LIBRARY_SCHEMA_VERSION,
    active_project_id: projects[0].id,
    projects,
    updated_at: nowIso()
  };
}

export function duplicateProject(project: ResearchProject): ResearchProject {
  const now = nowIso();
  return {
    ...project,
    schema_version: PROJECT_SCHEMA_VERSION,
    id: createId("project"),
    name: `${project.name} copy`,
    created_at: now,
    updated_at: now,
    saved_results: project.saved_results.map((item) => ({ ...item, updated_at: now })),
    search_history: [...project.search_history],
    result_snapshots: [...project.result_snapshots],
    board_sections: [...project.board_sections]
  };
}

export function createSearchSnapshot(response: ResearchResponse, request: ResearchRequest): SearchResultSnapshot {
  return {
    id: createId("snapshot"),
    request,
    search_plan: response.search_plan,
    diagnostics: response.diagnostics,
    results: response.results,
    created_at: response.diagnostics.generated_at,
    label: `${request.topic} · ${request.mode} · ${request.depth}`
  };
}

export function createSearchHistoryEntry(response: ResearchResponse, request: ResearchRequest, snapshotId: string): SearchHistoryEntry {
  return {
    id: createId("search"),
    snapshot_id: snapshotId,
    topic: request.topic,
    mode: request.mode,
    depth: request.depth,
    generated_at: response.diagnostics.generated_at,
    query_count: response.search_plan.queries.length,
    result_count: response.results.length,
    duplicate_count: response.diagnostics.duplicate_count,
    provider_health: response.diagnostics.provider_health,
    provider_toggles: response.diagnostics.provider_toggles
  };
}

export function providerSummary(health: ProviderHealth[]): string {
  return health
    .map((item) => `${item.provider}:${item.status}:${item.result_count}`)
    .join(" | ");
}

interface MergeLibrariesResult {
  library: ProjectLibrary;
  summary: LibraryImportSummary;
}

/**
 * Merge an incoming (imported) library into an existing one without ever
 * replacing the user's existing projects.
 *
 * - Projects whose IDs collide with existing ones are remapped to fresh IDs.
 * - Projects whose names collide with existing ones are renamed with an
 *   "(imported)" suffix and a numeric counter if needed.
 * - Invalid project entries (missing id, no name, non-array projects, etc.)
 *   are rejected and reported.
 * - The previously active project remains active. If it is missing for some
 *   reason, the first existing project is selected.
 */
export function mergeLibraries(existing: ProjectLibrary, incoming: Partial<ProjectLibrary>): MergeLibrariesResult {
  const existingNormalized = normalizeLibrary(existing);
  const existingIds = new Set(existingNormalized.projects.map((project) => project.id));
  const existingNames = new Set(existingNormalized.projects.map((project) => project.name.trim().toLowerCase()));

  const rejectedReasons: string[] = [];
  const imported: ResearchProject[] = [];

  let remappedCount = 0;
  let renamedCount = 0;

  const candidateProjects = Array.isArray(incoming?.projects) ? incoming.projects : [];

  for (const candidate of candidateProjects) {
    if (!candidate || typeof candidate !== "object") {
      rejectedReasons.push("Skipped a non-object project entry.");
      continue;
    }
    if (typeof (candidate as { name?: unknown }).name !== "string" || !(candidate as { name?: string }).name?.trim()) {
      rejectedReasons.push("Skipped a project entry with no name.");
      continue;
    }

    const normalized = normalizeProject(candidate as Partial<ResearchProject>);
    let importedProject = normalized;

    if (existingIds.has(importedProject.id)) {
      importedProject = { ...importedProject, id: createId("project") };
      remappedCount += 1;
    }

    let candidateName = importedProject.name.trim() || "Imported project";
    if (existingNames.has(candidateName.toLowerCase())) {
      let suffix = 1;
      let attempt = `${candidateName} (imported)`;
      while (existingNames.has(attempt.toLowerCase())) {
        suffix += 1;
        attempt = `${candidateName} (imported ${suffix})`;
      }
      importedProject = { ...importedProject, name: attempt };
      renamedCount += 1;
      candidateName = attempt;
    }

    existingIds.add(importedProject.id);
    existingNames.add(candidateName.toLowerCase());
    imported.push(importedProject);
  }

  if (imported.length === 0) {
    return {
      library: existingNormalized,
      summary: {
        status: "rejected",
        imported_count: 0,
        renamed_count: 0,
        remapped_count: 0,
        rejected_count: rejectedReasons.length,
        total_projects_after_import: existingNormalized.projects.length,
        active_project_changed: false,
        rejected_reasons: rejectedReasons,
        message: rejectedReasons.length > 0
          ? "No projects could be imported. The existing library was not changed."
          : "The imported file did not contain any projects."
      }
    };
  }

  const mergedProjects: ResearchProject[] = [...existingNormalized.projects, ...imported];

  // Active project always stays as the previously active project. We never
  // replace the user's working project from an import.
  const activeProjectId = existingNormalized.active_project_id;
  const activeStillValid = mergedProjects.some((project) => project.id === activeProjectId);

  const merged: ProjectLibrary = {
    schema_version: LIBRARY_SCHEMA_VERSION,
    active_project_id: activeStillValid ? activeProjectId : mergedProjects[0].id,
    projects: mergedProjects,
    updated_at: nowIso()
  };

  const summary: LibraryImportSummary = {
    status: rejectedReasons.length > 0 ? "merged" : "ok",
    imported_count: imported.length,
    renamed_count: renamedCount,
    remapped_count: remappedCount,
    rejected_count: rejectedReasons.length,
    total_projects_after_import: merged.projects.length,
    active_project_changed: !activeStillValid,
    rejected_reasons: rejectedReasons,
    message: buildImportMessage(imported.length, renamedCount, remappedCount, rejectedReasons.length)
  };

  return { library: merged, summary };
}

function buildImportMessage(imported: number, renamed: number, remapped: number, rejected: number): string {
  const parts: string[] = [];
  parts.push(`Imported ${imported} project${imported === 1 ? "" : "s"}`);
  if (renamed > 0) parts.push(`renamed ${renamed}`);
  if (remapped > 0) parts.push(`remapped ${remapped} duplicate id${remapped === 1 ? "" : "s"}`);
  if (rejected > 0) parts.push(`skipped ${rejected} invalid entr${rejected === 1 ? "y" : "ies"}`);
  return `${parts.join(", ")}.`;
}
