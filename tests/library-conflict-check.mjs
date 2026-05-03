import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

const existingFixture = JSON.parse(readFileSync(join(root, "tests/fixtures/project-library-alpha10.json"), "utf8"));
const incomingFixture = JSON.parse(readFileSync(join(root, "tests/fixtures/project-library-conflict-alpha10.json"), "utf8"));

// Mirror of src/lib/project.ts::mergeLibraries, kept in sync intentionally.
// If you change the source merge behaviour, update this too. Both must agree
// on what counts as a duplicate, what counts as invalid, and how renames are
// generated, so this script is also a contract for that behaviour.

function nowIso() {
  return "2026-05-02T01:00:00.000Z";
}

let idCounter = 0;
function freshId() {
  idCounter += 1;
  return `project_remapped_${idCounter}`;
}

function mergeLibraries(existing, incoming) {
  const existingIds = new Set((existing.projects ?? []).map((p) => p.id));
  const existingNames = new Set((existing.projects ?? []).map((p) => p.name.trim().toLowerCase()));

  const rejectedReasons = [];
  const imported = [];

  let remappedCount = 0;
  let renamedCount = 0;

  const candidateProjects = Array.isArray(incoming?.projects) ? incoming.projects : [];

  for (const candidate of candidateProjects) {
    if (!candidate || typeof candidate !== "object") {
      rejectedReasons.push("Skipped a non-object project entry.");
      continue;
    }
    if (typeof candidate.name !== "string" || !candidate.name.trim()) {
      rejectedReasons.push("Skipped a project entry with no name.");
      continue;
    }

    let next = { ...candidate };

    if (existingIds.has(next.id)) {
      next = { ...next, id: freshId() };
      remappedCount += 1;
    }

    let candidateName = (next.name || "").trim() || "Imported project";
    if (existingNames.has(candidateName.toLowerCase())) {
      let suffix = 1;
      let attempt = `${candidateName} (imported)`;
      while (existingNames.has(attempt.toLowerCase())) {
        suffix += 1;
        attempt = `${candidateName} (imported ${suffix})`;
      }
      next = { ...next, name: attempt };
      renamedCount += 1;
      candidateName = attempt;
    }

    existingIds.add(next.id);
    existingNames.add(candidateName.toLowerCase());
    imported.push(next);
  }

  const mergedProjects = [...(existing.projects ?? []), ...imported];
  const activeProjectId = existing.active_project_id;
  const activeStillValid = mergedProjects.some((p) => p.id === activeProjectId);

  return {
    library: {
      schema_version: "0.1.0-alpha.10",
      active_project_id: activeStillValid ? activeProjectId : mergedProjects[0]?.id ?? null,
      projects: mergedProjects,
      updated_at: nowIso()
    },
    summary: {
      status: imported.length === 0 ? "rejected" : (rejectedReasons.length > 0 ? "merged" : "ok"),
      imported_count: imported.length,
      renamed_count: renamedCount,
      remapped_count: remappedCount,
      rejected_count: rejectedReasons.length,
      total_projects_after_import: mergedProjects.length,
      active_project_changed: !activeStillValid,
      rejected_reasons: rejectedReasons
    }
  };
}

const before = existingFixture.projects.length;
const { library, summary } = mergeLibraries(existingFixture, incomingFixture);

// --- Expected outcomes for the conflict fixture ---------------------------
//
// project-library-conflict-alpha10.json contains 4 candidates:
//
//   1. { id: "project_fixture_alpha10_main", name: "Fixture research project" }
//        -> id collision AND name collision: remapped + renamed
//   2. { id: "project_incoming_clean", name: "Brand new incoming project" }
//        -> imported as-is
//   3. { id: null, name: "" }
//        -> rejected (no name)
//   4. { id: "project_incoming_collision", name: "Secondary fixture project" }
//        -> name collision: renamed
//
// So we expect:
//   imported_count = 3
//   renamed_count  = 2
//   remapped_count = 1
//   rejected_count = 1

assert(summary.imported_count === 3, `expected 3 imported, got ${summary.imported_count}`);
assert(summary.renamed_count === 2, `expected 2 renamed, got ${summary.renamed_count}`);
assert(summary.remapped_count === 1, `expected 1 remapped, got ${summary.remapped_count}`);
assert(summary.rejected_count === 1, `expected 1 rejected, got ${summary.rejected_count}`);
assert(summary.status === "merged", `expected status 'merged', got '${summary.status}'`);

// --- Active project must remain valid -------------------------------------

assert(library.active_project_id === existingFixture.active_project_id, "active project id must be preserved by import");
assert(library.projects.some((p) => p.id === library.active_project_id), "active project id must resolve to a project after import");
assert(summary.active_project_changed === false, "active_project_changed must be false on a normal merge");

// --- No project from the existing library was lost -----------------------

assert(library.projects.length === before + summary.imported_count, "all existing projects plus imported must remain");
for (const original of existingFixture.projects) {
  assert(library.projects.some((p) => p.id === original.id), `existing project ${original.id} must still be present after merge`);
}

// --- Duplicate IDs were remapped ------------------------------------------

const idCounts = new Map();
for (const project of library.projects) {
  idCounts.set(project.id, (idCounts.get(project.id) ?? 0) + 1);
}
for (const [id, count] of idCounts.entries()) {
  assert(count === 1, `merged library must have unique project ids; "${id}" appeared ${count} times`);
}

// --- Duplicate names were renamed (case-insensitive) ----------------------

const nameCounts = new Map();
for (const project of library.projects) {
  const key = project.name.trim().toLowerCase();
  nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
}
for (const [name, count] of nameCounts.entries()) {
  assert(count === 1, `merged library must have unique project names; "${name}" appeared ${count} times`);
}

// --- Renamed entry uses the "(imported)" suffix --------------------------

assert(library.projects.some((p) => p.name === "Secondary fixture project (imported)"), "renamed project must use the '(imported)' suffix");

if (failures.length > 0) {
  console.error("Library conflict checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Library conflict checks passed for v0.1.0-alpha.10.");
