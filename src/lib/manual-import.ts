import type { LicenseDetected, ResearchResult, ResultType } from "@/types/research";
import { inferRiskLevel } from "@/lib/risk";
import { scoreResult } from "@/lib/scoring";
import { buildQualityReasons, classifySourceDomain } from "@/lib/result-quality";

export interface ManualImportInput {
  sourceUrl: string;
  title?: string;
  type: ResultType;
  licenseDetected: LicenseDetected;
  notes?: string;
  thumbnailUrl?: string;
  description?: string;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

function stableManualId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return `manual_${Math.abs(hash).toString(36)}`;
}

export function createFallbackMetadata(url: string): { title: string; source_domain: string } {
  const source_domain = domainFromUrl(url);
  return {
    title: source_domain === "unknown-source" ? "Manual source" : source_domain,
    source_domain
  };
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createManualUrlResult(input: ManualImportInput): ResearchResult {
  const sourceUrl = input.sourceUrl.trim();
  const sourceDomain = domainFromUrl(sourceUrl);
  const title = input.title?.trim() || sourceDomain || "Manual source";
  const licenseConfidence = input.licenseDetected === "unknown" ? 0.18 : input.licenseDetected === "unclear" ? 0.35 : 0.58;
  const sourceGroup = classifySourceDomain(sourceDomain);
  const riskLevel = inferRiskLevel({
    license: input.licenseDetected,
    sourceDomain,
    type: input.type,
    title,
    licenseConfidence
  });

  const resultCore = {
    id: stableManualId(`${title}|${sourceUrl}|${input.type}`),
    type: input.type,
    title,
    description: input.description?.trim() || "Manually imported source. Metadata and license status require verification.",
    thumbnail_url: input.thumbnailUrl?.trim() || undefined,
    image_url: input.thumbnailUrl?.trim() || undefined,
    source_url: sourceUrl,
    source_domain: sourceDomain,
    provider: "manual" as const,
    license_detected: input.licenseDetected,
    license_confidence: licenseConfidence,
    source_access_mode: "manual_reference_only",
    rights_status: "reference_only",
    reuse_risk: riskLevel === "high" || riskLevel === "avoid" ? "high" : "medium",
    risk_level: riskLevel,
    tags: ["manual-import", "source-check-needed"],
    source_group: sourceGroup,
    notes: input.notes?.trim() || undefined,
    collected_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } satisfies Omit<ResearchResult, "scores">;

  const scored = {
    ...resultCore,
    scores: scoreResult(resultCore),
    duplicate_group_key: sourceUrl.toLowerCase()
  };

  return {
    ...scored,
    quality_reasons: buildQualityReasons(scored)
  };
}
