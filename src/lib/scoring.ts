import type { ResearchResult, ResultScores } from "@/types/research";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(2))));

const highCredibilityDomains = [
  "wikimedia",
  "loc.gov",
  "nasa.gov",
  "archives.gov",
  "archive.org",
  "metmuseum.org",
  "getty.edu",
  "si.edu",
  "europeana.eu"
];

const mediumCredibilityHints = ["museum", "archive", ".edu", ".gov", "library", "official"];
const highRiskDomains = ["reuters", "getty", "apnews", "shutterstock", "alamy", "istockphoto"];

export function scoreResult(
  input: Pick<ResearchResult, "source_domain" | "license_detected" | "type" | "width" | "height" | "tags" | "risk_level" | "license_confidence">
): ResultScores {
  const domain = input.source_domain.toLowerCase();

  const sourceCredibility = (() => {
    if (highCredibilityDomains.some((hint) => domain.includes(hint))) return 0.9;
    if (mediumCredibilityHints.some((hint) => domain.includes(hint))) return 0.78;
    if (highRiskDomains.some((hint) => domain.includes(hint))) return 0.62;
    if (domain.includes("wikipedia")) return 0.7;
    if (domain === "unknown-source") return 0.25;
    return 0.56;
  })();

  const licenseClarity = (() => {
    if (input.license_detected === "public_domain") return 0.9;
    if (input.license_detected === "creative_commons") return 0.76;
    if (input.license_detected === "unclear") return 0.36;
    if (input.license_detected === "unknown") return 0.24;
    return 0.14;
  })();

  const visualQuality = (() => {
    if (input.type !== "image") return 0.44;
    const width = input.width ?? 0;
    const height = input.height ?? 0;
    if (width >= 1800 && height >= 1000) return 0.92;
    if (width >= 1400 && height >= 800) return 0.84;
    if (width >= 1000 && height >= 600) return 0.74;
    if (width >= 640 && height >= 360) return 0.6;
    return 0.42;
  })();

  const tagSignal = (() => {
    const tags = input.tags.map((tag) => tag.toLowerCase()).join(" ");
    if (tags.includes("public-domain") || tags.includes("archive") || tags.includes("map")) return 0.08;
    if (tags.includes("thumbnail") || tags.includes("composition")) return 0.06;
    return 0;
  })();

  const riskPenalty = (() => {
    if (input.risk_level === "avoid") return 0.35;
    if (input.risk_level === "high") return 0.24;
    if (input.risk_level === "reference_only") return 0.12;
    if (input.risk_level === "medium") return 0.06;
    return 0;
  })();

  const productionUsefulness = clamp01((visualQuality * 0.38) + (sourceCredibility * 0.24) + (licenseClarity * 0.18) + 0.16 + tagSignal - riskPenalty);
  const uniqueness = clamp01(0.66 + (input.license_detected === "public_domain" ? 0.07 : 0) + (input.type === "archive" ? 0.07 : 0));
  const relevance = clamp01(0.78 + tagSignal - (input.source_domain === "unknown-source" ? 0.12 : 0));
  const overall = clamp01((relevance * 0.24) + (productionUsefulness * 0.32) + (sourceCredibility * 0.18) + (licenseClarity * 0.16) + (uniqueness * 0.1));

  return {
    relevance,
    visual_quality: clamp01(visualQuality),
    source_credibility: clamp01(sourceCredibility),
    license_clarity: clamp01(licenseClarity),
    uniqueness,
    production_usefulness: productionUsefulness,
    overall
  };
}
