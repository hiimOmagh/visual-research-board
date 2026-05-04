import type { LicenseDetected, ProviderName, ResearchMode, ResearchResult, ResultType, ReuseRisk, RightsStatus, SourceAccessMode } from "@/types/research";
import { inferRiskLevel } from "@/lib/risk";
import { scoreResult } from "@/lib/scoring";
import { buildQualityReasons, classifySourceDomain } from "@/lib/result-quality";

export interface RawProviderResult {
  id?: string;
  type: ResultType;
  title: string;
  description?: string;
  thumbnail_url?: string;
  image_url?: string;
  source_url: string;
  source_domain?: string;
  provider: ProviderName;
  width?: number;
  height?: number;
  license_detected?: LicenseDetected;
  license_confidence?: number;
  license_url?: string;
  source_access_mode?: SourceAccessMode;
  rights_status?: RightsStatus;
  reuse_risk?: ReuseRisk;
  tags?: string[];
}

export interface NormalizeContext {
  topic?: string;
  mode?: ResearchMode;
}

export interface NormalizeStats {
  raw_count: number;
  normalized_count: number;
  deduped_count: number;
  duplicate_count: number;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

function stableId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/index\.(html?|php)$/i, "")
    .replace(/\/$/, "")
    .trim();
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/^file:/, "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !["the", "and", "for", "with", "from", "image", "photo", "picture", "wiki"].includes(token))
    .join(" ")
    .trim();
}

function imageAssetKey(url?: string): string {
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

function dedupeCandidates(result: ResearchResult): string[] {
  const titleKey = normalizeTitle(result.title);
  const imageKey = imageAssetKey(result.image_url || result.thumbnail_url);
  const candidates = [
    normalizeKey(result.source_url),
    result.image_url ? normalizeKey(result.image_url) : "",
    result.thumbnail_url && !result.thumbnail_url.startsWith("data:") ? normalizeKey(result.thumbnail_url) : "",
    titleKey ? `${result.source_domain}|${titleKey}` : "",
    imageKey ? `image-asset|${imageKey}` : "",
    titleKey && result.width && result.height ? `visual-shape|${titleKey}|${result.width}x${result.height}` : ""
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function primaryDuplicateKey(result: ResearchResult): string {
  return dedupeCandidates(result)[0] ?? `${result.source_domain}|${normalizeTitle(result.title)}`;
}

function defaultSourceAccessMode(provider: ProviderName, sourceDomain: string): SourceAccessMode {
  if (provider === "manual") return "manual_reference_only";
  if (provider === "brave" || provider === "tavily") return "rights_check_required";
  if (provider === "loc" || provider === "internet_archive" || provider === "nasa") return "backend_free_no_key";
  if (provider === "smithsonian" || provider === "europeana") return "backend_free_key_required";
  if (provider === "wikimedia" || provider === "openverse" || provider === "mock") return "backend_free_no_key";
  if (sourceDomain.includes("pexels") || sourceDomain.includes("pixabay") || sourceDomain.includes("unsplash")) return "stock_illustrative";
  return "rights_check_required";
}

function defaultRightsStatus(license: LicenseDetected, riskLevel: ResearchResult["risk_level"], accessMode: SourceAccessMode): RightsStatus {
  if (accessMode === "manual_reference_only" || riskLevel === "reference_only") return "reference_only";
  if (license === "public_domain") return "public_domain";
  if (license === "creative_commons") return "open_license";
  if (license === "copyrighted" || riskLevel === "high" || riskLevel === "avoid") return "restricted";
  if (license === "unclear") return "check_required";
  return "unknown";
}

function defaultReuseRisk(rightsStatus: RightsStatus, riskLevel: ResearchResult["risk_level"]): ReuseRisk {
  if (rightsStatus === "public_domain" || rightsStatus === "open_license") return riskLevel === "low" ? "low" : "medium";
  if (rightsStatus === "likely_reusable") return "medium";
  if (rightsStatus === "reference_only" || rightsStatus === "check_required" || rightsStatus === "unknown") return "medium";
  return "high";
}

export function normalizeResult(raw: RawProviderResult, index: number, context: NormalizeContext = {}): ResearchResult {
  const sourceDomain = raw.source_domain ?? domainFromUrl(raw.source_url);
  const sourceGroup = classifySourceDomain(sourceDomain);
  const license = raw.license_detected ?? "unknown";
  const licenseConfidence = raw.license_confidence ?? 0.2;
  const cleanTags = Array.from(new Set(raw.tags ?? []));
  const title = raw.title.trim() || "Untitled result";
  const riskLevel = inferRiskLevel({
    license,
    sourceDomain,
    type: raw.type,
    title,
    licenseConfidence
  });
  const sourceAccessMode = raw.source_access_mode ?? defaultSourceAccessMode(raw.provider, sourceDomain);
  const rightsStatus = raw.rights_status ?? defaultRightsStatus(license, riskLevel, sourceAccessMode);
  const reuseRisk = raw.reuse_risk ?? defaultReuseRisk(rightsStatus, riskLevel);

  const resultCore = {
    id: raw.id ?? `${raw.provider}_${index}_${stableId(`${title}|${raw.source_url}|${raw.image_url ?? ""}`)}`,
    type: raw.type,
    title,
    description: raw.description,
    thumbnail_url: raw.thumbnail_url,
    image_url: raw.image_url,
    source_url: raw.source_url,
    source_domain: sourceDomain,
    provider: raw.provider,
    width: raw.width,
    height: raw.height,
    license_detected: license,
    license_confidence: licenseConfidence,
    license_url: raw.license_url,
    source_access_mode: sourceAccessMode,
    rights_status: rightsStatus,
    reuse_risk: reuseRisk,
    risk_level: riskLevel,
    tags: cleanTags,
    source_group: sourceGroup,
    collected_at: new Date().toISOString()
  } satisfies Omit<ResearchResult, "scores" | "quality_reasons" | "duplicate_group_key">;

  const scored = {
    ...resultCore,
    scores: scoreResult(resultCore, context),
    duplicate_group_key: primaryDuplicateKey(resultCore as ResearchResult)
  } satisfies ResearchResult;

  return {
    ...scored,
    quality_reasons: buildQualityReasons(scored)
  };
}

export function normalizeResults(rawResults: RawProviderResult[], context: NormalizeContext = {}): { results: ResearchResult[]; stats: NormalizeStats } {
  const seen = new Set<string>();
  const normalized = rawResults
    .filter((raw) => raw.source_url && raw.title)
    .map((raw, index) => normalizeResult(raw, index, context));

  const qualityOrdered = [...normalized].sort((a, b) => {
    if (b.scores.overall !== a.scores.overall) return b.scores.overall - a.scores.overall;
    return b.scores.source_credibility - a.scores.source_credibility;
  });

  const deduped = qualityOrdered.filter((result) => {
    const candidates = dedupeCandidates(result);

    if (candidates.some((candidate) => seen.has(candidate))) return false;
    candidates.forEach((candidate) => seen.add(candidate));
    return true;
  });

  const sorted = deduped.sort((a, b) => b.scores.overall - a.scores.overall);

  return {
    results: sorted,
    stats: {
      raw_count: rawResults.length,
      normalized_count: normalized.length,
      deduped_count: sorted.length,
      duplicate_count: normalized.length - sorted.length
    }
  };
}
