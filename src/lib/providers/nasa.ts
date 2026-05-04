import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { fetchJsonWithTimeout, querySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface NasaItem {
  href?: string;
  links?: Array<{ href?: string; rel?: string; render?: string }>;
  data?: Array<{ title?: string; description?: string; nasa_id?: string; date_created?: string; keywords?: string[] }>;
}

function limitForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 10;
  if (depth === "standard") return 18;
  return 26;
}

async function searchNasaQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://images-api.nasa.gov/search");
  url.searchParams.set("q", query);
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page_size", String(limitForDepth(plan.depth)));

  const data = await fetchJsonWithTimeout<{ collection?: { items?: NasaItem[] } }>(url.toString(), {}, 8000);
  return (data?.collection?.items ?? []).map((item, index) => {
    const meta = item.data?.[0] ?? {};
    const thumb = item.links?.find((link) => link.rel === "preview")?.href ?? item.links?.[0]?.href;
    const sourceUrl = meta.nasa_id ? `https://images.nasa.gov/details/${encodeURIComponent(meta.nasa_id)}` : item.href ?? "";
    return {
      id: `nasa_${queryIndex}_${meta.nasa_id ?? index}`,
      type: "image",
      title: stripHtml(meta.title) || `${plan.original_topic} NASA image`,
      description: stripHtml(meta.description).slice(0, 260) || meta.date_created,
      thumbnail_url: thumb,
      image_url: thumb,
      source_url: sourceUrl,
      source_domain: "images.nasa.gov",
      provider: "nasa",
      license_detected: "public_domain",
      license_confidence: 0.68,
      source_access_mode: "backend_free_no_key",
      rights_status: "likely_reusable",
      reuse_risk: "medium",
      tags: ["nasa-images", "public-agency", "science-image", ...(meta.keywords ?? []).slice(0, 4), `query-${queryIndex + 1}`]
    } satisfies RawProviderResult;
  }).filter((item) => item.source_url);
}

export async function searchNasaImages(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!plan.source_targets.includes("image") && !plan.source_targets.includes("archive")) return [];
  const tasks = querySlice(plan.queries, plan.depth).map((query, queryIndex) => () => searchNasaQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
