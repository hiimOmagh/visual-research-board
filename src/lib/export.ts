import type { ResearchResult } from "@/types/research";
import { licenseLabel, riskLabel } from "@/lib/risk";

export function createJsonExport(results: ResearchResult[]): string {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      warning: "License labels are candidates and require manual verification before publication or commercial use.",
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
    lines.push(`- Risk label: ${riskLabel(result.risk_level)}`);
    lines.push(`- Tags: ${result.tags.join(", ") || "none"}`);
    if (result.notes) lines.push(`- Notes: ${result.notes}`);
    lines.push("");
  });

  return lines.join("\n");
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
