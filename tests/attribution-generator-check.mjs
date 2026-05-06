import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.8.1", "package.json version must be 0.8.1");
assert(Boolean(pkg.scripts?.["attribution:generator:check"]), "package.json must define npm run attribution:generator:check");
assert((pkg.scripts?.qa?.includes("attribution-generator-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include attribution-generator-check");

for (const file of [
  "src/lib/attribution-generator.ts",
  "docs/attribution-generator-upgrade.md",
  "src/components/search/SavedBoard.tsx",
  "src/lib/evidence-pack-export.ts",
  "src/app/api/export/route.ts"
]) assert(existsSync(join(root, file)), `Missing v0.4.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "AttributionFormat",
  "AttributionClearance",
  "AttributionEntry",
  "AttributionAudit",
  "schema_version: \"0.4.1\"",
  "attribution_generator?: AttributionAudit",
  "rough_bibliography",
  "video_description",
  "attribution_ready_candidate",
  "verify_before_use",
  "do_not_use"
]) assert(types.includes(token), `types must include ${token}`);

const attr = read("src/lib/attribution-generator.ts");
for (const token of [
  "ATTRIBUTION_SCHEMA_VERSION",
  "ATTRIBUTION_FORMAT_LABELS",
  "ATTRIBUTION_CLEARANCE_LABELS",
  "inferAttributionClearance",
  "attributionWarnings",
  "createAttributionText",
  "buildAttributionEntry",
  "buildAttributionAudit",
  "buildAttributionPackPayload",
  "createAttributionJsonExport",
  "createAttributionCsvExport",
  "createAttributionMarkdownExport",
  "createMultiFormatAttributionMarkdownExport",
  "Attribution text is a drafting aid, not legal clearance"
]) assert(attr.includes(token), `attribution generator must include ${token}`);

const exportLib = read("src/lib/export.ts");
for (const token of [
  "createAttributionText(result, \"simple\")",
  "createAttributionPackMarkdownExport",
  "createAttributionPackJsonExport",
  "createAttributionPackCsvExport",
  "attribution_generator: buildAttributionAudit(results)",
  "attribution_ready_candidate_count",
  "attribution_verify_before_use_count"
]) assert(exportLib.includes(token), `export lib must include ${token}`);

const evidencePack = read("src/lib/evidence-pack-export.ts");
assert(evidencePack.includes("createAttributionText"), "evidence pack must use upgraded attribution generator");
assert(evidencePack.includes("creator_title_source_license"), "evidence pack must use a structured attribution format");

const savedBoard = read("src/components/search/SavedBoard.tsx");
for (const token of [
  "Attribution Generator v1",
  "Multi-format attribution",
  "Download attribution MD",
  "Download attribution JSON",
  "Download attribution CSV",
  "createAttributionPackMarkdownExport",
  "createAttributionPackJsonExport",
  "createAttributionPackCsvExport"
]) assert(savedBoard.includes(token), `SavedBoard must include ${token}`);

const exportRoute = read("src/app/api/export/route.ts");
for (const token of [
  "attribution_json",
  "attribution_markdown",
  "attribution_csv",
  "createAttributionPackJsonExport",
  "createAttributionPackMarkdownExport",
  "createAttributionPackCsvExport"
]) assert(exportRoute.includes(token), `export API route must include ${token}`);

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("buildAttributionAudit"), "search route must build attribution audit");
assert(searchRoute.includes("attribution_generator: attributionAudit"), "search diagnostics must include attribution audit");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("buildAttributionAudit"), "client search must build attribution audit");
assert(clientSearch.includes("attribution_generator: attributionAudit"), "client diagnostics must include attribution audit");

const docs = read("docs/attribution-generator-upgrade.md");
assert(docs.includes("v0.4.1"), "docs must identify v0.4.1");
assert(docs.includes("npm run attribution:generator:check"), "docs must document validation command");

const manifest = read("PATCH_MANIFEST.md");
assert(manifest.includes("v0.4.1"), "PATCH_MANIFEST must identify v0.4.1");
assert(manifest.includes("Attribution Generator Upgrade"), "PATCH_MANIFEST must identify the feature");

if (failures.length) {
  console.error("Attribution generator checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Attribution Generator Upgrade checks passed for v0.4.1.");
process.exit(0);
