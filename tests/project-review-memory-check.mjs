import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.4.0", "package.json version must be 0.4.0");
assert(Boolean(pkg.scripts?.["project:review:memory:check"]), "package.json must define npm run project:review:memory:check");
assert(pkg.scripts?.qa?.includes("project-review-memory-check"), "npm run qa must include project-review-memory-check");

for (const file of [
  "src/lib/project-review-memory.ts",
  "src/components/search/ProjectReviewMemoryPanel.tsx",
  "docs/project-specific-review-evidence-memory.md"
]) assert(existsSync(join(root, file)), `Missing v0.3.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "ProjectReviewEvidenceMemoryStatus",
  "ProjectReviewEvidenceMemory",
  "ProjectReviewEvidenceMemoryAudit",
  "project_review_evidence_memory?: ProjectReviewEvidenceMemory",
  "review_evidence_memory?: ProjectReviewEvidenceMemory",
  "project_review_memory?: ProjectReviewEvidenceMemoryAudit",
  "schema_version: \"0.3.1\""
]) assert(types.includes(token), `types must include ${token}`);

const lib = read("src/lib/project-review-memory.ts");
for (const token of [
  "buildProjectReviewEvidenceMemory",
  "resetProjectReviewEvidenceMemory",
  "isProjectReviewEvidenceMemoryStale",
  "buildProjectReviewEvidenceMemoryAudit",
  "projectReviewIsolationKey",
  "ignored_pre_reset_review_count",
  "source_fingerprint",
  "project:<project_id>"
]) assert(lib.includes(token), `project-review-memory lib must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v0.4.0",
  "ProjectReviewMemoryPanel",
  "buildProjectReviewEvidenceMemory(project)",
  "project_review_evidence_memory: freshProjectReviewMemory",
  "review_evidence_memory: freshProjectReviewMemory",
  "resetProjectReviewEvidenceMemory",
  "visual-research-board-library-v0.4.0.json"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const route = read("src/app/api/search/route.ts");
for (const token of [
  "project_review_evidence_memory",
  "buildProjectReviewEvidenceMemoryAudit",
  "review_evidence_feedback: validRequest.review_evidence_feedback ?? projectReviewMemory?.feedback",
  "project_review_memory: projectReviewMemoryAudit"
]) assert(route.includes(token), `search route must include ${token}`);

const client = read("src/lib/client-search.ts");
for (const token of [
  "request.project_review_evidence_memory?.feedback",
  "buildProjectReviewEvidenceMemoryAudit",
  "project_review_memory: projectReviewMemoryAudit"
]) assert(client.includes(token), `client fallback must include ${token}`);

const panel = read("src/components/search/ProjectReviewMemoryPanel.tsx");
for (const token of [
  "v0.3.1 project gate",
  "Project-specific review evidence memory",
  "Reset memory",
  "Memory warnings",
  "Memory confidence"
]) assert(panel.includes(token), `ProjectReviewMemoryPanel must include ${token}`);

const project = read("src/lib/project.ts");
for (const token of [
  "review_evidence_memory: undefined",
  "review_evidence_memory: project.review_evidence_memory",
  "source_class_routing: response.diagnostics.source_class_routing"
]) assert(project.includes(token), `project.ts must preserve ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "project_review_memory_count",
  "Project-Specific Review Evidence Memory",
  "projectMemoryAudit",
  "review_memory_confidence"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const docs = read("docs/project-specific-review-evidence-memory.md");
assert(docs.includes("v0.3.1"), "docs must identify v0.3.1");
assert(docs.includes("npm run project:review:memory:check"), "docs must document validation command");

if (failures.length) {
  console.error("Project review memory checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Project review memory checks passed for v0.3.1.");
process.exit(0);
