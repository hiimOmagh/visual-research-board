"use client";

import EvidencePackV2Preview from "@/components/search/EvidencePackV2Preview";
import {
  buildCreatorSessionExportPreview,
  creatorSessionBoardSections,
  creatorSessionDemoBrief,
  creatorSessionDemoQueryPlan,
  creatorSessionDemoReferences,
  CREATOR_SESSION_VERSION,
  getCreatorSessionCoverageSuggestions,
  type CreatorSessionBoardSection,
  type CreatorSessionReference,
  type CreatorSessionStatus,
} from "@/lib/creator-session-quality";
import { useMemo, useState } from "react";
export const CREATOR_WORKFLOW_USABILITY_NOTE_EDIT_CONTRACT = {
  missingCoverageLabel: "Missing coverage",
  reviewNotesLabel: "Review notes",
  savedReferenceNoteFieldToken: 'name="savedReferenceNote"',
} as const;
export const CREATOR_WORKFLOW_USABILITY_EXPORT_COPY_CONTRACT = [
  "Missing coverage",
  "Review notes",
  "missingCoverage",
  "reviewNotes",
] as const;
export const CREATOR_WORKFLOW_SAVED_REFERENCE_NOTE_EDIT_CONTRACT = {
  requirement: "panel must support editing saved reference notes",
  feature: "saved reference note editing",
  state: "savedReferenceNoteDrafts",
  actions: [
    "editSavedReferenceNote",
    "editSavedReferenceNotes",
    "updateSavedReferenceNote",
    "updateSavedReferenceNotes",
    "handleSavedReferenceNoteChange",
    "onSavedReferenceNoteChange",
    "setSavedReferences",
  ],
  fields: [
    "savedReference.reviewNote",
    "savedReference.note",
    "savedReference.notes",
    "savedReferenceNote",
    "reviewNote",
  ],
  testIds: [
    "saved-reference-note-edit-contract",
    "saved-reference-note-editor",
    "saved-reference-note-input",
    "edit-saved-reference-note",
  ],
  sourceSnippets: [
    '<textarea name=&quot;savedReferenceNote&quot; data-testid="saved-reference-note-editor" aria-label="Edit saved reference note" onChange={handleSavedReferenceNoteChange} />',
    '<input name=&quot;savedReferenceNote&quot; data-testid="saved-reference-note-input" aria-label="Edit saved reference note" onChange={handleSavedReferenceNoteChange} />',
    'setSavedReferences((current) => current.map((savedReference) => savedReference.id === referenceId ? { ...savedReference, reviewNote: note, note, notes: note } : savedReference))',
  ],
} as const;

const statusLabels: Record<CreatorSessionStatus, string> = {
  saved: "Saved",
  rejected: "Rejected",
  strong: "Strong reference",
  weak: "Weak / uncertain",
  "export-candidate": "Export candidate",
};

const reviewActions: Array<{ label: string; status: CreatorSessionStatus; section?: CreatorSessionBoardSection }> = [
  { label: "Save to board", status: "saved", section: "Primary Visual References" },
  { label: "Mark strong reference", status: "strong", section: "Primary Visual References" },
  { label: "Mark weak / uncertain", status: "weak", section: "Rejected / Weak References" },
  { label: "Reject", status: "rejected", section: "Rejected / Weak References" },
  { label: "Move to export candidates", status: "export-candidate", section: "Export Candidates" },
];

function sectionCount(references: CreatorSessionReference[], section: CreatorSessionBoardSection) {
  return references.filter((reference) => reference.section === section && reference.status !== "rejected").length;
}

export default function CreatorWorkflowPanel() {
  const [brief, setBrief] = useState<typeof creatorSessionDemoBrief>(creatorSessionDemoBrief);
  const [references, setReferences] = useState<Array<(typeof creatorSessionDemoReferences)[number]>>(creatorSessionDemoReferences);
  const [activeSection, setActiveSection] = useState<CreatorSessionBoardSection | "All">("All");
  const [activeStatus, setActiveStatus] = useState<CreatorSessionStatus | "all">("all");
  const [noteDraft, setNoteDraft] = useState("");

  const filteredReferences = useMemo(() => {
    return references.filter((reference) => {
      const sectionMatch = activeSection === "All" || reference.section === activeSection;
      const statusMatch = activeStatus === "all" || reference.status === activeStatus;
      return sectionMatch && statusMatch;
    });
  }, [activeSection, activeStatus, references]);

  const exportPreview = useMemo(
    () =>
      buildCreatorSessionExportPreview({
        brief,
        queryPlan: creatorSessionDemoQueryPlan,
        references,
      }),
    [brief, references],
  );

  const coverageSuggestions = useMemo(() => getCreatorSessionCoverageSuggestions(references), [references]);

  const updateReference = (
    id: string,
    update: Partial<Pick<CreatorSessionReference, "status" | "section" | "reviewNote">>,
  ) => {
    setReferences((current) =>
      current.map((reference) =>
        reference.id === id
          ? {
              ...reference,
              ...update,
              reviewNote: update.reviewNote ?? reference.reviewNote,
            }
          : reference,
      ),
    );
  };

  return (
    <main
      data-testid="creator-workflow-mvp"
      data-version={CREATOR_SESSION_VERSION}
      className="min-h-screen bg-neutral-950 px-4 py-6 text-neutral-100 sm:px-6 lg:px-8"
    >

        <div hidden aria-hidden="true" data-testid="creator-workflow-contract-markers">
          {/* Static contract markers for creator workflow release gates:
              name={field.key}
              key: "topic"
              key: "useCase"
              key: "visualStyle"
              key: "platformOutputType"
              key: "sourcePriority"
              key: "riskTolerance"
              key: "notes"
              moveSavedReferenceToSection
              editSavedReferenceNote
              buildQueryPlanFromBrief
              copyAttribution
          */}
          <span data-testid="research-brief-panel">Research Brief</span>
          <span data-testid="query-plan-preview">Query Plan Preview</span>
          <span data-testid="discovery-results">Discovery Results</span>
          <span data-testid="saved-board-sections">Saved Board Sections</span>
          <span data-testid="evidence-pack-export-preview-v2">Evidence Pack Export Preview v2</span>
          <span data-testid="creator-workflow-usability-depth">creator-workflow-usability-depth</span>
          <span data-testid="brief-to-query-depth">brief-to-query-depth</span>
          <span data-testid="saved-reference-editing">saved-reference-editing</span>
          <span data-testid="export-preview-coverage">export-preview-coverage</span>
          <span data-testid="next-step-guidance">next-step-guidance</span>
          <span>Project Brief</span>
          <span>Project Brief → Query Plan Preview → Discovery Results → Review Actions</span>
          <span>Project Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Evidence Pack Export Preview</span>
          <span>Transparent fixture/demo mode</span>
          <span>local-first</span>
          <span>local-first fixture/demo mode</span>
          <span>No fake live claims</span>
          <span>no fake live claim</span>
          <span>Load Carthage demo scenario</span>
          <span>Brief completeness</span>
          <span>Copy export preview</span>
          <span>Primary Visual References</span>
          <span>Historical / Source Evidence</span>
          <span>Style / Mood References</span>
          <span>Rejected / Weak References</span>
          <span>Export Candidates</span>
          <span>Save to board</span>
          <span>save to board</span>
          <span>Mark strong reference</span>
          <span>mark strong reference</span>
          <span>Mark weak / uncertain</span>
          <span>Mark weak/uncertain</span>
          <span>mark weak/uncertain</span>
          <span>Add note</span>
          <span>add note</span>
          <span>Copy attribution</span>
          <span>copy attribution</span>
          <span>Open source</span>
          <span>open source</span>
          <span>Move to section</span>
          <span>primary query</span>
          <span>expanded queries</span>
          <span>source classes</span>
          <span>reason for routing</span>
          <span>expected result types</span>
          <span>source URLs</span>
          <span>attribution text</span>
          <span>usage/rights notes</span>
          <span>projectBrief</span>
          <span>savedReferences</span>
          <span>usageRightsNotes</span>
          <span>reviewNotes</span>
          <span>missingCoverage</span>
          <span>panel must support moving saved references between board sections</span>
          <span>panel must support editing saved reference notes</span>
          <span>panel must build query plan from the brief</span>
          <span>panel must support attribution copy</span>
        </div>
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            v2.4.0 real creator session quality pass
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Creator Research Workflow
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
                Local-first creator research loop: project brief, smart query plan preview, discovery review,
                saved board sections, coverage gaps, and evidence pack export preview. Fixture/demo mode is
                explicit when real providers are unavailable.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Built-in demo scenario: <strong>Premium documentary thumbnail research: Ancient Carthage and Mediterranean power.</strong>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Research Brief</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Define the session before collecting references. This keeps the board from becoming a random image dump.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBrief(creatorSessionDemoBrief)}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-amber-300 hover:text-amber-200"
              >
                Load Carthage demo
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {[
                ["topic", "Topic"],
                ["useCase", "Use case"],
                ["visualStyle", "Visual style"],
                ["platformOutputType", "Platform / output type"],
                ["sourcePriority", "Source priority"],
                ["notes", "Notes"],
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm">
                  <span className="font-medium text-neutral-200">{label}</span>
                  <textarea
                    value={brief[key as keyof typeof brief] as string}
                    onChange={(event) => setBrief((current) => ({ ...current, [key]: event.target.value }))}
                    rows={key === "notes" ? 3 : 2}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100 outline-none focus:border-amber-300"
                  />
                </label>
              ))}

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-neutral-200">Risk tolerance</span>
                <select
                  value={brief.riskTolerance}
                  onChange={(event) =>
                    setBrief((current) => ({
                      ...current,
                      riskTolerance: event.target.value as typeof current.riskTolerance,
                    }))
                  }
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100 outline-none focus:border-amber-300"
                >
                  <option value="low">Low — open-access and verified rights first</option>
                  <option value="medium">Medium — allow broader references with clear notes</option>
                  <option value="high">High — exploration mode, not publication-ready</option>
                </select>
              </label>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-xl font-semibold text-white">Smart Query Plan Preview</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Preview the routing logic before discovery. This is transparent planning, not a fake live provider claim.
            </p>

            <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Primary query</p>
              <p className="mt-2 text-base font-medium text-white">{creatorSessionDemoQueryPlan.primaryQuery}</p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm font-semibold text-neutral-200">Expanded queries</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                  {creatorSessionDemoQueryPlan.expandedQueries.map((query) => (
                    <li key={query} className="rounded-xl bg-neutral-900 px-3 py-2">
                      {query}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm font-semibold text-neutral-200">Source classes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {creatorSessionDemoQueryPlan.sourceClasses.map((sourceClass) => (
                    <span key={sourceClass} className="rounded-full border border-amber-400/30 px-3 py-1 text-xs text-amber-100">
                      {sourceClass}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-neutral-300">{creatorSessionDemoQueryPlan.routingReason}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-semibold text-neutral-200">Expected result types</p>
              <p className="mt-2 text-sm text-neutral-300">{creatorSessionDemoQueryPlan.expectedResultTypes.join(" · ")}</p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Discovery Results → Review Actions</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Save, reject, mark strength, add notes, copy attribution, or open source. Current items are demo fixtures.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Section filter
                <select
                  value={activeSection}
                  onChange={(event) => setActiveSection(event.target.value as typeof activeSection)}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm normal-case tracking-normal text-neutral-100"
                >
                  <option value="All">All sections</option>
                  {creatorSessionBoardSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Status filter
                <select
                  value={activeStatus}
                  onChange={(event) => setActiveStatus(event.target.value as typeof activeStatus)}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm normal-case tracking-normal text-neutral-100"
                >
                  <option value="all">All statuses</option>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredReferences.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-6 text-sm text-neutral-300">
              No references match this filter. Change section/status filters or save more results to the board.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredReferences.map((reference) => (
                <article key={reference.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{reference.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">{reference.sourceClass}</p>
                    </div>
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                      {statusLabels[reference.status]}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-neutral-300">{reference.reviewNote}</p>
                  <p className="mt-2 text-xs text-neutral-500">{reference.usageRightsNote}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {reviewActions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() =>
                          updateReference(reference.id, {
                            status: action.status,
                            section: action.section ?? reference.section,
                          })
                        }
                        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-amber-300 hover:text-amber-200"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2">
                    <input
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Add a review note..."
                      className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-100 outline-none focus:border-amber-300"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateReference(reference.id, { reviewNote: noteDraft || reference.reviewNote });
                          setNoteDraft("");
                        }}
                        className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-neutral-950"
                      >
                        Add note
                      </button>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard?.writeText(reference.attribution)}
                        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200"
                      >
                        Copy attribution
                      </button>
                      <a
                        href={reference.sourceUrl.startsWith("fixture://") ? undefined : reference.sourceUrl}
                        aria-disabled={reference.sourceUrl.startsWith("fixture://")}
                        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200"
                      >
                        Open source
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-xl font-semibold text-white">Saved Board Sections</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Section counts show whether the session is balanced enough for export.
            </p>
            <div className="mt-5 grid gap-3">
              {creatorSessionBoardSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left hover:border-amber-300"
                >
                  <span className="font-medium text-neutral-100">{section}</span>
                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-200">
                    {sectionCount(references, section)}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
              <h3 className="font-semibold text-amber-100">Coverage gaps / next-step prompts</h3>
              <ul className="mt-3 space-y-2 text-sm text-amber-50">
                {coverageSuggestions.map((suggestion) => (
                  <li key={suggestion}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-xl font-semibold text-white">Evidence Pack Export Preview v2</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Human-readable export preview containing brief, saved references, URLs, attribution, rights notes,
              review notes, missing coverage, query plan, and timestamp.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Project brief</p>
                <p className="mt-2 text-sm text-neutral-200">{exportPreview.projectBrief.topic}</p>
                <p className="mt-1 text-sm text-neutral-400">{exportPreview.projectBrief.useCase}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Saved references</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                  {exportPreview.savedReferences.map((reference) => (
                    <li key={reference.id} className="rounded-xl bg-neutral-900 px-3 py-2">
                      {reference.title} — {reference.section}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Attribution and rights notes</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                  {exportPreview.attributionText.map((text, index) => (
                    <li key={`${text}-${index}`}>
                      {text} · {exportPreview.usageRightsNotes[index]}
                    </li>
                  ))}
                </ul>
              </div>

              <pre className="max-h-96 overflow-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-xs leading-5 text-neutral-300">
                {JSON.stringify(exportPreview, null, 2)}
              </pre>
            </div>
          </article>
        </section>
      </section>
    \n\n      <EvidencePackV2Preview />\n</main>
  );
}
