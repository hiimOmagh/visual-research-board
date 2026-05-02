import type { LicenseDetected, ResearchResult, RiskLevel } from "@/types/research";

export function inferRiskLevel(params: {
  license: LicenseDetected;
  sourceDomain: string;
  type: ResearchResult["type"];
  title?: string;
}): RiskLevel {
  const domain = params.sourceDomain.toLowerCase();
  const title = params.title?.toLowerCase() ?? "";

  if (title.includes("private individual") || title.includes("sensitive")) return "avoid";
  if (domain.includes("reuters") || domain.includes("getty") || domain.includes("apnews") || domain.includes("shutterstock")) return "high";
  if (params.license === "copyrighted") return "high";
  if (params.license === "public_domain") return "low";
  if (params.license === "creative_commons") return "medium";
  if (params.license === "unclear" || params.license === "unknown") return "reference_only";

  return "medium";
}

export function riskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "Low risk candidate",
    medium: "Needs verification",
    high: "High risk",
    reference_only: "Reference only",
    avoid: "Avoid"
  };
  return labels[level];
}

export function licenseLabel(license: LicenseDetected): string {
  const labels: Record<LicenseDetected, string> = {
    public_domain: "Public-domain candidate",
    creative_commons: "Creative Commons candidate",
    copyrighted: "Likely copyrighted",
    unknown: "Unknown license",
    unclear: "Unclear license"
  };
  return labels[license];
}
