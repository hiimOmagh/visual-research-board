import type {
  BroadReferenceAccessStatus,
  BroadReferenceResult,
  BroadReferenceResultSummary,
  BroadReferenceRightsStatus,
  BroadReferenceRiskLevel,
  BroadReferenceSourceClass
} from "@/types/broad-reference-result";

export const DEFAULT_BROAD_REFERENCE_RESULT: Omit<BroadReferenceResult, "id" | "query" | "source_url"> = {
  source_class: "unknown",
  access_status: "unknown",
  rights_status: "unknown",
  risk_level: "unknown",
  evidence_notes: []
};

export function createBroadReferenceResult(input: {
  id: string;
  query: string;
  source_url: string;
} & Partial<BroadReferenceResult>): BroadReferenceResult {
  return {
    ...DEFAULT_BROAD_REFERENCE_RESULT,
    ...input,
    evidence_notes: input.evidence_notes ?? []
  };
}

export function inferBroadReferenceSourceClass(input: {
  url?: string;
  title?: string;
  platform?: string;
  mime_type?: string;
}): BroadReferenceSourceClass {
  const url = input.url?.toLowerCase() ?? "";
  const title = input.title?.toLowerCase() ?? "";
  const platform = input.platform?.toLowerCase() ?? "";

  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/.test(url) || input.mime_type?.startsWith("image/")) return "web_image";
  if (/(twitter\.com|x\.com|instagram\.com|tiktok\.com|reddit\.com|pinterest\.com|facebook\.com)/.test(url) || platform === "social_media") return "social_media";
  if (/(youtube\.com|youtu\.be|vimeo\.com)/.test(url)) return "video";
  if (/(openlibrary\.org|books\.google\.|worldcat\.org|isbn)/.test(url) || /\bisbn\b/.test(title)) return "book";
  if (/(archive\.org|loc\.gov|nationalarchives|digitalcollections)/.test(url)) return "archive";
  if (/(metmuseum\.org|getty\.edu|rijksmuseum|britishmuseum|museum)/.test(url)) return "museum";
  if (/(unsplash\.com|pexels\.com|pixabay\.com|shutterstock\.com|adobestock|istockphoto)/.test(url)) return "stock";
  if (url) return "web_page";
  return "unknown";
}

export function inferBroadReferenceRiskLevel(
  accessStatus: BroadReferenceAccessStatus,
  rightsStatus: BroadReferenceRightsStatus
): BroadReferenceRiskLevel {
  if (accessStatus === "open" && (rightsStatus === "public_domain" || rightsStatus === "open_license")) return "low";
  if (
    accessStatus === "platform_restricted" ||
    accessStatus === "paywalled" ||
    rightsStatus === "likely_copyrighted" ||
    rightsStatus === "unclear"
  ) return "high";
  if (accessStatus === "unknown" || rightsStatus === "unknown") return "unknown";
  return "medium";
}

export function summarizeBroadReferenceResult(result: BroadReferenceResult): BroadReferenceResultSummary {
  return {
    id: result.id,
    source_class: result.source_class,
    access_status: result.access_status,
    rights_status: result.rights_status,
    risk_level: result.risk_level,
    has_visual: Boolean(result.image_url),
    has_source_url: Boolean(result.source_url),
    needs_review:
      result.risk_level === "high" ||
      result.risk_level === "unknown" ||
      result.access_status === "unknown" ||
      result.rights_status === "unknown"
  };
}

export function describeBroadReferenceSourceClass(sourceClass: BroadReferenceSourceClass): string {
  const labels: Record<BroadReferenceSourceClass, string> = {
    web_image: "Web image",
    web_page: "Web page",
    social_media: "Social media",
    book: "Book",
    archive: "Archive",
    museum: "Museum",
    stock: "Stock / illustrative",
    video: "Video",
    unknown: "Unknown"
  };
  return labels[sourceClass];
}
