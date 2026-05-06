
import type {
  BookReferenceAccessState,
  BookReferenceCandidate,
  BookReferenceNormalizationResult,
  BookReferenceSourceType
} from "@/types/book-reference";
import type { BroadReferenceResult } from "@/types/broad-reference-result";
import { createBroadReferenceResult } from "@/lib/broad-reference-result";

export function inferBookReferenceSourceType(sourceUrl: string): BookReferenceSourceType {
  const url = sourceUrl.toLowerCase();

  if (/openlibrary\.org/.test(url)) return "open_library_record";
  if (/books\.google\./.test(url)) return "google_books_preview";
  if (/worldcat\.org/.test(url)) return "worldcat_record";
  if (/archive\.org/.test(url)) return "archive_scan";
  if (/(library|catalog|opac)/.test(url)) return "catalog_entry";
  if (/(publisher|press|book)/.test(url)) return "publisher_page";

  return "unknown";
}

export function inferBookReferenceAccessState(sourceType: BookReferenceSourceType): BookReferenceAccessState {
  if (sourceType === "archive_scan") return "public_domain_scan";
  if (sourceType === "google_books_preview") return "preview_only";
  if (sourceType === "open_library_record" || sourceType === "worldcat_record" || sourceType === "catalog_entry") {
    return "metadata_only";
  }
  return "unknown";
}

export function normalizeBookReferenceCandidate(candidate: BookReferenceCandidate): BookReferenceNormalizationResult {
  const sourceType = candidate.source_type ?? inferBookReferenceSourceType(candidate.source_url);
  const accessState = candidate.access_state ?? inferBookReferenceAccessState(sourceType);
  const bibliographyLabel = createBibliographyLabel(candidate);

  const warnings = [
    "Book discovery is metadata-first.",
    "No copyrighted text extraction, full-text scraping, paywall bypass, or access circumvention is allowed.",
    "Use catalog, ISBN, preview, archive, and page/chapter notes as references unless full access and rights are reviewed."
  ];

  const result: BroadReferenceResult = createBroadReferenceResult({
    id: candidate.id ?? createStableBookReferenceId(candidate.source_url),
    query: candidate.query,
    title: candidate.subtitle ? `${candidate.title}: ${candidate.subtitle}` : candidate.title,
    description: candidate.description,
    image_url: candidate.cover_image_url,
    source_url: candidate.source_url,
    display_url: candidate.display_url ?? candidate.preview_url ?? candidate.archive_url,
    source_class: "book",
    platform: sourceType,
    creator_or_author: candidate.authors?.join(", "),
    publisher: candidate.publisher,
    date: candidate.published_year,
    access_status: mapBookAccessStateToBroadAccess(accessState),
    rights_status: accessState === "public_domain_scan" || accessState === "open_access" ? "public_domain" : "unknown",
    risk_level: "unknown",
    evidence_notes: [
      `Bibliography: ${bibliographyLabel}`,
      candidate.edition ? `Edition: ${candidate.edition}` : undefined,
      candidate.page_or_chapter_note ? `Page/chapter note: ${candidate.page_or_chapter_note}` : undefined,
      ...warnings
    ].filter((note): note is string => Boolean(note)),
    reference_intelligence: {
      use_as: ["historical_context", "topic_context", "claim_support", "research_anchor"],
      evidence_role: "bibliography",
      access_status: mapBookAccessStateToReferenceAccess(accessState),
      rights_status: accessState === "public_domain_scan" || accessState === "open_access" ? "public_domain" : "unknown",
      risk_level: "unknown",
      confidence: "medium",
      interpretation_note: "Bibliographic references support context, claims, and research direction through metadata, catalog links, previews, and page/chapter notes."
    }
  });

  return {
    result,
    source_type: sourceType,
    access_state: accessState,
    bibliography_label: bibliographyLabel,
    warnings
  };
}

export function createBibliographyLabel(candidate: BookReferenceCandidate): string {
  const authors = candidate.authors?.length ? candidate.authors.join(", ") : "Unknown author";
  const year = candidate.published_year ?? "n.d.";
  const title = candidate.subtitle ? `${candidate.title}: ${candidate.subtitle}` : candidate.title;
  const publisher = candidate.publisher ? ` ${candidate.publisher}.` : "";

  return `${authors} (${year}). ${title}.${publisher}`.replace(/\.\./g, ".");
}

function mapBookAccessStateToBroadAccess(accessState: BookReferenceAccessState): BroadReferenceResult["access_status"] {
  if (accessState === "open_access" || accessState === "public_domain_scan") return "open";
  if (accessState === "preview_only" || accessState === "metadata_only" || accessState === "library_access") return "preview_only";
  if (accessState === "paywalled") return "paywalled";
  return "unknown";
}

function mapBookAccessStateToReferenceAccess(accessState: BookReferenceAccessState) {
  if (accessState === "open_access" || accessState === "public_domain_scan") return "open";
  if (accessState === "preview_only" || accessState === "metadata_only" || accessState === "library_access") return "preview_only";
  if (accessState === "paywalled") return "paywalled";
  return "unknown";
}

function createStableBookReferenceId(sourceUrl: string): string {
  let hash = 0;
  for (let i = 0; i < sourceUrl.length; i += 1) {
    hash = (hash * 37 + sourceUrl.charCodeAt(i)) >>> 0;
  }
  return "book_" + hash.toString(16);
}
