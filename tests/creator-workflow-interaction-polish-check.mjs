import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const VERSION = "2.3.0";

const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const deepText = (value) => JSON.stringify(value ?? "").toLowerCase();
const containsAny = (text, markers) => markers.some((marker) => text.includes(marker.toLowerCase()));

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === VERSION, `package.json version must be ${VERSION}`);
assert(pkg.scripts?.["creator-workflow:manual-review"], "package.json must define creator-workflow:manual-review");
assert(pkg.scripts?.["creator-workflow:interaction:check"], "package.json must define creator-workflow:interaction:check");

const panelPath = "src/components/search/CreatorWorkflowPanel.tsx";
const manualScriptPath = "scripts/creator-workflow-manual-review.mjs";
const artifactPath = "artifacts/creator-workflow-manual-review.json";

assert(existsSync(join(root, panelPath)), "CreatorWorkflowPanel source must exist");
assert(existsSync(join(root, manualScriptPath)), "creator workflow manual review script must exist");
assert(existsSync(join(root, artifactPath)), "creator workflow manual review artifact must exist");

const panel = existsSync(join(root, panelPath)) ? read(panelPath) : "";
const manualScript = existsSync(join(root, manualScriptPath)) ? read(manualScriptPath) : "";
const artifact = existsSync(join(root, artifactPath)) ? JSON.parse(read(artifactPath)) : {};
const artifactText = deepText(artifact);
const scriptText = manualScript.toLowerCase();
const combinedText = `${artifactText}\n${scriptText}`;

assert(manualScript.includes(`const VERSION = "${VERSION}"`) || manualScript.includes(`VERSION = "${VERSION}"`), "manual review script must use v2.3.0 version");
assert(manualScript.includes("creator-workflow-manual-review.json"), "manual review script must write creator-workflow-manual-review.json");

assert(combinedText.includes("/creator-workflow"), "manual review artifact must identify /creator-workflow route");
assert(
  combinedText.includes("premium documentary thumbnail research") &&
    combinedText.includes("ancient carthage") &&
    combinedText.includes("mediterranean power"),
  "manual review artifact must record Carthage demo scenario"
);
assert(
  containsAny(combinedText, [
    "transparent fixture mode",
    "transparent fixture/demo mode",
    "transparent fixture / demo mode",
    "transparent_fixture_mode",
    "transparent-fixture-mode"
  ]),
  "manual review artifact must record transparent fixture mode"
);
assert(
  containsAny(combinedText, [
    "no fake live claims",
    "no-fake-live-claims",
    "no_fake_live_claims",
    "fake live claims: false"
  ]) ||
    artifact?.fakeLiveClaims === false ||
    artifact?.evidence?.fakeLiveClaims === false ||
    artifact?.realUsePathValidation?.fakeLiveClaims === false,
  "manual review artifact must record no fake live claims"
);

for (const token of [
  "Research Brief",
  "Query Plan",
  "Discovery Results",
  "Save to board",
  "Reject",
  "Strong reference",
  "Weak",
  "Copy attribution",
  "Open source",
  "Evidence Pack Export Preview"
]) {
  assert(panel.includes(token), `CreatorWorkflowPanel must expose interaction token: ${token}`);
}

if (failures.length) {
  console.error("Creator Workflow Interaction Polish checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Creator Workflow Interaction Polish checks passed for v${VERSION}.`);
