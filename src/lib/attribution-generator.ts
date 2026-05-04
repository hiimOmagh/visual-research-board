import type {
  AttributionAudit,
  AttributionClearance,
  AttributionEntry,
  AttributionFormat,
  ResearchProject,
  ResearchResult
} from "@/types/research";
import { normalizeManualReview } from "@/lib/manual-quality-review";
import { licenseLabel, riskLabel } from "@/lib/risk";

export const ATTRIBUTION_SCHEMA_VERSION = "0.4.1" as const;

export const ATTRIBUTION_FORMAT_LABELS: Record<AttributionFormat, string> = {
  simple: "Simple attribution",
  creator_title_source_license: "Creator / title / source / license",
  markdown_citation: "Markdown citation block",
  video_description: "Video description block",
  article_source_list: "Article source list",
  rough_bibliography: "Rough bibliography entry"
};

export const ATTRIBUTION_CLEARANCE_LABELS: Record<AttributionClearance, string> = {
  attribution_ready_candidate: "Attribution-ready candidate",
  verify_before_use: "Verify before use",
  reference_only: "Reference only",
  do_not_use: "Do not use"
};

function projectName(project?: Pick<ResearchProject, "name">): string {
  return project?.name?.trim() || "Visual Research Board";
}

function sourceTitle(result: ResearchResult): string {
  return result.title?.trim() || result.source_domain || result.source_url;
}

function creatorLabel(_result: ResearchResult): string {
  return "Creator not captured";
}

function sourceDateLabel(result: ResearchResult): string {
  const collectedYear = result.collected_at ? new Date(result.collected_at).getUTCFullYear() : undefined;
  return Number.isFinite(collectedYear) ? String(collectedYear) : "n.d.";
}

export function inferAttributionClearance(result: ResearchResult): AttributionClearance {
  const review = normalizeManualReview(result.manual_review);
  if (review.verdict === "reject" || result.risk_level === "avoid" || result.rights_status === "restricted") return "do_not_use";
  if (result.rights_status === "reference_only" || result.risk_level === "reference_only") return "reference_only";
  if (
    ["public_domain", "open_license", "likely_reusable"].includes(result.rights_status) &&
    result.reuse_risk === "low" &&
    result.risk_level === "low" &&
    result.license_detected !== "unknown" &&
    result.license_detected !== "unclear" &&
    review.verdict !== "needs_source_check"
  ) return "attribution_ready_candidate";
  return "verify_before_use";
}

export function attributionWarnings(result: ResearchResult): string[] {
  const review = normalizeManualReview(result.manual_review);
  return [
    result.license_detected === "unknown" || result.license_detected === "unclear" ? "License is unknown or unclear; verify the original source page before reuse." : "",
    !result.license_url && ["public_domain", "creative_commons"].includes(result.license_detected) ? "License URL is missing; attribution cannot be considered complete." : "",
    result.rights_status === "check_required" || result.rights_status === "unknown" ? "Rights status requires manual verification." : "",
    result.rights_status === "reference_only" ? "Reference-only item; use as research lead, not as publishable media." : "",
    result.rights_status === "restricted" || result.risk_level === "avoid" ? "Restricted/rejected item; do not reuse without explicit clearance." : "",
    result.source_access_mode === "manual_reference_only" ? "Imported from a manual/reference workflow; verify rights at the final source." : "",
    result.reuse_risk !== "low" ? `Reuse risk is ${result.reuse_risk}.` : "",
    (result.metadata_gaps?.length ?? 0) > 0 ? `Metadata gaps: ${result.metadata_gaps?.join(", ")}.` : "",
    review.verdict === "needs_source_check" ? "Manual review requested source/license verification." : "",
    review.verdict === "use_with_caution" ? "Manual review marked this item for cautious use." : "",
    review.verdict === "reject" ? "Manual review rejected this item." : ""
  ].filter(Boolean);
}

function licenseText(result: ResearchResult): string {
  const label = licenseLabel(result.license_detected);
  return result.license_url ? `${label} (${result.license_url})` : label;
}

function clearanceSuffix(result: ResearchResult): string {
  const clearance = ATTRIBUTION_CLEARANCE_LABELS[inferAttributionClearance(result)];
  return `Clearance: ${clearance}. Rights: ${result.rights_status}. Reuse risk: ${result.reuse_risk}.`;
}

export function createAttributionText(result: ResearchResult, format: AttributionFormat = "simple"): string {
  const title = sourceTitle(result);
  const creator = creatorLabel(result);
  const license = licenseText(result);
  const risk = riskLabel(result.risk_level);
  const source = `${result.source_domain} (${result.source_url})`;

  if (format === "creator_title_source_license") {
    return `${creator}. “${title}.” Source: ${source}. License/status: ${license}. ${clearanceSuffix(result)}`;
  }

  if (format === "markdown_citation") {
    const licensePart = result.license_url ? `[${licenseLabel(result.license_detected)}](${result.license_url})` : licenseLabel(result.license_detected);
    return `**${title}** — ${creator}. Source: [${result.source_domain}](${result.source_url}). License/status: ${licensePart}. ${clearanceSuffix(result)}`;
  }

  if (format === "video_description") {
    return `${title} — ${result.source_domain}: ${result.source_url} — License/status: ${license}. ${clearanceSuffix(result)}`;
  }

  if (format === "article_source_list") {
    return `${title}. ${result.source_domain}. ${result.source_url}. License/status: ${license}. ${clearanceSuffix(result)}`;
  }

  if (format === "rough_bibliography") {
    return `${creator}. “${title}.” ${result.source_domain}, ${sourceDateLabel(result)}. ${result.source_url}. License/status: ${license}. ${risk}.`;
  }

  return `${title} — Source: ${source}. ${license}; ${risk}. ${clearanceSuffix(result)}`;
}

export function buildAttributionEntry(result: ResearchResult, format: AttributionFormat = "simple"): AttributionEntry {
  const clearance = inferAttributionClearance(result);
  const text = createAttributionText(result, format);
  return {
    schema_version: ATTRIBUTION_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    result_id: result.id,
    title: sourceTitle(result),
    format,
    format_label: ATTRIBUTION_FORMAT_LABELS[format],
    text,
    markdown: format === "markdown_citation" ? text : createAttributionText(result, "markdown_citation"),
    creator: creatorLabel(result),
    source_domain: result.source_domain,
    source_url: result.source_url,
    image_url: result.image_url,
    license_label: licenseLabel(result.license_detected),
    license_url: result.license_url,
    rights_status: result.rights_status,
    reuse_risk: result.reuse_risk,
    risk_level: result.risk_level,
    source_access_mode: result.source_access_mode,
    clearance,
    clearance_label: ATTRIBUTION_CLEARANCE_LABELS[clearance],
    warnings: attributionWarnings(result)
  };
}

export function buildAttributionAudit(results: ResearchResult[]): AttributionAudit {
  const entries = results.map((result) => buildAttributionEntry(result));
  const count = (clearance: AttributionClearance) => entries.filter((entry) => entry.clearance === clearance).length;
  const unknownLicenseCount = results.filter((item) => item.license_detected === "unknown" || item.license_detected === "unclear").length;
  const missingLicenseUrlCount = results.filter((item) => ["public_domain", "creative_commons"].includes(item.license_detected) && !item.license_url).length;
  const warningCount = entries.reduce((total, entry) => total + entry.warnings.length, 0);

  return {
    schema_version: ATTRIBUTION_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    total_items: results.length,
    attribution_ready_candidate_count: count("attribution_ready_candidate"),
    verify_before_use_count: count("verify_before_use"),
    reference_only_count: count("reference_only"),
    do_not_use_count: count("do_not_use"),
    unknown_license_count: unknownLicenseCount,
    missing_license_url_count: missingLicenseUrlCount,
    warning_count: warningCount,
    warnings: [
      results.length === 0 ? "No saved items available for attribution." : "",
      unknownLicenseCount > 0 ? "Some items have unknown or unclear license metadata." : "",
      missingLicenseUrlCount > 0 ? "Some public-domain/Creative-Commons candidates are missing license URLs." : "",
      count("reference_only") > 0 ? "Reference-only items are present; keep them separate from publishable media." : "",
      count("do_not_use") > 0 ? "Restricted/rejected items are present; do not reuse without explicit clearance." : ""
    ].filter(Boolean)
  };
}

export function buildAttributionPackPayload(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name">, format: AttributionFormat = "simple") {
  const entries = results.map((result) => buildAttributionEntry(result, format));
  return {
    export_schema_version: ATTRIBUTION_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    export_type: "attribution_generator_v1",
    project: project ? { id: project.id, name: project.name } : undefined,
    format,
    format_label: ATTRIBUTION_FORMAT_LABELS[format],
    warning: "Attribution text is a drafting aid, not legal clearance. Verify creator, source page, image file, license terms, and publication context before reuse.",
    audit: buildAttributionAudit(results),
    entries
  };
}

export function createAttributionJsonExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name">, format: AttributionFormat = "simple"): string {
  return JSON.stringify(buildAttributionPackPayload(results, project, format), null, 2);
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createAttributionCsvExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name">, format: AttributionFormat = "simple"): string {
  const rows = [
    [
      "title",
      "format",
      "clearance",
      "source_domain",
      "source_url",
      "image_url",
      "license_label",
      "license_url",
      "rights_status",
      "reuse_risk",
      "risk_level",
      "source_access_mode",
      "warnings",
      "attribution_text"
    ]
  ];
  results.map((result) => buildAttributionEntry(result, format)).forEach((entry) => {
    rows.push([
      entry.title,
      entry.format,
      entry.clearance,
      entry.source_domain,
      entry.source_url,
      entry.image_url ?? "",
      entry.license_label,
      entry.license_url ?? "",
      entry.rights_status,
      entry.reuse_risk,
      entry.risk_level,
      entry.source_access_mode,
      entry.warnings.join(" | "),
      entry.text
    ]);
  });
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function createAttributionMarkdownExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name">, format: AttributionFormat = "simple"): string {
  const payload = buildAttributionPackPayload(results, project, format);
  const lines = [
    `# ${projectName(project)} — Attribution Generator v1`,
    "",
    `Generated at: ${payload.exported_at}`,
    `Format: ${payload.format_label}`,
    "",
    "> Attribution text is a drafting aid, not legal clearance. Verify creator, source page, image file, license terms, and publication context before reuse.",
    "",
    "## Attribution Audit",
    "",
    `- Total items: ${payload.audit.total_items}`,
    `- Attribution-ready candidates: ${payload.audit.attribution_ready_candidate_count}`,
    `- Verify before use: ${payload.audit.verify_before_use_count}`,
    `- Reference only: ${payload.audit.reference_only_count}`,
    `- Do not use: ${payload.audit.do_not_use_count}`,
    `- Unknown/unclear license: ${payload.audit.unknown_license_count}`,
    `- Missing license URL: ${payload.audit.missing_license_url_count}`,
    `- Warning count: ${payload.audit.warning_count}`,
    ""
  ];

  if (payload.audit.warnings.length) lines.push("## Pack Warnings", "", ...payload.audit.warnings.map((warning) => `- ${warning}`), "");

  payload.entries.forEach((entry, index) => {
    lines.push(`## ${index + 1}. ${entry.title}`);
    lines.push("");
    lines.push(`**Clearance:** ${entry.clearance_label}`);
    lines.push(`**Source:** ${entry.source_domain} — ${entry.source_url}`);
    lines.push(`**Rights/risk:** ${entry.rights_status} · ${entry.reuse_risk} · ${entry.risk_level}`);
    lines.push(`**License/status:** ${entry.license_label}${entry.license_url ? ` — ${entry.license_url}` : ""}`);
    lines.push("");
    lines.push("```text");
    lines.push(entry.text);
    lines.push("```");
    if (entry.warnings.length) lines.push("", "Warnings:", ...entry.warnings.map((warning) => `- ${warning}`));
    lines.push("");
  });

  return lines.join("\n");
}

export function createMultiFormatAttributionMarkdownExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name">): string {
  const formats: AttributionFormat[] = [
    "simple",
    "creator_title_source_license",
    "markdown_citation",
    "video_description",
    "article_source_list",
    "rough_bibliography"
  ];
  const audit = buildAttributionAudit(results);
  const lines = [
    `# ${projectName(project)} — Attribution Generator v1`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "> Multi-format attribution draft. This does not grant reuse rights or replace source/license verification.",
    "",
    "## Audit",
    "",
    `- Total items: ${audit.total_items}`,
    `- Attribution-ready candidates: ${audit.attribution_ready_candidate_count}`,
    `- Verify before use: ${audit.verify_before_use_count}`,
    `- Reference only: ${audit.reference_only_count}`,
    `- Do not use: ${audit.do_not_use_count}`,
    ""
  ];

  results.forEach((result, index) => {
    const baseEntry = buildAttributionEntry(result);
    lines.push(`## ${index + 1}. ${baseEntry.title}`);
    lines.push(`- Clearance: ${baseEntry.clearance_label}`);
    lines.push(`- Source: ${baseEntry.source_domain} — ${baseEntry.source_url}`);
    lines.push(`- License/status: ${baseEntry.license_label}${baseEntry.license_url ? ` — ${baseEntry.license_url}` : ""}`);
    if (baseEntry.warnings.length) lines.push(`- Warnings: ${baseEntry.warnings.join(" | ")}`);
    lines.push("");
    formats.forEach((format) => {
      lines.push(`### ${ATTRIBUTION_FORMAT_LABELS[format]}`);
      lines.push("```text");
      lines.push(createAttributionText(result, format));
      lines.push("```", "");
    });
  });

  return lines.join("\n");
}
