import type { ProviderHealth, ProviderResultInspection, ProviderResultInspectionEntry, ResearchResult, SearchProviderName } from "@/types/research";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(items: ResearchResult[], getValue: (item: ResearchResult) => number): number {
  if (items.length === 0) return 0;
  return round2(items.reduce((sum, item) => sum + getValue(item), 0) / items.length);
}

function hasClearLicense(item: ResearchResult): boolean {
  return item.license_detected === "public_domain" || item.license_detected === "creative_commons";
}

function isManualReviewCandidate(item: ResearchResult): boolean {
  if (item.risk_level === "avoid" || item.risk_level === "high") return true;
  if (item.license_detected === "unknown" || item.license_detected === "unclear" || item.license_detected === "copyrighted") return true;
  if (item.scores.relevance < 0.56 || item.scores.visual_quality < 0.5 || item.scores.source_credibility < 0.5) return true;
  if (!item.thumbnail_url && item.type === "image") return true;
  return false;
}

function warningsForProvider(items: ResearchResult[], health: ProviderHealth): string[] {
  const warnings: string[] = [];
  const imageCount = items.filter((item) => item.type === "image" || item.thumbnail_url || item.image_url).length;
  const reviewCount = items.filter(isManualReviewCandidate).length;
  if (health.status !== "active") warnings.push(`Provider status is ${health.status}; inspect provider setup before judging result quality.`);
  if (items.length > 0 && imageCount / items.length < 0.45) warnings.push("Low image density for a visual research workflow.");
  if (items.length > 0 && reviewCount / items.length > 0.45) warnings.push("Large share of results need manual quality review.");
  if (items.length > 0 && average(items, (item) => item.scores.source_credibility) < 0.55) warnings.push("Average source credibility is below the current review threshold.");
  if (items.length === 0 && health.enabled) warnings.push("Enabled provider returned no candidates for this run.");
  return warnings;
}

function buildProviderEntry(provider: SearchProviderName, results: ResearchResult[], health: ProviderHealth): ProviderResultInspectionEntry {
  const providerResults = results.filter((item) => item.provider === provider);
  const reviewCandidateIds = providerResults.filter(isManualReviewCandidate).map((item) => item.id).slice(0, 20);
  return {
    provider,
    status: health.status,
    enabled: health.enabled,
    result_count: providerResults.length,
    image_count: providerResults.filter((item) => item.type === "image" || item.thumbnail_url || item.image_url).length,
    web_context_count: providerResults.filter((item) => item.type === "web" || item.type === "news" || item.type === "archive").length,
    clear_license_count: providerResults.filter(hasClearLicense).length,
    low_risk_count: providerResults.filter((item) => item.risk_level === "low").length,
    high_risk_count: providerResults.filter((item) => item.risk_level === "high" || item.risk_level === "avoid").length,
    average_overall: average(providerResults, (item) => item.scores.overall),
    average_relevance: average(providerResults, (item) => item.scores.relevance),
    average_visual_quality: average(providerResults, (item) => item.scores.visual_quality),
    average_source_credibility: average(providerResults, (item) => item.scores.source_credibility),
    top_result_ids: [...providerResults].sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 5).map((item) => item.id),
    review_candidate_ids: reviewCandidateIds,
    warnings: warningsForProvider(providerResults, health)
  };
}

export function buildProviderResultInspection(params: {
  results: ResearchResult[];
  providerHealth: ProviderHealth[];
  generatedAt?: string;
}): ProviderResultInspection {
  const providers = params.providerHealth.map((health) => buildProviderEntry(health.provider, params.results, health));
  const globalReviewCandidateIds = params.results
    .filter(isManualReviewCandidate)
    .sort((a, b) => a.scores.overall - b.scores.overall)
    .slice(0, 30)
    .map((item) => item.id);
  const warnings = providers.flatMap((entry) => entry.warnings.map((warning) => `${entry.provider}: ${warning}`));
  return {
    generated_at: params.generatedAt ?? new Date().toISOString(),
    provider_count: providers.length,
    active_provider_count: providers.filter((entry) => entry.status === "active").length,
    inspected_result_count: params.results.length,
    manual_review_candidate_count: globalReviewCandidateIds.length,
    providers,
    global_review_candidate_ids: globalReviewCandidateIds,
    warnings: warnings.slice(0, 12)
  };
}
