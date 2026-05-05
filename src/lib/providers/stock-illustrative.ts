import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";

function rowsForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 8;
  if (depth === "standard") return 14;
  return 22;
}

function shouldRunStockProvider(plan: SearchPlan): boolean {
  return plan.source_targets.includes("image") || plan.mode === "thumbnail_inspiration" || plan.mode === "design_moodboard";
}

function stockLicense(provider: "pixabay" | "pexels" | "unsplash") {
  const licenseUrl = provider === "pixabay"
    ? "https://pixabay.com/service/license-summary/"
    : provider === "pexels"
      ? "https://www.pexels.com/license/"
      : "https://unsplash.com/license";

  return {
    license_detected: "unclear" as const,
    license_confidence: 0.58,
    license_url: licenseUrl,
    source_access_mode: "stock_illustrative" as const,
    rights_status: "likely_reusable" as const,
    reuse_risk: "medium" as const
  };
}

interface PixabayHit {
  id?: number;
  pageURL?: string;
  type?: string;
  tags?: string;
  previewURL?: string;
  webformatURL?: string;
  largeImageURL?: string;
  imageWidth?: number;
  imageHeight?: number;
  user?: string;
}

export async function searchPixabay(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey || !shouldRunStockProvider(plan)) return [];

  const tasks = providerQuerySlice(plan, "pixabay").map((query, queryIndex) => async () => {
    const url = new URL("https://pixabay.com/api/");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("image_type", "photo");
    url.searchParams.set("safesearch", "true");
    url.searchParams.set("per_page", String(Math.min(rowsForDepth(plan.depth), 20)));
    const data = await fetchJsonWithTimeout<{ hits?: PixabayHit[] }>(url.toString(), {}, 7500);
    return (data?.hits ?? []).map((item, index) => {
      const source = item.pageURL ?? "";
      const image = item.largeImageURL ?? item.webformatURL ?? item.previewURL;
      return {
        id: `pixabay_${queryIndex}_${item.id ?? index}`,
        type: image ? "image" : "web",
        title: stripHtml(item.tags) || `${plan.original_topic} Pixabay illustrative photo`,
        description: [item.user ? `Creator: ${item.user}` : undefined, "Stock/illustrative candidate; verify provider terms before publication."].filter(Boolean).join(" · "),
        thumbnail_url: item.webformatURL ?? item.previewURL,
        image_url: image,
        width: item.imageWidth,
        height: item.imageHeight,
        source_url: source,
        source_domain: source ? domainFromUrl(source) : "pixabay.com",
        provider: "pixabay",
        tags: ["stock-illustrative", "pixabay", "free-key-provider", "verify-stock-terms", `query-${queryIndex + 1}`],
        ...stockLicense("pixabay")
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });

  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface PexelsPhotoSource {
  original?: string;
  large2x?: string;
  large?: string;
  medium?: string;
  small?: string;
}

interface PexelsPhoto {
  id?: number;
  url?: string;
  alt?: string;
  photographer?: string;
  photographer_url?: string;
  width?: number;
  height?: number;
  src?: PexelsPhotoSource;
}

export async function searchPexels(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || !shouldRunStockProvider(plan)) return [];

  const tasks = providerQuerySlice(plan, "pexels").map((query, queryIndex) => async () => {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(Math.min(rowsForDepth(plan.depth), 20)));
    url.searchParams.set("orientation", "landscape");
    const data = await fetchJsonWithTimeout<{ photos?: PexelsPhoto[] }>(url.toString(), { headers: { Authorization: apiKey } }, 7500);
    return (data?.photos ?? []).map((item, index) => {
      const image = item.src?.large2x ?? item.src?.large ?? item.src?.original ?? item.src?.medium;
      return {
        id: `pexels_${queryIndex}_${item.id ?? index}`,
        type: image ? "image" : "web",
        title: stripHtml(item.alt) || `${plan.original_topic} Pexels illustrative photo`,
        description: [item.photographer ? `Photographer: ${item.photographer}` : undefined, item.photographer_url, "Stock/illustrative candidate; verify provider terms before publication."].filter(Boolean).join(" · "),
        thumbnail_url: item.src?.medium ?? item.src?.small ?? image,
        image_url: image,
        width: item.width,
        height: item.height,
        source_url: item.url ?? "",
        source_domain: item.url ? domainFromUrl(item.url) : "pexels.com",
        provider: "pexels",
        tags: ["stock-illustrative", "pexels", "free-key-provider", "verify-stock-terms", `query-${queryIndex + 1}`],
        ...stockLicense("pexels")
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });

  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface UnsplashPhoto {
  id?: string;
  alt_description?: string;
  description?: string;
  width?: number;
  height?: number;
  links?: { html?: string };
  urls?: { raw?: string; full?: string; regular?: string; small?: string; thumb?: string };
  user?: { name?: string; links?: { html?: string } };
}

export async function searchUnsplash(plan: SearchPlan): Promise<RawProviderResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || !shouldRunStockProvider(plan)) return [];

  const tasks = providerQuerySlice(plan, "unsplash").map((query, queryIndex) => async () => {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(Math.min(rowsForDepth(plan.depth), 20)));
    url.searchParams.set("orientation", "landscape");
    const data = await fetchJsonWithTimeout<{ results?: UnsplashPhoto[] }>(url.toString(), { headers: { Authorization: `Client-ID ${accessKey}` } }, 7500);
    return (data?.results ?? []).map((item, index) => {
      const image = item.urls?.regular ?? item.urls?.full ?? item.urls?.raw ?? item.urls?.small;
      const title = item.alt_description ?? item.description;
      return {
        id: `unsplash_${queryIndex}_${item.id ?? index}`,
        type: image ? "image" : "web",
        title: stripHtml(title) || `${plan.original_topic} Unsplash illustrative photo`,
        description: [item.user?.name ? `Photographer: ${item.user.name}` : undefined, item.user?.links?.html, "Stock/illustrative candidate; verify provider terms before publication."].filter(Boolean).join(" · "),
        thumbnail_url: item.urls?.small ?? item.urls?.thumb ?? image,
        image_url: image,
        width: item.width,
        height: item.height,
        source_url: item.links?.html ?? "",
        source_domain: item.links?.html ? domainFromUrl(item.links.html) : "unsplash.com",
        provider: "unsplash",
        tags: ["stock-illustrative", "unsplash", "free-key-provider", "verify-stock-terms", `query-${queryIndex + 1}`],
        ...stockLicense("unsplash")
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });

  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
