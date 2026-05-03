import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, querySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

interface BraveImageResult {
  title?: string;
  url?: string;
  thumbnail?: { src?: string };
  properties?: { url?: string; width?: number; height?: number };
  source?: string;
}

interface BraveWebResult {
  title?: string;
  url?: string;
  description?: string;
  profile?: { name?: string };
}

function offsetsForDepth(depth: SearchDepth): number[] {
  if (depth === "quick") return [0];
  if (depth === "standard") return [0, 20];
  return [0, 20, 40];
}

async function braveFetch<T>(path: "images/search" | "web/search", query: string, count: number, offset = 0): Promise<T | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`https://api.search.brave.com/res/v1/${path}`);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  if (offset > 0) url.searchParams.set("offset", String(offset));

  return fetchJsonWithTimeout<T>(
    url.toString(),
    {
      headers: {
        "X-Subscription-Token": apiKey
      }
    },
    7000
  );
}

export async function searchBraveImages(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey || !plan.source_targets.includes("image")) return [];

  const count = plan.depth === "quick" ? 12 : 20;
  const queries = querySlice(plan.queries, plan.depth);
  const offsets = offsetsForDepth(plan.depth);
  const tasks = queries.flatMap((query, queryIndex) =>
    offsets.map((offset) => async () => {
      const data = await braveFetch<{ results?: BraveImageResult[] }>("images/search", query, count, offset);
      return (data?.results ?? []).map((item, index) => {
        const sourceUrl = item.url ?? item.properties?.url ?? "";
        const imageUrl = item.properties?.url;
        return {
          id: `brave_image_${queryIndex}_${offset}_${index}`,
          type: "image",
          title: stripHtml(item.title) || plan.original_topic,
          thumbnail_url: item.thumbnail?.src,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_domain: sourceUrl ? domainFromUrl(sourceUrl) : item.source ?? "unknown-source",
          provider: "brave",
          width: item.properties?.width,
          height: item.properties?.height,
          license_detected: "unknown",
          license_confidence: 0.12,
          tags: ["brave-image", "broad-web-image-candidate", "license-check-needed", `query-${queryIndex + 1}`, `offset-${offset}`]
        } satisfies RawProviderResult;
      }).filter((item) => item.source_url);
    })
  );

  const batches = await runLimited(tasks, 3);
  return batches.flat();
}

export async function searchBraveWeb(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey || !plan.source_targets.includes("web")) return [];

  const count = plan.depth === "quick" ? 8 : plan.depth === "standard" ? 12 : 16;
  const queries = querySlice(plan.queries, plan.depth);
  const offsets = plan.depth === "deep" ? [0, 20] : [0];
  const tasks = queries.flatMap((query, queryIndex) =>
    offsets.map((offset) => async () => {
      const data = await braveFetch<{ web?: { results?: BraveWebResult[] } }>("web/search", query, count, offset);
      return (data?.web?.results ?? []).map((item, index) => ({
        id: `brave_web_${queryIndex}_${offset}_${index}`,
        type: "web",
        title: stripHtml(item.title) || plan.original_topic,
        description: stripHtml(item.description),
        source_url: item.url ?? "",
        source_domain: item.url ? domainFromUrl(item.url) : item.profile?.name ?? "unknown-source",
        provider: "brave",
        license_detected: "unknown",
        license_confidence: 0.12,
        tags: ["brave-web", "source-link", "broad-web-candidate", `query-${queryIndex + 1}`, `offset-${offset}`]
      } satisfies RawProviderResult)).filter((item) => item.source_url);
    })
  );

  const batches = await runLimited(tasks, 3);
  return batches.flat();
}
