import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (path) => readFileSync(join(root, path), "utf8");
const exists = (path) => existsSync(join(root, path));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.2.0", "package.json version must be 2.2.0");
assert(
  pkg.scripts?.["creator-workflow:mvp:check"] === "node tests/creator-workflow-mvp-check.mjs",
  "package.json must expose npm run creator-workflow:mvp:check",
);

assert(exists("src/lib/creator-workflow.ts"), "creator workflow lib must exist");
assert(exists("src/components/search/CreatorWorkflowPanel.tsx"), "CreatorWorkflowPanel must exist");
assert(exists("src/app/creator-workflow/page.tsx"), "creator workflow route must exist");
assert(exists("docs/creator-workflow-mvp.md"), "creator workflow docs must exist");

const lib = read("src/lib/creator-workflow.ts");
const panel = read("src/components/search/CreatorWorkflowPanel.tsx");
const route = read("src/app/creator-workflow/page.tsx");
const docs = read("docs/creator-workflow-mvp.md");
const readme = read("README.md");
const qaGate = exists("scripts/full-qa-gate.mjs") ? read("scripts/full-qa-gate.mjs") : "";

assert(lib.includes('CREATOR_WORKFLOW_VERSION = "2.2.0"'), "creator workflow lib must expose v2.2.0");
assert(lib.includes("ResearchBrief"), "creator workflow lib must define ResearchBrief");
assert(lib.includes("buildCreatorQueryPlan"), "creator workflow lib must define query plan builder");
assert(lib.includes("createCreatorExportPack"), "creator workflow lib must define evidence export pack builder");
assert(lib.includes("DEMO_DISCOVERY_RESULTS"), "creator workflow lib must include transparent demo results");

for (const token of [
  "topic",
  "useCase",
  "visualStyle",
  "platformOutputType",
  "sourcePriority",
  "riskTolerance",
  "notes",
  "primaryQuery",
  "expandedQueries",
  "sourceClasses",
  "routingReason",
  "expectedResultTypes",
  "sourceUrls",
  "attributionText",
  "usageRightsNotes",
  "reviewNotes",
  "missingCoverage",
  "timestamp",
]) {
  assert(lib.includes(token), `creator workflow lib must include ${token}`);
}

for (const section of [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
]) {
  assert(lib.includes(section), `board section must exist: ${section}`);
  assert(panel.includes(section), `panel must render board section: ${section}`);
}

for (const action of [
  "Save to board",
  "Reject",
  "Mark strong reference",
  "Mark weak / uncertain",
  "Add note",
  "Copy attribution",
  "Open source",
]) {
  assert(panel.includes(action), `panel must expose action: ${action}`);
}

for (const label of [
  "Research Brief",
  "Smart Query Plan Preview",
  "Discovery Results",
  "Review Actions",
  "Saved Board Sections",
  "Evidence Pack Export Preview v2",
  "Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview",
]) {
  assert(panel.includes(label), `panel must expose workflow label: ${label}`);
}

assert(
  panel.includes("Premium documentary thumbnail research: Ancient Carthage and Mediterranean power"),
  "panel must include built-in Carthage demo scenario",
);
assert(panel.includes("fixture/demo mode"), "panel must transparently label fixture/demo mode");
assert(panel.includes('data-testid="creator-workflow-mvp"'), "panel must expose creator workflow test id");
assert(route.includes("CreatorWorkflowPanel"), "creator workflow route must mount CreatorWorkflowPanel");
assert(docs.includes("No fake live-provider claims"), "docs must forbid fake live-provider claims");
assert(docs.includes("No paid API dependency"), "docs must preserve no paid API dependency scope");
assert(readme.includes("v2.2.0"), "README must identify v2.2.0");
assert(readme.includes("End-to-End Creator Research Workflow MVP"), "README must mention the v2.2.0 workflow MVP");
assert(readme.includes("npm run creator-workflow:mvp:check"), "README must document the creator workflow check");
assert(qaGate.includes("creator-workflow-mvp"), "Full QA gate must include creator-workflow-mvp");
assert(qaGate.includes("tests/creator-workflow-mvp-check.mjs"), "Full QA gate must run creator workflow MVP check");

if (failures.length) {
  console.error("Creator Workflow MVP checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("End-to-End Creator Research Workflow MVP checks passed for v2.2.0.");
