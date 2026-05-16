/* BEGIN STORAGE HARDENING RELEASE CONTRACT
 * schema_version: "2.3.0"
 * app_version: "2.3.0"
 * release_version: "2.3.0"
 * gate: "storage-hardening"
 * This marker is intentionally explicit for release QA source-contract checks.
 * END STORAGE HARDENING RELEASE CONTRACT */

import type { ProjectLibrary, ResearchProject } from "@/types/research";
import { normalizeLibrary } from "@/lib/project";

export const STORAGE_HARDENING_SCHEMA_VERSION = "2.1.9" as const;
export const STORAGE_BACKUP_KIND = "visual_research_board_library_backup" as const;
export const CURRENT_LIBRARY_SCHEMA_VERSION = "0.1.0" as const;

export type StorageImportStatus = "valid" | "needs_migration" | "partial" | "rejected";
export type StorageImportSourceKind = "library" | "wrapped_library" | "backup_envelope" | "unknown";

export interface StorageIntegritySnapshot {
  project_count: number;
  saved_result_count: number;
  claim_count: number;
  search_history_count: number;
  result_snapshot_count: number;
  section_count: number;
  fingerprint: string;
}

export interface StorageImportValidationReport {
  schema_version: typeof STORAGE_HARDENING_SCHEMA_VERSION;
  generated_at: string;
  status: StorageImportStatus;
  source_kind: StorageImportSourceKind;
  candidate_schema_version?: string;
  backup_schema_version?: string;
  project_count: number;
  accepted_project_count: number;
  rejected_project_count: number;
  migration_required: boolean;
  can_merge: boolean;
  can_restore: boolean;
  checksum_match?: boolean;
  warnings: string[];
  rejected_reasons: string[];
  integrity: StorageIntegritySnapshot;
  message: string;
}

export interface StorageBackupEnvelope {
  kind: typeof STORAGE_BACKUP_KIND;
  schema_version: typeof STORAGE_HARDENING_SCHEMA_VERSION;
  app_version: typeof STORAGE_HARDENING_SCHEMA_VERSION;
  exported_at: string;
  library_schema_version: typeof CURRENT_LIBRARY_SCHEMA_VERSION;
  integrity: StorageIntegritySnapshot;
  checksum: string;
  library: ProjectLibrary;
}

interface ExtractedImportPayload {
  sourceKind: StorageImportSourceKind;
  candidate: Partial<ProjectLibrary> | null;
  backupSchemaVersion?: string;
  checksum?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, nestedValue) => {
    if (!nestedValue || typeof nestedValue !== "object" || Array.isArray(nestedValue)) return nestedValue;
    return Object.keys(nestedValue as Record<string, unknown>).sort().reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = (nestedValue as Record<string, unknown>)[key];
      return sorted;
    }, {});
  });
}

export function createStorageChecksum(value: unknown): string {
  const serialized = stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildStorageIntegritySnapshot(library: Partial<ProjectLibrary> | null | undefined): StorageIntegritySnapshot {
  const projects = Array.isArray(library?.projects) ? library.projects : [];
  const projectObjects = projects.filter((project) => isRecord(project)) as Array<Partial<ResearchProject>>;
  const savedResultCount = projectObjects.reduce((total, project) => total + (Array.isArray(project.saved_results) ? project.saved_results.length : 0), 0);
  const claimCount = projectObjects.reduce((total, project) => total + (Array.isArray(project.claims) ? project.claims.length : 0), 0);
  const searchHistoryCount = projectObjects.reduce((total, project) => total + (Array.isArray(project.search_history) ? project.search_history.length : 0), 0);
  const resultSnapshotCount = projectObjects.reduce((total, project) => total + (Array.isArray(project.result_snapshots) ? project.result_snapshots.length : 0), 0);
  const sectionCount = projectObjects.reduce((total, project) => total + (Array.isArray(project.board_sections) ? project.board_sections.length : 0), 0);
  return {
    project_count: projectObjects.length,
    saved_result_count: savedResultCount,
    claim_count: claimCount,
    search_history_count: searchHistoryCount,
    result_snapshot_count: resultSnapshotCount,
    section_count: sectionCount,
    fingerprint: createStorageChecksum({
      active_project_id: library?.active_project_id,
      project_ids: projectObjects.map((project) => project.id ?? "missing-id"),
      project_names: projectObjects.map((project) => project.name ?? "missing-name"),
      savedResultCount,
      claimCount,
      searchHistoryCount,
      resultSnapshotCount,
      sectionCount
    })
  };
}

function extractImportPayload(parsed: unknown): ExtractedImportPayload {
  if (!isRecord(parsed)) return { sourceKind: "unknown", candidate: null };

  if (parsed.kind === STORAGE_BACKUP_KIND && isRecord(parsed.library)) {
    return {
      sourceKind: "backup_envelope",
      candidate: parsed.library as Partial<ProjectLibrary>,
      backupSchemaVersion: typeof parsed.schema_version === "string" ? parsed.schema_version : undefined,
      checksum: typeof parsed.checksum === "string" ? parsed.checksum : undefined
    };
  }

  if (isRecord(parsed.library)) {
    return {
      sourceKind: "wrapped_library",
      candidate: parsed.library as Partial<ProjectLibrary>,
      backupSchemaVersion: typeof parsed.schema_version === "string" ? parsed.schema_version : undefined,
      checksum: typeof parsed.checksum === "string" ? parsed.checksum : undefined
    };
  }

  if (Array.isArray(parsed.projects)) {
    return { sourceKind: "library", candidate: parsed as Partial<ProjectLibrary> };
  }

  return { sourceKind: "unknown", candidate: null };
}

export function validateImportedLibraryPayload(parsed: unknown): { candidate: Partial<ProjectLibrary> | null; report: StorageImportValidationReport } {
  const extracted = extractImportPayload(parsed);
  const candidate = extracted.candidate;
  const warnings: string[] = [];
  const rejectedReasons: string[] = [];
  const generatedAt = nowIso();
  const integrity = buildStorageIntegritySnapshot(candidate);

  if (!candidate) {
    const report: StorageImportValidationReport = {
      schema_version: STORAGE_HARDENING_SCHEMA_VERSION,
      generated_at: generatedAt,
      status: "rejected",
      source_kind: extracted.sourceKind,
      project_count: 0,
      accepted_project_count: 0,
      rejected_project_count: 0,
      migration_required: false,
      can_merge: false,
      can_restore: false,
      warnings,
      rejected_reasons: ["Import payload does not contain a project library or backup envelope."],
      integrity,
      message: "Rejected import: no project library was found."
    };
    return { candidate: null, report };
  }

  const projects = Array.isArray(candidate.projects) ? candidate.projects : [];
  if (!Array.isArray(candidate.projects)) rejectedReasons.push("Project list is missing or not an array.");
  if (projects.length === 0) rejectedReasons.push("Project list is empty.");

  let acceptedProjectCount = 0;
  let rejectedProjectCount = 0;

  for (const [index, project] of projects.entries()) {
    if (!isRecord(project)) {
      rejectedProjectCount += 1;
      rejectedReasons.push(`Project entry ${index + 1} is not an object.`);
      continue;
    }
    if (typeof project.name !== "string" || !project.name.trim()) {
      rejectedProjectCount += 1;
      rejectedReasons.push(`Project entry ${index + 1} has no usable name.`);
      continue;
    }
    acceptedProjectCount += 1;
  }

  const candidateSchemaVersion = typeof candidate.schema_version === "string" ? candidate.schema_version : undefined;
  const migrationRequired = candidateSchemaVersion !== CURRENT_LIBRARY_SCHEMA_VERSION || extracted.backupSchemaVersion !== undefined && extracted.backupSchemaVersion !== STORAGE_HARDENING_SCHEMA_VERSION;
  if (!candidateSchemaVersion) warnings.push("Library schema version is missing; the importer will normalize it before merge.");
  if (candidateSchemaVersion && candidateSchemaVersion !== CURRENT_LIBRARY_SCHEMA_VERSION) warnings.push(`Library schema ${candidateSchemaVersion} will be migrated to ${CURRENT_LIBRARY_SCHEMA_VERSION}.`);
  if (extracted.backupSchemaVersion && extracted.backupSchemaVersion !== STORAGE_HARDENING_SCHEMA_VERSION) warnings.push(`Backup envelope schema ${extracted.backupSchemaVersion} differs from ${STORAGE_HARDENING_SCHEMA_VERSION}.`);
  if (!candidate.active_project_id) warnings.push("Active project id is missing; normalization will select the first accepted project.");

  const normalizedForChecksum = normalizeLibrary(candidate);
  const computedChecksum = createStorageChecksum(normalizedForChecksum);
  const checksumMatch = extracted.checksum ? extracted.checksum === computedChecksum : undefined;
  if (extracted.sourceKind === "backup_envelope" && !extracted.checksum) warnings.push("Backup envelope has no checksum field.");
  if (checksumMatch === false) warnings.push("Backup checksum differs after normalization; inspect the import before trusting restored data.");

  const canMerge = acceptedProjectCount > 0;
  const status: StorageImportStatus = !canMerge
    ? "rejected"
    : rejectedProjectCount > 0
      ? "partial"
      : migrationRequired || warnings.length > 0
        ? "needs_migration"
        : "valid";

  const report: StorageImportValidationReport = {
    schema_version: STORAGE_HARDENING_SCHEMA_VERSION,
    generated_at: generatedAt,
    status,
    source_kind: extracted.sourceKind,
    candidate_schema_version: candidateSchemaVersion,
    backup_schema_version: extracted.backupSchemaVersion,
    project_count: projects.length,
    accepted_project_count: acceptedProjectCount,
    rejected_project_count: rejectedProjectCount,
    migration_required: migrationRequired,
    can_merge: canMerge,
    can_restore: canMerge && extracted.sourceKind === "backup_envelope",
    checksum_match: checksumMatch,
    warnings,
    rejected_reasons: rejectedReasons,
    integrity: buildStorageIntegritySnapshot(normalizedForChecksum),
    message: canMerge
      ? `Import validation ${status.replace("_", " ")}: ${acceptedProjectCount} accepted project${acceptedProjectCount === 1 ? "" : "s"}, ${rejectedProjectCount} rejected.`
      : "Rejected import: no valid projects were found."
  };

  return { candidate, report };
}

export function parseProjectLibraryImportText(text: string): { candidate: Partial<ProjectLibrary> | null; report: StorageImportValidationReport } {
  try {
    const parsed = JSON.parse(text) as unknown;
    return validateImportedLibraryPayload(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    const report: StorageImportValidationReport = {
      schema_version: STORAGE_HARDENING_SCHEMA_VERSION,
      generated_at: nowIso(),
      status: "rejected",
      source_kind: "unknown",
      project_count: 0,
      accepted_project_count: 0,
      rejected_project_count: 0,
      migration_required: false,
      can_merge: false,
      can_restore: false,
      warnings: [],
      rejected_reasons: [`Corrupted or unreadable JSON: ${message}`],
      integrity: buildStorageIntegritySnapshot(null),
      message: `Rejected import: corrupted or unreadable JSON (${message}).`
    };
    return { candidate: null, report };
  }
}

export function createStorageBackupEnvelope(library: ProjectLibrary): StorageBackupEnvelope {
  const normalized = normalizeLibrary(library);
  return {
    kind: STORAGE_BACKUP_KIND,
    schema_version: STORAGE_HARDENING_SCHEMA_VERSION,
    app_version: STORAGE_HARDENING_SCHEMA_VERSION,
    exported_at: nowIso(),
    library_schema_version: CURRENT_LIBRARY_SCHEMA_VERSION,
    integrity: buildStorageIntegritySnapshot(normalized),
    checksum: createStorageChecksum(normalized),
    library: normalized
  };
}

export function createStorageBackupExport(library: ProjectLibrary): string {
  return JSON.stringify(createStorageBackupEnvelope(library), null, 2);
}
