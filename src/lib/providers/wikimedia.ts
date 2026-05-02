import type { SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";

interface WikimediaPage {
  pageid: number;
  title: string;
  thumbnail?: { source?: string; width?: number; height?: number };
  fullurl?: string;
}

export async function searchWikimediaCommons(plan: SearchPlan): Promise<RawProviderResult[]> {
  const query = plan.queries[0];
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", plan.depth === "quick" ? "6" : "12");
  url.searchParams.set("prop", "pageimages|info");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "640");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("origin", "*");
  url.searchParams.set("format", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) return [];

  const data = await response.json() as { query?: { pages?: Record<string, WikimediaPage> } };
  const pages = Object.values(data.query?.pages ?? {});

  return pages.map((page) => ({
    id: `wikimedia_${page.pageid}`,
    type: "image",
    title: page.title.replace(/^File:/, ""),
    thumbnail_url: page.thumbnail?.source,
    image_url: page.thumbnail?.source,
    source_url: page.fullurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    source_domain: "commons.wikimedia.org",
    provider: "wikimedia",
    width: page.thumbnail?.width,
    height: page.thumbnail?.height,
    license_detected: "unclear",
    license_confidence: 0.45,
    tags: ["wikimedia-commons", "license-verification-needed"]
  } satisfies RawProviderResult));
}
