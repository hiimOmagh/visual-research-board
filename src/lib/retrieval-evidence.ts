import type { ProviderHealth, ResearchResult, RetrievalEvidence, SearchDepth, SearchPlan, SourceGroup } from "@/types/research";
import { classifySourceDomain, SOURCE_GROUP_ORDER } from "@/lib/result-quality";

const TARGET_CANDIDATES: Record<SearchDepth, number> = {
  quick: 12,
  standard: 30,
  deep: 40
};

function emptySourceGroupCounts(): Partial<Record<SourceGroup, number>> {
  return SOURCE_GROUP_ORDER.reduce<Partial<Record<SourceGroup, number>>>((acc, group) => {
    acc[group] = 0;
    return acc;
  }, {});
}

export function buildRetrievalEvidence(params: {
  plan: SearchPlan;
  results: ResearchResult[];
  providerHealth: ProviderHealth[];
}): RetrievalEvidence {
  const target = TARGET_CANDIDATES[params.plan.depth];
  const sourceGroupCounts = emptySourceGroupCounts();
  let imageCandidates = 0;
  let webCandidates = 0;
  let saveableCandidates = 0;

  for (const result of params.results) {
    const group = result.source_group ?? classifySourceDomain(result.source_domain);
    sourceGroupCounts[group] = (sourceGroupCounts[group] ?? 0) + 1;
    if (result.type === "image") imageCandidates += 1;
    if (result.type === "web" || result.type === "news" || result.type === "archive") webCandidates += 1;
    if (result.scores.overall >= 0.58 && result.risk_level !== "avoid") saveableCandidates += 1;
  }

  const activeProviderCount = params.providerHealth.filter((item) => item.status === "active").length;
  const enabledRealProviderCount = params.providerHealth.filter((item) => item.provider !== "mock" && item.enabled).length;
  const sourceGroupDiversity = Object.values(sourceGroupCounts).filter((count) => Number(count) > 0).length;
  const totalCandidates = params.results.length;
  const warnings: string[] = [];

  if (totalCandidates < target) warnings.push(`Below target candidate count for ${params.plan.depth} depth: ${totalCandidates}/${target}.`);
  if (imageCandidates < Math.ceil(target * 0.55)) warnings.push(`Image candidate pool is thin: ${imageCandidates} image results.`);
  if (saveableCandidates < Math.ceil(target * 0.25)) warnings.push(`Few immediately saveable candidates: ${saveableCandidates}.`);
  if (sourceGroupDiversity < 3) warnings.push(`Low source diversity: ${sourceGroupDiversity} source groups represented.`);
  if (enabledRealProviderCount > 0 && activeProviderCount <= 1) warnings.push("Real-provider breadth is weak; check API keys, provider errors, and query coverage.");

  const volumeScore = Math.min(1, totalCandidates / target);
  const imageScore = Math.min(1, imageCandidates / Math.max(1, Math.ceil(target * 0.55)));
  const saveableScore = Math.min(1, saveableCandidates / Math.max(1, Math.ceil(target * 0.25)));
  const diversityScore = Math.min(1, sourceGroupDiversity / 4);
  const providerScore = Math.min(1, Math.max(activeProviderCount, 1) / 3);
  const broadRetrievalScore = Number(((volumeScore * 0.34) + (imageScore * 0.22) + (saveableScore * 0.2) + (diversityScore * 0.16) + (providerScore * 0.08)).toFixed(2));

  const verdict = (() => {
    if (totalCandidates >= target && saveableCandidates >= Math.ceil(target * 0.25) && sourceGroupDiversity >= 3) return "passes_mvp_gate";
    if (totalCandidates < target) return "needs_more_results";
    if (sourceGroupDiversity < 3) return "needs_more_source_diversity";
    if (saveableCandidates < Math.ceil(target * 0.25)) return "needs_better_ranking";
    return "needs_review";
  })();

  return {
    target_candidate_count: target,
    total_candidates: totalCandidates,
    image_candidates: imageCandidates,
    web_context_candidates: webCandidates,
    saveable_candidates: saveableCandidates,
    active_provider_count: activeProviderCount,
    source_group_diversity: sourceGroupDiversity,
    source_group_counts: sourceGroupCounts,
    query_count: params.plan.queries.length,
    depth_branch_count: params.plan.depth === "quick" ? 2 : params.plan.depth === "standard" ? 5 : 8,
    broad_retrieval_score: broadRetrievalScore,
    verdict,
    warnings
  };
}
