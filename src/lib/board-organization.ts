import type { BoardOrganizationAudit, BoardSection, BoardSectionKind, ResearchProject, ResearchResult } from "@/types/research";
import { normalizeManualReview } from "@/lib/manual-quality-review";

export const INBOX_SECTION_ID = "section_inbox";
export const BACKGROUND_SECTION_ID = "section_background";
export const PRIMARY_EVIDENCE_SECTION_ID = "section_primary_evidence";
export const COUNTER_EVIDENCE_SECTION_ID = "section_counter_evidence";
export const VISUAL_REFERENCE_SECTION_ID = "section_visual_reference";
export const PUBLIC_DOMAIN_SECTION_ID = "section_public_domain";
export const CHECK_REQUIRED_SECTION_ID = "section_check_required";
export const REJECTED_SECTION_ID = "section_rejected";

export const DEFAULT_BOARD_TAGS = [
  "map",
  "photo",
  "archive",
  "document",
  "artwork",
  "screenshot-reference",
  "public-domain",
  "check-rights",
  "counter-evidence",
  "background",
  "thumbnail",
  "uncertain"
] as const;

export const BOARD_SECTION_KIND_LABELS: Record<BoardSectionKind, string> = {
  inbox: "Inbox",
  background: "Background",
  primary_evidence: "Primary evidence",
  counter_evidence: "Counter-evidence",
  visual_reference: "Visual reference",
  public_domain_candidate: "Public-domain candidate",
  check_required: "Check required",
  rejected: "Rejected",
  custom: "Custom"
};

export function createDefaultBoardSections(createdAt = new Date().toISOString()): BoardSection[] {
  return [
    {
      id: INBOX_SECTION_ID,
      name: "Inbox",
      kind: "inbox",
      description: "Temporary holding area for newly saved references before triage.",
      created_at: createdAt,
      export_priority: 10
    },
    {
      id: BACKGROUND_SECTION_ID,
      name: "Background / context",
      kind: "background",
      description: "Contextual sources that explain the topic but are not the main evidence.",
      created_at: createdAt,
      export_priority: 20
    },
    {
      id: PRIMARY_EVIDENCE_SECTION_ID,
      name: "Primary evidence",
      kind: "primary_evidence",
      description: "Main sources or visuals that directly support the research output.",
      created_at: createdAt,
      export_priority: 30
    },
    {
      id: COUNTER_EVIDENCE_SECTION_ID,
      name: "Counter-evidence",
      kind: "counter_evidence",
      description: "Sources that weaken, complicate, or contradict the current narrative.",
      created_at: createdAt,
      export_priority: 40
    },
    {
      id: VISUAL_REFERENCE_SECTION_ID,
      name: "Visual references",
      kind: "visual_reference",
      description: "Composition, style, framing, thumbnail, or reference-only image leads.",
      created_at: createdAt,
      export_priority: 50
    },
    {
      id: PUBLIC_DOMAIN_SECTION_ID,
      name: "Public-domain / open-license candidates",
      kind: "public_domain_candidate",
      description: "Candidates that look reusable, pending manual source-page verification.",
      created_at: createdAt,
      export_priority: 60
    },
    {
      id: CHECK_REQUIRED_SECTION_ID,
      name: "Check-required",
      kind: "check_required",
      description: "Useful material that needs source, license, or provenance verification.",
      created_at: createdAt,
      export_priority: 70
    },
    {
      id: REJECTED_SECTION_ID,
      name: "Rejected / do not use",
      kind: "rejected",
      description: "Weak, risky, irrelevant, duplicate, or explicitly rejected references.",
      created_at: createdAt,
      export_priority: 80
    }
  ];
}

export function normalizeBoardSections(sections: BoardSection[] | undefined): BoardSection[] {
  const defaults = createDefaultBoardSections();
  const byId = new Map<string, BoardSection>();

  for (const section of defaults) byId.set(section.id, section);

  for (const section of sections ?? []) {
    if (!section?.id || !section.name) continue;
    const existing = byId.get(section.id);
    byId.set(section.id, {
      ...existing,
      ...section,
      kind: section.kind ?? existing?.kind ?? "custom",
      description: section.description ?? existing?.description,
      created_at: section.created_at ?? existing?.created_at ?? new Date().toISOString(),
      export_priority: section.export_priority ?? existing?.export_priority ?? 100
    });
  }

  return Array.from(byId.values()).sort((a, b) => (a.export_priority ?? 100) - (b.export_priority ?? 100));
}

export function normalizeBoardTags(input: string | string[] | undefined): string[] {
  const raw = Array.isArray(input) ? input.join(",") : input ?? "";
  const tags = raw
    .split(/[;,]/g)
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    .map((tag) => tag.replace(/[^a-z0-9\-_/]/g, ""))
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(tags)).slice(0, 16);
}

export function toggleBoardTag(tags: string[], tag: string): string[] {
  const normalizedTag = normalizeBoardTags([tag])[0];
  if (!normalizedTag) return normalizeBoardTags(tags);
  const current = normalizeBoardTags(tags);
  return current.includes(normalizedTag)
    ? current.filter((entry) => entry !== normalizedTag)
    : [...current, normalizedTag].slice(0, 16);
}

export function formatBoardTag(tag: string): string {
  return tag.replace(/[\-_]/g, " ");
}

export function suggestSectionForResult(result: ResearchResult): string {
  const review = normalizeManualReview(result.manual_review);
  const tags = normalizeBoardTags(result.tags);
  if (review.verdict === "reject" || result.risk_level === "avoid" || result.rights_status === "restricted") return REJECTED_SECTION_ID;
  if (review.verdict === "needs_source_check" || result.rights_status === "check_required" || result.rights_status === "unknown" || result.reuse_risk === "high") return CHECK_REQUIRED_SECTION_ID;
  if (result.rights_status === "public_domain" || result.rights_status === "open_license" || tags.includes("public-domain")) return PUBLIC_DOMAIN_SECTION_ID;
  if (tags.includes("counter-evidence")) return COUNTER_EVIDENCE_SECTION_ID;
  if (tags.includes("background") || result.type === "web" || result.type === "news") return BACKGROUND_SECTION_ID;
  if (result.rights_status === "reference_only" || tags.includes("thumbnail") || tags.includes("screenshot-reference")) return VISUAL_REFERENCE_SECTION_ID;
  if (review.verdict === "approved_reference" || result.scores.source_credibility >= 0.75) return PRIMARY_EVIDENCE_SECTION_ID;
  return INBOX_SECTION_ID;
}

function countBy<T extends string>(items: ResearchResult[], getKey: (item: ResearchResult) => T): Record<T, number> {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export function buildBoardOrganizationAudit(project: Pick<ResearchProject, "board_sections" | "saved_results">): BoardOrganizationAudit {
  const sections = normalizeBoardSections(project.board_sections);
  const knownSectionIds = new Set(sections.map((section) => section.id));
  const saved = project.saved_results ?? [];
  const warnings: string[] = [];
  const unassignedCount = saved.filter((item) => !item.section_id || !knownSectionIds.has(item.section_id)).length;
  const taggedCount = saved.filter((item) => normalizeBoardTags(item.tags).length > 0).length;
  const notesCount = saved.filter((item) => Boolean(item.notes?.trim())).length;
  const reviewedCount = saved.filter((item) => normalizeManualReview(item.manual_review).verdict !== "unreviewed").length;
  const rejectedCount = saved.filter((item) => item.section_id === REJECTED_SECTION_ID || normalizeManualReview(item.manual_review).verdict === "reject").length;
  const checkRequiredCount = saved.filter((item) => item.section_id === CHECK_REQUIRED_SECTION_ID || item.rights_status === "check_required" || item.rights_status === "unknown").length;
  const referenceOnlyCount = saved.filter((item) => item.rights_status === "reference_only" || item.risk_level === "reference_only").length;
  const populatedSectionCount = sections.filter((section) => saved.some((item) => item.section_id === section.id)).length;
  const tagCounts: Record<string, number> = {};
  for (const item of saved) {
    for (const tag of normalizeBoardTags(item.tags)) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }

  if (unassignedCount > 0) warnings.push(`${unassignedCount} saved item(s) point to a missing or empty section id.`);
  if (saved.length > 0 && taggedCount / saved.length < 0.35) warnings.push("Tag coverage is low; add tags such as map, archive, photo, document, public-domain, or check-rights.");
  if (saved.length > 0 && notesCount / saved.length < 0.25) warnings.push("Few items have notes; add usage, verification, or production notes before export.");
  if (referenceOnlyCount > saved.length * 0.5) warnings.push("More than half of saved items are reference-only; separate them from reusable candidates before publication.");
  if (checkRequiredCount > 0) warnings.push(`${checkRequiredCount} item(s) still require source/license verification.`);

  return {
    schema_version: "0.3.2",
    generated_at: new Date().toISOString(),
    total_saved_count: saved.length,
    section_count: sections.length,
    populated_section_count: populatedSectionCount,
    unassigned_count: unassignedCount,
    notes_count: notesCount,
    tagged_count: taggedCount,
    manual_reviewed_count: reviewedCount,
    rejected_count: rejectedCount,
    check_required_count: checkRequiredCount,
    reference_only_count: referenceOnlyCount,
    section_counts: countBy(saved, (item) => item.section_id && knownSectionIds.has(item.section_id) ? item.section_id : "unassigned"),
    tag_counts: tagCounts,
    warnings
  };
}
