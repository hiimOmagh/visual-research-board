import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixture = JSON.parse(readFileSync(join(root, "tests/fixtures/normalization-alpha6.json"), "utf8"));

function normalizeKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .trim();
}

function domainKey(result) {
  return `${result.source_domain}|${result.title.toLowerCase().replace(/\s+/g, " ")}`;
}

function dedupe(rawResults) {
  const seen = new Set();
  return rawResults.filter((result) => {
    const candidates = [
      normalizeKey(result.source_url),
      result.image_url ? normalizeKey(result.image_url) : "",
      domainKey(result)
    ].filter(Boolean);

    if (candidates.some((candidate) => seen.has(candidate))) return false;
    candidates.forEach((candidate) => seen.add(candidate));
    return true;
  });
}

const raw = fixture.raw_results;
const deduped = dedupe(raw);
const duplicateCount = raw.length - deduped.length;
const failures = [];

if (raw.length !== fixture.expected.raw_count) failures.push(`Expected raw_count ${fixture.expected.raw_count}, got ${raw.length}`);
if (deduped.length !== fixture.expected.deduped_count) failures.push(`Expected deduped_count ${fixture.expected.deduped_count}, got ${deduped.length}`);
if (duplicateCount !== fixture.expected.duplicate_count) failures.push(`Expected duplicate_count ${fixture.expected.duplicate_count}, got ${duplicateCount}`);
if (!deduped.some((item) => item.source_domain === "commons.wikimedia.org" && item.license_detected === "public_domain")) {
  failures.push("Expected public-domain Wikimedia result to survive deduplication.");
}

if (failures.length > 0) {
  console.error("Normalization tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Normalization checks passed for v0.1.0-alpha.6.");
