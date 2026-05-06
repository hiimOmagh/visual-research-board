
import type { BroadReferenceResult } from "@/types/broad-reference-result";

export const SOCIAL_REFERENCE_PLATFORMS = [
  "x_twitter",
  "instagram",
  "tiktok",
  "youtube",
  "pinterest",
  "reddit",
  "facebook_public",
  "linkedin_public",
  "creator_site",
  "forum",
  "unknown"
] as const;

export type SocialReferencePlatform = (typeof SOCIAL_REFERENCE_PLATFORMS)[number];

export const SOCIAL_REFERENCE_CONTENT_TYPES = [
  "post",
  "image_post",
  "video_post",
  "short_video",
  "thread",
  "commentary",
  "profile",
  "board",
  "channel",
  "forum_thread",
  "unknown"
] as const;

export type SocialReferenceContentType = (typeof SOCIAL_REFERENCE_CONTENT_TYPES)[number];

export const SOCIAL_REFERENCE_ACCESS_STATES = [
  "public",
  "public_preview",
  "platform_restricted",
  "login_required",
  "unknown"
] as const;

export type SocialReferenceAccessState = (typeof SOCIAL_REFERENCE_ACCESS_STATES)[number];

export type SocialReferenceCandidate = {
  id?: string;
  query: string;
  title?: string;
  description?: string;
  image_url?: string;
  source_url: string;
  display_url?: string;
  platform?: SocialReferencePlatform;
  content_type?: SocialReferenceContentType;
  creator_or_author?: string;
  date?: string;
  engagement_hint?: string;
  source_class_hint?: "social_media";
};

export type SocialReferenceNormalizationResult = {
  result: BroadReferenceResult;
  platform: SocialReferencePlatform;
  content_type: SocialReferenceContentType;
  access_state: SocialReferenceAccessState;
  warnings: string[];
};
