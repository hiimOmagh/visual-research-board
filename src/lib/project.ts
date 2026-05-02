import type { BoardSection, ProjectLibrary, ProviderHealth, ResearchProject, ResearchRequest, ResearchResponse, ResearchResult, SearchHistoryEntry, SearchResultSnapshot } from "@/types/research";

export const PROJECT_SCHEMA_VERSION = "0.1.0-alpha.6" as const;
export const LIBRARY_SCHEMA_VERSION = "0.1.0-alpha.6" as const;
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

export function assignDefaultSection(result: ResearchResult): ResearchResult {
  if (result.section_id) return result;
  if (result.license_detected === "public_domain" || result.license_detected === "creative_commons") {
    return { ...result, section_id: PUBLIC_DOMAIN_SECTION_ID };
  }
  if (result.tags.some((tag) => tag.includes("thumbnail") || tag.includes("composition"))) {
    return { ...result, section_id: THUMBNAIL_SECTION_ID };
  }
  return { ...result, section_id: INBOX_SECTION_ID };
}

function normalizeProviderHealth(health: ProviderHealth[]): ProviderHealth[] {
  return health.map((item) => ({
    ...item,
    query_sample: item.query_sample ?? []
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
      provider_health: normalizeProviderHealth(snapshot.diagnostics.provider_health ?? [])
    },
    results: snapshot.results,
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
