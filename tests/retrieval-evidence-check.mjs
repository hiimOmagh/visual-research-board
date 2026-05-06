import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(relativePath) { return readFileSync(join(root, relativePath), "utf8"); }
assert(existsSync(join(root, "src/lib/retrieval-evidence.ts")), "retrieval-evidence.ts must exist");
assert(existsSync(join(root, "src/components/search/RetrievalEvidencePanel.tsx")), "RetrievalEvidencePanel.tsx must exist");
const types = read("src/types/research.ts");
const evidence = read("src/lib/retrieval-evidence.ts");
const searchRoute = read("src/app/api/search/route.ts");
const clientSearch = read("src/lib/client-search.ts");
const panel = read("src/components/search/RetrievalEvidencePanel.tsx");
const docs = read("docs/real-retrieval-validation.md");
const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.8.2", "package version must be v0.8.2");
assert(types.includes("RetrievalEvidenceVerdict"), "types must include RetrievalEvidenceVerdict");
assert(types.includes("retrieval_evidence: RetrievalEvidence"), "SearchDiagnostics must require retrieval evidence");
assert(evidence.includes("TARGET_CANDIDATES"), "retrieval evidence must define target candidate gates");
assert(evidence.includes("deep: 40"), "deep mode must target at least 40 candidates");
assert(evidence.includes("source_group_diversity"), "retrieval evidence must measure source diversity");
assert(evidence.includes("saveable_candidates"), "retrieval evidence must measure saveable candidates");
assert(evidence.includes("broad_retrieval_score"), "retrieval evidence must compute a broad retrieval score");
assert(searchRoute.includes("retrieval_evidence: retrievalEvidence"), "API search must attach retrieval evidence");
assert(clientSearch.includes("buildRetrievalEvidence"), "static mock fallback must attach retrieval evidence");
assert(panel.includes("Retrieval evidence"), "UI must render retrieval evidence");
assert(panel.includes("Failure signals to correct"), "UI must show evidence warnings");
assert(docs.includes("v0.3.1"), "real retrieval validation docs must identify v0.3.1");
assert(docs.includes("40 candidates"), "docs must state the deep-mode candidate target");
if (failures.length) { console.error("Retrieval evidence checks failed:"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("Retrieval evidence checks passed for v0.3.1.");
