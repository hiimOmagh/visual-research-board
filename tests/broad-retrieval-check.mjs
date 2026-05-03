import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

const planner = read("src/lib/query-planner.ts");
const providerUtils = read("src/lib/providers/provider-utils.ts");
const brave = read("src/lib/providers/brave.ts");
const wikimedia = read("src/lib/providers/wikimedia.ts");
const tavily = read("src/lib/providers/tavily.ts");
const docs = read("docs/broad-image-retrieval.md");

assert(planner.includes("deep: 16"), "query planner must keep a broad deep query plan");
assert(planner.includes("visualQueryExpansions"), "query planner must include visual/image-specific query expansions");
assert(providerUtils.includes('depth === "quick" ? 2 : depth === "standard" ? 5 : 8'), "querySlice must search more than one branch");
assert(providerUtils.includes("runLimited"), "provider calls must be concurrency-limited");
assert(brave.includes("offsetsForDepth"), "Brave image search must use offset windows for broader retrieval");
assert(brave.includes("broad-web-image-candidate"), "Brave image results must be tagged as broad web image candidates");
assert(wikimedia.includes("querySlice(plan.queries, plan.depth)"), "Wikimedia must search multiple query branches");
assert(wikimedia.includes("broad-commons-candidate"), "Wikimedia results must identify broad Commons candidates");
assert(tavily.includes("include_images: plan.source_targets.includes(\"image\")"), "Tavily must request image candidates when relevant");
assert(tavily.includes("tavily-image"), "Tavily image candidates must be normalized into image results");
assert(docs.includes("cannot literally fetch \"all images on the web.\""), "broad retrieval docs must state the all-web boundary honestly");

if (failures.length) {
  console.error("Broad retrieval checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Broad retrieval checks passed for v0.2.0.");
