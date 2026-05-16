import path from "node:path";
import fs from "node:fs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(path) { return readFileSync(join(root, path), "utf8"); }

const requiredFiles = [
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs",
  "docs/full-qa-gate.md",
  "docs/release-checklist.md",
  "docs/validation-report.md",
  ".github/workflows/ci.yml"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing full QA gate file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.3.0", "package.json version must be 2.3.0");
assert(pkg.description.includes("Public Demo Release Candidate"), "package description must identify Public Demo Release Candidate");
assert(pkg.scripts?.qa === "node scripts/full-qa-gate.mjs", "npm run qa must delegate to scripts/full-qa-gate.mjs");
assert(pkg.scripts?.["qa:list"] === "node scripts/full-qa-gate.mjs --list", "package.json must expose npm run qa:list");
assert(pkg.scripts?.["qa:baseline"]?.includes("--category=baseline"), "package.json must expose baseline QA category");
assert(pkg.scripts?.["qa:retrieval"]?.includes("--category=retrieval"), "package.json must expose retrieval QA category");
assert(pkg.scripts?.["qa:providers"]?.includes("--category=providers"), "package.json must expose providers QA category");
assert(pkg.scripts?.["qa:security"]?.includes("--category=security"), "package.json must expose security QA category");
assert(pkg.scripts?.["public-demo:check"] === "node tests/public-demo-release-candidate-check.mjs", "package.json must expose npm run public-demo:check");
assert(pkg.scripts?.["qa:public-demo"]?.includes("--category=public-demo"), "package.json must expose public-demo QA category");
assert(pkg.scripts?.["qa:workflow"]?.includes("--category=workflow"), "package.json must expose workflow QA category");
assert(pkg.scripts?.["qa:exports"]?.includes("--category=exports"), "package.json must expose exports QA category");
assert(pkg.scripts?.["qa:release"]?.includes("--category=release"), "package.json must expose release QA category");
assert(pkg.scripts?.["full:qa:check"] === "node tests/full-qa-gate-check.mjs", "package.json must expose npm run full:qa:check");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run qa"), "test:ci:no-browser must run the full QA gate");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run typecheck"), "test:ci:no-browser must run typecheck");
assert(pkg.scripts?.["test:ci:no-browser"]?.includes("npm run lint"), "test:ci:no-browser must run lint");

const fullGate = read("scripts/full-qa-gate.mjs");
const expectedCategories = ["baseline", "retrieval", "providers", "security", "public-demo", "workflow", "exports", "release"];
for (const category of expectedCategories) assert(fullGate.includes(`category: "${category}"`), `full QA gate must include ${category} category`);
const expectedChecks = [
  "tests/qa-check.mjs",
  "tests/normalization-check.mjs",
  "tests/e2e-fixture-check.mjs",
  "tests/provider-smoke-check.mjs",
  "tests/library-conflict-check.mjs",
  "tests/broad-retrieval-check.mjs",
  "tests/retrieval-evidence-check.mjs",
  "tests/provider-runtime-pack-check.mjs",
  "tests/retrieval-calibration-check.mjs",
  "tests/retrieval-autotuning-check.mjs",
  "tests/deployed-browser-evidence-check.mjs",
  "tests/real-topic-matrix-check.mjs",
  "tests/evidence-driven-tuning-check.mjs",
  "tests/lockfile-registry-check.mjs",
  "tests/provider-result-inspector-check.mjs",
  "tests/manual-quality-review-check.mjs",
  "tests/review-evidence-feedback-check.mjs",
  "tests/free-image-retrieval-check.mjs",
  "tests/normalization-dedupe-check.mjs",
  "tests/query-routing-check.mjs",
  "tests/ranking-explainability-check.mjs",
  "tests/project-review-memory-check.mjs",
  "tests/board-organization-check.mjs",
  "tests/claim-mapping-check.mjs",
  "tests/coverage-bias-check.mjs",
  "tests/evidence-pack-export-check.mjs",
  "tests/attribution-generator-check.mjs",
  "tests/ux-reliability-check.mjs",
  "tests/storage-hardening-check.mjs",
  "tests/museum-open-access-provider-pack-check.mjs",
  "tests/stock-illustrative-provider-pack-check.mjs",
  "tests/security-key-handling-check.mjs",
  "tests/public-demo-release-candidate-check.mjs",
  "tests/full-qa-gate-check.mjs"
];
for (const check of expectedChecks) assert(fullGate.includes(check), `full QA gate must include ${check}`);
assert(fullGate.includes("artifacts/full-qa-gate-report.json"), "full QA gate must write a report artifact");
assert(fullGate.includes("--category="), "full QA gate must support category execution");
assert(fullGate.includes("--list"), "full QA gate must support list mode");
assert(fullGate.includes('schema_version: "2.3.0"'), "full QA gate report schema must identify v2.3.0");

const ci = read(".github/workflows/ci.yml");
assert(ci.includes("npm run test:ci:no-browser"), "CI must run the consolidated no-browser CI gate");
assert(ci.includes("npm run build"), "CI must still run runtime build");
assert(ci.includes("actions/upload-artifact"), "CI must upload full QA evidence artifacts");
assert(ci.includes("full-qa-gate-report"), "CI artifact name must identify the full QA gate report");

const docs = read("docs/full-qa-gate.md");
for (const token of ["v2.3.0", "npm run qa", "npm run qa:list", "qa:baseline", "qa:retrieval", "qa:providers", "qa:security", "qa:public-demo", "qa:workflow", "qa:exports", "qa:release", "artifacts/full-qa-gate-report.json"]) {
  assert(docs.includes(token), `full QA docs must include ${token}`);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const release = read("docs/release-checklist.md");
assert(release.includes("v2.3.0"), "release checklist must identify v2.3.0");
assert(release.includes("npm run test:ci:no-browser"), "release checklist must include no-browser CI gate");
assert(release.includes("artifacts/full-qa-gate-report.json"), "release checklist must mention full QA artifact");

const validation = read("docs/validation-report.md");
assert(validation.includes("Visual Research Board v2.3.0"), "validation report must identify v2.3.0");
assert(validation.includes("Public Demo Release Candidate"), "validation report must describe the public demo release candidate");
assert(validation.includes("artifacts/full-qa-gate-report.json"), "validation report must mention the QA artifact");

const readme = read("README.md");
assert(readme.includes("Visual Research Board v2.3.0"), "README must identify v2.3.0");
assert(readme.includes("Public Demo Release Candidate"), "README must identify the release capability");
assert(readme.includes("npm run qa:list"), "README must document qa:list");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v2.3.0"), "PATCH_MANIFEST must identify v2.3.0");
assert(manifest.includes("Public Demo Release Candidate"), "PATCH_MANIFEST must identify the release capability");
assert(manifest.includes("scripts/full-qa-gate.mjs"), "PATCH_MANIFEST must list the full QA script");

if (failures.length) {
  console.error("Full QA gate checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const hostedDemoEvidenceReviewSource = read("scripts/full-qa-gate.mjs");
assert(hostedDemoEvidenceReviewSource.includes("hosted-demo-evidence-review"), "Full QA gate must include hosted demo evidence review");
assert(hostedDemoEvidenceReviewSource.includes("tests/hosted-demo-evidence-review-check.mjs"), "Full QA gate must run hosted demo evidence review check");

const packageForHostedDemoEvidence = JSON.parse(read("package.json"));
assert(packageForHostedDemoEvidence.scripts?.["hosted-demo:evidence:check"] === "node tests/hosted-demo-evidence-review-check.mjs", "package.json must expose hosted-demo:evidence:check");
assert(exists("tests/hosted-demo-evidence-review-check.mjs"), "hosted demo evidence review check file must exist");
assert(exists("docs/hosted-demo-evidence-review.md"), "hosted demo evidence review doc must exist");
assert(exists("docs/hosted-demo-review-checklist.md"), "hosted demo review checklist doc must exist");

const publicDemoFinalAcceptanceSource = read("scripts/full-qa-gate.mjs");
assert(publicDemoFinalAcceptanceSource.includes("public-demo-final-acceptance"), "Full QA gate must include public demo final acceptance");
assert(publicDemoFinalAcceptanceSource.includes("tests/public-demo-final-acceptance-check.mjs"), "Full QA gate must run public demo final acceptance check");

const packageForPublicDemoFinalAcceptance = JSON.parse(read("package.json"));
assert(packageForPublicDemoFinalAcceptance.scripts?.["public-demo:final:check"] === "node tests/public-demo-final-acceptance-check.mjs", "package.json must expose public-demo:final:check");
assert(exists("tests/public-demo-final-acceptance-check.mjs"), "public demo final acceptance check file must exist");
assert(exists("docs/public-demo-final-acceptance.md"), "public demo final acceptance doc must exist");
assert(exists("docs/final-demo-review-checklist.md"), "final demo review checklist doc must exist");

const publicDemoStableReleaseGateSource = read("scripts/full-qa-gate.mjs");
assert(publicDemoStableReleaseGateSource.includes("public-demo-stable-release"), "Full QA gate must include public demo stable release");
assert(publicDemoStableReleaseGateSource.includes("tests/public-demo-stable-release-check.mjs"), "Full QA gate must run public demo stable release check");

const packageForPublicDemoStableRelease = JSON.parse(read("package.json"));
assert(packageForPublicDemoStableRelease.scripts?.["public-demo:stable:check"] === "node tests/public-demo-stable-release-check.mjs", "package.json must expose public-demo:stable:check");
assert(exists("tests/public-demo-stable-release-check.mjs"), "public demo stable release check file must exist");
assert(exists("docs/public-demo-stable-release.md"), "public demo stable release doc must exist");
assert(exists("docs/stable-release-checklist.md"), "stable release checklist doc must exist");

const referenceIntelligenceGateSource = read("scripts/full-qa-gate.mjs");
assert(referenceIntelligenceGateSource.includes("reference-intelligence"), "Full QA gate must include reference intelligence");
assert(referenceIntelligenceGateSource.includes("tests/reference-intelligence-check.mjs"), "Full QA gate must run reference intelligence check");

const packageForReferenceIntelligence = JSON.parse(read("package.json"));
assert(packageForReferenceIntelligence.scripts?.["reference:intelligence:check"] === "node tests/reference-intelligence-check.mjs", "package.json must expose reference:intelligence:check");
assert(exists("tests/reference-intelligence-check.mjs"), "reference intelligence check file must exist");
assert(exists("src/types/reference-intelligence.ts"), "reference intelligence types must exist");
assert(exists("src/lib/reference-intelligence.ts"), "reference intelligence lib must exist");
assert(exists("src/components/search/ReferenceIntelligencePanel.tsx"), "reference intelligence panel must exist");
assert(exists("docs/reference-intelligence-layer.md"), "reference intelligence layer doc must exist");

const broadReferenceResultModelGateSource = read("scripts/full-qa-gate.mjs");
assert(broadReferenceResultModelGateSource.includes("broad-reference-result-model"), "Full QA gate must include broad reference result model");
assert(broadReferenceResultModelGateSource.includes("tests/broad-reference-result-model-check.mjs"), "Full QA gate must run broad reference result model check");

const packageForBroadReferenceResultModel = JSON.parse(read("package.json"));
assert(packageForBroadReferenceResultModel.scripts?.["broad-reference:model:check"] === "node tests/broad-reference-result-model-check.mjs", "package.json must expose broad-reference:model:check");
assert(exists("tests/broad-reference-result-model-check.mjs"), "broad reference result model check file must exist");
assert(exists("src/types/broad-reference-result.ts"), "broad reference result types must exist");
assert(exists("src/lib/broad-reference-result.ts"), "broad reference result lib must exist");
assert(exists("src/components/search/SourceClassBadge.tsx"), "source class badge component must exist");
assert(exists("docs/broad-reference-result-model.md"), "broad reference result model doc must exist");

const broadWebImageDiscoveryGateSource = read("scripts/full-qa-gate.mjs");
assert(broadWebImageDiscoveryGateSource.includes("broad-web-image-discovery"), "Full QA gate must include broad web image discovery");
assert(broadWebImageDiscoveryGateSource.includes("tests/broad-web-image-discovery-check.mjs"), "Full QA gate must run broad web image discovery check");

const packageForBroadWebImageDiscovery = JSON.parse(read("package.json"));
assert(packageForBroadWebImageDiscovery.scripts?.["broad-discovery:check"] === "node tests/broad-web-image-discovery-check.mjs", "package.json must expose broad-discovery:check");
assert(exists("tests/broad-web-image-discovery-check.mjs"), "broad web image discovery check file must exist");
assert(exists("src/types/broad-discovery.ts"), "broad discovery types must exist");
assert(exists("src/lib/broad-discovery.ts"), "broad discovery lib must exist");
assert(exists("src/components/search/BroadDiscoveryModePanel.tsx"), "broad discovery mode panel must exist");
assert(exists("docs/broad-web-image-discovery.md"), "broad web image discovery doc must exist");

const socialReferenceDiscoveryGateSource = read("scripts/full-qa-gate.mjs");
assert(socialReferenceDiscoveryGateSource.includes("social-reference-discovery"), "Full QA gate must include social reference discovery");
assert(socialReferenceDiscoveryGateSource.includes("tests/social-reference-discovery-check.mjs"), "Full QA gate must run social reference discovery check");

const packageForSocialReferenceDiscovery = JSON.parse(read("package.json"));
assert(packageForSocialReferenceDiscovery.scripts?.["social-reference:check"] === "node tests/social-reference-discovery-check.mjs", "package.json must expose social-reference:check");
assert(exists("tests/social-reference-discovery-check.mjs"), "social reference discovery check file must exist");
assert(exists("src/types/social-reference.ts"), "social reference types must exist");
assert(exists("src/lib/social-reference-discovery.ts"), "social reference discovery lib must exist");
assert(exists("src/components/search/SocialReferenceDiscoveryPanel.tsx"), "social reference discovery panel must exist");
assert(exists("docs/social-reference-discovery.md"), "social reference discovery doc must exist");

const bookBibliographicDiscoveryGateSource = read("scripts/full-qa-gate.mjs");
assert(bookBibliographicDiscoveryGateSource.includes("book-bibliographic-discovery"), "Full QA gate must include book bibliographic discovery");
assert(bookBibliographicDiscoveryGateSource.includes("tests/book-bibliographic-discovery-check.mjs"), "Full QA gate must run book bibliographic discovery check");

const packageForBookBibliographicDiscovery = JSON.parse(read("package.json"));
assert(packageForBookBibliographicDiscovery.scripts?.["book-reference:check"] === "node tests/book-bibliographic-discovery-check.mjs", "package.json must expose book-reference:check");
assert(exists("tests/book-bibliographic-discovery-check.mjs"), "book bibliographic discovery check file must exist");
assert(exists("src/types/book-reference.ts"), "book reference types must exist");
assert(exists("src/lib/book-bibliographic-discovery.ts"), "book bibliographic discovery lib must exist");
assert(exists("src/components/search/BookBibliographicDiscoveryPanel.tsx"), "book bibliographic discovery panel must exist");
assert(exists("docs/book-bibliographic-discovery.md"), "book bibliographic discovery doc must exist");

const referenceActivationPackGateSource = read("scripts/full-qa-gate.mjs");
assert(referenceActivationPackGateSource.includes("reference-activation-pack"), "Full QA gate must include reference activation pack");
assert(referenceActivationPackGateSource.includes("tests/reference-activation-pack-check.mjs"), "Full QA gate must run reference activation pack check");

const packageForReferenceActivationPack = JSON.parse(read("package.json"));
assert(packageForReferenceActivationPack.scripts?.["reference-activation:check"] === "node tests/reference-activation-pack-check.mjs", "package.json must expose reference-activation:check");
assert(exists("tests/reference-activation-pack-check.mjs"), "reference activation pack check file must exist");
assert(exists("src/types/reference-activation-pack.ts"), "reference activation pack types must exist");
assert(exists("src/lib/reference-activation-pack.ts"), "reference activation pack lib must exist");
assert(exists("src/components/search/ReferenceActivationPackPanel.tsx"), "reference activation pack panel must exist");
assert(exists("docs/reference-activation-pack.md"), "reference activation pack doc must exist");

const activationPackUiIntegrationGateSource = read("scripts/full-qa-gate.mjs");
assert(activationPackUiIntegrationGateSource.includes("activation-pack-ui-integration"), "Full QA gate must include activation pack UI integration");
assert(activationPackUiIntegrationGateSource.includes("tests/activation-pack-ui-integration-check.mjs"), "Full QA gate must run activation pack UI integration check");

const packageForActivationPackUiIntegration = JSON.parse(read("package.json"));
assert(packageForActivationPackUiIntegration.scripts?.["activation-pack:ui:check"] === "node tests/activation-pack-ui-integration-check.mjs", "package.json must expose activation-pack:ui:check");
assert(exists("tests/activation-pack-ui-integration-check.mjs"), "activation pack UI integration check file must exist");
assert(exists("src/types/activation-pack-ui.ts"), "activation pack UI types must exist");
assert(exists("src/lib/activation-pack-ui.ts"), "activation pack UI lib must exist");
assert(exists("src/components/search/ActivationPackWorkflowPanel.tsx"), "activation pack workflow panel must exist");
assert(exists("docs/activation-pack-ui-integration.md"), "activation pack UI integration doc must exist");

const activationPackExportPreviewGateSource = read("scripts/full-qa-gate.mjs");
assert(activationPackExportPreviewGateSource.includes("activation-pack-export-preview"), "Full QA gate must include activation pack export preview");
assert(activationPackExportPreviewGateSource.includes("tests/activation-pack-export-preview-check.mjs"), "Full QA gate must run activation pack export preview check");

const packageForActivationPackExportPreview = JSON.parse(read("package.json"));
assert(packageForActivationPackExportPreview.scripts?.["activation-pack:export-preview:check"] === "node tests/activation-pack-export-preview-check.mjs", "package.json must expose activation-pack:export-preview:check");
assert(exists("tests/activation-pack-export-preview-check.mjs"), "activation pack export preview check file must exist");
assert(exists("src/types/activation-pack-export-preview.ts"), "activation pack export preview types must exist");
assert(exists("src/lib/activation-pack-export-preview.ts"), "activation pack export preview lib must exist");
assert(exists("src/components/search/ActivationPackExportPreviewPanel.tsx"), "activation pack export preview panel must exist");
assert(exists("docs/activation-pack-export-preview.md"), "activation pack export preview doc must exist");

const activationPackExportIntegrationGateSource = read("scripts/full-qa-gate.mjs");
assert(activationPackExportIntegrationGateSource.includes("activation-pack-export-integration"), "Full QA gate must include activation pack export integration");
assert(activationPackExportIntegrationGateSource.includes("tests/activation-pack-export-integration-check.mjs"), "Full QA gate must run activation pack export integration check");

const packageForActivationPackExportIntegration = JSON.parse(read("package.json"));
assert(packageForActivationPackExportIntegration.scripts?.["activation-pack:export:check"] === "node tests/activation-pack-export-integration-check.mjs", "package.json must expose activation-pack:export:check");
assert(exists("tests/activation-pack-export-integration-check.mjs"), "activation pack export integration check file must exist");
assert(exists("src/types/activation-pack-export-integration.ts"), "activation pack export integration types must exist");
assert(exists("src/lib/activation-pack-export-integration.ts"), "activation pack export integration lib must exist");
assert(exists("src/components/search/ActivationPackExportIntegrationPanel.tsx"), "activation pack export integration panel must exist");
assert(exists("docs/activation-pack-export-integration.md"), "activation pack export integration doc must exist");

const referenceWorkflowStableReleaseGateSource = read("scripts/full-qa-gate.mjs");
assert(referenceWorkflowStableReleaseGateSource.includes("reference-workflow-stable-release"), "Full QA gate must include reference workflow stable release");
assert(referenceWorkflowStableReleaseGateSource.includes("tests/reference-workflow-stable-release-check.mjs"), "Full QA gate must run reference workflow stable release check");
const packageForReferenceWorkflowStableRelease = JSON.parse(read("package.json"));
assert(packageForReferenceWorkflowStableRelease.scripts?.["reference-workflow:stable:check"] === "node tests/reference-workflow-stable-release-check.mjs", "package.json must expose reference-workflow:stable:check");
assert(exists("tests/reference-workflow-stable-release-check.mjs"), "reference workflow stable release check file must exist");
assert(exists("docs/reference-workflow-stable-release.md"), "reference workflow stable release doc must exist");
assert(exists("docs/stable-reference-workflow-checklist.md"), "stable reference workflow checklist must exist");

const stableReleaseHygieneGateSource = read("scripts/full-qa-gate.mjs");
assert(stableReleaseHygieneGateSource.includes("stable-release-hygiene"), "Full QA gate must include stable release hygiene");
assert(stableReleaseHygieneGateSource.includes("tests/stable-release-hygiene-check.mjs"), "Full QA gate must run stable release hygiene check");

const packageForStableReleaseHygiene = JSON.parse(read("package.json"));
assert(packageForStableReleaseHygiene.scripts?.["stable:hygiene:check"] === "node tests/stable-release-hygiene-check.mjs", "package.json must expose stable:hygiene:check");
assert(exists("tests/stable-release-hygiene-check.mjs"), "stable release hygiene check file must exist");
assert(exists("docs/stable-release-hygiene-audit-review.md"), "stable release hygiene audit review doc must exist");
assert(exists("docs/audit-warning-review.md"), "audit warning review doc must exist");

const dependencyAuditTriageGateSource = read("scripts/full-qa-gate.mjs");
assert(dependencyAuditTriageGateSource.includes("dependency-audit-triage"), "Full QA gate must include dependency audit triage");
assert(dependencyAuditTriageGateSource.includes("tests/dependency-audit-triage-check.mjs"), "Full QA gate must run dependency audit triage check");

const packageForDependencyAuditTriage = JSON.parse(read("package.json"));
assert(packageForDependencyAuditTriage.scripts?.["dependency:audit:triage:check"] === "node tests/dependency-audit-triage-check.mjs", "package.json must expose dependency:audit:triage:check");
assert(exists("tests/dependency-audit-triage-check.mjs"), "dependency audit triage check file must exist");
assert(exists("docs/dependency-audit-triage.md"), "dependency audit triage doc must exist");
assert(exists("docs/dependency-audit-triage-checklist.md"), "dependency audit triage checklist must exist");

const publicDemoScreenshotLockGateSource = read("scripts/full-qa-gate.mjs");
assert(publicDemoScreenshotLockGateSource.includes("public-demo-screenshot-lock"), "Full QA gate must include public demo screenshot lock");
assert(publicDemoScreenshotLockGateSource.includes("tests/public-demo-screenshot-lock-check.mjs"), "Full QA gate must run public demo screenshot lock check");

const packageForPublicDemoScreenshotLock = JSON.parse(read("package.json"));
assert(packageForPublicDemoScreenshotLock.scripts?.["public-demo:screenshot:check"] === "node tests/public-demo-screenshot-lock-check.mjs", "package.json must expose public-demo:screenshot:check");
assert(exists("tests/public-demo-screenshot-lock-check.mjs"), "public demo screenshot lock check file must exist");
assert(exists("docs/public-demo-evidence-screenshot-lock.md"), "public demo screenshot lock doc must exist");
assert(exists("docs/public-demo-screenshot-checklist.md"), "public demo screenshot checklist must exist");

const releasePackageAuditGateSource = read("scripts/full-qa-gate.mjs");
assert(releasePackageAuditGateSource.includes("release-package-audit"), "Full QA gate must include release package audit");
assert(releasePackageAuditGateSource.includes("tests/release-package-audit-check.mjs"), "Full QA gate must run release package audit check");
const packageForReleasePackageAudit = JSON.parse(read("package.json"));
assert(packageForReleasePackageAudit.scripts?.["release:package:audit:check"] === "node tests/release-package-audit-check.mjs", "package.json must expose release:package:audit:check");
assert(exists("tests/release-package-audit-check.mjs"), "release package audit check file must exist");
assert(exists("docs/release-package-audit.md"), "release package audit doc must exist");
assert(exists("docs/release-package-audit-checklist.md"), "release package audit checklist must exist");

const releaseVerifyRunnerGateSource = read("scripts/full-qa-gate.mjs");
assert(releaseVerifyRunnerGateSource.includes("release-verify-runner"), "Full QA gate must include release verify runner");
assert(releaseVerifyRunnerGateSource.includes("tests/release-verify-runner-check.mjs"), "Full QA gate must run release verify runner check");
const packageForReleaseVerifyRunner = JSON.parse(read("package.json"));
assert(packageForReleaseVerifyRunner.scripts?.["verify:release"] === "node scripts/release-verify.mjs", "package.json must expose verify:release");
assert(packageForReleaseVerifyRunner.scripts?.["verify:ci-parity"] === "npm ci && npm run verify:release", "package.json must expose verify:ci-parity");
assert(packageForReleaseVerifyRunner.scripts?.["release:verify:runner:check"] === "node tests/release-verify-runner-check.mjs", "package.json must expose release:verify:runner:check");
assert(exists("scripts/release-verify.mjs"), "release verify runner file must exist");
assert(exists("tests/release-verify-runner-check.mjs"), "release verify runner check file must exist");
assert(exists("docs/unified-release-verification-runner.md"), "unified release verification runner doc must exist");
assert(exists("docs/release-verification-runner-checklist.md"), "release verification runner checklist must exist");

const firstRunUxWorkflowGateSource = read("scripts/full-qa-gate.mjs");
assert(firstRunUxWorkflowGateSource.includes("first-run-ux-workflow"), "Full QA gate must include first-run UX workflow");
assert(firstRunUxWorkflowGateSource.includes("tests/first-run-ux-workflow-check.mjs"), "Full QA gate must run first-run UX workflow check");
const packageForFirstRunUxWorkflow = JSON.parse(read("package.json"));
assert(packageForFirstRunUxWorkflow.scripts?.["first-run:ux:check"] === "node tests/first-run-ux-workflow-check.mjs", "package.json must expose first-run:ux:check");
assert(exists("tests/first-run-ux-workflow-check.mjs"), "first-run UX workflow check file must exist");
assert(exists("docs/first-run-ux-workflow-clarity.md"), "first-run UX workflow doc must exist");
assert(exists("docs/first-run-ux-checklist.md"), "first-run UX checklist must exist");
assert(exists("src/lib/first-run-workflow.ts"), "first-run workflow lib must exist");
assert(exists("src/components/search/FirstRunWorkflowPanel.tsx"), "first-run workflow panel must exist");

const firstRunPanelMountGateSource = read("scripts/full-qa-gate.mjs");
assert(firstRunPanelMountGateSource.includes("first-run-panel-mount"), "Full QA gate must include first-run panel mount");
assert(firstRunPanelMountGateSource.includes("tests/first-run-panel-mount-check.mjs"), "Full QA gate must run first-run panel mount check");
const packageForFirstRunPanelMount = JSON.parse(read("package.json"));
assert(packageForFirstRunPanelMount.scripts?.["first-run:panel:check"] === "node tests/first-run-panel-mount-check.mjs", "package.json must expose first-run:panel:check");
assert(exists("tests/first-run-panel-mount-check.mjs"), "first-run panel mount check file must exist");
assert(exists("docs/controlled-first-run-panel-mount.md"), "controlled first-run panel mount doc must exist");
assert(exists("docs/ui-consistency-first-run-checklist.md"), "UI consistency first-run checklist must exist");

const firstRunVisualQaGateSource = read("scripts/full-qa-gate.mjs");
assert(firstRunVisualQaGateSource.includes("first-run-visual-qa"), "Full QA gate must include first-run visual QA");
assert(firstRunVisualQaGateSource.includes("tests/first-run-visual-qa-check.mjs"), "Full QA gate must run first-run visual QA check");
const packageForFirstRunVisualQa = JSON.parse(read("package.json"));
assert(packageForFirstRunVisualQa.scripts?.["first-run:visual:check"] === "node tests/first-run-visual-qa-check.mjs", "package.json must expose first-run:visual:check");
assert(packageForFirstRunVisualQa.scripts?.["first-run:visual:evidence"] === "node scripts/first-run-visual-evidence.mjs", "package.json must expose first-run:visual:evidence");
assert(exists("scripts/first-run-visual-evidence.mjs"), "first-run visual evidence script must exist");
assert(exists("tests/first-run-visual-qa-check.mjs"), "first-run visual QA check file must exist");
assert(exists("docs/first-run-visual-qa-screenshot-evidence.md"), "first-run visual QA evidence doc must exist");
assert(exists("docs/first-run-responsive-screenshot-checklist.md"), "first-run responsive screenshot checklist must exist");

const firstRunEvidenceReviewGateSource = read("scripts/full-qa-gate.mjs");
assert(firstRunEvidenceReviewGateSource.includes("first-run-evidence-review"), "Full QA gate must include first-run evidence review");
assert(firstRunEvidenceReviewGateSource.includes("tests/first-run-evidence-review-check.mjs"), "Full QA gate must run first-run evidence review check");
const packageForFirstRunEvidenceReview = JSON.parse(read("package.json"));
assert(packageForFirstRunEvidenceReview.scripts?.["first-run:evidence-review"] === "node scripts/first-run-evidence-review.mjs", "package.json must expose first-run:evidence-review");
assert(packageForFirstRunEvidenceReview.scripts?.["first-run:evidence-review:check"] === "node tests/first-run-evidence-review-check.mjs", "package.json must expose first-run:evidence-review:check");
assert(exists("scripts/first-run-evidence-review.mjs"), "first-run evidence review script must exist");
assert(exists("tests/first-run-evidence-review-check.mjs"), "first-run evidence review check file must exist");
assert(exists("docs/first-run-evidence-artifact-review.md"), "first-run evidence artifact review doc must exist");
assert(exists("docs/first-run-demo-capture-notes.md"), "first-run demo capture notes doc must exist");

const firstRunDemoScriptGateSource = read("scripts/full-qa-gate.mjs");
assert(firstRunDemoScriptGateSource.includes("first-run-demo-script"), "Full QA gate must include first-run demo script");
assert(firstRunDemoScriptGateSource.includes("tests/first-run-demo-script-check.mjs"), "Full QA gate must run first-run demo script check");
const packageForFirstRunDemoScript = JSON.parse(read("package.json"));
assert(packageForFirstRunDemoScript.scripts?.["first-run:demo-script"] === "node scripts/first-run-demo-script.mjs", "package.json must expose first-run:demo-script");
assert(packageForFirstRunDemoScript.scripts?.["first-run:demo-script:check"] === "node tests/first-run-demo-script-check.mjs", "package.json must expose first-run:demo-script:check");
assert(exists("scripts/first-run-demo-script.mjs"), "first-run demo script generator must exist");
assert(exists("tests/first-run-demo-script-check.mjs"), "first-run demo script check file must exist");
assert(exists("docs/first-run-demo-script.md"), "first-run demo script doc must exist");
assert(exists("docs/public-walkthrough-copy.md"), "public walkthrough copy doc must exist");

const singleCommandVerificationGateSource = read("scripts/full-qa-gate.mjs");
assert(singleCommandVerificationGateSource.includes("single-command-verification"), "Full QA gate must include single-command verification");
assert(singleCommandVerificationGateSource.includes("tests/single-command-verification-check.mjs"), "Full QA gate must run single-command verification check");
const packageForSingleCommandVerification = JSON.parse(read("package.json"));
assert(packageForSingleCommandVerification.scripts?.["verify:artifacts"] === "npm run first-run:visual:evidence && npm run first-run:evidence-review && npm run first-run:demo-script", "package.json must expose verify:artifacts");
assert(packageForSingleCommandVerification.scripts?.["verify:all"] === "npm run verify:artifacts && npm run verify:release", "package.json must expose verify:all");
assert(packageForSingleCommandVerification.scripts?.["verify:ci-parity"] === "npm ci && npm run verify:all", "package.json must expose verify:ci-parity");
assert(packageForSingleCommandVerification.scripts?.["single-command:verification:check"] === "node tests/single-command-verification-check.mjs", "package.json must expose single-command:verification:check");
assert(exists("tests/single-command-verification-check.mjs"), "single-command verification check file must exist");
assert(exists("docs/single-command-verification.md"), "single-command verification doc must exist");
assert(exists("docs/release-command-compression.md"), "release command compression doc must exist");

const ciParityWorkflowGateSource = read("scripts/full-qa-gate.mjs");
assert(ciParityWorkflowGateSource.includes("ci-parity-workflow-badge"), "Full QA gate must include CI parity workflow badge");
assert(ciParityWorkflowGateSource.includes("tests/ci-parity-workflow-badge-check.mjs"), "Full QA gate must run CI parity workflow badge check");
assert(exists(".github/workflows/ci-parity.yml"), "CI parity workflow must exist");
assert(exists("docs/ci-parity-workflow-badge.md"), "CI parity workflow badge doc must exist");
assert(exists("docs/verification-docs-lock.md"), "verification docs lock doc must exist");
const verificationFreshnessGateSource = read("scripts/full-qa-gate.mjs");
assert(verificationFreshnessGateSource.includes("verification-report-freshness-lock"), "Full QA gate must include verification report freshness lock");
assert(verificationFreshnessGateSource.includes("tests/verification-report-freshness-lock-check.mjs"), "Full QA gate must run verification report freshness lock check");
const packageForVerificationFreshness = JSON.parse(read("package.json"));
assert(packageForVerificationFreshness.scripts?.["verification:freshness:check"] === "node tests/verification-report-freshness-lock-check.mjs", "package.json must expose verification:freshness:check");
assert(exists("tests/verification-report-freshness-lock-check.mjs"), "verification report freshness lock check file must exist");
assert(exists("docs/verification-report-freshness-lock.md"), "verification report freshness lock doc must exist");
assert(exists("docs/warning-suppression.md"), "warning suppression doc must exist");

const artifactSchemaGateSource = read("scripts/full-qa-gate.mjs");
assert(artifactSchemaGateSource.includes("verification-artifact-schema-lock"), "Full QA gate must include verification artifact schema lock");
assert(artifactSchemaGateSource.includes("tests/verification-artifact-schema-lock-check.mjs"), "Full QA gate must run verification artifact schema lock check");
assert(artifactSchemaGateSource.includes("release-evidence-index"), "Full QA gate must include release evidence index");
assert(artifactSchemaGateSource.includes("tests/release-evidence-index-check.mjs"), "Full QA gate must run release evidence index check");
const packageForArtifactSchema = JSON.parse(read("package.json"));
assert(packageForArtifactSchema.scripts?.["verification:artifact-schema:check"] === "node tests/verification-artifact-schema-lock-check.mjs", "package.json must expose verification:artifact-schema:check");
assert(packageForArtifactSchema.scripts?.["release:evidence:index"] === "node scripts/release-evidence-index.mjs", "package.json must expose release:evidence:index");
assert(packageForArtifactSchema.scripts?.["release:evidence:index:check"] === "node tests/release-evidence-index-check.mjs", "package.json must expose release:evidence:index:check");
assert(exists("tests/verification-artifact-schema-lock-check.mjs"), "verification artifact schema lock check file must exist");
assert(exists("tests/release-evidence-index-check.mjs"), "release evidence index check file must exist");
assert(exists("scripts/release-evidence-index.mjs"), "release evidence index generator must exist");
assert(exists("docs/verification-artifact-schema-lock.md"), "verification artifact schema lock doc must exist");
assert(exists("docs/release-evidence-index.md"), "release evidence index doc must exist");

console.log("Full QA Gate checks passed for v2.3.0.");

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("public-demo-evidence-lock"), "Full QA gate must include public-demo evidence lock");
assert(fullQaGate.includes("tests/public-demo-evidence-lock-check.mjs"), "Full QA gate must run public demo evidence lock check");
