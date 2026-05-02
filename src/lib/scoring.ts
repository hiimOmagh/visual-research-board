import type { ResearchResult, ResultScores } from "@/types/research";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(2))));

export function scoreResult(input: Pick<ResearchResult, "source_domain" | "license_detected" | "type" | "width" | "height" | "tags">): ResultScores {
  const sourceCredibility = (() => {
    const domain = input.source_domain.toLowerCase();
    if (domain.includes("wikimedia") || domain.includes("loc.gov") || domain.includes("nasa.gov")) return 0.9;
    if (domain.includes("museum") || domain.includes("archive") || domain.includes("edu") || domain.includes("gov")) return 0.82;
    if (domain.includes("news") || domain.includes("reuters") || domain.includes("apnews")) return 0.68;
    return 0.58;
  })();

  const licenseClarity = (() => {
    if (input.license_detected === "public_domain") return 0.9;
    if (input.license_detected === "creative_commons") return 0.78;
    if (input.license_detected === "unclear") return 0.35;
    if (input.license_detected === "unknown") return 0.25;
    return 0.15;
  })();

  const visualQuality = (() => {
    if (input.type !== "image") return 0.45;
    const width = input.width ?? 0;
    const height = input.height ?? 0;
    if (width >= 1600 && height >= 900) return 0.88;
    if (width >= 1000 && height >= 600) return 0.75;
    if (width >= 640 && height >= 360) return 0.62;
    return 0.48;
  })();

  const productionUsefulness = clamp01((visualQuality * 0.42) + (sourceCredibility * 0.25) + (licenseClarity * 0.18) + 0.15);

  return {
    relevance: 0.82,
    visual_quality: clamp01(visualQuality),
    source_credibility: clamp01(sourceCredibility),
    license_clarity: clamp01(licenseClarity),
    uniqueness: 0.7,
    production_usefulness: productionUsefulness
  };
}
