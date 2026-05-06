"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ClaimEvidenceRelation,
  LibraryImportSummary,
  ManualQualityReview,
  ProjectLibrary,
  ProviderToggleMap,
  ResearchProject,
  ResearchRequest,
  ResearchResponse,
  ResearchResult,
  SearchDepth,
  SearchDiagnostics,
  SearchPlan,
  ResearchMode
} from "@/types/research";
import { DEFAULT_PROVIDER_TOGGLES, RESEARCH_MODES, SEARCH_DEPTHS } from "@/types/research";
import { ResultGrid } from "@/components/search/ResultGrid";
import { SavedBoard } from "@/components/search/SavedBoard";
import { ResultDetailPanel } from "@/components/search/ResultDetailPanel";
import { ProviderHealthPanel } from "@/components/search/ProviderHealthPanel";
import { ResultFilters, defaultResultFilters, type ResultFilterState } from "@/components/search/ResultFilters";
import { ProviderTogglePanel } from "@/components/search/ProviderTogglePanel";
import { RetrievalEvidencePanel } from "@/components/search/RetrievalEvidencePanel";
import { ProviderRuntimePanel } from "@/components/search/ProviderRuntimePanel";
import { LiveQualityCalibrationPanel } from "@/components/search/LiveQualityCalibrationPanel";
import { RetrievalAutoTuningPanel } from "@/components/search/RetrievalAutoTuningPanel";
import { EvidenceDrivenTuningPanel } from "@/components/search/EvidenceDrivenTuningPanel";
import { ProviderResultInspectorPanel } from "@/components/search/ProviderResultInspectorPanel";
import { ReviewEvidenceFeedbackPanel } from "@/components/search/ReviewEvidenceFeedbackPanel";
import { ReferenceSearchHub } from "@/components/search/ReferenceSearchHub";
import { NormalizationDedupePanel } from "@/components/search/NormalizationDedupePanel";
import { SourceClassRoutingPanel } from "@/components/search/SourceClassRoutingPanel";
import { RankingExplainabilityPanel } from "@/components/search/RankingExplainabilityPanel";
import { ProjectReviewMemoryPanel } from "@/components/search/ProjectReviewMemoryPanel";
import { ClaimMappingPanel } from "@/components/search/ClaimMappingPanel";
import { CoverageBiasAuditPanel } from "@/components/search/CoverageBiasAuditPanel";
import { UXReliabilityPanel } from "@/components/search/UXReliabilityPanel";
import { ProjectLibraryPanel } from "@/components/search/ProjectLibraryPanel";
import { SearchHistoryPanel } from "@/components/search/SearchHistoryPanel";
import { createFreshProject, loadProjectLibrary, persistProjectLibrary } from "@/lib/local-storage";
import { createProjectLibraryExport, downloadTextFile } from "@/lib/export";
import { createStorageBackupExport, parseProjectLibraryImportText, type StorageImportValidationReport } from "@/lib/storage-hardening";
import { createClientMockResearchResponse, isStaticClientDemo } from "@/lib/client-search";
import { applyManualReviewPatch } from "@/lib/manual-quality-review";
import { buildReviewEvidenceFeedback } from "@/lib/review-evidence-feedback";
import { normalizeBoardTags } from "@/lib/board-organization";
import { buildCoverageBiasAudit } from "@/lib/coverage-bias-audit";
import { createDemoProject } from "@/lib/demo-project";
import { buildUxReliabilityAudit } from "@/lib/ux-reliability";
import { buildProjectReviewEvidenceMemory, buildProjectReviewEvidenceMemoryAudit, isProjectReviewEvidenceMemoryStale, resetProjectReviewEvidenceMemory } from "@/lib/project-review-memory";
import {
  addProjectClaim,
  assignDefaultSection,
  createProjectLibrary,
  createSearchHistoryEntry,
  createSearchSnapshot,
  createSection,
  duplicateProject,
  getActiveProject,
  linkProjectSourceToClaim,
  MAX_RESULT_SNAPSHOTS,
  MAX_SEARCH_HISTORY,
  mergeLibraries,
  removeProject,
  removeProjectClaim,
  removeSavedResultAndClaimLinks,
  unlinkProjectSourceFromClaim,
  updateActiveProject,
  updateProjectClaim,
  upsertProject
} from "@/lib/project";

export function SearchPanel() {
  const [topic, setTopic] = useState("Hannibal crossing the Alps");
  const [mode, setMode] = useState<ResearchMode>("youtube_documentary");
  const [depth, setDepth] = useState<SearchDepth>("standard");
  const [providerToggles, setProviderToggles] = useState<ProviderToggleMap>(DEFAULT_PROVIDER_TOGGLES);
  const [library, setLibrary] = useState<ProjectLibrary>(() => createProjectLibrary(createFreshProject("Visual research project")));
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<LibraryImportSummary | null>(null);
  const [storageImportReport, setStorageImportReport] = useState<StorageImportValidationReport | null>(null);
  const [searchPlan, setSearchPlan] = useState<SearchPlan | null>(null);
  const [diagnostics, setDiagnostics] = useState<SearchDiagnostics | null>(null);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);
  const [filters, setFilters] = useState<ResultFilterState>(defaultResultFilters);

  useEffect(() => {
    setLibrary(loadProjectLibrary());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persistProjectLibrary(library);
  }, [hydrated, library]);

  const project = useMemo(() => getActiveProject(library), [library]);
  const saved = project.saved_results;
  const savedIds = useMemo(() => new Set(saved.map((item) => item.id)), [saved]);
  const projectReviewMemoryStale = useMemo(() => isProjectReviewEvidenceMemoryStale(project), [project]);
  const projectReviewMemory = useMemo(() => project.review_evidence_memory ?? buildProjectReviewEvidenceMemory(project), [project]);
  const projectReviewMemoryAudit = useMemo(() => buildProjectReviewEvidenceMemoryAudit({
    memory: projectReviewMemory,
    stale: projectReviewMemoryStale,
    usedForSearch: false
  }), [projectReviewMemory, projectReviewMemoryStale]);
  const coverageBiasAudit = useMemo(() => buildCoverageBiasAudit(project), [project]);
  const uxReliabilityAudit = useMemo(() => buildUxReliabilityAudit({
    library,
    project,
    results,
    diagnostics,
    providerToggles,
    topic
  }), [diagnostics, library, project, providerToggles, results, topic]);

  const updateLibrary = (updater: (current: ProjectLibrary) => ProjectLibrary) => {
    setLibrary((current) => updater(current));
  };

  const updateProject = (updater: (current: ResearchProject) => ResearchProject) => {
    updateLibrary((current) => updateActiveProject(current, updater));
  };

  const filteredResults = useMemo(() => {
    const sourceNeedle = filters.source.trim().toLowerCase();
    const scoreForSort = (result: ResearchResult): number => {
      if (filters.sortBy === "newest") return new Date(result.collected_at).getTime() || 0;
      return result.scores[filters.sortBy] ?? result.scores.overall;
    };

    return results
      .filter((result) => filters.type === "all" || result.type === filters.type)
      .filter((result) => filters.provider === "all" || result.provider === filters.provider)
      .filter((result) => filters.risk === "all" || result.risk_level === filters.risk)
      .filter((result) => filters.license === "all" || result.license_detected === filters.license)
      .filter((result) => !sourceNeedle || result.source_domain.toLowerCase().includes(sourceNeedle) || result.source_url.toLowerCase().includes(sourceNeedle) || (result.source_group ?? "").toLowerCase().includes(sourceNeedle))
      .filter((result) => !filters.savedOnly || savedIds.has(result.id))
      .filter((result) => result.scores.overall >= filters.minOverall)
      .sort((a, b) => {
        if (filters.savedFirst) {
          const savedDelta = Number(savedIds.has(b.id)) - Number(savedIds.has(a.id));
          if (savedDelta !== 0) return savedDelta;
        }
        const scoreDelta = scoreForSort(b) - scoreForSort(a);
        if (scoreDelta !== 0) return scoreDelta;
        return b.scores.overall - a.scores.overall;
      });
  }, [filters, results, savedIds]);

  const resetVisibleSearchState = () => {
    setSearchPlan(null);
    setDiagnostics(null);
    setResults([]);
    setSelectedResult(null);
    setFilters(defaultResultFilters);
  };

  const submitSearch = async () => {
    const freshProjectReviewMemory = buildProjectReviewEvidenceMemory(project);
    const reviewEvidenceFeedback = freshProjectReviewMemory.feedback ?? buildReviewEvidenceFeedback(saved);
    const request: ResearchRequest = {
      topic: topic.trim(),
      mode,
      depth,
      provider_toggles: providerToggles,
      review_evidence_feedback: reviewEvidenceFeedback,
      project_review_evidence_memory: freshProjectReviewMemory
    };

    if (request.topic.length < 2) {
      setError("Enter at least two characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImportNotice(null);
    setFilters(defaultResultFilters);

    try {
      let data: ResearchResponse;
      if (isStaticClientDemo()) {
        data = await createClientMockResearchResponse(request);
        setImportNotice("Static demo mode: ran client-side mock search. Real providers require a Next.js runtime host such as Vercel.");
      } else {
        try {
          const response = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
          });

          if (!response.ok) {
            throw new Error("Search request failed.");
          }

          data = await response.json() as ResearchResponse;
        } catch (apiError) {
          data = await createClientMockResearchResponse(request);
          setImportNotice(apiError instanceof Error
            ? `API search unavailable (${apiError.message}). Used client-side mock fallback.`
            : "API search unavailable. Used client-side mock fallback.");
        }
      }
      setSearchPlan(data.search_plan);
      setDiagnostics(data.diagnostics);
      setResults(data.results);
      const snapshot = createSearchSnapshot(data, request);
      const historyEntry = createSearchHistoryEntry(data, request, snapshot.id);
      updateProject((current) => ({
        ...current,
        review_evidence_memory: freshProjectReviewMemory,
        result_snapshots: [snapshot, ...current.result_snapshots].slice(0, MAX_RESULT_SNAPSHOTS),
        search_history: [historyEntry, ...current.search_history].slice(0, MAX_SEARCH_HISTORY)
      }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unknown search error.");
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSnapshot = (snapshotId: string) => {
    const snapshot = project.result_snapshots.find((item) => item.id === snapshotId);
    if (!snapshot) {
      setError("Snapshot not found in the active project.");
      return;
    }
    setError(null);
    setImportNotice(`Restored snapshot: ${snapshot.label}`);
    setTopic(snapshot.request.topic);
    setMode(snapshot.request.mode);
    setDepth(snapshot.request.depth);
    setProviderToggles(snapshot.request.provider_toggles ?? DEFAULT_PROVIDER_TOGGLES);
    setSearchPlan(snapshot.search_plan);
    setDiagnostics(snapshot.diagnostics);
    setResults(snapshot.results);
    setSelectedResult(null);
    setFilters(defaultResultFilters);
  };

  const saveResult = (result: ResearchResult) => {
    updateProject((current) => {
      const exists = current.saved_results.some((item) => item.id === result.id);
      if (exists) return current;
      const savedResult = assignDefaultSection({ ...result, updated_at: new Date().toISOString() });
      return { ...current, saved_results: [savedResult, ...current.saved_results] };
    });
  };

  const removeSaved = (id: string) => {
    updateProject((current) => removeSavedResultAndClaimLinks(current, id));
  };

  const updateSavedNotes = (id: string, notes: string) => {
    updateProject((current) => ({
      ...current,
      saved_results: current.saved_results.map((item) => item.id === id ? { ...item, notes, updated_at: new Date().toISOString() } : item)
    }));
  };

  const updateSavedSection = (id: string, sectionId: string) => {
    updateProject((current) => ({
      ...current,
      saved_results: current.saved_results.map((item) => item.id === id ? { ...item, section_id: sectionId, updated_at: new Date().toISOString() } : item)
    }));
  };

  const updateSavedTags = (id: string, tags: string[]) => {
    updateProject((current) => ({
      ...current,
      saved_results: current.saved_results.map((item) => item.id === id ? { ...item, tags: normalizeBoardTags(tags), updated_at: new Date().toISOString() } : item)
    }));
  };

  const updateSavedManualReview = (id: string, patch: Partial<ManualQualityReview>) => {
    updateProject((current) => ({
      ...current,
      saved_results: current.saved_results.map((item) => item.id === id ? applyManualReviewPatch(item, patch) : item)
    }));
  };

  const addManualResult = (result: ResearchResult) => {
    updateProject((current) => {
      const exists = current.saved_results.some((item) => item.id === result.id || item.source_url === result.source_url);
      if (exists) return current;
      return { ...current, saved_results: [assignDefaultSection(result), ...current.saved_results] };
    });
  };

  const addSection = (name: string) => {
    updateProject((current) => ({
      ...current,
      board_sections: [...current.board_sections, createSection(name)]
    }));
  };

  const addClaim = (statement: string) => {
    updateProject((current) => addProjectClaim(current, statement));
  };

  const updateClaim = (claimId: string, patch: Parameters<typeof updateProjectClaim>[2]) => {
    updateProject((current) => updateProjectClaim(current, claimId, patch));
  };

  const deleteClaim = (claimId: string) => {
    updateProject((current) => removeProjectClaim(current, claimId));
  };

  const linkSourceToClaim = (claimId: string, resultId: string, relation: ClaimEvidenceRelation) => {
    updateProject((current) => linkProjectSourceToClaim(current, claimId, resultId, relation));
  };

  const unlinkSourceFromClaim = (claimId: string, resultId: string) => {
    updateProject((current) => unlinkProjectSourceFromClaim(current, claimId, resultId));
  };

  const renameProject = (name: string) => {
    updateProject((current) => ({ ...current, name }));
  };

  const clearSaved = () => {
    updateProject((current) => ({ ...current, saved_results: [], claims: current.claims.map((claim) => ({ ...claim, source_links: [], status: "under_supported", updated_at: new Date().toISOString() })) }));
  };

  const resetReviewMemory = () => {
    updateProject((current) => ({
      ...current,
      review_evidence_memory: resetProjectReviewEvidenceMemory(current)
    }));
  };

  const createNewProject = () => {
    const nextProject = createFreshProject("Visual research project");
    updateLibrary((current) => upsertProject(current, nextProject));
    resetVisibleSearchState();
  };

  const selectProject = (projectId: string) => {
    updateLibrary((current) => ({ ...current, active_project_id: projectId, updated_at: new Date().toISOString() }));
    resetVisibleSearchState();
  };

  const duplicateActiveProject = () => {
    updateLibrary((current) => upsertProject(current, duplicateProject(getActiveProject(current))));
  };

  const loadDemoProject = () => {
    updateLibrary((current) => upsertProject(current, createDemoProject()));
    setTopic("Carthage Hannibal historical map");
    setMode("historical_topic");
    setDepth("standard");
    setProviderToggles(DEFAULT_PROVIDER_TOGGLES);
    resetVisibleSearchState();
    setImportNotice("Loaded demo project with saved references, claim links, review labels, and export-ready workflow data.");
  };

  const useDemoSearchTopic = () => {
    setTopic("Carthage Hannibal historical map");
    setMode("historical_topic");
    setDepth("standard");
    setProviderToggles(DEFAULT_PROVIDER_TOGGLES);
    setImportNotice("Demo topic loaded. Run Search to generate free-source results and reference launchers.");
  };

  const deleteProject = (projectId: string) => {
    updateLibrary((current) => removeProject(current, projectId));
    resetVisibleSearchState();
  };

  const exportLibrary = () => {
    downloadTextFile("visual-research-board-library-v1.2.0.json", createProjectLibraryExport(library), "application/json");
  };

  const exportBackup = () => {
    downloadTextFile("visual-research-board-backup-v1.2.0.json", createStorageBackupExport(library), "application/json");
  };

  const importLibraryFile = async (file: File) => {
    setError(null);
    setImportNotice(null);
    setImportSummary(null);
    setStorageImportReport(null);
    try {
      const text = await file.text();
      const { candidate, report } = parseProjectLibraryImportText(text);
      setStorageImportReport(report);
      if (!candidate || !report.can_merge) {
        setError(report.message);
        return;
      }
      const { library: merged, summary } = mergeLibraries(library, candidate);
      setLibrary(merged);
      setImportSummary(summary);
      if (summary.status === "rejected") {
        setError(summary.message);
      } else {
        setImportNotice(`${summary.message} Validation: ${report.message} Source file: ${file.name}.`);
      }
    } catch (importError) {
      setError(importError instanceof Error ? `Library import failed: ${importError.message}` : "Library import failed.");
    }
  };

  const dismissImportSummary = () => {
    setImportSummary(null);
    setStorageImportReport(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-lime-300">v1.2.0</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Visual Research Board
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              A multi-project, source-aware visual research workspace with free backend image retrieval, manual reference search launchers, canonical provider normalization, duplicate merging, query expansion, source-class routing, rights/risk labels, review-based ranking calibration, ranking explainability, project-specific review evidence memory, board-section organization, claim-to-source mapping, coverage/bias auditing, attribution generation, evidence-pack exports, guided onboarding, demo project loading, workflow-specific empty states, and local storage import/export hardening.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100 lg:max-w-md" role="note">
            License and risk labels are candidates only. Verify source pages before direct use, publication, or commercial work.
          </div>
        </div>
      </header>

      <ProjectLibraryPanel
        library={library}
        activeProject={project}
        onSelectProject={selectProject}
        onRenameActiveProject={renameProject}
        onNewProject={createNewProject}
        onDuplicateProject={duplicateActiveProject}
        onDeleteProject={deleteProject}
        onExportLibrary={exportLibrary}
        onExportBackup={exportBackup}
        storageImportReport={storageImportReport}
        onImportLibraryFile={importLibraryFile}
      />

      <div className="mb-6">
        <UXReliabilityPanel
          audit={uxReliabilityAudit}
          onLoadDemoProject={loadDemoProject}
          onSearchDemoTopic={useDemoSearchTopic}
        />
      </div>

      {storageImportReport && (
        <StorageImportReportNotice report={storageImportReport} onDismiss={dismissImportSummary} />
      )}

      {importSummary && (
        <section
          className="mb-4 rounded-2xl border border-lime-300/30 bg-lime-300/[0.06] p-4 text-sm text-lime-100"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-lime-300">Library import summary</p>
              <p className="mt-1 font-semibold text-white">{importSummary.message}</p>
              <ul className="mt-2 space-y-1 text-xs text-lime-100">
                <li>Imported: {importSummary.imported_count}</li>
                <li>Renamed (duplicate names): {importSummary.renamed_count}</li>
                <li>Remapped (duplicate IDs): {importSummary.remapped_count}</li>
                <li>Rejected (invalid entries): {importSummary.rejected_count}</li>
                <li>Total projects after import: {importSummary.total_projects_after_import}</li>
                {importSummary.active_project_changed && (
                  <li>Note: the active project was reset because the previous one was missing.</li>
                )}
              </ul>
              {importSummary.rejected_reasons.length > 0 && (
                <details className="mt-2 text-xs text-amber-100">
                  <summary className="cursor-pointer">Rejected entry details</summary>
                  <ul className="mt-1 list-disc pl-5">
                    {importSummary.rejected_reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <button
              type="button"
              onClick={dismissImportSummary}
              className="rounded-xl border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-lime-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
              aria-label="Dismiss import summary"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {importNotice && !importSummary && !storageImportReport && (
        <p
          className="mb-4 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-3 text-sm text-lime-100"
          role="status"
          aria-live="polite"
        >
          {importNotice}
        </p>
      )}

      <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.5fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Research topic</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none ring-lime-300/40 placeholder:text-slate-500 focus:ring-4"
              placeholder="Example: Hannibal crossing the Alps"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as ResearchMode)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-lime-300/40 focus:ring-4"
            >
              {RESEARCH_MODES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Depth</span>
            <select
              value={depth}
              onChange={(event) => setDepth(event.target.value as SearchDepth)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-lime-300/40 focus:ring-4"
            >
              {SEARCH_DEPTHS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={submitSearch}
            disabled={isLoading}
            className="rounded-2xl bg-lime-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          {RESEARCH_MODES.find((item) => item.value === mode)?.description}
        </div>
        {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_26rem]">
        <div className="space-y-6">
          <ProviderTogglePanel toggles={providerToggles} onChange={setProviderToggles} />
          <ReferenceSearchHub topic={topic} links={diagnostics?.reference_searches} />
          {searchPlan && <SearchPlanPanel plan={searchPlan} diagnostics={diagnostics} />}
          {diagnostics?.source_class_routing && <SourceClassRoutingPanel trace={diagnostics.source_class_routing} />}
          {diagnostics?.normalization_dedupe && <NormalizationDedupePanel trace={diagnostics.normalization_dedupe} />}
          {diagnostics?.retrieval_evidence && <RetrievalEvidencePanel evidence={diagnostics.retrieval_evidence} />}
          {diagnostics?.quality_calibration && <LiveQualityCalibrationPanel calibration={diagnostics.quality_calibration} />}
          {diagnostics?.auto_tuning && <RetrievalAutoTuningPanel trace={diagnostics.auto_tuning} />}
          {diagnostics?.evidence_tuning && <EvidenceDrivenTuningPanel trace={diagnostics.evidence_tuning} />}
          {diagnostics?.review_evidence_calibration && <ReviewEvidenceFeedbackPanel trace={diagnostics.review_evidence_calibration} />}
          <ProjectReviewMemoryPanel memory={projectReviewMemory} audit={diagnostics?.project_review_memory ?? projectReviewMemoryAudit} onReset={resetReviewMemory} />
          <ClaimMappingPanel
            project={project}
            onAddClaim={addClaim}
            onUpdateClaim={updateClaim}
            onRemoveClaim={deleteClaim}
          />
          <CoverageBiasAuditPanel audit={diagnostics?.coverage_bias ?? coverageBiasAudit} />
          {diagnostics?.ranking_explainability && <RankingExplainabilityPanel audit={diagnostics.ranking_explainability} />}
          {diagnostics?.provider_result_inspection && <ProviderResultInspectorPanel inspection={diagnostics.provider_result_inspection} />}
          {diagnostics?.runtime_report && <ProviderRuntimePanel report={diagnostics.runtime_report} />}
          {diagnostics && <ProviderHealthPanel health={diagnostics.provider_health} />}
          <SearchHistoryPanel history={project.search_history} onRestoreSnapshot={restoreSnapshot} />
          <ResultFilters filters={filters} onChange={setFilters} totalCount={results.length} visibleCount={filteredResults.length} />
          <ResultGrid
            results={filteredResults}
            totalCount={results.length}
            hasSearched={Boolean(searchPlan || diagnostics || results.length > 0)}
            filtersActive={JSON.stringify(filters) !== JSON.stringify(defaultResultFilters)}
            savedIds={savedIds}
            onSave={saveResult}
            onInspect={setSelectedResult}
            onResetFilters={() => setFilters(defaultResultFilters)}
          />
        </div>
        <SavedBoard
          project={project}
          saved={saved}
          sections={project.board_sections}
          onRemove={removeSaved}
          onClear={clearSaved}
          onUpdateNotes={updateSavedNotes}
          onUpdateSection={updateSavedSection}
          onUpdateManualReview={updateSavedManualReview}
          onUpdateTags={updateSavedTags}
          onAddSection={addSection}
          onLinkSourceToClaim={linkSourceToClaim}
          onUnlinkSourceFromClaim={unlinkSourceFromClaim}
          onManualImport={addManualResult}
        />
      </div>

      <ResultDetailPanel result={selectedResult} onClose={() => setSelectedResult(null)} />
    </main>
  );
}


function StorageImportReportNotice({ report, onDismiss }: { report: StorageImportValidationReport; onDismiss: () => void }) {
  const tone = report.status === "rejected" ? "red" : report.status === "valid" ? "lime" : "amber";
  const borderClass = tone === "red" ? "border-red-300/30 bg-red-300/[0.06] text-red-100" : tone === "lime" ? "border-lime-300/30 bg-lime-300/[0.06] text-lime-100" : "border-amber-300/30 bg-amber-300/[0.06] text-amber-100";

  return (
    <section
      className={`mb-4 rounded-2xl border p-4 text-sm ${borderClass}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Storage import validation</p>
          <p className="mt-1 font-semibold text-white">{report.message}</p>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
            <span className="rounded-xl bg-white/5 px-3 py-2">Status: {report.status}</span>
            <span className="rounded-xl bg-white/5 px-3 py-2">Source: {report.source_kind}</span>
            <span className="rounded-xl bg-white/5 px-3 py-2">Projects: {report.accepted_project_count}/{report.project_count}</span>
            <span className="rounded-xl bg-white/5 px-3 py-2">Migration: {report.migration_required ? "required" : "not required"}</span>
            <span className="rounded-xl bg-white/5 px-3 py-2">Checksum: {report.checksum_match === undefined ? "not provided" : report.checksum_match ? "matched" : "mismatch"}</span>
            <span className="rounded-xl bg-white/5 px-3 py-2">Fingerprint: {report.integrity.fingerprint}</span>
          </div>
          {(report.warnings.length > 0 || report.rejected_reasons.length > 0) && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer">Validation warnings and rejected entries</summary>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {[...report.warnings, ...report.rejected_reasons].map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </details>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-lime-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/60"
          aria-label="Dismiss storage import validation report"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

function SearchPlanPanel({ plan, diagnostics }: { plan: SearchPlan; diagnostics: SearchDiagnostics | null }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Generated search plan</p>
          <h2 className="mt-1 text-xl font-bold text-white">{plan.original_topic}</h2>
          {diagnostics && (
            <p className="mt-2 text-xs text-slate-400">
              {diagnostics.total_raw_results} raw · {diagnostics.total_deduped_results} deduped · {diagnostics.duplicate_count} duplicates removed
              {diagnostics.mock_only ? " · mock-only safe mode" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          {plan.source_targets.map((target) => (
            <span key={target} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{target}</span>
          ))}
        </div>
      </div>
      {plan.query_variants && plan.query_variants.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Expanded query variants</h3>
            <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs text-lime-100">{plan.query_variants.length} variants</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {plan.query_variants.map((variant) => (
              <div key={variant.id} className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <span className="block text-slate-100">{variant.query}</span>
                <span className="mt-1 block text-[11px] text-slate-500">{variant.intent} · {variant.source_classes.join(" / ")} · {variant.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {plan.queries.map((query) => (
          <div key={query} className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
            {query}
          </div>
        ))}
      </div>
    </section>
  );
}
