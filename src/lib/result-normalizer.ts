import type { LicenseDetected, ProviderName, ResearchResult, ResultType } from "@/types/research";
import { inferRiskLevel } from "@/lib/risk";
import { scoreResult } from "@/lib/scoring";

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
  tags?: string[];
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
    .replace(/\/$/, "")
    .trim();
}

export function normalizeResult(raw: RawProviderResult, index: number): ResearchResult {
  const sourceDomain = raw.source_domain ?? domainFromUrl(raw.source_url);
  const license = raw.license_detected ?? "unknown";
  const licenseConfidence = raw.license_confidence ?? 0.2;
  const riskLevel = inferRiskLevel({
    license,
    sourceDomain,
    type: raw.type,
    title: raw.title,
    licenseConfidence
  });

  const resultCore = {
    id: raw.id ?? `${raw.provider}_${index}_${stableId(`${raw.title}|${raw.source_url}|${raw.image_url ?? ""}`)}`,
    type: raw.type,
    title: raw.title.trim() || "Untitled result",
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
    risk_level: riskLevel,
    tags: Array.from(new Set(raw.tags ?? [])),
    collected_at: new Date().toISOString()
  } satisfies Omit<ResearchResult, "scores">;

  return {
    ...resultCore,
    scores: scoreResult(resultCore)
  };
}

export function normalizeResults(rawResults: RawProviderResult[]): { results: ResearchResult[]; stats: NormalizeStats } {
  const seen = new Set<string>();
  const normalized = rawResults
    .filter((raw) => raw.source_url && raw.title)
    .map((raw, index) => normalizeResult(raw, index));

  const deduped = normalized.filter((result) => {
    const candidates = [
      normalizeKey(result.source_url),
      result.image_url ? normalizeKey(result.image_url) : "",
      `${result.source_domain}|${result.title.toLowerCase().replace(/\s+/g, " ")}`
    ].filter(Boolean);

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
