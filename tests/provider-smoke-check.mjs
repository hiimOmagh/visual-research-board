import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixture = JSON.parse(readFileSync(join(root, "tests/fixtures/provider-smoke-alpha9.json"), "utf8"));
const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
}

// Minimal in-Node mirrors of what src/lib/result-normalizer.ts does, used to
// verify that a raw provider payload would survive normalization without
// requiring a TypeScript runtime here.

function normalizeKey(value) {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .trim();
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

function looksUsable(raw) {
  if (typeof raw !== "object" || raw === null) return false;
  if (typeof raw.title !== "string" || !raw.title.trim()) return false;
  if (typeof raw.source_url !== "string" || !raw.source_url.trim()) return false;
  if (!["image", "web", "news", "archive"].includes(raw.type)) return false;
  if (!["mock", "manual", "wikimedia", "brave", "tavily"].includes(raw.provider)) return false;
  return true;
}

const providerNames = ["mock", "wikimedia", "brave", "tavily"];

for (const providerName of providerNames) {
  const providerEntry = fixture.providers?.[providerName];
  assert(providerEntry, `provider smoke fixture missing entry for ${providerName}`);
  if (!providerEntry) continue;

  const rawResults = Array.isArray(providerEntry.raw_results) ? providerEntry.raw_results : [];
  assert(rawResults.length >= (providerEntry.expected_min_count ?? 1), `${providerName}: must include at least ${providerEntry.expected_min_count ?? 1} raw result(s)`);

  const usable = rawResults.filter(looksUsable);
  assert(usable.length === rawResults.length, `${providerName}: every raw result must be usable (title, url, type, provider)`);

  for (const result of usable) {
    assert(result.provider === providerName, `${providerName}: raw result.provider must equal "${providerName}"`);
    const domain = result.source_domain ?? domainFromUrl(result.source_url);
    assert(domain && domain !== "unknown-source", `${providerName}: result must have a resolvable source_domain (got "${domain}" for "${result.title}")`);
    assert(typeof result.license_confidence === "number" && result.license_confidence >= 0 && result.license_confidence <= 1, `${providerName}: license_confidence must be in [0, 1] for "${result.title}"`);
  }

  // Within a single provider, every (source_url + image_url) pair should be
  // unique once normalized — otherwise the smoke fixture itself contains a
  // dup that would confuse downstream tests.
  const seen = new Set();
  for (const result of usable) {
    const key = `${normalizeKey(result.source_url)}|${result.image_url ? normalizeKey(result.image_url) : ""}`;
    assert(!seen.has(key), `${providerName}: smoke fixture must not contain internal duplicates ("${result.title}")`);
    seen.add(key);
  }
}

// Cross-provider sanity: pooling all raw responses through dedupe must yield
// exactly the union (no accidental cross-provider collisions in fixture).
const everyResult = providerNames.flatMap((name) => fixture.providers?.[name]?.raw_results ?? []);
const seen = new Set();
let deduped = 0;
for (const result of everyResult) {
  const key = `${normalizeKey(result.source_url)}|${result.image_url ? normalizeKey(result.image_url) : ""}`;
  if (!seen.has(key)) {
    seen.add(key);
    deduped += 1;
  }
}
assert(deduped === everyResult.length, "provider smoke fixture must not contain cross-provider duplicates");

if (failures.length > 0) {
  console.error("Provider smoke fixture checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Provider smoke fixture checks passed for v0.1.0-alpha.9.");
