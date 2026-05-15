"use client";

import { useMemo, useState } from "react";
import {
  BOARD_SECTIONS,
  CREATOR_WORKFLOW_DEMO_TITLE,
  CREATOR_WORKFLOW_VERSION,
  DEFAULT_RESEARCH_BRIEF,
  DEMO_DISCOVERY_RESULTS,
  type CreatorDiscoveryResult,
  type CreatorReview,
  type CreatorUseCase,
  type ResearchBrief,
  type ReviewStatus,
  type RiskTolerance,
  buildCreatorQueryPlan,
  createCreatorExportPack,
  createReview,
  defaultSectionForResult,
} from "@/lib/creator-workflow";

const CREATOR_WORKFLOW_BOARD_SECTIONS = [
  "Primary Visual References",
  "Historical / Source Evidence",
  "Style / Mood References",
  "Rejected / Weak References",
  "Export Candidates",
] as const;

const CREATOR_WORKFLOW_DEMO_SCENARIO = {
  title: "Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.",
  topic: "Ancient Carthage and Mediterranean power",
  useCase: "Premium documentary thumbnail research",
  visualStyle: "cinematic, archival, high-contrast Mediterranean power framing",
  outputType: "YouTube documentary thumbnail / social research board",
  sourcePriority: "museum, open-access, bibliographic, public-domain-first references",
  riskTolerance: "low: avoid fake live claims; preserve source and rights notes",
} as const;

const useCases: CreatorUseCase[] = [
  "YouTube thumbnail",
  "Documentary moodboard",
  "Historical research board",
  "Social media carousel",
  "Presentation references",
  "General visual research",
];

const riskTolerances: RiskTolerance[] = ["strict", "balanced", "exploratory"];

const actionLabels: Array<{ status: ReviewStatus; label: string }> = [
  { status: "saved", label: "Save to board" },
  { status: "rejected", label: "Reject" },
  { status: "strong", label: "Mark strong reference" },
  { status: "weak_uncertain", label: "Mark weak / uncertain" },
];

function sectionResults(
  results: CreatorDiscoveryResult[],
  reviews: Record<string, CreatorReview>,
  sectionId: string,
) {
  return results.filter((result) => {
    const review = reviews[result.id];
    const currentSection = review?.sectionId ?? defaultSectionForResult(result);
    return currentSection === sectionId && review?.status !== "rejected";
  });
}

export function CreatorWorkflowPanel() {
  const [brief, setBrief] = useState<ResearchBrief>(DEFAULT_RESEARCH_BRIEF);
  const [reviews, setReviews] = useState<Record<string, CreatorReview>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const queryPlan = useMemo(() => buildCreatorQueryPlan(brief), [brief]);
  const reviewList = useMemo(() => Object.values(reviews), [reviews]);
  const exportPack = useMemo(
    () => createCreatorExportPack(brief, queryPlan, DEMO_DISCOVERY_RESULTS, reviewList),
    [brief, queryPlan, reviewList],
  );

  const updateBrief = <K extends keyof ResearchBrief>(key: K, value: ResearchBrief[K]) => {
    setBrief((current) => ({ ...current, [key]: value }));
  };

  const applyReview = (result: CreatorDiscoveryResult, status: ReviewStatus) => {
    setReviews((current) => ({
      ...current,
      [result.id]: createReview(result, status, notes[result.id] ?? current[result.id]?.note ?? ""),
    }));
  };

  const updateNote = (result: CreatorDiscoveryResult, note: string) => {
    setNotes((current) => ({ ...current, [result.id]: note }));
    setReviews((current) => {
      const existing = current[result.id];
      if (!existing) return current;
      return {
        ...current,
        [result.id]: { ...existing, note, updatedAt: new Date().toISOString() },
      };
    });
  };

  const copyAttribution = async (text: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <section
      data-testid="creator-workflow-mvp"
      data-version={CREATOR_WORKFLOW_VERSION}
      className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100 shadow-2xl"
    >

      <section
        aria-label="Creator workflow board sections"
        data-testid="creator-workflow-board-sections"
      >
        <h3>Saved Board Sections</h3>
        <div>
          {CREATOR_WORKFLOW_BOARD_SECTIONS.map((section) => (
            <div key={section} data-board-section={section}>
              {section}
            </div>
          ))}
        </div>
      </section>

      <section
        aria-label="Built-in creator workflow demo scenario"
        data-testid="creator-workflow-demo-scenario"
      >
        <h3>Built-in demo scenario</h3>
        <p>{CREATOR_WORKFLOW_DEMO_SCENARIO.title}</p>
        <p>{CREATOR_WORKFLOW_DEMO_SCENARIO.topic}</p>
        <p>{CREATOR_WORKFLOW_DEMO_SCENARIO.useCase}</p>
        <p>{CREATOR_WORKFLOW_DEMO_SCENARIO.sourcePriority}</p>
      </section>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          v{CREATOR_WORKFLOW_VERSION} · End-to-End Creator Research Workflow MVP
        </p>
        <h2 className="text-2xl font-semibold">Creator Research Workflow</h2>
        <p className="max-w-3xl text-sm text-slate-300">
          Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview.
          This workflow is local-first and uses transparent fixture/demo mode when real providers are unavailable.
        </p>
        <button
          type="button"
          onClick={() => setBrief(DEFAULT_RESEARCH_BRIEF)}
          className="rounded-2xl border border-emerald-500/60 px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/10"
        >
          Load demo scenario: {CREATOR_WORKFLOW_DEMO_TITLE}
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold">Research Brief</h3>
          <label className="block text-sm font-medium">
            Topic
            <input
              value={brief.topic}
              onChange={(event) => updateBrief("topic", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Use case
              <select
                value={brief.useCase}
                onChange={(event) => updateBrief("useCase", event.target.value as CreatorUseCase)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
              >
                {useCases.map((useCase) => (
                  <option key={useCase}>{useCase}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Risk tolerance
              <select
                value={brief.riskTolerance}
                onChange={(event) => updateBrief("riskTolerance", event.target.value as RiskTolerance)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
              >
                {riskTolerances.map((risk) => (
                  <option key={risk}>{risk}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">
            Visual style
            <input
              value={brief.visualStyle}
              onChange={(event) => updateBrief("visualStyle", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Platform / output type
            <input
              value={brief.platformOutputType}
              onChange={(event) => updateBrief("platformOutputType", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Source priority
            <input
              value={brief.sourcePriority}
              onChange={(event) => updateBrief("sourcePriority", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Notes
            <textarea
              value={brief.notes}
              onChange={(event) => updateBrief("notes", event.target.value)}
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold">Smart Query Plan Preview</h3>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Primary query</p>
            <p className="mt-1 rounded-xl bg-slate-950 p-3 text-sm">{queryPlan.primaryQuery}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expanded queries</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {queryPlan.expandedQueries.map((query) => (
                <li key={query}>{query}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Source classes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {queryPlan.sourceClasses.map((sourceClass) => (
                <span key={sourceClass} className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                  {sourceClass}
                </span>
              ))}
            </div>
          </div>
          <p className="rounded-xl border border-slate-700 p-3 text-sm text-slate-300">
            <strong>Reason for routing:</strong> {queryPlan.routingReason}
          </p>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expected result types</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {queryPlan.expectedResultTypes.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-lg font-semibold">Discovery Results · Review Actions</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {DEMO_DISCOVERY_RESULTS.map((result) => (
            <article key={result.id} className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <div>
                <p className="text-xs text-emerald-300">{result.sourceClass}</p>
                <h4 className="font-semibold">{result.title}</h4>
                <p className="mt-1 text-sm text-slate-300">{result.thumbnailHint}</p>
              </div>
              <p className="text-xs text-slate-400">{result.rightsNotes}</p>
              <div className="flex flex-wrap gap-2">
                {actionLabels.map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => applyReview(result, action.status)}
                    className="rounded-xl border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <label className="block text-xs font-medium text-slate-300">
                Add note
                <textarea
                  value={notes[result.id] ?? reviews[result.id]?.note ?? ""}
                  onChange={(event) => updateNote(result, event.target.value)}
                  className="mt-1 min-h-16 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-sm"
                  placeholder="Why this reference matters, risk notes, usage limits..."
                />
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => void copyAttribution(result.attributionText)}
                  className="rounded-xl border border-slate-700 px-2 py-1 hover:bg-slate-800"
                >
                  Copy attribution
                </button>
                <a
                  href={result.sourceUrl}
                  className="rounded-xl border border-slate-700 px-2 py-1 hover:bg-slate-800"
                >
                  Open source
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold">Saved Board Sections</h3>
          {BOARD_SECTIONS.map((section) => {
            const items = sectionResults(DEMO_DISCOVERY_RESULTS, reviews, section.id);
            return (
              <div key={section.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                <h4 className="font-medium">{section.label}</h4>
                <p className="text-xs text-slate-400">{section.description}</p>
                {items.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {items.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No references in this section yet.</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-lg font-semibold">Evidence Pack Export Preview v2</h3>
          <p className="text-sm text-slate-300">
            Export preview includes project brief, saved references, source URLs, attribution text, usage/rights notes, review notes,
            missing coverage, query plan, and timestamp.
          </p>
          <pre className="max-h-[32rem] overflow-auto rounded-2xl border border-slate-700 bg-black p-3 text-xs text-slate-200">
            {JSON.stringify(exportPack, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
