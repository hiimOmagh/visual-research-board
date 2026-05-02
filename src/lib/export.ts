import type { ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";

function countBy<T extends string>(items: ResearchResult[], getKey: (item: ResearchResult) => T): Record<T, number> {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export function createJsonExport(results: ResearchResult[]): string {
  return JSON.stringify(
    {
      export_schema_version: "0.1.0-alpha.3",
      exported_at: new Date().toISOString(),
      warning: "License labels are candidates and require manual verification before publication or commercial use.",
      audit: {
        total_items: results.length,
        by_type: countBy(results, (item) => item.type),
        by_provider: countBy(results, (item) => item.provider),
        by_risk: countBy(results, (item) => item.risk_level),
        by_license: countBy(results, (item) => item.license_detected),
        notes_count: results.filter((item) => Boolean(item.notes?.trim())).length,
        manual_import_count: results.filter((item) => item.provider === "manual").length
      },
      results
    },
    null,
    2
  );
}

export function createMarkdownExport(results: ResearchResult[]): string {
  const lines = [
    "# Visual Research Board Export",
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

  results.forEach((result, index) => {
    lines.push(`## ${index + 1}. ${result.title}`);
    lines.push("");
    lines.push(`- Type: ${result.type}`);
    lines.push(`- Source: ${result.source_domain}`);
    lines.push(`- URL: ${result.source_url}`);
    lines.push(`- Provider: ${result.provider}`);
    lines.push(`- License label: ${licenseLabel(result.license_detected)}`);
    lines.push(`- License confidence: ${Math.round(result.license_confidence * 100)}%`);
    if (result.license_url) lines.push(`- License URL: ${result.license_url}`);
    lines.push(`- Risk label: ${riskLabel(result.risk_level)}`);
    lines.push(`- Overall score: ${Math.round(result.scores.overall * 100)}%`);
    lines.push(`- Tags: ${result.tags.join(", ") || "none"}`);
    if (result.notes) lines.push(`- Notes: ${result.notes}`);
    lines.push(`- Attribution line: ${createSingleAttribution(result)}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function createSingleAttribution(result: ResearchResult): string {
  const license = licenseLabel(result.license_detected);
  const risk = riskLabel(result.risk_level);
  const licenseUrl = result.license_url ? ` License: ${result.license_url}.` : "";
  return `${result.title} — Source: ${result.source_domain} (${result.source_url}). ${license}; ${risk}.${licenseUrl}`;
}

export function createAttributionExport(results: ResearchResult[]): string {
  const lines = [
    "# Attribution Pack",
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

function csvEscape(value: string | number | undefined): string {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export function createCsvExport(results: ResearchResult[]): string {
  const headers = [
    "title",
    "type",
    "provider",
    "source_domain",
    "source_url",
    "license_detected",
    "license_confidence",
    "risk_level",
    "overall_score",
    "production_usefulness",
    "tags",
    "notes"
  ];

  const rows = results.map((result) => [
    result.title,
    result.type,
    result.provider,
    result.source_domain,
    result.source_url,
    result.license_detected,
    Math.round(result.license_confidence * 100),
    result.risk_level,
    Math.round(result.scores.overall * 100),
    Math.round(result.scores.production_usefulness * 100),
    result.tags.join(";"),
    result.notes ?? ""
  ].map(csvEscape).join(","));

  return [headers.join(","), ...rows].join("\n");
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
