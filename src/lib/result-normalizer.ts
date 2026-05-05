import type {
  DuplicateGroupTrace,
  DuplicateMatchReason,
  LicenseDetected,
  MetadataGap,
  NormalizationDedupeTrace,
  ProviderName,
  ResearchMode,
  ResearchResult,
  ResultType,
  ReuseRisk,
  RightsStatus,
  SourceAccessMode
} from "@/types/research";
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
  duplicate_group_count: number;
  metadata_gap_count: number;
  trace: NormalizationDedupeTrace;
}

interface DuplicateCandidate {
  key: string;
  reason: DuplicateMatchReason;
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

export function canonicalUrl(value?: string): string {
  if (!value) return "";
  if (value.startsWith("data:")) return value.slice(0, 80);
  try {
    const parsed = new URL(value.trim());
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    parsed.pathname = decodeURIComponent(parsed.pathname)
      .replace(/\/index\.(html?|php)$/i, "/")
      .replace(/\/{2,}/g, "/");
    parsed.searchParams.sort();
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (/^(utm_|fbclid|gclid|mc_cid|mc_eid|igshid|ref|spm)/i.test(key)) parsed.searchParams.delete(key);
    }
    const rendered = parsed.toString().replace(/\/$/, "");
    return rendered;
  } catch {
    return value.trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "");
  }
}

export function normalizeKey(value: string): string {
  return canonicalUrl(value)
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/index\.(html?|php)$/i, "")
    .replace(/\/$/, "")
    .trim();
}

export function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/^file:/, "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !["the", "and", "for", "with", "from", "image", "photo", "picture", "wiki", "commons"].includes(token))
    .join(" ")
    .trim();
}

function imageAssetKey(url?: string): string {
  if (!url || url.startsWith("data:")) return "";
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname).toLowerCase();
    const file = path.split("/").filter(Boolean).at(-1) ?? "";
    return file
      .replace(/^[0-9]+px-/, "")
      .replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, "")
      .replace(/[?#].*$/, "")
      .trim();
  } catch {
    return "";
  }
}

function dedupeCandidateEntries(result: ResearchResult): DuplicateCandidate[] {
  const titleKey = normalizeTitle(result.title);
  const imageKey = imageAssetKey(result.image_url || result.thumbnail_url);
  const candidates: DuplicateCandidate[] = [
    { reason: "source_url", key: normalizeKey(result.source_url) },
    { reason: "image_url", key: result.image_url ? normalizeKey(result.image_url) : "" },
    { reason: "thumbnail_url", key: result.thumbnail_url && !result.thumbnail_url.startsWith("data:") ? normalizeKey(result.thumbnail_url) : "" },
    { reason: "title_domain", key: titleKey ? `${result.source_domain}|${titleKey}` : "" },
    { reason: "image_asset", key: imageKey ? `image-asset|${imageKey}` : "" },
    { reason: "visual_shape", key: titleKey && result.width && result.height ? `visual-shape|${titleKey}|${result.width}x${result.height}` : "" }
  ];
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (!candidate.key || seen.has(candidate.key)) return false;
    seen.add(candidate.key);
    return true;
  });
}

function dedupeCandidates(result: ResearchResult): string[] {
  return dedupeCandidateEntries(result).map((candidate) => candidate.key);
}

function primaryDuplicateKey(result: ResearchResult): string {
  return dedupeCandidates(result)[0] ?? `${result.source_domain}|${normalizeTitle(result.title)}`;
}

function metadataGaps(result: ResearchResult): MetadataGap[] {
  const gaps: MetadataGap[] = [];
  if (!result.thumbnail_url && !result.image_url) gaps.push("missing_visual_asset");
  if (!result.description?.trim()) gaps.push("missing_description");
  if (!result.width || !result.height) gaps.push("missing_dimensions");
  if (!result.license_url && ["public_domain", "creative_commons"].includes(result.license_detected)) gaps.push("missing_license_url");
  if (result.license_detected === "unknown" || result.license_detected === "unclear") gaps.push("unclear_license");
  if (result.rights_status === "unknown" || result.rights_status === "check_required") gaps.push("unclear_rights_status");
  if (result.source_domain === "unknown-source") gaps.push("unknown_source_domain");
  return Array.from(new Set(gaps));
}

function defaultSourceAccessMode(provider: ProviderName, sourceDomain: string): SourceAccessMode {
  if (provider === "manual") return "manual_reference_only";
  if (["pixabay", "pexels", "unsplash"].includes(provider)) return "stock_illustrative";
  if (provider === "brave" || provider === "tavily") return "rights_check_required";
  if (["loc", "nasa", "met", "artic", "cleveland_museum", "wellcome", "bhl", "gallica", "nara"].includes(provider)) return "backend_free_no_key";
  if (provider === "internet_archive") return "archive_open_access";
  if (["smithsonian", "europeana", "rijksmuseum", "nypl", "dpla"].includes(provider)) return "backend_free_key_required";
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

function sourceTrace(result: ResearchResult) {
  return {
    id: result.id,
    provider: result.provider,
    source_url: result.source_url,
    image_url: result.image_url,
    thumbnail_url: result.thumbnail_url,
    rights_status: result.rights_status,
    reuse_risk: result.reuse_risk,
    score: result.scores.overall
  };
}

function mergeMetadata(primary: ResearchResult, duplicate: ResearchResult, reasons: DuplicateMatchReason[]): ResearchResult {
  const mergedReasons = Array.from(new Set([...(primary.duplicate_match_reasons ?? []), ...reasons]));
  const providerSources = [...(primary.provider_sources ?? [sourceTrace(primary)]), sourceTrace(duplicate)];
  const duplicateMembers = Array.from(new Set([...(primary.duplicate_group_members ?? [primary.id]), duplicate.id]));
  const tags = Array.from(new Set([...primary.tags, ...duplicate.tags]));
  const qualityReasons = Array.from(new Set([...(primary.quality_reasons ?? []), ...(duplicate.quality_reasons ?? [])])).slice(0, 6);
  const bestLicense = duplicate.license_confidence > primary.license_confidence ? duplicate : primary;
  const merged: ResearchResult = {
    ...primary,
    description: primary.description ?? duplicate.description,
    thumbnail_url: primary.thumbnail_url ?? duplicate.thumbnail_url,
    image_url: primary.image_url ?? duplicate.image_url,
    width: primary.width ?? duplicate.width,
    height: primary.height ?? duplicate.height,
    license_detected: bestLicense.license_detected,
    license_confidence: Math.max(primary.license_confidence, duplicate.license_confidence),
    license_url: primary.license_url ?? duplicate.license_url,
    tags,
    quality_reasons: qualityReasons.length ? qualityReasons : primary.quality_reasons,
    duplicate_group_size: duplicateMembers.length,
    duplicate_group_members: duplicateMembers,
    duplicate_match_reasons: mergedReasons,
    provider_sources: providerSources
  };
  return {
    ...merged,
    metadata_gaps: metadataGaps(merged)
  };
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
  const canonicalSourceUrl = canonicalUrl(raw.source_url);
  const canonicalImageUrl = canonicalUrl(raw.image_url);
  const canonicalThumbnailUrl = canonicalUrl(raw.thumbnail_url);
  const normalizedTitleKey = normalizeTitle(title);

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
    canonical_source_url: canonicalSourceUrl,
    canonical_image_url: canonicalImageUrl || undefined,
    canonical_thumbnail_url: canonicalThumbnailUrl || undefined,
    normalized_title_key: normalizedTitleKey,
    collected_at: new Date().toISOString()
  } satisfies Omit<ResearchResult, "scores" | "quality_reasons" | "duplicate_group_key" | "duplicate_keys" | "metadata_gaps">;

  const scored = {
    ...resultCore,
    scores: scoreResult(resultCore, context),
    duplicate_group_key: primaryDuplicateKey(resultCore as ResearchResult)
  } satisfies ResearchResult;

  const duplicateKeys = dedupeCandidates(scored);
  const enriched = {
    ...scored,
    duplicate_keys: duplicateKeys,
    duplicate_group_size: 1,
    duplicate_group_members: [scored.id],
    provider_sources: [sourceTrace(scored)],
    metadata_gaps: metadataGaps(scored)
  } satisfies ResearchResult;

  return {
    ...enriched,
    quality_reasons: buildQualityReasons(enriched)
  };
}

function buildTrace(params: {
  rawCount: number;
  normalized: ResearchResult[];
  deduped: ResearchResult[];
  duplicateGroups: DuplicateGroupTrace[];
}): NormalizationDedupeTrace {
  const gapCounts = params.deduped.reduce<Record<MetadataGap, number>>((acc, result) => {
    for (const gap of result.metadata_gaps ?? []) acc[gap] = (acc[gap] ?? 0) + 1;
    return acc;
  }, {} as Record<MetadataGap, number>);
  const metadataGapCount = Object.values(gapCounts).reduce((total, count) => total + count, 0);
  const uniqueSourceUrls = new Set(params.deduped.map((item) => item.canonical_source_url || normalizeKey(item.source_url)).filter(Boolean)).size;
  const uniqueImageUrls = new Set(params.deduped.map((item) => item.canonical_image_url || item.canonical_thumbnail_url || "").filter(Boolean)).size;
  const duplicateCount = params.normalized.length - params.deduped.length;
  const warnings = [
    duplicateCount > 0 ? `${duplicateCount} duplicate candidate(s) were merged before ranking/export.` : "No duplicate candidates were detected in this run.",
    metadataGapCount > params.deduped.length ? "Several surviving candidates still have metadata gaps; inspect rights and source pages manually." : "Metadata gap volume is within the expected range for mixed free providers."
  ];

  return {
    schema_version: "0.2.10",
    raw_count: params.rawCount,
    normalized_count: params.normalized.length,
    deduped_count: params.deduped.length,
    duplicate_count: duplicateCount,
    duplicate_group_count: params.duplicateGroups.length,
    merged_duplicate_count: params.duplicateGroups.reduce((total, group) => total + group.duplicate_count, 0),
    unique_canonical_source_count: uniqueSourceUrls,
    unique_canonical_image_count: uniqueImageUrls,
    metadata_gap_count: metadataGapCount,
    metadata_gap_counts: gapCounts,
    duplicate_groups: params.duplicateGroups.slice(0, 20),
    warnings
  };
}

export function normalizeResults(rawResults: RawProviderResult[], context: NormalizeContext = {}): { results: ResearchResult[]; stats: NormalizeStats } {
  const normalized = rawResults
    .filter((raw) => raw.source_url && raw.title)
    .map((raw, index) => normalizeResult(raw, index, context));

  const qualityOrdered = [...normalized].sort((a, b) => {
    if (b.scores.overall !== a.scores.overall) return b.scores.overall - a.scores.overall;
    return b.scores.source_credibility - a.scores.source_credibility;
  });

  const seen = new Map<string, { survivorIndex: number; reason: DuplicateMatchReason }>();
  const survivors: ResearchResult[] = [];
  const duplicateGroups = new Map<string, DuplicateGroupTrace>();

  for (const result of qualityOrdered) {
    const candidates = dedupeCandidateEntries(result);
    const match = candidates.find((candidate) => seen.has(candidate.key));

    if (!match) {
      const survivorIndex = survivors.length;
      survivors.push(result);
      candidates.forEach((candidate) => seen.set(candidate.key, { survivorIndex, reason: candidate.reason }));
      continue;
    }

    const matched = seen.get(match.key);
    if (!matched) continue;
    const survivor = survivors[matched.survivorIndex];
    const reasons = Array.from(new Set([match.reason, matched.reason]));
    const merged = mergeMetadata(survivor, result, reasons);
    survivors[matched.survivorIndex] = merged;
    dedupeCandidateEntries(merged).forEach((candidate) => seen.set(candidate.key, { survivorIndex: matched.survivorIndex, reason: candidate.reason }));

    const groupKey = merged.duplicate_group_key ?? primaryDuplicateKey(merged);
    const existing = duplicateGroups.get(groupKey);
    duplicateGroups.set(groupKey, {
      group_key: groupKey,
      survivor_id: merged.id,
      duplicate_count: (existing?.duplicate_count ?? 0) + 1,
      match_reasons: Array.from(new Set([...(existing?.match_reasons ?? []), ...reasons])),
      member_ids: Array.from(new Set([...(existing?.member_ids ?? [survivor.id]), result.id])),
      provider_sources: merged.provider_sources ?? [sourceTrace(merged)]
    });
  }

  const sorted = survivors.sort((a, b) => b.scores.overall - a.scores.overall);
  const trace = buildTrace({ rawCount: rawResults.length, normalized, deduped: sorted, duplicateGroups: Array.from(duplicateGroups.values()) });

  return {
    results: sorted,
    stats: {
      raw_count: rawResults.length,
      normalized_count: normalized.length,
      deduped_count: sorted.length,
      duplicate_count: normalized.length - sorted.length,
      duplicate_group_count: trace.duplicate_group_count,
      metadata_gap_count: trace.metadata_gap_count,
      trace
    }
  };
}
