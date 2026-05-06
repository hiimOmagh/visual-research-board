import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.9.0", "package.json version must be 1.9.0");
assert(Boolean(pkg.scripts?.["claim:mapping:check"]), "package.json must define npm run claim:mapping:check");
assert((pkg.scripts?.qa?.includes("claim-mapping-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include claim-mapping-check");

for (const file of [
  "src/lib/claim-mapping.ts",
  "src/components/search/ClaimMappingPanel.tsx",
  "src/components/search/SavedBoard.tsx",
  "docs/claim-to-source-mapping.md"
]) assert(existsSync(join(root, file)), `Missing v0.3.3 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "ClaimEvidenceRelation",
  "ClaimSourceLink",
  "ResearchClaim",
  "ClaimMappingAudit",
  "schema_version: \"0.3.3\"",
  "claims: ResearchClaim[]",
  "claim_mapping?: ClaimMappingAudit",
  "claim_evidence"
]) assert(types.includes(token), `types must include ${token}`);

const lib = read("src/lib/claim-mapping.ts");
for (const token of [
  "buildClaimMappingAudit",
  "createResearchClaim",
  "normalizeResearchClaims",
  "linkSourceToClaim",
  "unlinkSourceFromClaim",
  "removeResultFromAllClaims",
  "inferClaimStatus",
  "CLAIM_RELATION_LABELS",
  "visual_reference_only",
  "unlinked_saved_count"
]) assert(lib.includes(token), `claim-mapping lib must include ${token}`);

const project = read("src/lib/project.ts");
for (const token of [
  "claims: []",
  "normalizeResearchClaims(project.claims",
  "addProjectClaim",
  "updateProjectClaim",
  "linkProjectSourceToClaim",
  "unlinkProjectSourceFromClaim",
  "removeSavedResultAndClaimLinks"
]) assert(project.includes(token), `project.ts must include ${token}`);

const panel = read("src/components/search/ClaimMappingPanel.tsx");
for (const token of [
  "Claim-to-source mapping",
  "v0.3.3 claim gate",
  "Add claim",
  "Claim mapping warnings",
  "Evidence links",
  "CLAIM_STATUS_OPTIONS",
  "CLAIM_CONFIDENCE_OPTIONS"
]) assert(panel.includes(token), `ClaimMappingPanel must include ${token}`);

const savedBoard = read("src/components/search/SavedBoard.tsx");
for (const token of [
  "ClaimLinkEditor",
  "Claim links",
  "onLinkSourceToClaim",
  "onUnlinkSourceFromClaim",
  "CLAIM_RELATION_OPTIONS",
  "CLAIM_RELATION_LABELS",
  "visual reference"
]) assert(savedBoard.includes(token), `SavedBoard must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v1.9.0",
  "ClaimMappingPanel",
  "addProjectClaim",
  "linkProjectSourceToClaim",
  "removeSavedResultAndClaimLinks",
  "visual-research-board-library-v1.9.0.json",
  "onLinkSourceToClaim={linkSourceToClaim}"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "createClaimEvidenceExport",
  "buildClaimMappingAudit",
  "claim_mapping",
  "Claim Evidence Map",
  "linked_claims",
  "claim_source_link_count"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const docs = read("docs/claim-to-source-mapping.md");
assert(docs.includes("v0.3.3"), "docs must identify v0.3.3");
assert(docs.includes("npm run claim:mapping:check"), "docs must document validation command");

if (failures.length) {
  console.error("Claim mapping checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Claim-to-source mapping checks passed for v0.3.3.");
process.exit(0);
