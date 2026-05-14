import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.3", "package.json version must be 2.1.3");
assert(Boolean(pkg.scripts?.["coverage:bias:check"]), "package.json must define npm run coverage:bias:check");
assert((pkg.scripts?.qa?.includes("coverage-bias-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include coverage-bias-check");

for (const file of [
  "src/lib/coverage-bias-audit.ts",
  "src/components/search/CoverageBiasAuditPanel.tsx",
  "docs/coverage-bias-audit.md"
]) assert(existsSync(join(root, file)), `Missing v0.4.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "CoverageBiasAudit",
  "schema_version: \"0.3.4\"",
  "coverage_bias?: CoverageBiasAudit",
  "dominant_provider_share",
  "claims_without_counter_count",
  "coverage_audit"
]) assert(types.includes(token), `types must include ${token}`);

const auditLib = read("src/lib/coverage-bias-audit.ts");
for (const token of [
  "buildCoverageBiasAudit",
  "COVERAGE_BIAS_AUDIT_SCHEMA_VERSION",
  "Provider concentration risk",
  "Domain concentration risk",
  "Source-group concentration risk",
  "No claim has weakening or contradictory evidence",
  "Reference-only",
  "high reuse-risk"
]) assert(auditLib.includes(token), `coverage-bias audit lib must include ${token}`);

const panel = read("src/components/search/CoverageBiasAuditPanel.tsx");
for (const token of [
  "Coverage and bias audit",
  "v0.4.1 coverage gate",
  "Source diversity, rights risk, and claim coverage",
  "Dominant provider",
  "Claim gaps",
  "Audit warnings"
]) assert(panel.includes(token), `CoverageBiasAuditPanel must include ${token}`);

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of [
  "v2.1.3",
  "CoverageBiasAuditPanel",
  "buildCoverageBiasAudit(project)",
  "coverageBiasAudit",
  "visual-research-board-library-v2.1.3.json"
]) assert(searchPanel.includes(token), `SearchPanel must include ${token}`);

const route = read("src/app/api/search/route.ts");
for (const token of [
  "buildCoverageBiasAudit",
  "const coverageBias = buildCoverageBiasAudit(rankedResults)",
  "coverage_bias: coverageBias"
]) assert(route.includes(token), `search route must include ${token}`);

const clientSearch = read("src/lib/client-search.ts");
for (const token of [
  "buildCoverageBiasAudit",
  "coverage_bias: coverageBias"
]) assert(clientSearch.includes(token), `client search must include ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "buildCoverageBiasAudit",
  "coverage_bias",
  "Coverage and Bias Audit",
  "createCoverageAuditExport",
  "coverage_flags",
  "coverage_warning_count",
  "coverage_high_risk_count"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const docs = read("docs/coverage-bias-audit.md");
assert(docs.includes("v0.4.1"), "docs must identify v0.4.1");
assert(docs.includes("npm run coverage:bias:check"), "docs must document validation command");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v0.4.1"), "PATCH_MANIFEST must identify v0.4.1");
assert(manifest.includes("Coverage and Bias Audit"), "PATCH_MANIFEST must identify the feature");

if (failures.length) {
  console.error("Coverage and bias audit checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Coverage and bias audit checks passed for v0.4.1.");
process.exit(0);
