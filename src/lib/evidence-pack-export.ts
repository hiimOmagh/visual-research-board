import type { EvidencePackAudit, EvidencePackBucketId, EvidencePackItem, ResearchProject, ResearchResult } from "@/types/research";
import { BOARD_SECTION_KIND_LABELS, buildBoardOrganizationAudit } from "@/lib/board-organization";
import { buildClaimMappingAudit, CLAIM_RELATION_LABELS, CLAIM_STATUS_LABELS, normalizeResearchClaims } from "@/lib/claim-mapping";
import { buildCoverageBiasAudit } from "@/lib/coverage-bias-audit";
import { normalizeManualReview } from "@/lib/manual-quality-review";
import { licenseLabel, riskLabel } from "@/lib/risk";
import { createAttributionText } from "@/lib/attribution-generator";
import { classifySourceDomain, sourceGroupLabel } from "@/lib/result-quality";

export const EVIDENCE_PACK_SCHEMA_VERSION = "0.4.1" as const;

const BUCKET_LABELS: Record<EvidencePackBucketId, string> = { reusable: "Reusable / likely safe candidates",
  check_required: "Check required before use",
  reference_only: "Reference-only discovery leads",
  restricted_or_rejected: "Restricted, rejected, or avoid" };

const BUCKET_DESCRIPTIONS: Record<EvidencePackBucketId, string> = { reusable: "Items with low reuse risk and public-domain, open-license, or likely-reusable metadata. Still verify the source page before publication.",
  check_required: "Items that may be useful but require source, rights, metadata, or editorial verification.",
  reference_only: "Items discovered for inspiration or lead generation. Do not publish, embed, or redistribute without independent rights clearance.",
  restricted_or_rejected: "Items with restricted rights, high risk, avoid status, or explicit manual rejection. Keep for audit trail only." };

function projectName(project?: Pick<ResearchProject, "name">): string { return project?.name?.trim() || "Visual Research Board"; }

function sectionName(project: Pick<ResearchProject, "board_sections"> | undefined, sectionId?: string): string { return project?.board_sections.find((section) => section.id === sectionId)?.name ?? "Unassigned"; }

function sectionKind(project: Pick<ResearchProject, "board_sections"> | undefined, sectionId?: string): string { const kind = project?.board_sections.find((section) => section.id === sectionId)?.kind ?? "custom";
  return BOARD_SECTION_KIND_LABELS[kind]; }

function escapeHtml(value: string): string { return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;"); }

function csvEscape(value: string | number | undefined): string { const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw; }

export function classifyEvidencePackBucket(result: ResearchResult): EvidencePackBucketId { const review = normalizeManualReview(result.manual_review);
  if (
    review.verdict === "reject" ||
    result.rights_status === "restricted" ||
    result.risk_level === "avoid" ||
    result.risk_level === "high" ||
    result.reuse_risk === "high"
  ) return "restricted_or_rejected";

  if (result.rights_status === "reference_only" || result.risk_level === "reference_only") return "reference_only";

  if (
    result.rights_status === "public_domain" ||
    result.rights_status === "open_license" ||
    result.rights_status === "likely_reusable"
  ) { if (
      result.reuse_risk === "low" &&
      result.risk_level === "low" &&
      review.verdict !== "needs_source_check" &&
      (result.metadata_gaps?.length ?? 0) === 0
    ) return "reusable"; }

  return "check_required"; }

function itemWarnings(result: ResearchResult, bucket: EvidencePackBucketId): string[] { const review = normalizeManualReview(result.manual_review);
  return [
    bucket === "reference_only" ? "Reference-only: verify rights before any reuse." : "",
    bucket === "restricted_or_rejected" ? "Do not use without explicit clearance or reversal of rejection." : "",
    result.license_detected === "unknown" || result.license_detected === "unclear" ? "License is unclear." : "",
    result.rights_status === "unknown" || result.rights_status === "check_required" ? "Rights status needs manual verification." : "",
    (result.metadata_gaps?.length ?? 0) > 0 ? `Metadata gaps: ${result.metadata_gaps?.join(", ")}.` : "",
    review.verdict === "needs_source_check" ? "Manual review requested a source check." : "",
    review.verdict === "use_with_caution" ? "Manual review marked use with caution." : "",
    review.verdict === "reject" ? "Manual review rejected this item." : ""
  ].filter(Boolean); }

export function buildEvidencePackItem(result: ResearchResult, project?: Pick<ResearchProject, "board_sections" | "claims" | "saved_results">): EvidencePackItem { const bucket = classifyEvidencePackBucket(result);
  const claims = normalizeResearchClaims(project?.claims, project?.saved_results ?? []);
  const linkedClaims = claims.flatMap((claim) =>
    claim.source_links
      .filter((link) => link.result_id === result.id)
      .map((link) => ({ claim_id: claim.id,
        statement: claim.statement,
        relation: link.relation,
        relation_label: CLAIM_RELATION_LABELS[link.relation],
        note: link.note }))
  );

  return { id: result.id,
    bucket,
    bucket_label: BUCKET_LABELS[bucket],
    title: result.title,
    source_url: result.source_url,
    source_domain: result.source_domain,
    image_url: result.image_url,
    thumbnail_url: result.thumbnail_url,
    provider: result.provider,
    source_group: result.source_group ?? classifySourceDomain(result.source_domain),
    source_group_label: sourceGroupLabel(result.source_group ?? classifySourceDomain(result.source_domain)),
    section_id: result.section_id,
    section_name: sectionName(project, result.section_id),
    section_kind: sectionKind(project, result.section_id),
    license_detected: result.license_detected,
    license_label: licenseLabel(result.license_detected),
    license_url: result.license_url,
    rights_status: result.rights_status,
    source_access_mode: result.source_access_mode,
    reuse_risk: result.reuse_risk,
    risk_level: result.risk_level,
    risk_label: riskLabel(result.risk_level),
    score: Math.round(result.scores.overall * 100),
    production_usefulness: Math.round(result.scores.production_usefulness * 100),
    tags: result.tags,
    notes: result.notes,
    manual_review: normalizeManualReview(result.manual_review),
    linked_claims: linkedClaims,
    attribution_line: createAttributionText(result, "creator_title_source_license"),
    warnings: itemWarnings(result, bucket) }; }

export function buildEvidencePackAudit(results: ResearchResult[], project?: Pick<ResearchProject, "board_sections" | "claims" | "saved_results">): EvidencePackAudit { const items = results.map((result) => buildEvidencePackItem(result, project));
  const bucketCounts = items.reduce((acc, item) => { acc[item.bucket] = (acc[item.bucket] ?? 0) + 1;
    return acc; }, { reusable: 0, check_required: 0, reference_only: 0, restricted_or_rejected: 0 } as Record<EvidencePackBucketId, number>);

  const warnings = [
    bucketCounts.reusable === 0 && results.length > 0 ? "No item currently qualifies as a reusable / likely safe candidate." : "",
    bucketCounts.reference_only > bucketCounts.reusable ? "Reference-only items outnumber reusable candidates." : "",
    bucketCounts.restricted_or_rejected > 0 ? "Restricted/rejected items are present; keep them out of production exports." : "",
    items.some((item) => item.linked_claims.length === 0) ? "Some evidence items are not linked to claims." : ""
  ].filter(Boolean);

  return { schema_version: EVIDENCE_PACK_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    total_items: results.length,
    reusable_count: bucketCounts.reusable,
    check_required_count: bucketCounts.check_required,
    reference_only_count: bucketCounts.reference_only,
    restricted_or_rejected_count: bucketCounts.restricted_or_rejected,
    claim_linked_count: items.filter((item) => item.linked_claims.length > 0).length,
    attribution_ready_count: items.filter((item) => item.attribution_line && item.bucket !== "restricted_or_rejected").length,
    bucket_counts: bucketCounts,
    warnings }; }

export function buildEvidencePackPayload(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "claims" | "saved_results" | "search_history" | "review_evidence_memory">) { const items = results.map((result) => buildEvidencePackItem(result, project));
  const buckets: Record<EvidencePackBucketId, EvidencePackItem[]> = { reusable: [],
    check_required: [],
    reference_only: [],
    restricted_or_rejected: [] };
  items.forEach((item) => buckets[item.bucket].push(item));

  return { export_schema_version: EVIDENCE_PACK_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    export_type: "evidence_pack_v1",
    project: project ? { id: project.id,
      name: project.name,
      saved_result_count: project.saved_results?.length ?? results.length,
      claim_count: project.claims?.length ?? 0,
      section_count: project.board_sections?.length ?? 0,
      search_history_count: project.search_history?.length ?? 0 } : undefined,
    warning: "Evidence pack categories are workflow labels, not legal clearance. Verify all source pages, image files, creators, and license terms before publication or commercial use.",
    audit: buildEvidencePackAudit(results, project),
    board_organization: project?.saved_results ? buildBoardOrganizationAudit(project) : undefined,
    claim_mapping: project?.saved_results && project.claims ? buildClaimMappingAudit(project) : undefined,
    coverage_bias: project?.saved_results ? buildCoverageBiasAudit(project) : buildCoverageBiasAudit(results),
    buckets }; }

export function createEvidencePackJsonExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "claims" | "saved_results" | "search_history" | "review_evidence_memory">): string { return JSON.stringify(buildEvidencePackPayload(results, project), null, 2); }

export function createEvidencePackMarkdownExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "claims" | "saved_results" | "search_history" | "review_evidence_memory">): string { const payload = buildEvidencePackPayload(results, project);
  const lines = [
    `# ${projectName(project)} — Evidence Pack v1`,
    "",
    `Generated at: ${payload.exported_at}`,
    "",
    "> Evidence pack categories are workflow labels. Verify source pages and license terms before publication or commercial use.",
    "",
    "## Pack Audit",
    "",
    `- Total items: ${payload.audit.total_items}`,
    `- Reusable / likely safe: ${payload.audit.reusable_count}`,
    `- Check required: ${payload.audit.check_required_count}`,
    `- Reference only: ${payload.audit.reference_only_count}`,
    `- Restricted / rejected: ${payload.audit.restricted_or_rejected_count}`,
    `- Claim-linked items: ${payload.audit.claim_linked_count}`,
    `- Attribution-ready draft lines: ${payload.audit.attribution_ready_count}`,
    ""
  ];

  if (payload.audit.warnings.length) lines.push("## Pack Warnings", "", ...payload.audit.warnings.map((warning) => `- ${warning}`), "");

  const claims = normalizeResearchClaims(project?.claims, project?.saved_results ?? results);
  if (claims.length) { lines.push("## Claims", "");
    claims.forEach((claim, index) => { lines.push(`### ${index + 1}. ${claim.statement}`);
      lines.push(`- Status: ${CLAIM_STATUS_LABELS[claim.status]}`);
      lines.push(`- Confidence: ${claim.confidence}`);
      lines.push(`- Linked sources: ${claim.source_links.length}`);
      if (claim.description) lines.push(`- Description: ${claim.description}`);
      lines.push(""); }); }

  (Object.keys(BUCKET_LABELS) as EvidencePackBucketId[]).forEach((bucket) => { const bucketItems = payload.buckets[bucket];
    lines.push(`## ${BUCKET_LABELS[bucket]}`);
    lines.push("");
    lines.push(BUCKET_DESCRIPTIONS[bucket]);
    lines.push("");
    if (bucketItems.length === 0) { lines.push("No items in this category.", "");
      return; }
    bucketItems.forEach((item, index) => { lines.push(`### ${index + 1}. ${item.title}`);
      if (item.thumbnail_url || item.image_url) lines.push(`![${item.title}](${item.thumbnail_url ?? item.image_url})`);
      lines.push(`- Source: ${item.source_domain} — ${item.source_url}`);
      lines.push(`- Section: ${item.section_name} (${item.section_kind})`);
      lines.push(`- Provider/source group: ${item.provider} · ${item.source_group_label}`);
      lines.push(`- Rights/risk: ${item.rights_status} · ${item.reuse_risk} · ${item.risk_label}`);
      lines.push(`- License: ${item.license_label}${item.license_url ? ` — ${item.license_url}` : ""}`);
      lines.push(`- Scores: overall ${item.score}% · production ${item.production_usefulness}%`);
      lines.push(`- Tags: ${item.tags.join(", ") || "none"}`);
      if (item.linked_claims.length) lines.push(`- Linked claims: ${item.linked_claims.map((claim) => `${claim.relation_label} → ${claim.statement}`).join(" | ")}`);
      if (item.notes) lines.push(`- Notes: ${item.notes}`);
      if (item.warnings.length) lines.push(`- Warnings: ${item.warnings.join(" | ")}`);
      lines.push(`- Attribution draft: ${item.attribution_line}`);
      lines.push(""); }); });

  return lines.join("\n"); }

export function createEvidencePackCsvExport(results: ResearchResult[], project?: Pick<ResearchProject, "board_sections" | "claims" | "saved_results">): string { const headers = [
    "bucket",
    "title",
    "section_name",
    "provider",
    "source_domain",
    "source_url",
    "image_url",
    "rights_status",
    "reuse_risk",
    "risk_level",
    "license_detected",
    "license_url",
    "score",
    "production_usefulness",
    "tags",
    "linked_claims",
    "warnings",
    "attribution_line"
  ];
  const rows = results.map((result) => { const item = buildEvidencePackItem(result, project);
    return [
      item.bucket,
      item.title,
      item.section_name,
      item.provider,
      item.source_domain,
      item.source_url,
      item.image_url ?? item.thumbnail_url ?? "",
      item.rights_status,
      item.reuse_risk,
      item.risk_level,
      item.license_detected,
      item.license_url ?? "",
      item.score,
      item.production_usefulness,
      item.tags.join(";"),
      item.linked_claims.map((claim) => `${claim.relation}:${claim.statement}`).join(";"),
      item.warnings.join(";"),
      item.attribution_line
    ].map(csvEscape).join(","); });
  return [headers.join(","), ...rows].join("\n"); }

export function createEvidencePackHtmlExport(results: ResearchResult[], project?: Pick<ResearchProject, "id" | "name" | "board_sections" | "claims" | "saved_results" | "search_history" | "review_evidence_memory">): string { const payload = buildEvidencePackPayload(results, project);
  const bucketSections = (Object.keys(BUCKET_LABELS) as EvidencePackBucketId[]).map((bucket) => { const cards = payload.buckets[bucket].map((item) => `
      <article class="card ${item.bucket}">
        ${item.thumbnail_url || item.image_url ? `<img src="${escapeHtml(item.thumbnail_url ?? item.image_url ?? "")}" alt="" loading="lazy" />` : ""}
        <div>
          <p class="bucket">${escapeHtml(item.bucket_label)}</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta">${escapeHtml(item.source_domain)} · ${escapeHtml(item.provider)} · ${escapeHtml(item.source_group_label)}</p>
          <p>${escapeHtml(item.section_name)} · ${escapeHtml(item.rights_status)} · ${escapeHtml(item.reuse_risk)} · ${escapeHtml(item.risk_label)}</p>
          <p><a href="${escapeHtml(item.source_url)}">Open source</a>${item.license_url ? ` · <a href="${escapeHtml(item.license_url)}">License</a>` : ""}</p>
          ${item.linked_claims.length ? `<p><strong>Claims:</strong> ${escapeHtml(item.linked_claims.map((claim) => `${claim.relation_label} → ${claim.statement}`).join(" | "))}</p>` : ""}
          ${item.warnings.length ? `<p class="warning">${escapeHtml(item.warnings.join(" | "))}</p>` : ""}
          <p class="attrib">${escapeHtml(item.attribution_line)}</p>
        </div>
      </article>`).join("\n");
    return `<section><h2>${escapeHtml(BUCKET_LABELS[bucket])} (${payload.audit.bucket_counts[bucket]})</h2><p>${escapeHtml(BUCKET_DESCRIPTIONS[bucket])}</p>${cards || "<p>No items in this category.</p>"}</section>`; }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(projectName(project))} — Evidence Pack v1</title>
  <style>
    body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#0f172a;color:#e5e7eb;line-height:1.55}
    main{max-width:1120px;margin:0 auto;padding:32px 20px 56px}
    header,section{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);border-radius:24px;padding:24px;margin:0 0 20px}
    h1,h2,h3{line-height:1.15;margin:.2rem 0 .7rem} a{color:#bef264}.audit{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:18px}.metric{background:rgba(0,0,0,.28);border-radius:16px;padding:12px}.metric b{display:block;font-size:1.4rem;color:#fff}.card{display:grid;grid-template-columns:132px 1fr;gap:16px;border-top:1px solid rgba(255,255,255,.1);padding:18px 0}.card img{width:132px;height:92px;object-fit:cover;border-radius:14px;background:#020617}.bucket{color:#bef264;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem}.meta,.attrib{color:#94a3b8;font-size:.9rem}.warning{color:#fde68a}@media(max-width:640px){.card{grid-template-columns:1fr}.card img{width:100%;height:180px}}
  </style>
</head>
<body>
<main>
  <header>
    <p class="bucket">Evidence Pack v1 · schema ${EVIDENCE_PACK_SCHEMA_VERSION}</p>
    <h1>${escapeHtml(projectName(project))}</h1>
    <p>Generated at ${escapeHtml(payload.exported_at)}. Categories are workflow labels, not legal clearance. Verify all source pages, image files, creators, and license terms before publication or commercial use.</p>
    <div class="audit">
      <div class="metric"><b>${payload.audit.total_items}</b>Total items</div>
      <div class="metric"><b>${payload.audit.reusable_count}</b>Reusable / likely safe</div>
      <div class="metric"><b>${payload.audit.check_required_count}</b>Check required</div>
      <div class="metric"><b>${payload.audit.reference_only_count}</b>Reference only</div>
      <div class="metric"><b>${payload.audit.restricted_or_rejected_count}</b>Restricted / rejected</div>
      <div class="metric"><b>${payload.audit.claim_linked_count}</b>Claim-linked</div>
    </div>
    ${payload.audit.warnings.length ? `<p class="warning">${escapeHtml(payload.audit.warnings.join(" | "))}</p>` : ""}
  </header>
  ${bucketSections}
</main>
</body>
</html>`; }
