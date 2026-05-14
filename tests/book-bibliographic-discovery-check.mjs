
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fp(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(fp(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(fp(relativePath), "utf8");
}

function fail(message) {
  console.error(`FAIL book bibliographic discovery check: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const pkg = JSON.parse(read("package.json"));
const VERSION = pkg.version;

assert(VERSION === "2.1.3", "package.json version must be 2.1.3");
assert(pkg.description?.includes("Book / Bibliographic Discovery Layer"), "package description must identify Book / Bibliographic Discovery Layer");
assert(pkg.description?.includes("Social Reference Discovery Layer"), "package description must preserve Social Reference Discovery Layer wording");
assert(pkg.description?.includes("Broad Web + Image Discovery Expansion"), "package description must preserve Broad Web + Image Discovery Expansion wording");
assert(pkg.description?.includes("Broad Reference Result Model"), "package description must preserve Broad Reference Result Model wording");
assert(pkg.description?.includes("Reference Intelligence Layer MVP"), "package description must preserve Reference Intelligence Layer MVP wording");
assert(pkg.description?.includes("Security and Key Handling"), "package description must preserve Security and Key Handling wording");
assert(pkg.scripts?.["book-reference:check"] === "node tests/book-bibliographic-discovery-check.mjs", "package.json must expose book-reference:check");
assert(pkg.scripts?.["social-reference:check"] === "node tests/social-reference-discovery-check.mjs", "package.json must preserve social-reference:check");

if (exists("package-lock.json")) {
  const lock = JSON.parse(read("package-lock.json"));
  assert(lock.version === VERSION, "package-lock.json version must match package.json");
  assert(lock.packages?.[""]?.version === VERSION, "package-lock root package version must match package.json");
}

const lockText = exists("package-lock.json") ? read("package-lock.json") : "";
assert(!lockText.includes('"is-finalizationregistry": "^2.1.3"'), "lockfile must not mutate is-finalizationregistry dependency to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.1.3"'), "lockfile must not mutate which-boxed-primitive dependency to app version");

const requiredFiles = [
  "src/types/book-reference.ts",
  "src/lib/book-bibliographic-discovery.ts",
  "src/components/search/BookBibliographicDiscoveryPanel.tsx",
  "tests/book-bibliographic-discovery-check.mjs",
  "docs/book-bibliographic-discovery.md",
  "docs/book-reference-safety-boundaries.md",
  "scripts/full-qa-gate.mjs",
  "tests/full-qa-gate-check.mjs"
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required file: ${file}`);
}

const types = read("src/types/book-reference.ts");
for (const token of [
  "BookReferenceSourceType",
  "BookReferenceCandidate",
  "BookReferenceNormalizationResult",
  "isbn_record",
  "catalog_entry",
  "open_library_record",
  "google_books_preview",
  "worldcat_record",
  "archive_scan",
  "bibliography_entry"
]) {
  assert(types.includes(token), `book reference types must include ${token}`);
}

const lib = read("src/lib/book-bibliographic-discovery.ts");
for (const token of [
  "inferBookReferenceSourceType",
  "inferBookReferenceAccessState",
  "normalizeBookReferenceCandidate",
  "createBibliographyLabel",
  "source_class: \"book\"",
  "Book discovery is metadata-first",
  "No copyrighted text extraction",
  "full-text scraping",
  "paywall bypass"
]) {
  assert(lib.includes(token), `book bibliographic lib must include ${token}`);
}

const panel = read("src/components/search/BookBibliographicDiscoveryPanel.tsx");
for (const token of [
  "BookBibliographicDiscoveryPanel",
  "Book / bibliographic discovery",
  "metadata-first",
  "copyrighted text extraction",
  "full-text scraping",
  "paywall bypass"
]) {
  assert(panel.includes(token), `book bibliographic panel must include ${token}`);
}

const fullQaGate = read("scripts/full-qa-gate.mjs");
assert(fullQaGate.includes("book-bibliographic-discovery"), "Full QA gate must include book bibliographic discovery gate");
assert(fullQaGate.includes("tests/book-bibliographic-discovery-check.mjs"), "Full QA gate must run book bibliographic discovery check");

const fullQaCheck = read("tests/full-qa-gate-check.mjs");
assert(fullQaCheck.includes("book-bibliographic-discovery"), "Full QA gate manifest must check book bibliographic discovery gate");

const bookDoc = read("docs/book-bibliographic-discovery.md");
assert(bookDoc.includes("metadata-first"), "book doc must mention metadata-first scope");
assert(bookDoc.includes("No copyrighted text extraction"), "book doc must forbid copyrighted text extraction");
assert(bookDoc.includes("No full-text scraping"), "book doc must forbid full-text scraping");
assert(bookDoc.includes("No paywall bypass"), "book doc must forbid paywall bypass");

const boundariesDoc = read("docs/book-reference-safety-boundaries.md");
for (const token of ["allowed", "forbidden", "metadata", "preview", "catalog"]) {
  assert(boundariesDoc.includes(token), `book boundary doc must include ${token}`);
}

const rootApplyScripts = fs.readdirSync(root).filter((name) => /^apply-v.*\.(mjs|py)$/.test(name));
assert(rootApplyScripts.length === 0, `root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);

const reportPath = "artifacts/full-qa-gate-report.json";
if (exists(reportPath)) {
  const report = JSON.parse(read(reportPath));
  if (report.app_version !== VERSION) {
    console.warn(`WARN book bibliographic discovery: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`);
  } else if (report.status !== "passed" || report.failed_gate_count !== 0) {
    console.warn(`WARN book bibliographic discovery: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`Book / Bibliographic Discovery Layer checks passed for v${VERSION}.`);
