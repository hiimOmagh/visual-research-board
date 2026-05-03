import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixture = JSON.parse(readFileSync(join(root, "tests/fixtures/normalization-stable.json"), "utf8"));

function normalizeKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/index\.(html?|php)$/i, "")
    .replace(/\/$/, "")
    .trim();
}

function normalizeTitle(value) {
  return String(value)
    .toLowerCase()
    .replace(/^file:/, "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !["the", "and", "for", "with", "from", "image", "photo", "picture", "wiki"].includes(token))
    .join(" ")
    .trim();
}

function imageAssetKey(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname).toLowerCase();
    const file = path.split("/").filter(Boolean).at(-1) ?? "";
    return file.replace(/^[0-9]+px-/, "").replace(/[?#].*$/, "").trim();
  } catch {
    return "";
  }
}

function classifySourceDomain(sourceDomain) {
  const domain = String(sourceDomain ?? "").toLowerCase();
  if (!domain || domain === "unknown-source") return "unknown";
  if (domain.includes("commons.wikimedia.org") || domain.includes("wikimedia") || domain.includes("wikipedia.org")) return "commons_open_access";
  if (["loc.gov", "archives.gov", "archive.org", "europeana.eu", "metmuseum.org", "getty.edu", "si.edu"].some((hint) => domain.includes(hint))) return "institutional_archive";
  if ([".gov", ".edu", ".ac.", "who.int", "un.org"].some((hint) => domain.includes(hint))) return "official_academic";
  if (["shutterstock", "alamy", "gettyimages", "istockphoto"].some((hint) => domain.includes(hint))) return "commercial_stock";
  if (["reuters", "apnews", "bbc.", "cnn.", "nytimes"].some((hint) => domain.includes(hint))) return "news_media";
  if (["search.brave.com", "google.com", "youtube.com", "instagram.com", "reddit.com"].some((hint) => domain.includes(hint))) return "search_or_social";
  return "general_web";
}

function dedupeCandidates(result) {
  const titleKey = normalizeTitle(result.title);
  const imageKey = imageAssetKey(result.image_url || result.thumbnail_url);
  return [
    normalizeKey(result.source_url),
    result.image_url ? normalizeKey(result.image_url) : "",
    result.thumbnail_url && !String(result.thumbnail_url).startsWith("data:") ? normalizeKey(result.thumbnail_url) : "",
    titleKey ? `${result.source_domain}|${titleKey}` : "",
    imageKey ? `image-asset|${imageKey}` : "",
    titleKey && result.width && result.height ? `visual-shape|${titleKey}|${result.width}x${result.height}` : ""
  ].filter(Boolean);
}

function dedupe(rawResults) {
  const seen = new Set();
  return rawResults.filter((result) => {
    const candidates = dedupeCandidates(result);
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
if (classifySourceDomain("commons.wikimedia.org") !== "commons_open_access") failures.push("Commons should classify as commons_open_access.");
if (classifySourceDomain("loc.gov") !== "institutional_archive") failures.push("LOC should classify as institutional_archive.");
if (!dedupeCandidates(raw[0]).some((key) => key.startsWith("image-asset|"))) failures.push("Image asset key must be part of dedupe candidates.");

if (failures.length > 0) {
  console.error("Normalization tests failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Normalization checks passed for v0.1.0.");
