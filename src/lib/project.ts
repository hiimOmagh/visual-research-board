import type { BoardSection, ProjectLibrary, ProviderHealth, ResearchProject, ResearchRequest, ResearchResponse, ResearchResult, SearchHistoryEntry } from "@/types/research";

export const PROJECT_SCHEMA_VERSION = "0.1.0-alpha.5" as const;
export const LIBRARY_SCHEMA_VERSION = "0.1.0-alpha.5" as const;
export const INBOX_SECTION_ID = "section_inbox";
export const PUBLIC_DOMAIN_SECTION_ID = "section_public_domain";
export const THUMBNAIL_SECTION_ID = "section_thumbnail";

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
    search_history: []
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

export function normalizeProject(project: Partial<ResearchProject> & { name?: string; id?: string }): ResearchProject {
  const fallback = createEmptyProject(project.name || "Migrated research project");
  return {
    ...fallback,
    ...project,
    schema_version: PROJECT_SCHEMA_VERSION,
    id: project.id || fallback.id,
    name: project.name || fallback.name,
    created_at: project.created_at || fallback.created_at,
    updated_at: project.updated_at || new Date().toISOString(),
    board_sections: project.board_sections?.length ? project.board_sections : fallback.board_sections,
    saved_results: (project.saved_results ?? []).map(assignDefaultSection),
    search_history: project.search_history ?? []
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
  const exists = library.projects.some((entry) => entry.id === project.id);
  return {
    ...library,
    active_project_id: project.id,
    projects: exists
      ? library.projects.map((entry) => entry.id === project.id ? project : entry)
      : [project, ...library.projects],
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
    board_sections: [...project.board_sections]
  };
}

export function createSearchHistoryEntry(response: ResearchResponse, request: ResearchRequest): SearchHistoryEntry {
  return {
    id: createId("search"),
    topic: request.topic,
    mode: request.mode,
    depth: request.depth,
    generated_at: response.diagnostics.generated_at,
    query_count: response.search_plan.queries.length,
    result_count: response.results.length,
    duplicate_count: response.diagnostics.duplicate_count,
    provider_health: response.diagnostics.provider_health
  };
}

export function providerSummary(health: ProviderHealth[]): string {
  return health
    .map((item) => `${item.provider}:${item.status}:${item.result_count}`)
    .join(" | ");
}
