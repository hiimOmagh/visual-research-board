"use client";

import { useMemo, useState } from "react";
import {
  buildCarthageDemoEvidencePackV2,
  buildEvidencePackV2,
  buildEvidencePackV2Markdown,
  toEvidencePackV2Json,
  type EvidencePackV2,
} from "@/lib/evidence-pack-v2";

const downloadTextFile = (filename: string, content: string, type: string) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const copyText = (content: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  void navigator.clipboard.writeText(content);
};

const createEmptyPack = (): EvidencePackV2 =>
  buildEvidencePackV2({
    timestamp: new Date().toISOString(),
    mode: "local_creator_session",
    missing_coverage: [
      "No saved references yet. Save or review references before using this export as a production handoff.",
    ],
  });

export function EvidencePackV2Preview() {
  const [pack, setPack] = useState<EvidencePackV2>(() =>
    buildCarthageDemoEvidencePackV2({ timestamp: new Date().toISOString() }),
  );

  const markdown = useMemo(() => buildEvidencePackV2Markdown(pack), [pack]);
  const json = useMemo(() => toEvidencePackV2Json(pack), [pack]);

  return (
    <section
      data-testid="evidence-pack-v2-preview"
      className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Evidence Pack Export v2</p>
          <h2 className="text-xl font-semibold text-neutral-100">Usable creator output</h2>
          <p className="mt-1 max-w-3xl text-sm text-neutral-400">
            Export a local-first creator deliverable containing the project brief, query plan, saved references,
            source URLs, attribution text, usage/rights notes, review notes, missing coverage, and a timestamp.
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Fixture/demo mode disclosure is included when demo references are loaded. Do not present fixture entries
          as live retrieval evidence.
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
          <h3 className="text-sm font-semibold text-neutral-100">Project brief</h3>
          <dl className="mt-2 space-y-1 text-xs text-neutral-300">
            <div>
              <dt className="inline text-neutral-500">Topic: </dt>
              <dd className="inline">{pack.project_brief.topic}</dd>
            </div>
            <div>
              <dt className="inline text-neutral-500">Use case: </dt>
              <dd className="inline">{pack.project_brief.use_case}</dd>
            </div>
            <div>
              <dt className="inline text-neutral-500">Visual style: </dt>
              <dd className="inline">{pack.project_brief.visual_style}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
          <h3 className="text-sm font-semibold text-neutral-100">Query plan</h3>
          <p className="mt-2 text-xs text-neutral-300">{pack.query_plan.primary_query}</p>
          <p className="mt-1 text-xs text-neutral-500">{pack.query_plan.reason_for_routing}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
        <h3 className="text-sm font-semibold text-neutral-100">Saved references by board section</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {Object.entries(pack.saved_references_by_section).map(([section, references]) => (
            <div key={section} className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
              <h4 className="text-xs font-semibold text-neutral-200">{section}</h4>
              {references.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500">No saved references in this section.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {references.map((reference) => (
                    <li key={reference.id} className="text-xs text-neutral-300">
                      <span className="font-medium text-neutral-100">{reference.title}</span>
                      <br />
                      <span className="text-neutral-500">{reference.review_note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
          <h3 className="text-sm font-semibold text-neutral-100">Missing coverage</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-neutral-300">
            {pack.missing_coverage.length > 0 ? (
              pack.missing_coverage.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No missing coverage recorded.</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
          <h3 className="text-sm font-semibold text-neutral-100">Review notes</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-neutral-300">
            {pack.review_notes.length > 0 ? (
              pack.review_notes.slice(0, 5).map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No review notes recorded.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Evidence Pack v2 export actions">
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => copyText(markdown)}
        >
          Copy Markdown
        </button>
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => copyText(json)}
        >
          Copy JSON
        </button>
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => downloadTextFile("evidence-pack-v2.json", json, "application/json")}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => downloadTextFile("evidence-pack-v2.md", markdown, "text/markdown")}
        >
          Download Markdown
        </button>
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => setPack(createEmptyPack())}
        >
          Reset export preview
        </button>
        <button
          type="button"
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:bg-neutral-800"
          onClick={() => setPack(buildCarthageDemoEvidencePackV2({ timestamp: new Date().toISOString() }))}
        >
          Load Carthage demo
        </button>
      </div>

      <details className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-neutral-100">Export Pack Preview</summary>
        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-xs text-neutral-300">
          {markdown}
        </pre>
      </details>
    </section>
  );
}

export default EvidencePackV2Preview;
