import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const read = (path) => readFileSync(join(root, path), "utf8");

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.1.0", "package.json version must be 2.1.0");
assert(Boolean(pkg.scripts?.["query:routing:check"]), "package.json must define npm run query:routing:check");
assert((pkg.scripts?.qa?.includes("query-routing-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include query-routing-check");

const requiredFiles = [
  "src/lib/query-planner.ts",
  "src/lib/providers/provider-utils.ts",
  "src/components/search/SourceClassRoutingPanel.tsx",
  "docs/query-expansion-source-class-routing.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing v0.3.1 file: ${file}`);

const types = read("src/types/research.ts");
for (const token of [
  "SearchSourceTarget",
  "QueryIntent",
  "SourceClass",
  "QueryVariant",
  "ProviderRoutingPlanEntry",
  "SourceClassRoutingTrace",
  "query_variants",
  "provider_routing",
  "source_class_routing",
  "schema_version: \"0.3.1\""
]) {
  assert(types.includes(token), `types must include ${token}`);
}

const planner = read("src/lib/query-planner.ts");
for (const token of [
  "modeQueryExpansions",
  "multilingualExpansions",
  "providerClassMap",
  "providerMaxQueries",
  "createQueryVariants",
  "buildProviderRouting",
  "buildRoutingTrace",
  "source_class_counts",
  "provider_query_counts",
  "reference_launcher_count"
]) {
  assert(planner.includes(token), `query planner must include ${token}`);
}
for (const sourceClass of ["open_media", "archive", "museum", "science", "manual_reference", "web_context", "academic_context"]) {
  assert(planner.includes(`\"${sourceClass}\"`), `query planner must route source class ${sourceClass}`);
}
for (const provider of ["wikimedia", "openverse", "loc", "internet_archive", "nasa", "smithsonian", "europeana", "brave", "tavily"]) {
  assert(planner.includes(`${provider}:`) || planner.includes(`\"${provider}\"`), `query planner must include provider route for ${provider}`);
}

const providerUtils = read("src/lib/providers/provider-utils.ts");
assert(providerUtils.includes("providerQuerySlice"), "provider-utils must expose providerQuerySlice");
assert(providerUtils.includes("plan.provider_routing?.[provider]?.queries"), "providerQuerySlice must read provider-specific routed queries");

for (const [file, provider] of [
  ["src/lib/providers/wikimedia.ts", "wikimedia"],
  ["src/lib/providers/openverse.ts", "openverse"],
  ["src/lib/providers/loc.ts", "loc"],
  ["src/lib/providers/internet-archive.ts", "internet_archive"],
  ["src/lib/providers/nasa.ts", "nasa"],
  ["src/lib/providers/smithsonian.ts", "smithsonian"],
  ["src/lib/providers/europeana.ts", "europeana"],
  ["src/lib/providers/brave.ts", "brave"],
  ["src/lib/providers/tavily.ts", "tavily"]
]) {
  const source = read(file);
  assert(source.includes("providerQuerySlice"), `${file} must use providerQuerySlice`);
  assert(source.includes(`providerQuerySlice(plan, \"${provider}\")`), `${file} must request routed queries for ${provider}`);
}

const route = read("src/app/api/search/route.ts");
for (const token of ["source_class_routing: tunedPlan.source_class_routing", "routed_query_count", "source_classes", "routing_reason", "providerQuerySlice(plan, provider)"]) {
  assert(route.includes(token), `search route must include ${token}`);
}

const client = read("src/lib/client-search.ts");
assert(client.includes("source_class_routing: tunedPlan.source_class_routing"), "client fallback diagnostics must include source_class_routing");
assert(client.includes("providerQuerySlice(searchPlan, \"mock\")"), "client fallback must use routed mock queries");

const panel = read("src/components/search/SourceClassRoutingPanel.tsx");
for (const token of ["v0.3.1 routing gate", "Query expansion + source-class routing", "Source-class coverage", "Provider query caps", "manual reference launchers"]) {
  assert(panel.includes(token), `SourceClassRoutingPanel must include ${token}`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
for (const token of ["v2.1.0", "SourceClassRoutingPanel", "source_class_routing", "Expanded query variants", "visual-research-board-library-v2.1.0.json"]) {
  assert(searchPanel.includes(token), `SearchPanel must include ${token}`);
}

const providerHealth = read("src/components/search/ProviderHealthPanel.tsx");
for (const token of ["routed source classes", "Source classes:", "Routing:"]) {
  assert(providerHealth.includes(token), `ProviderHealthPanel must include ${token}`);
}

const docs = read("docs/query-expansion-source-class-routing.md");
assert(docs.includes("v0.3.1"), "routing docs must identify v0.3.1");
assert(docs.includes("providerQuerySlice"), "routing docs must document providerQuerySlice");
assert(docs.includes("npm run query:routing:check"), "routing docs must document validation command");

if (failures.length) {
  console.error("Query expansion + source-class routing checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Query expansion + source-class routing checks passed for v0.3.1.");
process.exit(0);
