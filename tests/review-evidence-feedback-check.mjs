import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.5", "package.json version must be 2.1.5");
assert(Boolean(pkg.scripts?.["review:evidence:check"]), "package.json must define npm run review:evidence:check");
assert((pkg.scripts?.qa?.includes("review-evidence-feedback-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include review-evidence-feedback-check");

assert(existsSync(join(root, "src/lib/review-evidence-feedback.ts")), "review-evidence-feedback lib must exist");
assert(existsSync(join(root, "src/components/search/ReviewEvidenceFeedbackPanel.tsx")), "ReviewEvidenceFeedbackPanel must exist");
assert(existsSync(join(root, "docs/review-evidence-feedback-calibration.md")), "review evidence feedback docs must exist");

const types = read("src/types/research.ts");
assert(types.includes("ReviewEvidenceFeedback"), "types must define ReviewEvidenceFeedback");
assert(types.includes("ReviewEvidenceCalibrationTrace"), "types must define ReviewEvidenceCalibrationTrace");
assert(types.includes("review_evidence_feedback?: ReviewEvidenceFeedback"), "ResearchRequest must carry review_evidence_feedback");
assert(types.includes("review_evidence_calibration?: ReviewEvidenceCalibrationTrace"), "SearchDiagnostics must include review_evidence_calibration");
assert(types.includes('schema_version: "0.2.10"'), "review feedback schema must be versioned as 0.2.10");

const lib = read("src/lib/review-evidence-feedback.ts");
assert(lib.includes("buildReviewEvidenceFeedback"), "review feedback lib must build feedback");
assert(lib.includes("applyReviewEvidenceRanking"), "review feedback lib must apply ranking calibration");
assert(lib.includes("buildReviewEvidenceCalibrationTrace"), "review feedback lib must build diagnostics trace");
assert(lib.includes("review-evidence-calibrated"), "review feedback ranking must tag adjusted results");
assert(lib.includes("confidence"), "review feedback must use confidence damping");

const route = read("src/app/api/search/route.ts");
assert(route.includes("applyReviewEvidenceRanking"), "search route must apply review evidence ranking");
assert(route.includes("buildReviewEvidenceCalibrationTrace"), "search route must build review evidence trace");
assert(route.includes("review_evidence_feedback"), "search route must accept review_evidence_feedback");
assert(route.includes("review_evidence_calibration"), "search route diagnostics must return review_evidence_calibration");

const client = read("src/lib/client-search.ts");
assert(client.includes("applyReviewEvidenceRanking"), "static fallback must apply review evidence ranking");
assert(client.includes("buildReviewEvidenceCalibrationTrace"), "static fallback must build review evidence trace");
assert(client.includes("request.review_evidence_feedback"), "static fallback must read request review evidence");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("buildReviewEvidenceFeedback(saved)"), "SearchPanel must build feedback from saved results");
assert(searchPanel.includes("review_evidence_feedback: reviewEvidenceFeedback"), "SearchPanel must send review feedback in request");
assert(searchPanel.includes("ReviewEvidenceFeedbackPanel"), "SearchPanel must render ReviewEvidenceFeedbackPanel");
assert(searchPanel.includes("diagnostics?.review_evidence_calibration"), "SearchPanel must gate panel by review_evidence_calibration diagnostics");
assert(searchPanel.includes("v2.1.5"), "SearchPanel header must show v2.1.5");
assert(searchPanel.includes("visual-research-board-library-v2.1.5.json"), "library export filename must use v2.1.5");

const panel = read("src/components/search/ReviewEvidenceFeedbackPanel.tsx");
assert(panel.includes("Review-evidence feedback into ranking calibration"), "panel must identify review-evidence calibration");
assert(panel.includes("Domain bias"), "panel must display domain bias");
assert(panel.includes("Source-group bias"), "panel must display source-group bias");
assert(panel.includes("Provider bias"), "panel must display provider bias");
assert(panel.includes("Calibration delta"), "panel must display calibration delta");

const exportLib = read("src/lib/export.ts");
assert(exportLib.includes("buildReviewEvidenceFeedback"), "quality export must build review feedback evidence");
assert(exportLib.includes("Review-Evidence Ranking Feedback"), "quality export must include review-evidence feedback section");
assert(exportLib.includes("reviewEvidenceBiasSummary"), "quality export must include feedback summary");

const docs = read("docs/review-evidence-feedback-calibration.md");
assert(docs.includes("v0.3.1"), "docs must identify v0.3.1");
assert(docs.includes("review_evidence_feedback"), "docs must document request feedback field");
assert(docs.includes("npm run review:evidence:check"), "docs must document validation command");

if (failures.length) {
  console.error("Review-evidence feedback checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Review-evidence feedback checks passed for v0.3.1.");
