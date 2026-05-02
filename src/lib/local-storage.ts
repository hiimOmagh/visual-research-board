import type { ProjectLibrary, ResearchProject, ResearchResult } from "@/types/research";
import { assignDefaultSection, createEmptyProject, createProjectLibrary, normalizeLibrary, normalizeProject } from "@/lib/project";

const PROJECT_LIBRARY_STORAGE_KEY = "visual-research-board:project-library:v0.1.0-alpha.6";
const LEGACY_PROJECT_LIBRARY_KEYS = [
  "visual-research-board:project-library:v0.1.0-alpha.5"
];
const LEGACY_ACTIVE_PROJECT_KEY = "visual-research-board:active-project:v0.1.0-alpha.4";
const LEGACY_SAVED_KEYS = [
  "visual-research-board:saved-results:v0.1.0-alpha.3",
  "visual-research-board:saved-results:v0.1.0-alpha.2",
  "visual-research-board:saved-results:v0.1.0-alpha.1"
];

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadLegacySavedResults(): ResearchResult[] {
  if (typeof window === "undefined") return [];
  for (const legacyKey of LEGACY_SAVED_KEYS) {
    const legacy = parseJson<ResearchResult[]>(window.localStorage.getItem(legacyKey));
    if (Array.isArray(legacy) && legacy.length > 0) return legacy.map(assignDefaultSection);
  }
  return [];
}

function loadLegacyLibrary(): ProjectLibrary | null {
  if (typeof window === "undefined") return null;
  for (const legacyKey of LEGACY_PROJECT_LIBRARY_KEYS) {
    const legacyLibrary = parseJson<ProjectLibrary>(window.localStorage.getItem(legacyKey));
    if (legacyLibrary) return normalizeLibrary(legacyLibrary);
  }
  return null;
}

function migrateLegacyProject(): ProjectLibrary | null {
  if (typeof window === "undefined") return null;

  const legacyLibrary = loadLegacyLibrary();
  if (legacyLibrary) return legacyLibrary;

  const legacyProject = parseJson<ResearchProject>(window.localStorage.getItem(LEGACY_ACTIVE_PROJECT_KEY));
  if (legacyProject) {
    return createProjectLibrary(normalizeProject(legacyProject));
  }

  const legacySaved = loadLegacySavedResults();
  if (legacySaved.length > 0) {
    const migrated = createEmptyProject("Migrated alpha board");
    migrated.saved_results = legacySaved;
    migrated.updated_at = new Date().toISOString();
    return createProjectLibrary(migrated);
  }

  return null;
}

export function loadProjectLibrary(): ProjectLibrary {
  if (typeof window === "undefined") return createProjectLibrary(createEmptyProject("Visual research project"));

  const current = parseJson<ProjectLibrary>(window.localStorage.getItem(PROJECT_LIBRARY_STORAGE_KEY));
  if (current) return normalizeLibrary(current);

  const migrated = migrateLegacyProject() ?? createProjectLibrary(createEmptyProject("Visual research project"));
  window.localStorage.setItem(PROJECT_LIBRARY_STORAGE_KEY, JSON.stringify(migrated));
  return migrated;
}

export function persistProjectLibrary(library: ProjectLibrary): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECT_LIBRARY_STORAGE_KEY, JSON.stringify({ ...normalizeLibrary(library), updated_at: new Date().toISOString() }));
}

export function createFreshProject(name?: string): ResearchProject {
  return createEmptyProject(name ?? "Visual research project");
}

export { PROJECT_LIBRARY_STORAGE_KEY, LEGACY_PROJECT_LIBRARY_KEYS };
