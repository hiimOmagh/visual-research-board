import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const VERSION = "2.3.0";
const failures = [];

const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === VERSION, `package.json version must be ${VERSION}`);
assert(pkg.scripts?.["creator-session:quality:review"] === "node scripts/creator-session-quality-review.mjs", "package.json must expose creator-session:quality:review");
assert(pkg.scripts?.["creator-session:quality:check"] === "node tests/creator-session-quality-pass-check.mjs", "package.json must expose creator-session:quality:check");

const lock = JSON.parse(read("package-lock.json"));
assert(lock.version === VERSION, `package-lock.json version must be ${VERSION}`);
assert(lock.packages?.[""]?.version === VERSION, `package-lock root package version must be ${VERSION}`);

const libPath = "src/lib/creator-session-quality.ts";
const panelPath = "src/components/search/CreatorWorkflowPanel.tsx";
const routePath = "app/creator-workflow/page.tsx";
const reviewPath = "scripts/creator-session-quality-review.mjs";
const qaPath = "scripts/full-qa-gate.mjs";

for (const path of [libPath, panelPath, routePath, reviewPath, qaPath]) {
  assert(existsSync(join(root, path)), `${path} must exist`);
}

const lib = read(libPath);
const panel = read(panelPath);
const route = read(routePath);
const review = read(reviewPath);
const qa = read(qaPath);

assert(lib.includes(`CREATOR_SESSION_VERSION = "${VERSION}"`), "creator session lib must expose v2.3.0 version");
assert(lib.includes("buildCreatorSessionExportPreview"), "creator session lib must build evidence export preview v2");
assert(lib.includes("getCreatorSessionCoverageSuggestions"), "creator session lib must expose coverage gap suggestions");

for (const field of ["topic", "useCase", "visualStyle", "platformOutputType", "sourcePriority", "riskTolerance", "notes"]) {
  assert(lib.includes(field) || panel.includes(field), `research brief must include ${field}`);
}

for (const token of [
  "Smart Query Plan Preview",
  "primaryQuery",
  "expandedQueries",
  "sourceClasses",
  "routingReason",
  "expectedResultTypes",
]) {
  assert(panel.includes(token) || lib.includes(token), `query plan preview must include ${token}`);
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
  assert(panel.includes(action), `panel must expose review action: ${action}`);
}

for (const section of [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
]) {
  assert(panel.includes(section) || lib.includes(section), `panel/lib must render board section: ${section}`);
}

for (const exportToken of [
  "Evidence Pack Export Preview v2",
  "projectBrief",
  "savedReferences",
  "sourceUrls",
  "attributionText",
  "usageRightsNotes",
  "reviewNotes",
  "missingCoverage",
  "queryPlan",
  "timestamp",
]) {
  assert(panel.includes(exportToken) || lib.includes(exportToken), `export preview must include ${exportToken}`);
}

assert(panel.includes("Premium documentary thumbnail research: Ancient Carthage and Mediterranean power"), "panel must include built-in Carthage demo scenario");
assert(panel.includes("Fixture/demo mode") || panel.includes("fixture/demo mode"), "panel must transparently mention fixture/demo mode");
assert(!panel.includes("OAuth"), "panel must not add OAuth workflow copy");
assert(!panel.includes("paid API"), "panel must not require paid APIs");
assert(!panel.includes("live scraping"), "panel must not claim live scraping");

assert(route.includes("CreatorWorkflowPanel"), "creator workflow route must render CreatorWorkflowPanel");
assert(review.includes(`VERSION = "${VERSION}"`), "creator session review script must use v2.3.0 version");
assert(qa.includes("creator-session-quality-pass"), "full QA gate must include creator-session-quality-pass");
assert(qa.includes("tests/creator-session-quality-pass-check.mjs"), "full QA gate must call creator session quality test");

const artifactPath = join(root, "artifacts", "creator-session-quality-review.json");
if (existsSync(artifactPath)) {
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  assert(artifact.schema_version === VERSION, "creator session review artifact schema_version must be v2.3.0");
  assert(artifact.app_version === VERSION, "creator session review artifact app_version must be v2.3.0");
  assert(artifact.status === "review-recorded", "creator session review artifact status must be review-recorded");
}

if (failures.length > 0) {
  console.error("Real Creator Session Quality Pass checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Real Creator Session Quality Pass checks passed for v${VERSION}.`);
