import type { ExportTemplateId, ProjectLibrary, ManualReviewVerdict, ResearchProject, ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { classifySourceDomain, sourceGroupLabel } from "@/lib/result-quality";
import { normalizeManualReview, summarizeManualReviews } from "@/lib/manual-quality-review";
import { buildReviewEvidenceFeedback, reviewEvidenceBiasSummary } from "@/lib/review-evidence-feedback";

function countBy<T extends string>(items: ResearchResult[], getKey: (item: ResearchResult) => T): Record<T, number> {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function projectName(project?: Pick<ResearchProject, "name">): string {
  return project?.name?.trim() || "Visual Research Board";
}

function sectionName(project: Pick<ResearchProject, "board_sections"> | undefined, sectionId?: string): string {
  return project?.board_sections.find((section) => section.id === sectionId)?.name ?? "Unassigned";
}

function sortedBySection(results: ResearchResult[], project?: Pick<ResearchProject, "board_sections">): Array<{ section: string; items: ResearchResult[] }> {
  const sectionOrder = project?.board_sections.map((section) => section.id) ?? [];
  const buckets = new Map<string, ResearchResult[]>();

  results.forEach((result) => {
    const key = result.section_id ?? "unassigned";
    buckets.set(key, [...(buckets.get(key) ?? []), result]);
  });

  const orderedIds = [...sectionOrder, ...Array.from(buckets.keys()).filter((key) => !sectionOrder.includes(key))];
  return orderedIds
    .map((id) => ({ section: sectionName(project, id), items: buckets.get(id) ?? [] }))
    .filter((entry) => entry.items.length > 0);
}

export function createJsonExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "search_history">): string {
  return JSON.stringify(
    {
      export_schema_version: "0.1.0",
      exported_at: new Date().toISOString(),
      project: project ? {
        id: project.id,
        name: project.name,
        section_count: project.board_sections.length,
        search_history_count: project.search_history.length
      } : undefined,
      warning: "License labels are candidates and require manual verification before publication or commercial use.",
      audit: {
        total_items: results.length,
        by_type: countBy(results, (item) => item.type),
        by_provider: countBy(results, (item) => item.provider),
        by_risk: countBy(results, (item) => item.risk_level),
        by_rights_status: countBy(results, (item) => item.rights_status),
        by_source_access_mode: countBy(results, (item) => item.source_access_mode),
        by_reuse_risk: countBy(results, (item) => item.reuse_risk),
        by_license: countBy(results, (item) => item.license_detected),
        by_section: countBy(results, (item) => item.section_id ?? "unassigned"),
        by_source_group: countBy(results, (item) => item.source_group ?? classifySourceDomain(item.source_domain)),
        notes_count: results.filter((item) => Boolean(item.notes?.trim())).length,
        manual_import_count: results.filter((item) => item.provider === "manual").length,
        manual_review_summary: summarizeManualReviews(results),
        duplicate_group_count: results.filter((item) => (item.duplicate_group_size ?? 1) > 1).length,
        metadata_gap_count: results.reduce((total, item) => total + (item.metadata_gaps?.length ?? 0), 0)
      },
      results
    },
    null,
    2
  );
}

export function createMarkdownExport(results: ResearchResult[], project?: Pick<ResearchProject, "name" | "board_sections">): string {
  const lines = [
    `# ${projectName(project)} — Visual Research Board Export`,
    "",
    `Exported at: ${new Date().toISOString()}`,
    "",
    "> License labels are candidates and require manual verification before publication or commercial use.",
    "",
    "## Source Audit",
    "",
    `- Total items: ${results.length}`,
    `- Low-risk candidates: ${results.filter((item) => item.risk_level === "low").length}`,
    `- Reference-only/high-risk/avoid: ${results.filter((item) => ["reference_only", "high", "avoid"].includes(item.risk_level)).length}`,
    `- Manual imports: ${results.filter((item) => item.provider === "manual").length}`,
    `- Items with notes: ${results.filter((item) => Boolean(item.notes?.trim())).length}`,
    ""
  ];

  results.forEach((result, index) => appendDetailedResult(lines, result, index + 1, sectionName(project, result.section_id)));

  return lines.join("\n");
}

function appendDetailedResult(lines: string[], result: ResearchResult, index: number, section: string): void {
  lines.push(`## ${index}. ${result.title}`);
  lines.push("");
  lines.push(`- Section: ${section}`);
  lines.push(`- Type: ${result.type}`);
  lines.push(`- Source: ${result.source_domain}`);
  lines.push(`- URL: ${result.source_url}`);
  lines.push(`- Provider: ${result.provider}`);
  lines.push(`- Source group: ${sourceGroupLabel(result.source_group ?? classifySourceDomain(result.source_domain))}`);
  lines.push(`- License label: ${licenseLabel(result.license_detected)}`);
  lines.push(`- License confidence: ${Math.round(result.license_confidence * 100)}%`);
  if (result.license_url) lines.push(`- License URL: ${result.license_url}`);
  lines.push(`- Risk label: ${riskLabel(result.risk_level)}`);
  lines.push(`- Rights status: ${result.rights_status}`);
  lines.push(`- Source access mode: ${result.source_access_mode}`);
  lines.push(`- Reuse risk: ${result.reuse_risk}`);
  lines.push(`- Canonical source URL: ${result.canonical_source_url ?? result.source_url}`);
  if (result.canonical_image_url) lines.push(`- Canonical image URL: ${result.canonical_image_url}`);
  if ((result.duplicate_group_size ?? 1) > 1) lines.push(`- Duplicate merge: ${result.duplicate_group_size} records; reasons=${result.duplicate_match_reasons?.join(", ") || "unknown"}`);
  if (result.metadata_gaps?.length) lines.push(`- Metadata gaps: ${result.metadata_gaps.join(", ")}`);
  lines.push(`- Overall score: ${Math.round(result.scores.overall * 100)}%`);
  if (result.quality_reasons?.length) lines.push(`- Why this result: ${result.quality_reasons.join(" | ")}`);
  lines.push(`- Tags: ${result.tags.join(", ") || "none"}`);
  if (result.description) lines.push(`- Description: ${result.description}`);
  if (result.notes) lines.push(`- Notes: ${result.notes}`);
  const manualReview = normalizeManualReview(result.manual_review);
  lines.push(`- Manual review: ${manualReview.verdict} · relevance=${manualReview.relevance} · visual=${manualReview.visual_usefulness} · source=${manualReview.source_trust} · license=${manualReview.license_status}`);
  if (manualReview.reviewer_note) lines.push(`- Reviewer note: ${manualReview.reviewer_note}`);
  lines.push(`- Attribution line: ${createSingleAttribution(result)}`);
  lines.push("");
}

export function createSingleAttribution(result: ResearchResult): string {
  const license = licenseLabel(result.license_detected);
  const risk = riskLabel(result.risk_level);
  const licenseUrl = result.license_url ? ` License: ${result.license_url}.` : "";
  return `${result.title} — Source: ${result.source_domain} (${result.source_url}). ${license}; ${risk}.${licenseUrl}`;
}

export function createAttributionExport(results: ResearchResult[], project?: Pick<ResearchProject, "name">): string {
  const lines = [
    `# ${projectName(project)} — Attribution Pack`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "> These attribution lines are drafting aids only. Verify source pages and license terms before publication or commercial use.",
    ""
  ];

  results.forEach((result, index) => {
    lines.push(`## ${index + 1}. ${result.title}`);
    lines.push("");
    lines.push(createSingleAttribution(result));
    if (result.notes) {
      lines.push("");
      lines.push(`Internal note: ${result.notes}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

export function createProductionBriefExport(results: ResearchResult[], project?: Pick<ResearchProject, "name" | "board_sections">): string {
  const lines = [
    `# ${projectName(project)} — Production Brief`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Editorial Warning",
    "",
    "Use this brief as a curation aid. Verify all source pages and licensing terms before publication.",
    "",
    "## Board Summary",
    "",
    `- Saved references: ${results.length}`,
    `- Strong production candidates: ${results.filter((item) => item.scores.production_usefulness >= 0.7).length}`,
    `- Needs legal/source verification: ${results.filter((item) => item.risk_level !== "low").length}`,
    ""
  ];

  sortedBySection(results, project).forEach((group) => {
    lines.push(`## ${group.section}`);
    lines.push("");
    group.items
      .sort((a, b) => b.scores.production_usefulness - a.scores.production_usefulness)
      .forEach((item) => {
        lines.push(`### ${item.title}`);
        lines.push(`- Production usefulness: ${Math.round(item.scores.production_usefulness * 100)}%`);
        lines.push(`- Source/risk: ${item.source_domain} · ${sourceGroupLabel(item.source_group ?? classifySourceDomain(item.source_domain))} · ${riskLabel(item.risk_level)} · ${licenseLabel(item.license_detected)}`);
        if (item.quality_reasons?.length) lines.push(`- Why: ${item.quality_reasons[0]}`);
        lines.push(`- Source URL: ${item.source_url}`);
        if (item.notes) lines.push(`- Production note: ${item.notes}`);
        lines.push("");
      });
  });

  return lines.join("\n");
}

export function createVisualMoodboardExport(results: ResearchResult[], project?: Pick<ResearchProject, "name" | "board_sections">): string {
  const imageResults = results.filter((item) => item.thumbnail_url || item.image_url || item.type === "image");
  const lines = [
    `# ${projectName(project)} — Visual Moodboard`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "> Moodboard export keeps sources attached. It is not a license clearance document.",
    ""
  ];

  sortedBySection(imageResults, project).forEach((group) => {
    lines.push(`## ${group.section}`);
    lines.push("");
    group.items.forEach((item) => {
      lines.push(`### ${item.title}`);
      if (item.thumbnail_url || item.image_url) lines.push(`![${item.title}](${item.thumbnail_url ?? item.image_url})`);
      lines.push(`- Source: ${item.source_url}`);
      lines.push(`- Tags: ${item.tags.join(", ") || "none"}`);
      lines.push(`- Source group: ${sourceGroupLabel(item.source_group ?? classifySourceDomain(item.source_domain))}`);
      lines.push(`- Risk/license: ${riskLabel(item.risk_level)} · ${licenseLabel(item.license_detected)}`);
      if (item.quality_reasons?.length) lines.push(`- Why: ${item.quality_reasons[0]}`);
      if (item.notes) lines.push(`- Note: ${item.notes}`);
      lines.push("");
    });
  });

  return lines.join("\n");
}


export function createQualityReviewExport(results: ResearchResult[], project?: Pick<ResearchProject, "name" | "board_sections">): string {
  const summary = summarizeManualReviews(results);
  const feedback = buildReviewEvidenceFeedback(results);
  const summaryLine = (verdict: ManualReviewVerdict) => `- ${verdict}: ${summary[verdict]}`;
  const lines = [
    `# ${projectName(project)} — Manual Quality Review Evidence`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "> This report captures human review labels for relevance, visual usefulness, source trust, license status, and final curation verdict. It is evidence for editorial review, not legal clearance.",
    "",
    "## Review Summary",
    "",
    summaryLine("approved_reference"),
    summaryLine("use_with_caution"),
    summaryLine("needs_source_check"),
    summaryLine("reject"),
    summaryLine("unreviewed"),
    "",
    "## Review-Evidence Ranking Feedback",
    "",
    `- Feedback summary: ${reviewEvidenceBiasSummary(feedback)}`,
    `- Pass/watch/fail labels: ${feedback.pass_label_count}/${feedback.watch_label_count}/${feedback.fail_label_count}`,
    `- Domain bias entries: ${feedback.domain_bias.length}`,
    `- Source-group bias entries: ${feedback.source_group_bias.length}`,
    `- Provider bias entries: ${feedback.provider_bias.length}`,
    ...(feedback.warnings.length ? ["", "### Feedback warnings", "", ...feedback.warnings.map((warning) => `- ${warning}`)] : []),
    ""
  ];

  sortedBySection(results, project).forEach((group) => {
    lines.push(`## ${group.section}`);
    lines.push("");
    group.items.forEach((item) => {
      const review = normalizeManualReview(item.manual_review);
      lines.push(`### ${item.title}`);
      lines.push(`- Verdict: ${review.verdict}`);
      lines.push(`- Relevance: ${review.relevance}`);
      lines.push(`- Visual usefulness: ${review.visual_usefulness}`);
      lines.push(`- Source trust: ${review.source_trust}`);
      lines.push(`- License status: ${review.license_status}`);
      lines.push(`- Reviewed at: ${review.reviewed_at ?? "not reviewed"}`);
      if (review.reviewer_note) lines.push(`- Reviewer note: ${review.reviewer_note}`);
      lines.push(`- Source: ${item.source_url}`);
      lines.push(`- Provider/source group: ${item.provider} · ${sourceGroupLabel(item.source_group ?? classifySourceDomain(item.source_domain))}`);
      lines.push(`- Risk/license candidate: ${riskLabel(item.risk_level)} · ${licenseLabel(item.license_detected)}`);
      lines.push("");
    });
  });

  return lines.join("\n");
}

export function createTemplateExport(templateId: ExportTemplateId, results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "search_history">): string {
  if (templateId === "production_brief") return createProductionBriefExport(results, project);
  if (templateId === "visual_moodboard") return createVisualMoodboardExport(results, project);
  if (templateId === "attribution_pack") return createAttributionExport(results, project);
  if (templateId === "quality_review") return createQualityReviewExport(results, project);
  return createMarkdownExport(results, project);
}

function csvEscape(value: string | number | undefined): string {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export function createCsvExport(results: ResearchResult[]): string {
  const headers = [
    "title",
    "section_id",
    "type",
    "provider",
    "source_domain",
    "source_group",
    "source_url",
    "canonical_source_url",
    "canonical_image_url",
    "duplicate_group_size",
    "duplicate_match_reasons",
    "metadata_gaps",
    "license_detected",
    "license_confidence",
    "risk_level",
    "rights_status",
    "source_access_mode",
    "reuse_risk",
    "overall_score",
    "production_usefulness",
    "quality_reasons",
    "tags",
    "notes",
    "manual_review_verdict",
    "manual_review_relevance",
    "manual_review_visual_usefulness",
    "manual_review_source_trust",
    "manual_review_license_status",
    "manual_review_note",
    "manual_reviewed_at"
  ];

  const rows = results.map((result) => [
    result.title,
    result.section_id ?? "",
    result.type,
    result.provider,
    result.source_domain,
    result.source_group ?? classifySourceDomain(result.source_domain),
    result.source_url,
    result.canonical_source_url ?? result.source_url,
    result.canonical_image_url ?? "",
    result.duplicate_group_size ?? 1,
    result.duplicate_match_reasons?.join(";") ?? "",
    result.metadata_gaps?.join(";") ?? "",
    result.license_detected,
    Math.round(result.license_confidence * 100),
    result.risk_level,
    result.rights_status,
    result.source_access_mode,
    result.reuse_risk,
    Math.round(result.scores.overall * 100),
    Math.round(result.scores.production_usefulness * 100),
    result.quality_reasons?.join(";") ?? "",
    result.tags.join(";"),
    result.notes ?? "",
    normalizeManualReview(result.manual_review).verdict,
    normalizeManualReview(result.manual_review).relevance,
    normalizeManualReview(result.manual_review).visual_usefulness,
    normalizeManualReview(result.manual_review).source_trust,
    normalizeManualReview(result.manual_review).license_status,
    normalizeManualReview(result.manual_review).reviewer_note ?? "",
    normalizeManualReview(result.manual_review).reviewed_at ?? ""
  ].map(csvEscape).join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function createProjectLibraryExport(library: ProjectLibrary): string {
  return JSON.stringify(
    {
      export_schema_version: "0.1.0",
      exported_at: new Date().toISOString(),
      warning: "Local project-library export. License labels and attribution lines remain candidates requiring manual verification.",
      audit: {
        project_count: library.projects.length,
        active_project_id: library.active_project_id,
        saved_result_count: library.projects.reduce((total, project) => total + project.saved_results.length, 0),
        search_history_count: library.projects.reduce((total, project) => total + project.search_history.length, 0),
        result_snapshot_count: library.projects.reduce((total, project) => total + project.result_snapshots.length, 0)
      },
      library
    },
    null,
    2
  );
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
