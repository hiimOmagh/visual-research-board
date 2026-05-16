import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");
const reviewPath = path.join(artifactsDir, "first-run-evidence-review.json");

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function fileInfo(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const exists = fs.existsSync(absolutePath);
  return {
    path: relativePath,
    exists,
    size_bytes: exists ? fs.statSync(absolutePath).size : 0
  };
}

const pkg = readJson("package.json");
const fullQa = readJson("artifacts/full-qa-gate-report.json");
const releaseVerify = readJson("artifacts/release-verify-report.json");
const visualEvidence = readJson("artifacts/first-run-visual-evidence.json");

const screenshotFiles = [
  "artifacts/first-run-screenshots/desktop-first-run.png",
  "artifacts/first-run-screenshots/tablet-first-run.png",
  "artifacts/first-run-screenshots/mobile-first-run.png"
].map(fileInfo);

const evidenceFiles = [
  fileInfo("artifacts/full-qa-gate-report.json"),
  fileInfo("artifacts/release-verify-report.json"),
  fileInfo("artifacts/first-run-visual-evidence.json")
];

const review = {
  schema_version: "first-run.evidence-review.v1",
  app_version: pkg?.version ?? "unknown",
  release: "v2.3.0",
  generated_at: new Date().toISOString(),
  status: "review-recorded",
  artifact_inputs: evidenceFiles,
  screenshot_inputs: screenshotFiles,
  source_reports: {
    full_qa: fullQa
      ? {
          app_version: fullQa.app_version,
          status: fullQa.status,
          failed_gate_count: fullQa.failed_gate_count,
          gate_count: Array.isArray(fullQa.gates) ? fullQa.gates.length : undefined
        }
      : null,
    release_verify: releaseVerify
      ? {
          app_version: releaseVerify.app_version,
          status: releaseVerify.status,
          failed_step_count: releaseVerify.failed_step_count,
          step_count: Array.isArray(releaseVerify.steps) ? releaseVerify.steps.length : undefined
        }
      : null,
    first_run_visual_evidence: visualEvidence
      ? {
          app_version: visualEvidence.app_version,
          status: visualEvidence.status,
          screenshot_count: Array.isArray(visualEvidence.screenshots) ? visualEvidence.screenshots.length : undefined,
          manual_review_required: visualEvidence.manual_review_required
        }
      : null
  },
  demo_capture_notes: [
    "Start from a clean first-run state where the board has no saved references.",
    "Capture the first-run panel before running a search.",
    "Capture desktop, tablet, and mobile views.",
    "Verify primary search action remains visible.",
    "Verify source/provider controls remain reachable.",
    "Verify activation pack and export preview language is visible or reachable.",
    "Do not claim rights clearance, private account access, paywall bypass, or source media rehosting."
  ],
  review_questions: [
    "Does the first-run panel explain search -> save -> review -> activation pack -> export?",
    "Is the first primary action obvious without reading documentation?",
    "Does the page avoid horizontal overflow on mobile?",
    "Are limitations and boundaries visible without overwhelming the user?",
    "Do generated artifacts match the current package version?"
  ],
  manual_review_required: true,
  next_action: "Attach screenshots when available, regenerate first-run visual evidence, then regenerate this review artifact."
};

fs.mkdirSync(artifactsDir, { recursive: true });
fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(`First-run evidence review written: ${path.relative(root, reviewPath)}`);
console.log(`Status: ${review.status}`);
