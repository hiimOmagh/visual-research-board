
import type { BroadReferenceResult } from "@/types/broad-reference-result";

export const BOOK_REFERENCE_SOURCE_TYPES = [
  "isbn_record",
  "catalog_entry",
  "open_library_record",
  "google_books_preview",
  "worldcat_record",
  "archive_scan",
  "publisher_page",
  "library_record",
  "bibliography_entry",
  "unknown"
] as const;

export type BookReferenceSourceType = (typeof BOOK_REFERENCE_SOURCE_TYPES)[number];

export const BOOK_REFERENCE_ACCESS_STATES = [
  "metadata_only",
  "preview_only",
  "open_access",
  "public_domain_scan",
  "library_access",
  "paywalled",
  "unknown"
] as const;

export type BookReferenceAccessState = (typeof BOOK_REFERENCE_ACCESS_STATES)[number];

export type BookReferenceIdentifier = {
  kind: "isbn10" | "isbn13" | "oclc" | "lccn" | "doi" | "archive_id" | "unknown";
  value: string;
};

export type BookReferenceCandidate = {
  id?: string;
  query: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  description?: string;
  source_url: string;
  display_url?: string;
  preview_url?: string;
  archive_url?: string;
  publisher?: string;
  published_year?: string;
  edition?: string;
  identifiers?: BookReferenceIdentifier[];
  source_type?: BookReferenceSourceType;
  access_state?: BookReferenceAccessState;
  cover_image_url?: string;
  language?: string;
  page_or_chapter_note?: string;
};

export type BookReferenceNormalizationResult = {
  result: BroadReferenceResult;
  source_type: BookReferenceSourceType;
  access_state: BookReferenceAccessState;
  bibliography_label: string;
  warnings: string[];
};
