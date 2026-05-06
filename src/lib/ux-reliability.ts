import type { ProjectLibrary, ProviderToggleMap, ResearchProject, ResearchResult, SearchDiagnostics, SearchProviderName } from "@/types/research";
import { DEFAULT_PROVIDER_TOGGLES, SEARCH_PROVIDERS } from "@/types/research";
import { buildBoardOrganizationAudit } from "@/lib/board-organization";
import { buildClaimMappingAudit } from "@/lib/claim-mapping";
import { buildCoverageBiasAudit } from "@/lib/coverage-bias-audit";
import { buildEvidencePackAudit } from "@/lib/evidence-pack-export";
import { buildAttributionAudit } from "@/lib/attribution-generator";
import { normalizeManualReview } from "@/lib/manual-quality-review";

export type UxReadinessStatus = "ready" | "needs_action" | "blocked";
export type UxWorkflowStepId =
  | "project"
  | "providers"
  | "search"
  | "reference_hub"
  | "save"
  | "review"
  | "claims"
  | "coverage"
  | "export";

export interface UxWorkflowStep {
  id: UxWorkflowStepId;
  label: string;
  status: UxReadinessStatus;
  detail: string;
  next_action: string;
}

export interface ProviderSetupSummary {
  enabled_count: number;
  free_core_enabled_count: number;
  free_key_enabled_count: number;
  optional_paid_enabled_count: number;
  disabled_count: number;
  missing_key_count: number;
  active_provider_count: number;
  no_result_provider_count: number;
  error_provider_count: number;
  static_or_mock_only: boolean;
}

export interface UxReliabilityAudit {
  schema_version: "1.1.0";
  generated_at: string;
  app_version: "1.1.0";
  workflow_ready: boolean;
  readiness_score: number;
  status: UxReadinessStatus;
  project_count: number;
  active_project_id: string;
  active_project_name: string;
  saved_count: number;
  result_count: number;
  search_has_run: boolean;
  reference_launcher_count: number;
  claim_count: number;
  reviewed_count: number;
  exportable_count: number;
  provider_setup: ProviderSetupSummary;
  steps: UxWorkflowStep[];
  empty_states: string[];
  warnings: string[];
  next_actions: string[];
}

const FREE_CORE_PROVIDERS: SearchProviderName[] = ["mock", "wikimedia", "openverse", "loc", "internet_archive", "nasa"];
const FREE_KEY_PROVIDERS: SearchProviderName[] = ["smithsonian", "europeana"];
const OPTIONAL_PAID_PROVIDERS: SearchProviderName[] = ["brave", "tavily"];

function enabledCount(toggles: ProviderToggleMap, providers: SearchProviderName[]): number {
  return providers.filter((provider) => toggles[provider]).length;
}

function stepStatus(done: boolean, blocked = false): UxReadinessStatus {
  if (blocked) return "blocked";
  return done ? "ready" : "needs_action";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildUxReliabilityAudit({
  library,
  project,
  results,
  diagnostics,
  providerToggles = DEFAULT_PROVIDER_TOGGLES,
  topic
}: {
  library: ProjectLibrary;
  project: ResearchProject;
  results: ResearchResult[];
  diagnostics: SearchDiagnostics | null;
  providerToggles?: ProviderToggleMap;
  topic: string;
}): UxReliabilityAudit {
  const boardAudit = buildBoardOrganizationAudit(project);
  const claimAudit = buildClaimMappingAudit(project);
  const coverageAudit = buildCoverageBiasAudit(project);
  const evidencePackAudit = buildEvidencePackAudit(project.saved_results, project);
  const attributionAudit = buildAttributionAudit(project.saved_results);
  const reviewedCount = project.saved_results.filter((item) => normalizeManualReview(item.manual_review).verdict !== "unreviewed").length;
  const health = diagnostics?.provider_health ?? [];
  const enabledProviderCount = enabledCount(providerToggles, SEARCH_PROVIDERS);
  const activeProviderCount = health.filter((item) => item.status === "active").length;
  const missingKeyCount = health.filter((item) => item.status === "missing_key").length;
  const errorProviderCount = health.filter((item) => item.status === "error" || item.status === "timeout").length;
  const noResultProviderCount = health.filter((item) => item.status === "no_results").length;
  const providerSetup: ProviderSetupSummary = {
    enabled_count: enabledProviderCount,
    free_core_enabled_count: enabledCount(providerToggles, FREE_CORE_PROVIDERS),
    free_key_enabled_count: enabledCount(providerToggles, FREE_KEY_PROVIDERS),
    optional_paid_enabled_count: enabledCount(providerToggles, OPTIONAL_PAID_PROVIDERS),
    disabled_count: SEARCH_PROVIDERS.length - enabledProviderCount,
    missing_key_count: missingKeyCount,
    active_provider_count: activeProviderCount,
    no_result_provider_count: noResultProviderCount,
    error_provider_count: errorProviderCount,
    static_or_mock_only: Boolean(diagnostics?.mock_only) || (providerToggles.mock && enabledProviderCount === 1)
  };

  const topicReady = topic.trim().length >= 2;
  const searchHasRun = Boolean(diagnostics) || results.length > 0;
  const referenceLauncherCount = diagnostics?.reference_searches?.length ?? 0;
  const hasSaved = project.saved_results.length > 0;
  const hasClaims = project.claims.length > 0;
  const hasClaimLinks = claimAudit.source_link_count > 0;
  const hasExportable = project.saved_results.length > 0;
  const hasReferenceHub = referenceLauncherCount > 0 || topicReady;
  const providerBlocked = enabledProviderCount === 0;

  const steps: UxWorkflowStep[] = [
    {
      id: "project",
      label: "Project workspace",
      status: stepStatus(Boolean(project.id && project.name)),
      detail: `${library.projects.length} project${library.projects.length === 1 ? "" : "s"}; active: ${project.name}.`,
      next_action: "Create, rename, duplicate, import, or select a project."
    },
    {
      id: "providers",
      label: "Provider setup",
      status: stepStatus(enabledProviderCount > 0, providerBlocked),
      detail: `${providerSetup.free_core_enabled_count} free-core sources enabled; ${providerSetup.free_key_enabled_count} free-key sources enabled; ${providerSetup.optional_paid_enabled_count} optional API providers enabled.`,
      next_action: "Use Free-core sources for no-key retrieval; enable free-key providers only after adding their environment keys."
    },
    {
      id: "search",
      label: "Search results",
      status: stepStatus(searchHasRun && results.length > 0),
      detail: searchHasRun ? `${results.length} visible result${results.length === 1 ? "" : "s"} in the latest search state.` : "No search run in this session yet.",
      next_action: "Enter a topic and run Search."
    },
    {
      id: "reference_hub",
      label: "Reference Search Hub",
      status: stepStatus(hasReferenceHub),
      detail: `${referenceLauncherCount || 9} manual launcher${(referenceLauncherCount || 9) === 1 ? "" : "s"} available for reference discovery without scraping.`,
      next_action: "Open a launcher, inspect results manually, then import selected source URLs."
    },
    {
      id: "save",
      label: "Saved board",
      status: stepStatus(hasSaved),
      detail: `${project.saved_results.length} saved item${project.saved_results.length === 1 ? "" : "s"}; ${boardAudit.populated_section_count}/${boardAudit.section_count} sections populated.`,
      next_action: "Save useful results or import a manual URL."
    },
    {
      id: "review",
      label: "Manual review",
      status: stepStatus(reviewedCount > 0),
      detail: `${reviewedCount}/${project.saved_results.length} saved items reviewed.`,
      next_action: "Review relevance, visual usefulness, source trust, and license status for saved items."
    },
    {
      id: "claims",
      label: "Claim mapping",
      status: stepStatus(hasClaims && hasClaimLinks),
      detail: `${project.claims.length} claim${project.claims.length === 1 ? "" : "s"}; ${claimAudit.source_link_count} source link${claimAudit.source_link_count === 1 ? "" : "s"}.`,
      next_action: "Create claims and attach saved sources as support, contradiction, context, or visual reference."
    },
    {
      id: "coverage",
      label: "Coverage/bias audit",
      status: stepStatus(hasSaved && coverageAudit.warnings.length <= 4),
      detail: `${coverageAudit.warnings.length} coverage warning${coverageAudit.warnings.length === 1 ? "" : "s"}; dominant provider share ${Math.round(coverageAudit.dominant_provider_share * 100)}%.`,
      next_action: "Reduce provider/domain concentration, add counter-evidence, and resolve rights-risk warnings."
    },
    {
      id: "export",
      label: "Export readiness",
      status: stepStatus(hasExportable),
      detail: `${evidencePackAudit.total_items} evidence-pack item${evidencePackAudit.total_items === 1 ? "" : "s"}; ${attributionAudit.attribution_ready_candidate_count} attribution-ready candidate${attributionAudit.attribution_ready_candidate_count === 1 ? "" : "s"}.`,
      next_action: "Preview Evidence Pack HTML or export JSON/Markdown/CSV after source checks."
    }
  ];

  const readySteps = steps.filter((step) => step.status === "ready").length;
  const blockedSteps = steps.filter((step) => step.status === "blocked").length;
  const readinessScore = Math.round((readySteps / steps.length) * 100);
  const emptyStates = unique([
    !searchHasRun ? "No search has run in the current workspace state." : "",
    searchHasRun && results.length === 0 ? "The current search/filter state has no visible results." : "",
    project.saved_results.length === 0 ? "Saved board is empty." : "",
    project.claims.length === 0 ? "No claims have been created." : "",
    project.search_history.length === 0 ? "Search history is empty." : "",
    project.result_snapshots.length === 0 ? "No search snapshots are available." : ""
  ]);
  const warnings = unique([
    providerBlocked ? "No provider is enabled; mock will be required to avoid a dead search state." : "",
    providerSetup.static_or_mock_only ? "Current provider setup is mock/static-demo heavy; live free-source behavior may differ on a Next.js runtime host." : "",
    missingKeyCount > 0 ? `${missingKeyCount} free-key provider${missingKeyCount === 1 ? "" : "s"} need environment configuration.` : "",
    errorProviderCount > 0 ? `${errorProviderCount} provider${errorProviderCount === 1 ? "" : "s"} reported error/timeout in the latest diagnostics.` : "",
    evidencePackAudit.reference_only_count > evidencePackAudit.reusable_count ? "Reference-only items outnumber reusable candidates; exports must preserve rights separation." : "",
    claimAudit.claim_without_support_count > 0 ? `${claimAudit.claim_without_support_count} claim${claimAudit.claim_without_support_count === 1 ? "" : "s"} lack supporting sources.` : "",
    coverageAudit.claims_without_counter_count > 0 ? `${coverageAudit.claims_without_counter_count} claim${coverageAudit.claims_without_counter_count === 1 ? "" : "s"} lack counter-evidence.` : ""
  ]);
  const nextActions = steps.filter((step) => step.status !== "ready").slice(0, 4).map((step) => `${step.label}: ${step.next_action}`);

  return {
    schema_version: "1.1.0",
    generated_at: new Date().toISOString(),
    app_version: "1.1.0",
    workflow_ready: readinessScore >= 70 && blockedSteps === 0,
    readiness_score: readinessScore,
    status: blockedSteps > 0 ? "blocked" : readinessScore >= 70 ? "ready" : "needs_action",
    project_count: library.projects.length,
    active_project_id: project.id,
    active_project_name: project.name,
    saved_count: project.saved_results.length,
    result_count: results.length,
    search_has_run: searchHasRun,
    reference_launcher_count: referenceLauncherCount,
    claim_count: project.claims.length,
    reviewed_count: reviewedCount,
    exportable_count: project.saved_results.length,
    provider_setup: providerSetup,
    steps,
    empty_states: emptyStates,
    warnings,
    next_actions: nextActions.length > 0 ? nextActions : ["Workflow is ready for export review; verify rights on source pages before publication."]
  };
}
