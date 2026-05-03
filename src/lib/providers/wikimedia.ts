import type { LicenseDetected, SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, querySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface WikimediaImageInfo {
  url?: string;
  thumburl?: string;
  thumbwidth?: number;
  thumbheight?: number;
  size?: number;
  width?: number;
  height?: number;
  mime?: string;
  extmetadata?: Record<string, { value?: string }>;
}

interface WikimediaPage {
  pageid: number;
  title: string;
  fullurl?: string;
  imageinfo?: WikimediaImageInfo[];
}

function detectLicense(meta?: Record<string, { value?: string }>): {
  license_detected: LicenseDetected;
  license_confidence: number;
  license_url?: string;
  tags: string[];
} {
  if (!meta) {
    return {
      license_detected: "unclear",
      license_confidence: 0.42,
      tags: ["wikimedia-commons", "license-verification-needed"]
    };
  }

  const licenseShortName = stripHtml(meta.LicenseShortName?.value);
  const usageTerms = stripHtml(meta.UsageTerms?.value);
  const copyrightStatus = stripHtml(meta.Copyrighted?.value);
  const licenseUrl = stripHtml(meta.LicenseUrl?.value) || undefined;
  const combined = `${licenseShortName} ${usageTerms} ${copyrightStatus}`.toLowerCase();

  if (combined.includes("public domain") || combined.includes("pd-") || combined.includes("cc0")) {
    return {
      license_detected: "public_domain",
      license_confidence: 0.86,
      license_url: licenseUrl,
      tags: ["wikimedia-commons", "public-domain-candidate"]
    };
  }

  if (combined.includes("creative commons") || combined.includes("cc-by") || combined.includes("cc by") || combined.includes("cc-by-sa")) {
    return {
      license_detected: "creative_commons",
      license_confidence: 0.78,
      license_url: licenseUrl,
      tags: ["wikimedia-commons", "creative-commons-candidate"]
    };
  }

  if (combined.includes("copyrighted") || combined.includes("all rights reserved")) {
    return {
      license_detected: "copyrighted",
      license_confidence: 0.74,
      license_url: licenseUrl,
      tags: ["wikimedia-commons", "copyright-review-needed"]
    };
  }

  return {
    license_detected: "unclear",
    license_confidence: 0.48,
    license_url: licenseUrl,
    tags: ["wikimedia-commons", "license-verification-needed"]
  };
}

function limitForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 10;
  if (depth === "standard") return 16;
  return 24;
}

async function searchWikimediaQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", String(limitForDepth(plan.depth)));
  url.searchParams.set("prop", "imageinfo|info");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");
  url.searchParams.set("iiurlwidth", "900");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("origin", "*");
  url.searchParams.set("format", "json");

  const data = await fetchJsonWithTimeout<{ query?: { pages?: Record<string, WikimediaPage> } }>(url.toString(), {}, 7000);
  const pages = Object.values(data?.query?.pages ?? {});

  return pages.map((page) => {
    const info = page.imageinfo?.[0];
    const license = detectLicense(info?.extmetadata);
    return {
      id: `wikimedia_${queryIndex}_${page.pageid}`,
      type: "image",
      title: page.title.replace(/^File:/, ""),
      thumbnail_url: info?.thumburl ?? info?.url,
      image_url: info?.url,
      source_url: page.fullurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      source_domain: "commons.wikimedia.org",
      provider: "wikimedia",
      width: info?.width ?? info?.thumbwidth,
      height: info?.height ?? info?.thumbheight,
      license_detected: license.license_detected,
      license_confidence: license.license_confidence,
      license_url: license.license_url,
      tags: [...license.tags, "broad-commons-candidate", `query-${queryIndex + 1}`]
    } satisfies RawProviderResult;
  });
}

export async function searchWikimediaCommons(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("commons")) return [];

  const tasks = querySlice(plan.queries, plan.depth).map((query, queryIndex) => () => searchWikimediaQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 3);
  return batches.flat();
}
