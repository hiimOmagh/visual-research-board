import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const VERSION = "2.3.0";

const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === VERSION, `package.json version must be ${VERSION}`);
assert(pkg.scripts?.["creator-workflow:usability:review"], "package.json must define creator-workflow:usability:review");
assert(pkg.scripts?.["creator-workflow:usability:check"], "package.json must define creator-workflow:usability:check");

const panelPath = "src/components/search/CreatorWorkflowPanel.tsx";
const reviewScriptPath = "scripts/creator-workflow-usability-review.mjs";
const reviewArtifactPath = "artifacts/creator-workflow-usability-review.json";

assert(existsSync(join(root, panelPath)), "CreatorWorkflowPanel source must exist");
assert(existsSync(join(root, reviewScriptPath)), "creator workflow usability review script must exist");

const panel = existsSync(join(root, panelPath)) ? read(panelPath) : "";
const reviewScript = existsSync(join(root, reviewScriptPath)) ? read(reviewScriptPath) : "";
const reviewArtifactText = existsSync(join(root, reviewArtifactPath)) ? read(reviewArtifactPath) : "";

assert(reviewScript.includes(VERSION), "review script must use v2.3.0 version");

for (const token of [
  "CREATOR_WORKFLOW_SAVED_REFERENCE_NOTE_EDIT_CONTRACT",
  "panel must support editing saved reference notes",
  "savedReferenceNoteDrafts",
  "editSavedReferenceNote",
  "updateSavedReferenceNote",
  "handleSavedReferenceNoteChange",
  "savedReference.reviewNote",
  "savedReference.note",
  "saved-reference-note-editor",
  "saved-reference-note-input",
  "setSavedReferences",
  "<textarea",
  "name=\"savedReferenceNote\""
]) {
  assert(panel.includes(token), `panel must support editing saved reference notes via token: ${token}`);
}

for (const token of [
  "Research Brief",
  "Query Plan",
  "Saved Board",
  "Evidence Pack Export Preview",
  "Missing coverage",
  "Review notes"
]) {
  assert(panel.includes(token), `CreatorWorkflowPanel must expose usability token: ${token}`);
}

if (reviewArtifactText) {
  const lower = reviewArtifactText.toLowerCase();
  assert(lower.includes("v2.3.0") || lower.includes("2.3.0"), "usability review artifact must identify v2.3.0");
}

if (failures.length) {
  console.error("Creator Workflow Usability Depth checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Creator Workflow Usability Depth checks passed for v${VERSION}.`);
