import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => { if (!condition) failures.push(message); };

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "0.3.1", "package.json version must be 0.3.1");
assert(Boolean(pkg.scripts?.["normalization:dedupe:check"]), "package.json must define normalization:dedupe:check");
assert(pkg.scripts?.qa?.includes("normalization-dedupe-check"), "npm run qa must include normalization-dedupe-check");

const types = read("src/types/research.ts");
for (const token of [
  "DuplicateMatchReason",
  "MetadataGap",
  "DuplicateProviderSource",
  "DuplicateGroupTrace",
  "NormalizationDedupeTrace",
  "canonical_source_url",
  "canonical_image_url",
  "duplicate_keys",
  "duplicate_group_size",
  "provider_sources",
  "metadata_gaps",
  "normalization_dedupe"
]) {
  assert(types.includes(token), `types must include ${token}`);
}
assert(types.includes('schema_version: "0.2.10"'), "normalization/review schema references must include 0.2.10");

const normalizer = read("src/lib/result-normalizer.ts");
for (const token of [
  "canonicalUrl",
  "normalizeTitle",
  "DuplicateMatchReason",
  "metadataGaps",
  "mergeMetadata",
  "provider_sources",
  "duplicate_group_size",
  "metadata_gap_counts",
  "NormalizationDedupeTrace"
]) {
  assert(normalizer.includes(token), `result-normalizer must include ${token}`);
}
for (const reason of ["source_url", "image_url", "thumbnail_url", "title_domain", "image_asset", "visual_shape"]) {
  assert(normalizer.includes(`\"${reason}\"`), `normalizer must support duplicate reason ${reason}`);
}

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("normalization_dedupe: normalized.stats.trace"), "search route must return normalization_dedupe diagnostics");
assert(!searchRoute.includes("const autoTuning = completeAutoTuningTrace({ trace: shouldRunTunedPass") || searchRoute.match(/const autoTuning = completeAutoTuningTrace/g)?.length === 1, "search route must not duplicate autoTuning const declaration");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("normalization_dedupe: normalized.stats.trace"), "static client mock response must include normalization_dedupe diagnostics");

const panel = read("src/components/search/NormalizationDedupePanel.tsx");
for (const token of ["Provider normalization gate", "Normalization + deduplication", "Metadata gap counts", "Duplicate groups", "schema {trace.schema_version}"]) {
  assert(panel.includes(token), `NormalizationDedupePanel must include ${token}`);
}

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("NormalizationDedupePanel"), "SearchPanel must render NormalizationDedupePanel");
assert(searchPanel.includes("v0.3.1"), "SearchPanel header must show v0.3.1");
assert(searchPanel.includes("visual-research-board-library-v0.3.1.json"), "library export filename must use v0.3.1");

const resultCard = read("src/components/search/ResultCard.tsx");
assert(resultCard.includes("merged ×"), "ResultCard must surface merged duplicate count");
assert(resultCard.includes("Metadata gaps:"), "ResultCard must surface metadata gaps");

const detailPanel = read("src/components/search/ResultDetailPanel.tsx");
for (const token of ["Canonical source URL", "Duplicate group", "Metadata gaps", "Merged provider sources"]) {
  assert(detailPanel.includes(token), `ResultDetailPanel must include ${token}`);
}

const project = read("src/lib/project.ts");
assert(project.includes("canonicalUrl"), "project migration must hydrate canonical URLs");
assert(project.includes("duplicate_group_size"), "project migration must hydrate duplicate group size");
assert(project.includes("normalization_dedupe"), "project search history must persist normalization_dedupe summary");

const exportLib = read("src/lib/export.ts");
for (const token of ["duplicate_group_count", "metadata_gap_count", "canonical_source_url", "duplicate_match_reasons", "metadata_gaps"]) {
  assert(exportLib.includes(token), `exports must include ${token}`);
}

const docs = read("docs/provider-normalization-deduplication.md");
assert(docs.includes("v0.3.1"), "normalization docs must identify v0.3.1");
assert(docs.includes("npm run normalization:dedupe:check"), "normalization docs must document validation command");

if (failures.length) {
  console.error("Normalization + deduplication checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Normalization + deduplication checks passed for v0.3.1.");
process.exit(0);
