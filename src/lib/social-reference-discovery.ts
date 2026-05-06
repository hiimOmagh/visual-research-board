
import type {
  SocialReferenceAccessState,
  SocialReferenceCandidate,
  SocialReferenceContentType,
  SocialReferenceNormalizationResult,
  SocialReferencePlatform
} from "@/types/social-reference";
import type { BroadReferenceResult } from "@/types/broad-reference-result";
import { createBroadReferenceResult } from "@/lib/broad-reference-result";

export function inferSocialReferencePlatform(sourceUrl: string): SocialReferencePlatform {
  const url = sourceUrl.toLowerCase();

  if (/\b(x\.com|twitter\.com)\b/.test(url)) return "x_twitter";
  if (/instagram\.com/.test(url)) return "instagram";
  if (/tiktok\.com/.test(url)) return "tiktok";
  if (/(youtube\.com|youtu\.be)/.test(url)) return "youtube";
  if (/pinterest\.com/.test(url)) return "pinterest";
  if (/reddit\.com/.test(url)) return "reddit";
  if (/facebook\.com/.test(url)) return "facebook_public";
  if (/linkedin\.com/.test(url)) return "linkedin_public";
  if (/(forum|community|discourse)/.test(url)) return "forum";

  return "unknown";
}

export function inferSocialReferenceContentType(sourceUrl: string, title = ""): SocialReferenceContentType {
  const url = sourceUrl.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  if (/(youtube\.com|youtu\.be|tiktok\.com|reel|shorts)/.test(url)) return "video_post";
  if (/(pinterest\.com).*(pin|board)/.test(url)) return "board";
  if (/reddit\.com\/r\//.test(url)) return "forum_thread";
  if (/(thread|conversation)/.test(normalizedTitle)) return "thread";
  if (/(profile|channel|creator)/.test(normalizedTitle)) return "profile";
  if (/(image|photo|visual)/.test(normalizedTitle)) return "image_post";

  return "post";
}

export function inferSocialReferenceAccessState(platform: SocialReferencePlatform): SocialReferenceAccessState {
  if (platform === "unknown") return "unknown";
  if (platform === "instagram" || platform === "facebook_public" || platform === "linkedin_public") {
    return "platform_restricted";
  }
  return "public_preview";
}

export function normalizeSocialReferenceCandidate(
  candidate: SocialReferenceCandidate
): SocialReferenceNormalizationResult {
  const platform = candidate.platform ?? inferSocialReferencePlatform(candidate.source_url);
  const contentType = candidate.content_type ?? inferSocialReferenceContentType(candidate.source_url, candidate.title);
  const accessState = inferSocialReferenceAccessState(platform);

  const warnings = [
    "Social reference discovery only supports public/reference links.",
    "No private account scraping, login bypass, hidden API abuse, or media rehosting is allowed.",
    "Platform access and rights labels require user review."
  ];

  const result: BroadReferenceResult = createBroadReferenceResult({
    id: candidate.id ?? createStableSocialReferenceId(candidate.source_url),
    query: candidate.query,
    title: candidate.title,
    description: candidate.description,
    image_url: candidate.image_url,
    source_url: candidate.source_url,
    display_url: candidate.display_url,
    source_class: "social_media",
    platform,
    creator_or_author: candidate.creator_or_author,
    date: candidate.date,
    access_status: accessState === "public" || accessState === "public_preview" ? "platform_restricted" : "unknown",
    rights_status: "unknown",
    risk_level: "unknown",
    evidence_notes: [
      "Normalized from public social-reference candidate.",
      ...warnings
    ],
    reference_intelligence: {
      use_as: ["visual_inspiration", "topic_context"],
      evidence_role: "context",
      access_status: "platform_restricted",
      rights_status: "unknown",
      risk_level: "unknown",
      confidence: "low",
      interpretation_note: "Public social references can provide trend, creator, platform, or visual context, but require source and rights review."
    }
  });

  return {
    result,
    platform,
    content_type: contentType,
    access_state: accessState,
    warnings
  };
}

export function createSocialReferenceDiscoveryNotes(platform: SocialReferencePlatform): string[] {
  return [
    `Platform classified as ${platform}.`,
    "Discovery is limited to public/reference-facing material.",
    "Do not use private account scraping, login bypass, hidden API abuse, or media rehosting.",
    "Use social results as context or inspiration unless rights and access are reviewed."
  ];
}

function createStableSocialReferenceId(sourceUrl: string): string {
  let hash = 0;
  for (let i = 0; i < sourceUrl.length; i += 1) {
    hash = (hash * 33 + sourceUrl.charCodeAt(i)) >>> 0;
  }
  return "social_" + hash.toString(16);
}
