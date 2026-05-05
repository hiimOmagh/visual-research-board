import type {
  ProviderHealth,
  RetrievalAutoTuningAction,
  RetrievalAutoTuningTrace,
  RetrievalEvidence,
  RetrievalQualityCalibration,
  ResearchResult,
  SearchPlan,
  SearchProviderName,
  SourceGroup
} from "@/types/research";
import { classifySourceDomain } from "@/lib/result-quality";

const PROVIDER_BASE_WEIGHTS: Record<SearchProviderName, number> = {
  mock: 0.62,
  wikimedia: 1,
  openverse: 1.02,
  loc: 1.04,
  internet_archive: 0.98,
  nasa: 0.98,
  smithsonian: 1.06,
  europeana: 1.03,
  met: 1.08,
  artic: 1.08,
  cleveland_museum: 1.08,
  rijksmuseum: 1.05,
  wellcome: 1.06,
  bhl: 1.04,
  gallica: 1.05,
  nypl: 1.05,
  nara: 1.06,
  dpla: 1.04,
  brave: 0.82,
  tavily: 0.8
};

const IMPORTANT_SOURCE_GROUPS = new Set<SourceGroup>([
  "commons_open_access",
  "institutional_archive",
  "official_academic",
  "news_media"
]);

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

function sourceTargetsWith(plan: SearchPlan, targets: SearchPlan["source_targets"]): SearchPlan["source_targets"] {
  return unique([...plan.source_targets, ...targets]) as SearchPlan["source_targets"];
}

function issueDrivenQueries(plan: SearchPlan, actions: RetrievalAutoTuningAction[]): string[] {
  const topic = plan.original_topic;
  const queries: string[] = [];

  if (actions.includes("increase_relevance_precision")) {
    queries.push(
      `\"${topic}\" visual reference`,
      `\"${topic}\" image source`,
      `${topic} primary visual source`,
      `${topic} explained images`
    );
  }

  if (actions.includes("increase_visual_branches")) {
    queries.push(
      `${topic} high resolution images`,
      `${topic} photos`,
      `${topic} illustrations`,
      `${topic} visual references`,
      `${topic} documentary images`
    );
  }

  if (actions.includes("increase_commons_archive_bias") || actions.includes("increase_license_clarity_bias")) {
    queries.push(
      `${topic} Wikimedia Commons`,
      `${topic} public domain images`,
      `${topic} Creative Commons image`,
      `${topic} museum open access`,
      `${topic} Library of Congress`,
      `${topic} archive image`
    );
  }

  if (actions.includes("increase_source_diversity")) {
    queries.push(
      `${topic} official photos`,
      `${topic} institution archive`,
      `${topic} museum collection`,
      `${topic} university source`,
      `${topic} government archive`,
      `${topic} editorial source image`
    );
  }

  if (plan.mode === "public_domain") {
    queries.push(`${topic} CC0`, `${topic} PD image`, `${topic} open access collection`);
  }

  if (plan.mode === "thumbnail_inspiration" || plan.mode === "design_moodboard") {
    queries.push(`${topic} composition reference`, `${topic} lighting reference`, `${topic} poster visual reference`);
  }

  if (plan.mode === "news_event") {
    queries.push(`${topic} official press images`, `${topic} recent event photos`, `${topic} news photo context`);
  }

  return unique(queries);
}

function buildActionSet(evidence: RetrievalEvidence, calibration?: RetrievalQualityCalibration): RetrievalAutoTuningAction[] {
  const actions = new Set<RetrievalAutoTuningAction>();

  if (evidence.verdict !== "passes_mvp_gate") actions.add("expand_queries");
  if (evidence.verdict === "needs_more_results") actions.add("increase_visual_branches");
  if (evidence.verdict === "needs_more_source_diversity") actions.add("increase_source_diversity");
  if (evidence.verdict === "needs_better_ranking") actions.add("apply_diversity_rerank");

  if (calibration) {
    if (calibration.verdict === "needs_more_relevance") actions.add("increase_relevance_precision");
    if (calibration.verdict === "needs_more_visuals") actions.add("increase_visual_branches");
    if (calibration.verdict === "needs_stronger_sources") {
      actions.add("increase_commons_archive_bias");
      actions.add("increase_source_diversity");
    }
    if (calibration.verdict === "needs_license_clarity") actions.add("increase_license_clarity_bias");
    if (calibration.verdict === "needs_real_provider_evidence") actions.add("increase_real_provider_bias");
    if (calibration.top10_source_diversity < calibration.expectations.source_diversity_target) actions.add("apply_diversity_rerank");
    if (calibration.image_share < calibration.expectations.image_share_target) actions.add("increase_visual_branches");
  }

  if (actions.size > 0) actions.add("apply_diversity_rerank");
  return Array.from(actions);
}

function weightsForActions(actions: RetrievalAutoTuningAction[], providerHealth: ProviderHealth[]): Record<SearchProviderName, number> {
  const weights = { ...PROVIDER_BASE_WEIGHTS };
  const activeRealProviders = providerHealth.filter((entry) => entry.provider !== "mock" && entry.status === "active").map((entry) => entry.provider);

  if (actions.includes("increase_real_provider_bias")) {
    weights.mock = 0.35;
    for (const provider of activeRealProviders) weights[provider] = Math.min(1.12, weights[provider] + 0.12);
  }

  if (actions.includes("increase_commons_archive_bias") || actions.includes("increase_license_clarity_bias")) {
    for (const provider of ["wikimedia", "openverse", "loc", "internet_archive", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla"] as SearchProviderName[]) {
      weights[provider] = Math.min(1.18, weights[provider] + 0.12);
    }
  }

  if (actions.includes("increase_visual_branches")) {
    for (const provider of ["wikimedia", "openverse", "loc", "internet_archive", "nasa", "smithsonian", "europeana", "met", "artic", "cleveland_museum", "rijksmuseum", "wellcome", "bhl", "gallica", "nypl", "nara", "dpla"] as SearchProviderName[]) {
      weights[provider] = Math.min(1.16, weights[provider] + 0.05);
    }
    weights.brave = Math.min(1.02, weights.brave + 0.03);
    weights.tavily = Math.min(0.96, weights.tavily + 0.02);
  }

  return weights;
}

export function buildRetrievalAutoTunePlan(params: {
  plan: SearchPlan;
  evidence: RetrievalEvidence;
  calibration?: RetrievalQualityCalibration;
  providerHealth: ProviderHealth[];
}): { plan: SearchPlan; trace: RetrievalAutoTuningTrace } {
  const actions = buildActionSet(params.evidence, params.calibration);
  const enabled = true;
  const shouldApply = actions.length > 0 && (params.evidence.verdict !== "passes_mvp_gate" || params.calibration?.verdict !== "passes_creator_gate");
  const providerWeights = weightsForActions(actions, params.providerHealth);
  const addedQueries = shouldApply ? issueDrivenQueries(params.plan, actions) : [];
  const tunedTargets = shouldApply
    ? sourceTargetsWith(params.plan, ["image", "web", "commons", "archive"])
    : params.plan.source_targets;

  const tunedPlan: SearchPlan = shouldApply
    ? {
        ...params.plan,
        queries: unique([...addedQueries, ...params.plan.queries]).slice(0, params.plan.depth === "deep" ? 24 : params.plan.depth === "standard" ? 18 : 10),
        source_targets: tunedTargets
      }
    : params.plan;

  return {
    plan: tunedPlan,
    trace: {
      enabled,
      applied: shouldApply,
      reason: shouldApply
        ? "Initial retrieval evidence or creator-gate calibration exposed a weak case; a second tuned retrieval/rerank pass was applied."
        : "Initial retrieval passed the retrieval and creator gates; auto-tuning was not needed.",
      initial_evidence_verdict: params.evidence.verdict,
      initial_quality_verdict: params.calibration?.verdict,
      actions,
      added_queries: addedQueries,
      provider_weights: providerWeights,
      rerank_profile: shouldApply ? "weak-case diversity-aware score adjustment" : "baseline ranking",
      initial_candidate_count: params.evidence.total_candidates,
      final_candidate_count: params.evidence.total_candidates,
      candidate_delta: 0,
      initial_calibration_score: params.calibration?.calibration_score,
      final_calibration_score: params.calibration?.calibration_score,
      calibration_delta: 0,
      source_targets: tunedTargets,
      warnings: [
        ...params.evidence.warnings,
        ...(params.calibration?.warnings ?? [])
      ].slice(0, 8)
    }
  };
}

function topicHit(result: ResearchResult, topic: string): boolean {
  const tokens = topic.toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/).filter((token) => token.length >= 3);
  if (tokens.length === 0) return true;
  const haystack = `${result.title} ${result.description ?? ""} ${result.tags.join(" ")} ${result.source_domain}`.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

function scoreAdjustment(result: ResearchResult, trace: RetrievalAutoTuningTrace): number {
  if (!trace.applied) return 0;
  const actions = trace.actions;
  const sourceGroup = result.source_group ?? classifySourceDomain(result.source_domain);
  let adjustment = 0;

  adjustment += (trace.provider_weights[result.provider as SearchProviderName] ?? 0.7) * 0.03 - 0.02;
  if (actions.includes("increase_real_provider_bias") && result.provider === "mock") adjustment -= 0.08;
  if (actions.includes("increase_real_provider_bias") && result.provider !== "mock" && result.provider !== "manual") adjustment += 0.04;
  if (actions.includes("increase_visual_branches")) adjustment += result.type === "image" ? 0.04 : -0.025;
  if (actions.includes("increase_commons_archive_bias") && (sourceGroup === "commons_open_access" || sourceGroup === "institutional_archive")) adjustment += 0.05;
  if (actions.includes("increase_source_diversity") && IMPORTANT_SOURCE_GROUPS.has(sourceGroup)) adjustment += 0.035;
  if (actions.includes("increase_license_clarity_bias")) {
    if (result.license_detected === "public_domain" || result.license_detected === "creative_commons") adjustment += 0.045;
    if (result.license_detected === "unknown" || result.license_detected === "copyrighted") adjustment -= 0.025;
  }
  if (actions.includes("increase_relevance_precision")) adjustment += topicHit(result, trace.added_queries[0] ?? "") ? 0.01 : 0;
  if (result.risk_level === "avoid") adjustment -= 0.08;
  if (result.risk_level === "high") adjustment -= 0.045;
  if (sourceGroup === "commercial_stock") adjustment -= 0.035;
  return Math.max(-0.16, Math.min(0.14, adjustment));
}

function adjustedResult(result: ResearchResult, trace: RetrievalAutoTuningTrace): ResearchResult {
  const adjustment = scoreAdjustment(result, trace);
  if (!trace.applied || Math.abs(adjustment) < 0.005) return result;
  const overall = Number(Math.max(0, Math.min(1, result.scores.overall + adjustment)).toFixed(2));
  return {
    ...result,
    tags: Array.from(new Set([...result.tags, "auto-tuned-rank"])),
    scores: {
      ...result.scores,
      overall
    },
    quality_reasons: Array.from(new Set([
      ...(result.quality_reasons ?? []),
      adjustment > 0
        ? "Auto-tuned rank boost from weak-case provider/source/license/visual calibration."
        : "Auto-tuned rank penalty from weak-case risk, source, provider, or license calibration."
    ])).slice(0, 5)
  };
}

function diversityAwareSort(results: ResearchResult[]): ResearchResult[] {
  const groups = new Map<SourceGroup, ResearchResult[]>();
  for (const result of results) {
    const group = result.source_group ?? classifySourceDomain(result.source_domain);
    const bucket = groups.get(group) ?? [];
    bucket.push(result);
    groups.set(group, bucket);
  }
  for (const bucket of groups.values()) bucket.sort((a, b) => b.scores.overall - a.scores.overall);

  const ordered: ResearchResult[] = [];
  const groupOrder = Array.from(groups.keys()).sort((a, b) => {
    const aTop = groups.get(a)?.[0]?.scores.overall ?? 0;
    const bTop = groups.get(b)?.[0]?.scores.overall ?? 0;
    return bTop - aTop;
  });

  while (ordered.length < results.length) {
    let moved = false;
    for (const group of groupOrder) {
      const bucket = groups.get(group);
      const next = bucket?.shift();
      if (next) {
        ordered.push(next);
        moved = true;
      }
    }
    if (!moved) break;
  }

  return ordered;
}

export function applyAutoTunedRanking(results: ResearchResult[], trace: RetrievalAutoTuningTrace): ResearchResult[] {
  const adjusted = results.map((result) => adjustedResult(result, trace));
  const scoreSorted = adjusted.sort((a, b) => b.scores.overall - a.scores.overall);
  if (!trace.applied || !trace.actions.includes("apply_diversity_rerank")) return scoreSorted;
  return diversityAwareSort(scoreSorted);
}

export function completeAutoTuningTrace(params: {
  trace: RetrievalAutoTuningTrace;
  finalEvidence: RetrievalEvidence;
  finalCalibration?: RetrievalQualityCalibration;
}): RetrievalAutoTuningTrace {
  return {
    ...params.trace,
    final_evidence_verdict: params.finalEvidence.verdict,
    final_quality_verdict: params.finalCalibration?.verdict,
    final_candidate_count: params.finalEvidence.total_candidates,
    candidate_delta: params.finalEvidence.total_candidates - params.trace.initial_candidate_count,
    final_calibration_score: params.finalCalibration?.calibration_score,
    calibration_delta: params.finalCalibration?.calibration_score !== undefined && params.trace.initial_calibration_score !== undefined
      ? Number((params.finalCalibration.calibration_score - params.trace.initial_calibration_score).toFixed(2))
      : undefined,
    warnings: [
      ...params.trace.warnings,
      ...params.finalEvidence.warnings,
      ...(params.finalCalibration?.warnings ?? [])
    ].filter((warning, index, all) => all.indexOf(warning) === index).slice(0, 10)
  };
}
