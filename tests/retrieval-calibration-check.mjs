import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(relativePath) { return readFileSync(join(root, relativePath), "utf8"); }

const requiredFiles = [
  "src/lib/retrieval-calibration.ts",
  "src/components/search/LiveQualityCalibrationPanel.tsx",
  "scripts/retrieval-quality-calibration.mjs",
  "tests/fixtures/retrieval-quality-calibration-topics.json",
  "docs/live-retrieval-quality-calibration.md"
];

for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing retrieval calibration file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.3", "package.json version must be 2.1.3");
assert(Boolean(pkg.scripts?.["retrieval:quality:test"]), "package.json must define npm run retrieval:quality:test");
assert(Boolean(pkg.scripts?.["retrieval:calibration:check"]), "package.json must define npm run retrieval:calibration:check");
assert((pkg.scripts?.qa?.includes("retrieval-calibration-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include retrieval-calibration-check");

const types = read("src/types/research.ts");
assert(types.includes("RetrievalQualityCalibration"), "types must define RetrievalQualityCalibration");
assert(types.includes("RetrievalQualityVerdict"), "types must define RetrievalQualityVerdict");
assert(types.includes("quality_calibration?: RetrievalQualityCalibration"), "SearchDiagnostics must include optional quality_calibration");

const calibration = read("src/lib/retrieval-calibration.ts");
assert(calibration.includes("buildRetrievalQualityCalibration"), "retrieval-calibration.ts must export buildRetrievalQualityCalibration");
assert(calibration.includes("passes_creator_gate"), "retrieval calibration must include passes_creator_gate verdict");
assert(calibration.includes("real_provider_share"), "retrieval calibration must measure real_provider_share");
assert(calibration.includes("top10_average_overall"), "retrieval calibration must calculate top-10 average score");
assert(calibration.includes("MODE_EXPECTATION_OVERRIDES"), "retrieval calibration must include mode-specific expectations");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("buildRetrievalQualityCalibration"), "search route must build retrieval quality calibration");
assert(searchRoute.includes("quality_calibration: qualityCalibration"), "search route diagnostics must attach quality_calibration");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("buildRetrievalQualityCalibration"), "client static fallback must build retrieval quality calibration");
assert(clientSearch.includes("quality_calibration"), "client static fallback diagnostics must attach quality_calibration");

const panel = read("src/components/search/LiveQualityCalibrationPanel.tsx");
assert(panel.includes("Live retrieval creator gate"), "quality calibration panel must render creator gate heading");
assert(panel.includes("Real-provider share"), "quality calibration panel must show real-provider share");
assert(panel.includes("Calibration failure signals"), "quality calibration panel must show warning signals");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("LiveQualityCalibrationPanel"), "SearchPanel must render LiveQualityCalibrationPanel");
assert(searchPanel.includes("v2.1.3"), "SearchPanel header must show v2.1.3");

const script = read("scripts/retrieval-quality-calibration.mjs");
assert(script.includes("VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL"), "retrieval quality script must support runtime base URL env");
assert(script.includes("VISUAL_RESEARCH_BOARD_REQUIRE_CREATOR_GATE"), "retrieval quality script must support strict creator gate env");
assert(script.includes("artifacts/retrieval-quality-calibration.json"), "retrieval quality script must write calibration evidence artifact");
assert(script.includes("/api/search"), "retrieval quality script must call search endpoint");

const topics = JSON.parse(read("tests/fixtures/retrieval-quality-calibration-topics.json"));
assert(Array.isArray(topics) && topics.length >= 4, "retrieval quality fixture must include at least four cases");
assert(topics.some((item) => item.depth === "deep"), "retrieval quality fixture must include a deep search case");
assert(topics.some((item) => item.mode === "public_domain"), "retrieval quality fixture must include a public_domain case");
assert(topics.every((item) => item.topic && item.mode && item.depth), "retrieval quality fixture cases must include topic, mode, and depth");

const docs = read("docs/live-retrieval-quality-calibration.md");
assert(docs.includes("v0.3.1"), "live retrieval calibration docs must identify v0.3.1");
assert(docs.includes("npm run retrieval:quality:test"), "live retrieval calibration docs must document the quality test command");
assert(docs.includes("passes_creator_gate"), "live retrieval calibration docs must document the creator gate verdict");

if (failures.length) {
  console.error("Retrieval calibration checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Retrieval calibration checks passed for v0.3.1.");
