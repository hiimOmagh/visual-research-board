import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.4.0", "package.json version must be 2.4.0");
assert(pkg.scripts?.["evidence-pack:v2:check"] === "node tests/evidence-pack-v2-check.mjs", "package.json must expose evidence-pack:v2:check");

const libPath = "src/lib/evidence-pack-v2.ts";
const componentPath = "src/components/search/EvidencePackV2Preview.tsx";
const panelPath = "src/components/search/CreatorWorkflowPanel.tsx";

assert(existsSync(join(root, libPath)), "src/lib/evidence-pack-v2.ts must exist");
assert(existsSync(join(root, componentPath)), "EvidencePackV2Preview component must exist");
assert(existsSync(join(root, panelPath)), "CreatorWorkflowPanel must exist");

const lib = read(libPath);
const component = read(componentPath);
const panel = read(panelPath);
const fullQa = read("scripts/full-qa-gate.mjs");

for (const token of [
  'APP_VERSION = "2.4.0"',
  'EVIDENCE_PACK_V2_SCHEMA_VERSION = "evidence_pack_v2"',
  "buildEvidencePackV2",
  "buildEvidencePackV2Markdown",
  "toEvidencePackV2Json",
  "schema_version",
  "app_version",
  "generated_at",
  "fixture_demo_disclosure",
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
  "Premium documentary thumbnail research",
  "Ancient Carthage and Mediterranean power",
]) {
  assert(lib.includes(token), `evidence-pack-v2 lib must include ${token}`);
}

for (const token of [
  'data-testid="evidence-pack-v2-preview"',
  "Copy Markdown",
  "Copy JSON",
  "Download JSON",
  "Download Markdown",
  "Reset export preview",
  "Load Carthage demo",
  "Export Pack Preview",
  "Missing coverage",
  "Review notes",
  "Fixture/demo mode disclosure",
]) {
  assert(component.includes(token), `EvidencePackV2Preview must expose ${token}`);
}

assert(panel.includes("EvidencePackV2Preview"), "CreatorWorkflowPanel must render EvidencePackV2Preview");
assert(fullQa.includes("evidence-pack-v2"), "Full QA gate must include evidence-pack-v2 check");

if (failures.length > 0) {
  console.error("Evidence Pack Export v2 checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Evidence Pack Export v2 + Usable Creator Output checks passed for v2.4.0.");
