"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Short uppercase eyebrow shown above the title (optional). */
  eyebrow?: string;
  /** Main one-line title describing what's empty. */
  title: string;
  /** Helpful 1–2 sentence body that tells the user what to do next. */
  description?: string;
  /** Optional action element (button, link, etc.). */
  action?: ReactNode;
  /** Visual variant. "subtle" sits inside other panels, "panel" stands alone. */
  variant?: "subtle" | "panel";
}

/**
 * Reusable empty-state block.
 *
 * Empty states should never trap workflow: they always describe what's empty,
 * what to do, and (when meaningful) provide a way to proceed without leaving
 * the page. The component renders as a region with an accessible name so
 * screen readers can navigate to it.
 */
export function EmptyState({ eyebrow, title, description, action, variant = "panel" }: EmptyStateProps) {
  const baseClass =
    variant === "subtle"
      ? "rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-slate-300"
      : "rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-slate-300";

  return (
    <section className={baseClass} role="region" aria-label={title}>
      {eyebrow && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </section>
  );
}
