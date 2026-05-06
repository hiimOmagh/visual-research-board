import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.9.0", "package.json version must be 1.9.0");
assert(Boolean(pkg.scripts?.["evidence:pack:check"]), "package.json must define npm run evidence:pack:check");
assert((pkg.scripts?.qa?.includes("evidence-pack-export-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include evidence-pack-export-check");

for (const file of [
  "src/lib/evidence-pack-export.ts",
  "docs/evidence-pack-export-v1.md",
  "src/components/search/ExportPreviewDrawer.tsx",
  "src/components/search/SavedBoard.tsx"
]) assert(existsSync(join(root, file)), `Missing v0.4.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "EvidencePackBucketId",
  "EvidencePackItem",
  "EvidencePackAudit",
  "schema_version: \"0.4.1\"",
  "evidence_pack?: EvidencePackAudit",
  "evidence_pack"
]) assert(types.includes(token), `types must include ${token}`);

const packLib = read("src/lib/evidence-pack-export.ts");
for (const token of [
  "EVIDENCE_PACK_SCHEMA_VERSION",
  "classifyEvidencePackBucket",
  "buildEvidencePackAudit",
  "buildEvidencePackPayload",
  "createEvidencePackJsonExport",
  "createEvidencePackMarkdownExport",
  "createEvidencePackCsvExport",
  "createEvidencePackHtmlExport",
  "Reusable / likely safe candidates",
  "Check required before use",
  "Reference-only discovery leads",
  "Restricted, rejected, or avoid"
]) assert(packLib.includes(token), `evidence-pack lib must include ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "buildEvidencePackAudit",
  "buildEvidencePackPayload",
  "evidence_pack_buckets",
  "createEvidencePackMarkdownExport",
  "createEvidencePackHtmlExport",
  "evidence_pack_reusable_count",
  "evidence_pack_reference_only_count",
  "evidence_pack_category"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const savedBoard = read("src/components/search/SavedBoard.tsx");
for (const token of [
  "Evidence Pack v1",
  "Preview HTML pack",
  "Download HTML pack",
  "Download pack JSON",
  "Download pack Markdown",
  "createEvidencePackHtmlExport",
  "createEvidencePackJsonExport",
  "createEvidencePackMarkdownExport"
]) assert(savedBoard.includes(token), `SavedBoard must include ${token}`);

const drawer = read("src/components/search/ExportPreviewDrawer.tsx");
for (const token of [
  'ExportPreviewFormat = "json" | "markdown" | "csv" | "html" | "template"',
  "HTML evidence pack",
  "createEvidencePackHtmlExport",
  "visual-research-board-evidence-pack.html",
  "text/html"
]) assert(drawer.includes(token), `ExportPreviewDrawer must include ${token}`);

const route = read("src/app/api/export/route.ts");
for (const token of [
  "evidence_pack_json",
  "evidence_pack_markdown",
  "evidence_pack_csv",
  "evidence_pack_html",
  "createEvidencePackHtmlExport"
]) assert(route.includes(token), `export API route must include ${token}`);

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("buildEvidencePackAudit"), "search route must build evidence-pack diagnostics");
assert(searchRoute.includes("evidence_pack: evidencePack"), "search route diagnostics must include evidence_pack");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("buildEvidencePackAudit"), "client search must build evidence-pack diagnostics");
assert(clientSearch.includes("evidence_pack: evidencePack"), "client search diagnostics must include evidence_pack");

const docs = read("docs/evidence-pack-export-v1.md");
assert(docs.includes("v0.4.1"), "docs must identify v0.4.1");
assert(docs.includes("npm run evidence:pack:check"), "docs must document validation command");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v0.4.1"), "PATCH_MANIFEST must identify v0.4.1");
assert(manifest.includes("Evidence Pack Export v1"), "PATCH_MANIFEST must identify the feature");

if (failures.length) {
  console.error("Evidence pack export checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Evidence Pack Export v1 checks passed for v0.4.1.");
process.exit(0);
