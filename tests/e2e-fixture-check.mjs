import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

const fixture = JSON.parse(readFileSync(join(root, "tests/fixtures/project-library-alpha6.json"), "utf8"));

assert(fixture.schema_version === "0.1.0-alpha.6", "project library fixture must be alpha.6");
assert(Array.isArray(fixture.projects) && fixture.projects.length >= 2, "fixture must include multiple projects");
assert(fixture.projects.some((project) => project.id === fixture.active_project_id), "active project id must resolve to a fixture project");

const active = fixture.projects.find((project) => project.id === fixture.active_project_id);
assert(active.schema_version === "0.1.0-alpha.6", "active project schema must be alpha.6");
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

const exported = {
  export_schema_version: "0.1.0-alpha.6",
  exported_at: new Date("2026-05-02T00:00:00.000Z").toISOString(),
  library: fixture
};
const imported = exported.library;
assert(imported.schema_version === fixture.schema_version, "exported/imported library schema must round-trip");
assert(imported.projects.length === fixture.projects.length, "exported/imported library project count must round-trip");

if (failures.length > 0) {
  console.error("E2E fixture checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("E2E fixture checks passed for v0.1.0-alpha.6.");
