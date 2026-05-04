import type { LicenseDetected, ResearchResult, RiskLevel } from "@/types/research";

const highRiskDomainHints = [
  "reuters",
  "getty",
  "apnews",
  "associatedpress",
  "shutterstock",
  "alamy",
  "istockphoto",
  "dreamstime",
  "depositphotos"
];

const lowRiskDomainHints = [
  "commons.wikimedia.org",
  "loc.gov",
  "nasa.gov",
  "archives.gov",
  "archive.org",
  "openverse.org",
  "images.nasa.gov",
  "nasa.gov",
  "si.edu",
  "metmuseum.org",
  "si.edu",
  "europeana.eu"
];

export function inferRiskLevel(params: {
  license: LicenseDetected;
  sourceDomain: string;
  type: ResearchResult["type"];
  title?: string;
  licenseConfidence?: number;
}): RiskLevel {
  const domain = params.sourceDomain.toLowerCase();
  const title = params.title?.toLowerCase() ?? "";
  const confidence = params.licenseConfidence ?? 0.2;

  if (title.includes("private individual") || title.includes("sensitive") || title.includes("graphic")) return "avoid";
  if (highRiskDomainHints.some((hint) => domain.includes(hint))) return "high";
  if (params.license === "copyrighted") return "high";
  if (params.license === "public_domain" && confidence >= 0.65) return "low";
  if (params.license === "creative_commons" && confidence >= 0.6) return "medium";
  if (lowRiskDomainHints.some((hint) => domain.includes(hint)) && params.license !== "unknown") return "medium";
  if (params.type === "web" || params.type === "archive") return "reference_only";
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
