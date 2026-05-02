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
  tags?: string[];
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

export function normalizeResult(raw: RawProviderResult, index: number): ResearchResult {
  const sourceDomain = raw.source_domain ?? domainFromUrl(raw.source_url);
  const license = raw.license_detected ?? "unknown";
  const riskLevel = inferRiskLevel({
    license,
    sourceDomain,
    type: raw.type,
    title: raw.title
  });

  const resultCore = {
    id: raw.id ?? `${raw.provider}_${index}_${Math.abs(raw.title.length * 37)}`,
    type: raw.type,
    title: raw.title,
    description: raw.description,
    thumbnail_url: raw.thumbnail_url,
    image_url: raw.image_url,
    source_url: raw.source_url,
    source_domain: sourceDomain,
    provider: raw.provider,
    width: raw.width,
    height: raw.height,
    license_detected: license,
    license_confidence: raw.license_confidence ?? 0.2,
    risk_level: riskLevel,
    tags: raw.tags ?? []
  } satisfies Omit<ResearchResult, "scores">;

  return {
    ...resultCore,
    scores: scoreResult(resultCore)
  };
}

export function normalizeResults(rawResults: RawProviderResult[]): ResearchResult[] {
  const seen = new Set<string>();
  return rawResults
    .map((raw, index) => normalizeResult(raw, index))
    .filter((result) => {
      const key = `${result.source_url}|${result.image_url ?? ""}|${result.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
