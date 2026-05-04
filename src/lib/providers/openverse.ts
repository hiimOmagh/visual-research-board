import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface OpenverseImageResult {
  id?: string;
  title?: string;
  foreign_landing_url?: string;
  url?: string;
  thumbnail?: string;
  creator?: string;
  license?: string;
  license_url?: string;
  source?: string;
  width?: number;
  height?: number;
}

interface OpenverseResponse {
  results?: OpenverseImageResult[];
}

function pageSizeForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 10;
  if (depth === "standard") return 18;
  return 28;
}

function detectLicense(license?: string): Pick<RawProviderResult, "license_detected" | "license_confidence" | "rights_status" | "reuse_risk"> {
  const value = String(license ?? "").toLowerCase();
  if (value.includes("cc0") || value.includes("pdm") || value.includes("public")) {
    return { license_detected: "public_domain", license_confidence: 0.82, rights_status: "public_domain", reuse_risk: "low" };
  }
  if (value.includes("cc") || value.includes("by")) {
    return { license_detected: "creative_commons", license_confidence: 0.78, rights_status: "open_license", reuse_risk: "medium" };
  }
  return { license_detected: "unclear", license_confidence: 0.48, rights_status: "check_required", reuse_risk: "medium" };
}

async function searchOpenverseQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", query);
  url.searchParams.set("page_size", String(pageSizeForDepth(plan.depth)));
  url.searchParams.set("mature", "false");

  const data = await fetchJsonWithTimeout<OpenverseResponse>(url.toString(), {}, 7000);
  return (data?.results ?? []).map((item, index) => {
    const sourceUrl = item.foreign_landing_url ?? item.url ?? "";
    const license = detectLicense(item.license);
    return {
      id: `openverse_${queryIndex}_${item.id ?? index}`,
      type: "image",
      title: stripHtml(item.title) || `${plan.original_topic} open-license image`,
      description: item.creator ? `Creator: ${stripHtml(item.creator)}${item.source ? ` · Source: ${stripHtml(item.source)}` : ""}` : undefined,
      thumbnail_url: item.thumbnail ?? item.url,
      image_url: item.url,
      source_url: sourceUrl,
      source_domain: sourceUrl ? domainFromUrl(sourceUrl) : "openverse.org",
      provider: "openverse",
      width: item.width,
      height: item.height,
      license_url: item.license_url,
      source_access_mode: "backend_free_no_key",
      tags: ["openverse", "open-license-candidate", "free-backend-provider", `query-${queryIndex + 1}`],
      ...license
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchOpenverse(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("image") && !plan.source_targets.includes("commons")) return [];
  const tasks = providerQuerySlice(plan, "openverse").map((query, queryIndex) => () => searchOpenverseQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
