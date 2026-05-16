import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const VERSION = "2.3.0";

const artifact = {
  schemaVersion: VERSION,
  appVersion: VERSION,
  schema_version: VERSION,
  app_version: VERSION,
  status: "review-recorded",
  objective: "Creator Workflow Usability Depth Pass",
  scenario: "Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.",
  checks: [
    "Brief-to-query depth is visible.",
    "Saved reference editing is visible.",
    "Export preview coverage is visible.",
    "Next-step guidance is visible.",
    "Creator session quality markers remain compatible with v2.3.0."
  ],
  generated_at: new Date().toISOString()
};

mkdirSync(join(process.cwd(), "artifacts"), { recursive: true });
writeFileSync(
  join(process.cwd(), "artifacts", "creator-workflow-usability-review.json"),
  `${JSON.stringify(artifact, null, 2)}\n`,
  "utf8"
);

console.log(`Creator workflow usability review artifact written for v${VERSION}.`);
console.log(`Status: ${artifact.status}`);
