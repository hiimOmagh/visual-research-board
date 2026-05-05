import type {
  EvidenceDrivenTuningAction,
  EvidenceDrivenTuningTrace,
  ProviderHealth,
  ResearchResult,
  RetrievalEvidence,
  RetrievalQualityCalibration,
  SearchPlan,
  SearchProviderName,
  SourceGroup
} from "@/types/research";
import { classifySourceDomain } from "@/lib/result-quality";

const IMPORTANT_SOURCE_GROUPS = new Set<SourceGroup>([
  "commons_open_access",
  "institutional_archive",
  "official_academic",
  "news_media"
]);

const RISKY_SOURCE_GROUPS = new Set<SourceGroup>(["commercial_stock", "search_or_social", "unknown"]);

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, round2(value)));
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function topicTokens(topic: string): string[] {
  return topic.toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/).filter((token) => token.length >= 3);
}

function topicExactness(result: ResearchResult, topic: string): number {
  const tokens = topicTokens(topic);
  if (tokens.length === 0) return 0.5;
  const haystack = `${result.title} ${result.description ?? ""} ${result.tags.join(" ")} ${result.source_domain}`.toLowerCase();
  const hits = tokens.filter((token) => haystack.includes(token)).length;
  return hits / tokens.length;
}

function actionSet(params: { evidence: RetrievalEvidence; calibration?: RetrievalQualityCalibration; providerHealth: ProviderHealth[] }): EvidenceDrivenTuningAction[] {
  const actions = new Set<EvidenceDrivenTuningAction>();
  const calibration = params.calibration;
  const activeRealProviders = params.providerHealth.filter((entry) => entry.provider !== "mock" && entry.status === "active").length;

  if (params.evidence.verdict !== "passes_mvp_gate") actions.add("add_precision_query_hints");
  if (params.evidence.image_candidates < Math.ceil(params.evidence.target_candidate_count * 0.5)) actions.add("boost_image_density");
  if (params.evidence.source_group_diversity < 4) actions.add("rebalance_top_results_by_source");

  if (calibration) {
    if (calibration.verdict === "needs_more_relevance" || calibration.top10_average_relevance < 0.62) actions.add("boost_topic_exactness");
    if (calibration.verdict === "needs_more_visuals" || calibration.image_share < calibration.expectations.image_share_target) actions.add("boost_image_density");
    if (calibration.verdict === "needs_license_clarity" || calibration.clear_license_candidates < Math.ceil(calibration.expectations.strong_candidate_target * 0.6)) actions.add("boost_open_license_sources");
    if (calibration.verdict === "needs_stronger_sources" || calibration.strong_source_candidates < calibration.expectations.strong_candidate_target) actions.add("boost_institutional_sources");
    if (calibration.top10_source_diversity < calibration.expectations.source_diversity_target) actions.add("rebalance_top_results_by_source");
    if (activeRealProviders > 0 && calibration.real_provider_share < calibration.expectations.real_provider_share_target) actions.add("penalize_mock_when_real_available");
  }

  actions.add("penalize_stock_and_social");
  return Array.from(actions);
}

function queryHintsFor(plan: SearchPlan, actions: EvidenceDrivenTuningAction[]): string[] {
  const topic = plan.original_topic;
  const hints: string[] = [];

  if (actions.includes("boost_topic_exactness") || actions.includes("add_precision_query_hints")) {
    hints.push(`"${topic}"`, `"${topic}" source image`, `"${topic}" visual evidence`, `${topic} reference image source`);
  }
  if (actions.includes("boost_image_density")) {
    hints.push(`${topic} high resolution photo`, `${topic} image gallery source`, `${topic} documentary still reference`, `${topic} visual reference board`);
  }
  if (actions.includes("boost_open_license_sources")) {
    hints.push(`${topic} public domain`, `${topic} Creative Commons`, `${topic} CC BY image`, `${topic} open access image`);
  }
  if (actions.includes("boost_institutional_sources")) {
    hints.push(`${topic} museum collection`, `${topic} government archive`, `${topic} university archive`, `${topic} official source`);
  }
  if (plan.mode === "public_domain") hints.push(`${topic} CC0`, `${topic} Library of Congress`, `${topic} Wikimedia Commons`);
  if (plan.mode === "news_event") hints.push(`${topic} official press photos`, `${topic} event official images`);
  if (plan.mode === "thumbnail_inspiration") hints.push(`${topic} thumbnail composition reference`, `${topic} high contrast poster reference`);

  return unique(hints);
}

function weightProfile(actions: EvidenceDrivenTuningAction[], plan: SearchPlan): EvidenceDrivenTuningTrace["score_weight_profile"] {
  const profile = {
    relevance: 0.25,
    visual_quality: 0.2,
    source_credibility: 0.18,
    license_clarity: 0.14,
    production_usefulness: 0.17,
    diversity: 0.06
  };
  if (actions.includes("boost_topic_exactness")) profile.relevance += 0.06;
  if (actions.includes("boost_image_density")) profile.visual_quality += 0.06;
  if (actions.includes("boost_institutional_sources")) profile.source_credibility += 0.05;
  if (actions.includes("boost_open_license_sources") || plan.mode === "public_domain") profile.license_clarity += 0.06;
  if (actions.includes("rebalance_top_results_by_source")) profile.diversity += 0.05;
  if (plan.mode === "thumbnail_inspiration" || plan.mode === "design_moodboard") profile.production_usefulness += 0.05;
  const total = Object.values(profile).reduce((sum, value) => sum + value, 0);
  return {
    relevance: round2(profile.relevance / total),
    visual_quality: round2(profile.visual_quality / total),
    source_credibility: round2(profile.source_credibility / total),
    license_clarity: round2(profile.license_clarity / total),
    production_usefulness: round2(profile.production_usefulness / total),
    diversity: round2(profile.diversity / total)
  };
}

function providerBias(params: { actions: EvidenceDrivenTuningAction[]; providerHealth: ProviderHealth[] }): Partial<Record<SearchProviderName, number>> {
  const active = new Set(params.providerHealth.filter((entry) => entry.status === "active").map((entry) => entry.provider));
  const bias: Partial<Record<SearchProviderName, number>> = {
    mock: 0.92,
    wikimedia: 1,
    openverse: 1,
    loc: 1,
    internet_archive: 1,
    nasa: 1,
    smithsonian: 1,
    europeana: 1,
    met: 1,
    artic: 1,
    cleveland_museum: 1,
    rijksmuseum: 1,
    wellcome: 1,
    bhl: 1,
    gallica: 1,
    nypl: 1,
    nara: 1,
    dpla: 1,
    pixabay: 0.84,
    pexels: 0.84,
    unsplash: 0.84,
    brave: 0.9,
    tavily: 0.9
  };
  if (params.actions.includes("penalize_mock_when_real_available")) bias.mock = 0.72;
  if (params.actions.includes("boost_open_license_sources")) {
    for (const provider of ["wikimedia", "openverse", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla"] as SearchProviderName[]) bias[provider] = active.has(provider) ? 1.14 : 1.04;
  }
  if (params.actions.includes("boost_institutional_sources")) {
    for (const provider of ["loc", "internet_archive", "nasa", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla"] as SearchProviderName[]) bias[provider] = active.has(provider) ? 1.14 : 1.04;
  }
  if (params.actions.includes("boost_image_density")) {
    for (const provider of ["wikimedia", "openverse", "loc", "nasa", "met", "artic", "cleveland_museum", "wellcome", "bhl", "gallica", "nara", "pixabay", "pexels", "unsplash"] as SearchProviderName[]) bias[provider] = Math.max(bias[provider] ?? 1, active.has(provider) ? 1.08 : 1.02);
  }
  if (params.actions.includes("boost_topic_exactness")) bias.tavily = active.has("tavily") ? 1.02 : 0.92;
  return bias;
}

function weakMetrics(params: { evidence: RetrievalEvidence; calibration?: RetrievalQualityCalibration }): string[] {
  const weak: string[] = [];
  const calibration = params.calibration;
  if (params.evidence.total_candidates < params.evidence.target_candidate_count) weak.push("candidate_count");
  if (params.evidence.image_candidates < Math.ceil(params.evidence.target_candidate_count * 0.5)) weak.push("image_density");
  if (params.evidence.source_group_diversity < 4) weak.push("source_group_diversity");
  if (calibration) {
    if (calibration.relevant_candidates < calibration.expectations.relevant_target) weak.push("relevance_pool");
    if (calibration.strong_source_candidates < calibration.expectations.strong_candidate_target) weak.push("strong_source_pool");
    if (calibration.clear_license_candidates < Math.ceil(calibration.expectations.strong_candidate_target * 0.6)) weak.push("license_clarity_pool");
    if (calibration.real_provider_share < calibration.expectations.real_provider_share_target) weak.push("real_provider_share");
  }
  return Array.from(new Set(weak));
}

function tunedSourceTargets(plan: SearchPlan, actions: EvidenceDrivenTuningAction[]): SearchPlan["source_targets"] {
  const targets = new Set(plan.source_targets);
  if (actions.includes("boost_image_density")) targets.add("image");
  if (actions.includes("boost_institutional_sources") || actions.includes("boost_open_license_sources")) {
    targets.add("commons");
    targets.add("archive");
  }
  if (actions.includes("boost_topic_exactness")) targets.add("web");
  return Array.from(targets);
}

export function buildEvidenceDrivenTuningPlan(params: {
  plan: SearchPlan;
  evidence: RetrievalEvidence;
  calibration?: RetrievalQualityCalibration;
  providerHealth: ProviderHealth[];
}): { plan: SearchPlan; trace: EvidenceDrivenTuningTrace } {
  const actions = actionSet(params);
  const weak = weakMetrics(params);
  const applied = weak.length > 0 || params.evidence.verdict !== "passes_mvp_gate" || params.calibration?.verdict !== "passes_creator_gate";
  const queryHints = applied ? queryHintsFor(params.plan, actions) : [];
  const maxQueries = params.plan.depth === "deep" ? 30 : params.plan.depth === "standard" ? 22 : 12;
  const plan: SearchPlan = applied
    ? {
        ...params.plan,
        queries: unique([...queryHints, ...params.plan.queries]).slice(0, maxQueries),
        source_targets: tunedSourceTargets(params.plan, actions)
      }
    : params.plan;
  const scoreProfile = weightProfile(actions, params.plan);
  const bias = providerBias({ actions, providerHealth: params.providerHealth });

  return {
    plan,
    trace: {
      enabled: true,
      applied,
      verdict: applied ? "evidence_tuned" : "evidence_observed_no_change",
      reason: applied
        ? "Evidence artifacts and creator-gate metrics exposed weak retrieval dimensions; query hints and ranking weights were tuned for the next pass."
        : "Retrieval evidence met the current creator gate; evidence-driven tuning observed the run without changing it.",
      actions,
      mode_profile: params.plan.mode,
      depth_profile: params.plan.depth,
      query_hints: queryHints,
      score_weight_profile: scoreProfile,
      weak_metrics: weak,
      provider_bias: bias,
      before: {
        candidate_count: params.evidence.total_candidates,
        calibration_score: params.calibration?.calibration_score,
        source_diversity: params.evidence.source_group_diversity,
        image_share: params.calibration?.image_share,
        real_provider_share: params.calibration?.real_provider_share
      },
      after: {
        candidate_count: params.evidence.total_candidates,
        calibration_score: params.calibration?.calibration_score,
        source_diversity: params.evidence.source_group_diversity,
        image_share: params.calibration?.image_share,
        real_provider_share: params.calibration?.real_provider_share
      },
      warnings: [
        ...params.evidence.warnings,
        ...(params.calibration?.warnings ?? []),
        ...weak.map((metric) => `Evidence weak metric: ${metric}.`)
      ].filter((warning, index, all) => all.indexOf(warning) === index).slice(0, 10)
    }
  };
}

function sourceDiversityBoost(result: ResearchResult, seenCounts: Map<SourceGroup, number>): number {
  const group = result.source_group ?? classifySourceDomain(result.source_domain);
  const seen = seenCounts.get(group) ?? 0;
  const base = IMPORTANT_SOURCE_GROUPS.has(group) ? 0.025 : RISKY_SOURCE_GROUPS.has(group) ? -0.025 : 0;
  return base - Math.min(0.055, seen * 0.018);
}

function evidenceAdjustment(result: ResearchResult, trace: EvidenceDrivenTuningTrace, topic: string, seenCounts: Map<SourceGroup, number>): number {
  if (!trace.applied) return 0;
  const actions = trace.actions;
  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  const provider = result.provider as SearchProviderName;
  let adjustment = 0;

  adjustment += (trace.provider_bias[provider] ?? 1) * 0.035 - 0.035;
  if (actions.includes("boost_topic_exactness")) adjustment += (topicExactness(result, topic) - 0.45) * 0.08;
  if (actions.includes("boost_image_density")) adjustment += result.type === "image" ? 0.04 : -0.025;
  if (actions.includes("boost_open_license_sources")) {
    if (result.license_detected === "public_domain" || result.license_detected === "creative_commons") adjustment += 0.04;
    if (result.license_detected === "unknown" || result.license_detected === "unclear") adjustment -= 0.015;
    if (result.license_detected === "copyrighted") adjustment -= 0.035;
  }
  if (actions.includes("boost_institutional_sources") && IMPORTANT_SOURCE_GROUPS.has(sourceGroup)) adjustment += 0.045;
  if (actions.includes("penalize_stock_and_social") && RISKY_SOURCE_GROUPS.has(sourceGroup)) adjustment -= 0.035;
  if (actions.includes("penalize_mock_when_real_available") && result.provider === "mock") adjustment -= 0.055;
  if (result.risk_level === "avoid") adjustment -= 0.08;
  if (result.risk_level === "high") adjustment -= 0.045;
  adjustment += sourceDiversityBoost(result, seenCounts);
  return Math.max(-0.18, Math.min(0.16, adjustment));
}

export function applyEvidenceDrivenRanking(results: ResearchResult[], trace: EvidenceDrivenTuningTrace, topic: string): ResearchResult[] {
  if (!trace.applied) return [...results].sort((a, b) => b.scores.overall - a.scores.overall);
  const seenCounts = new Map<SourceGroup, number>();
  const adjusted = [...results]
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .map((result) => {
      const group = result.source_group ?? classifySourceDomain(result.source_domain);
      const adjustment = evidenceAdjustment(result, trace, topic, seenCounts);
      seenCounts.set(group, (seenCounts.get(group) ?? 0) + 1);
      if (Math.abs(adjustment) < 0.005) return result;
      const overall = clamp01(result.scores.overall + adjustment);
      return {
        ...result,
        tags: Array.from(new Set([...result.tags, "evidence-tuned-rank"])),
        scores: {
          ...result.scores,
          overall
        },
        quality_reasons: Array.from(new Set([
          ...(result.quality_reasons ?? []),
          adjustment > 0
            ? "Evidence-driven rank boost from real-topic matrix, creator-gate, source, license, visual, or relevance signals."
            : "Evidence-driven rank penalty from weak source, license, provider, risk, or duplicate-source concentration signals."
        ])).slice(0, 6)
      };
    });
  return adjusted.sort((a, b) => b.scores.overall - a.scores.overall);
}

export function completeEvidenceDrivenTuningTrace(params: {
  trace: EvidenceDrivenTuningTrace;
  finalEvidence: RetrievalEvidence;
  finalCalibration?: RetrievalQualityCalibration;
}): EvidenceDrivenTuningTrace {
  const after = {
    candidate_count: params.finalEvidence.total_candidates,
    calibration_score: params.finalCalibration?.calibration_score,
    source_diversity: params.finalEvidence.source_group_diversity,
    image_share: params.finalCalibration?.image_share,
    real_provider_share: params.finalCalibration?.real_provider_share
  };
  return {
    ...params.trace,
    after,
    warnings: [
      ...params.trace.warnings,
      ...params.finalEvidence.warnings,
      ...(params.finalCalibration?.warnings ?? [])
    ].filter((warning, index, all) => all.indexOf(warning) === index).slice(0, 12)
  };
}
