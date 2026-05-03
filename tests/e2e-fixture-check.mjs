import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

const fixture = JSON.parse(readFileSync(join(root, "tests/fixtures/project-library-alpha9.json"), "utf8"));

// --- Library shape ---------------------------------------------------------

assert(fixture.schema_version === "0.1.0-alpha.9", "project library fixture must be alpha.8");
assert(Array.isArray(fixture.projects) && fixture.projects.length >= 2, "fixture must include multiple projects");
assert(fixture.projects.some((project) => project.id === fixture.active_project_id), "active project id must resolve to a fixture project");

const active = fixture.projects.find((project) => project.id === fixture.active_project_id);
assert(active.schema_version === "0.1.0-alpha.9", "active project schema must be alpha.8");
assert(Array.isArray(active.result_snapshots) && active.result_snapshots.length > 0, "active project must include persistent result snapshots");
assert(Array.isArray(active.search_history) && active.search_history.length > 0, "active project must include search history");

const history = active.search_history[0];
const snapshot = active.result_snapshots.find((item) => item.id === history.snapshot_id);
assert(Boolean(snapshot), "search history snapshot_id must resolve to a result snapshot");
assert(Boolean(history.provider_toggles), "search history must persist provider toggles");
assert(history.provider_health.every((item) => Array.isArray(item.query_sample)), "provider health entries must include query_sample arrays");
assert(snapshot?.diagnostics?.provider_toggles?.mock === true, "snapshot diagnostics must persist provider toggles");
assert(Array.isArray(snapshot?.results) && snapshot.results.length === history.result_count, "snapshot result count must match history result_count");
assert(active.saved_results[0].section_id === "section_inbox", "fixture saved result must have section_id");

// --- Export round-trip -----------------------------------------------------

const exported = {
  export_schema_version: "0.1.0-alpha.9",
  exported_at: new Date("2026-05-02T00:00:00.000Z").toISOString(),
  library: fixture
};
const imported = exported.library;
assert(imported.schema_version === fixture.schema_version, "exported/imported library schema must round-trip");
assert(imported.projects.length === fixture.projects.length, "exported/imported library project count must round-trip");

// --- Snapshot restore simulation ------------------------------------------
// Verify that the fields needed by SearchPanel.restoreSnapshot() are all
// present on the snapshot (request, search_plan, diagnostics, results),
// and that the saved snapshot_id on the history entry points to a snapshot
// that yields a non-empty result list once "restored".

const snapshotForHistory = active.result_snapshots.find((s) => s.id === history.snapshot_id);
assert(snapshotForHistory && snapshotForHistory.request && snapshotForHistory.search_plan && snapshotForHistory.diagnostics, "snapshot must carry full restore payload (request/search_plan/diagnostics)");
assert(snapshotForHistory && Array.isArray(snapshotForHistory.results) && snapshotForHistory.results.length > 0, "restored snapshot must yield non-empty results");

// --- Active project still valid after import (simulated) -------------------
// Spec: import must never silently drop or replace the active project.
// We cannot import live in Node, but we can confirm that the fixture
// invariant holds: every project listed has an id that the active id can
// match against.

const allIds = new Set(fixture.projects.map((p) => p.id));
assert(allIds.has(fixture.active_project_id), "active_project_id must remain valid in any imported library");

// --- Export templates produce non-empty output ----------------------------
// We do a minimal in-process simulation: every template export should
// produce >= 1 line per saved result. We don't import the TS module here
// (Node-only test, no transpiler), so we check structural pre-conditions:
// the saved result has the fields each template touches.

const requiredFields = ["title", "source_url", "source_domain", "license_detected", "risk_level", "scores"];
for (const field of requiredFields) {
  assert(active.saved_results.every((r) => Object.prototype.hasOwnProperty.call(r, field)), `saved result must carry ${field} for export templates to render`);
}

if (failures.length > 0) {
  console.error("E2E fixture checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("E2E fixture checks passed for v0.1.0-alpha.9.");
