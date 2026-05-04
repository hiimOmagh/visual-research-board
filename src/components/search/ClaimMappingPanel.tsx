"use client";

import { useMemo, useState } from "react";
import type { ClaimConfidence, ClaimStatus, ResearchClaim, ResearchProject } from "@/types/research";
import {
  buildClaimMappingAudit,
  CLAIM_CONFIDENCE_OPTIONS,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_OPTIONS
} from "@/lib/claim-mapping";

interface ClaimMappingPanelProps {
  project: ResearchProject;
  onAddClaim: (statement: string) => void;
  onUpdateClaim: (claimId: string, patch: Partial<Pick<ResearchClaim, "statement" | "description" | "confidence" | "status">>) => void;
  onRemoveClaim: (claimId: string) => void;
}

export function ClaimMappingPanel({ project, onAddClaim, onUpdateClaim, onRemoveClaim }: ClaimMappingPanelProps) {
  const [statement, setStatement] = useState("");
  const audit = useMemo(() => buildClaimMappingAudit(project), [project]);

  const submit = () => {
    if (!statement.trim()) return;
    onAddClaim(statement.trim());
    setStatement("");
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-lime-300">Claim-to-source mapping</p>
          <h2 className="mt-1 text-xl font-bold text-white">{audit.claim_count} claim cards · {audit.source_link_count} source links</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            v0.3.3 claim gate: connect saved sources to explicit claims as support, contradiction, context, or visual reference. This prevents the board from becoming a link pile.
          </p>
        </div>
        <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs text-lime-100">
          {audit.linked_claim_count}/{audit.claim_count || 0} linked
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Create a factual claim to test with saved evidence..."
          aria-label="New research claim"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-2xl border border-lime-300/30 px-4 py-3 text-sm font-semibold text-lime-100 hover:border-lime-300/70"
        >
          Add claim
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-[11px] text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
        <span className="rounded-xl bg-white/5 px-3 py-2">Supported: {audit.supported_claim_count}</span>
        <span className="rounded-xl bg-white/5 px-3 py-2">Contested: {audit.contested_claim_count}</span>
        <span className="rounded-xl bg-white/5 px-3 py-2">Needs verification: {audit.needs_verification_claim_count}</span>
        <span className="rounded-xl bg-white/5 px-3 py-2">Unlinked sources: {audit.unlinked_saved_count}</span>
      </div>

      {audit.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-50">Claim mapping warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {audit.warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {project.claims.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
            No claims yet. Add a claim, then attach saved sources from the right-side saved-board cards.
          </div>
        ) : (
          project.claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onUpdateClaim={onUpdateClaim} onRemoveClaim={onRemoveClaim} />
          ))
        )}
      </div>
    </section>
  );
}

function ClaimCard({
  claim,
  onUpdateClaim,
  onRemoveClaim
}: {
  claim: ResearchClaim;
  onUpdateClaim: (claimId: string, patch: Partial<Pick<ResearchClaim, "statement" | "description" | "confidence" | "status">>) => void;
  onRemoveClaim: (claimId: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Claim statement</span>
          <input
            value={claim.statement}
            onChange={(event) => onUpdateClaim(claim.id, { statement: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-lime-300/40 focus:ring-4"
          />
        </label>
        <button
          type="button"
          onClick={() => onRemoveClaim(claim.id)}
          className="rounded-xl border border-red-300/20 px-3 py-2 text-xs text-red-100 hover:border-red-300/50"
        >
          Delete
        </button>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Description / falsifier note</span>
        <textarea
          value={claim.description ?? ""}
          onChange={(event) => onUpdateClaim(claim.id, { description: event.target.value })}
          rows={2}
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100 outline-none ring-lime-300/40 placeholder:text-slate-600 focus:ring-4"
          placeholder="Scope, uncertainty, or disproven-if condition..."
        />
      </label>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-400">Status</span>
          <select
            value={claim.status}
            onChange={(event) => onUpdateClaim(claim.id, { status: event.target.value as ClaimStatus })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-lime-300/40 focus:ring-4"
          >
            {CLAIM_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-400">Confidence</span>
          <select
            value={claim.confidence}
            onChange={(event) => onUpdateClaim(claim.id, { confidence: event.target.value as ClaimConfidence })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none ring-lime-300/40 focus:ring-4"
          >
            {CLAIM_CONFIDENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
          <span className="block text-[11px] text-slate-500">Evidence links</span>
          <span className="font-semibold text-white">{claim.source_links.length}</span> · {CLAIM_STATUS_LABELS[claim.status]}
        </div>
      </div>

      {claim.source_links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
          {claim.source_links.map((link) => (
            <span key={`${claim.id}-${link.result_id}`} className="rounded-full bg-white/5 px-2 py-1">
              {link.relation}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
