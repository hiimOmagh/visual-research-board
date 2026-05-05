import type { SearchDepth, SearchPlan } from "@/types/research";
import type { RawProviderResult } from "@/lib/result-normalizer";
import { domainFromUrl, fetchJsonWithTimeout, fetchTextWithTimeout, providerQuerySlice, runLimited, stripHtml } from "@/lib/providers/provider-utils";
import { readServerProviderKey } from "@/lib/provider-key-security";

function rowsForDepth(depth: SearchDepth): number {
  if (depth === "quick") return 8;
  if (depth === "standard") return 14;
  return 22;
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 90) || "record";
}

function publicDomainLicense() {
  return {
    license_detected: "public_domain" as const,
    license_confidence: 0.74,
    source_access_mode: "archive_open_access" as const,
    rights_status: "public_domain" as const,
    reuse_risk: "low" as const
  };
}

function checkRequiredLicense() {
  return {
    license_detected: "unclear" as const,
    license_confidence: 0.46,
    source_access_mode: "archive_open_access" as const,
    rights_status: "check_required" as const,
    reuse_risk: "medium" as const
  };
}

function shouldRunMuseumProvider(plan: SearchPlan): boolean {
  return plan.source_targets.includes("archive") || plan.source_targets.includes("image") || plan.source_targets.includes("commons");
}

interface MetSearchResponse { objectIDs?: number[] | null; }
interface MetObjectResponse {
  objectID?: number;
  title?: string;
  primaryImageSmall?: string;
  primaryImage?: string;
  objectURL?: string;
  artistDisplayName?: string;
  objectDate?: string;
  isPublicDomain?: boolean;
  department?: string;
}

async function fetchMetObject(id: number, queryIndex: number, recordIndex: number, plan: SearchPlan): Promise<RawProviderResult | null> {
  const item = await fetchJsonWithTimeout<MetObjectResponse>(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, {}, 7500);
  if (!item?.objectURL) return null;
  const license = item.isPublicDomain ? publicDomainLicense() : checkRequiredLicense();
  return {
    id: `met_${queryIndex}_${item.objectID ?? recordIndex}`,
    type: item.primaryImageSmall || item.primaryImage ? "image" : "archive",
    title: stripHtml(item.title) || `${plan.original_topic} Met Museum object`,
    description: [item.artistDisplayName, item.objectDate, item.department].filter(Boolean).map(stripHtml).join(" · ") || undefined,
    thumbnail_url: item.primaryImageSmall || item.primaryImage,
    image_url: item.primaryImage || item.primaryImageSmall,
    source_url: item.objectURL,
    source_domain: "metmuseum.org",
    provider: "met",
    tags: ["met-museum", "museum-open-access", "public-domain-check", `query-${queryIndex + 1}`],
    ...license
  };
}

async function searchMetQuery(query: string, queryIndex: number, plan: SearchPlan): Promise<RawProviderResult[]> {
  const url = new URL("https://collectionapi.metmuseum.org/public/collection/v1/search");
  url.searchParams.set("hasImages", "true");
  url.searchParams.set("q", query);
  const data = await fetchJsonWithTimeout<MetSearchResponse>(url.toString(), {}, 7500);
  const ids = (data?.objectIDs ?? []).slice(0, Math.min(rowsForDepth(plan.depth), 12));
  const tasks = ids.map((id, index) => () => fetchMetObject(id, queryIndex, index, plan));
  const records = await runLimited(tasks, 3);
  return records.filter((item): item is RawProviderResult => Boolean(item));
}

export async function searchMetMuseum(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "met").map((query, queryIndex) => () => searchMetQuery(query, queryIndex, plan));
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface ArticItem {
  id?: number;
  title?: string;
  thumbnail?: { alt_text?: string };
  image_id?: string;
  artist_display?: string;
  date_display?: string;
  is_public_domain?: boolean;
}

export async function searchArtInstituteChicago(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "artic").map((query, queryIndex) => async () => {
    const url = new URL("https://api.artic.edu/api/v1/artworks/search");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(rowsForDepth(plan.depth)));
    url.searchParams.set("fields", "id,title,thumbnail,image_id,artist_display,date_display,is_public_domain");
    const data = await fetchJsonWithTimeout<{ data?: ArticItem[] }>(url.toString(), {}, 7500);
    return (data?.data ?? []).map((item, index) => {
      const image = item.image_id ? `https://www.artic.edu/iiif/2/${encodeURIComponent(item.image_id)}/full/843,/0/default.jpg` : undefined;
      const license = item.is_public_domain ? publicDomainLicense() : checkRequiredLicense();
      return {
        id: `artic_${queryIndex}_${item.id ?? index}`,
        type: image ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} Art Institute record`,
        description: stripHtml(item.thumbnail?.alt_text || [item.artist_display, item.date_display].filter(Boolean).join(" · ")).slice(0, 260) || undefined,
        thumbnail_url: image,
        image_url: image,
        source_url: item.id ? `https://www.artic.edu/artworks/${item.id}` : "",
        source_domain: "artic.edu",
        provider: "artic",
        tags: ["art-institute-chicago", "museum-open-access", "iiif", `query-${queryIndex + 1}`],
        ...license
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface ClevelandArtwork {
  id?: number;
  title?: string;
  creators?: Array<{ description?: string }>;
  creation_date?: string;
  url?: string;
  images?: { web?: { url?: string }; print?: { url?: string } };
  share_license_status?: string;
}

export async function searchClevelandMuseum(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "cleveland_museum").map((query, queryIndex) => async () => {
    const url = new URL("https://openaccess-api.clevelandart.org/api/artworks/");
    url.searchParams.set("q", query);
    url.searchParams.set("has_image", "1");
    url.searchParams.set("limit", String(rowsForDepth(plan.depth)));
    const data = await fetchJsonWithTimeout<{ data?: ClevelandArtwork[] }>(url.toString(), {}, 7500);
    return (data?.data ?? []).map((item, index) => {
      const image = item.images?.web?.url ?? item.images?.print?.url;
      const rights = String(item.share_license_status ?? "").toLowerCase();
      const license = rights.includes("public") || rights.includes("cc0") ? publicDomainLicense() : checkRequiredLicense();
      return {
        id: `cleveland_museum_${queryIndex}_${item.id ?? index}`,
        type: image ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} Cleveland Museum record`,
        description: [item.creators?.[0]?.description, item.creation_date, item.share_license_status].filter(Boolean).map(stripHtml).join(" · ") || undefined,
        thumbnail_url: image,
        image_url: image,
        source_url: item.url ?? (item.id ? `https://www.clevelandart.org/art/${item.id}` : ""),
        source_domain: "clevelandart.org",
        provider: "cleveland_museum",
        license_url: rights.includes("public") ? "https://www.clevelandart.org/open-access" : undefined,
        tags: ["cleveland-museum", "museum-open-access", `query-${queryIndex + 1}`],
        ...license
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface RijksItem {
  objectNumber?: string;
  title?: string;
  longTitle?: string;
  webImage?: { url?: string; width?: number; height?: number };
  headerImage?: { url?: string };
  principalOrFirstMaker?: string;
  links?: { web?: string };
  hasImage?: boolean;
}

export async function searchRijksmuseum(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = readServerProviderKey("RIJKSMUSEUM_API_KEY");
  if (!apiKey || !shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "rijksmuseum").map((query, queryIndex) => async () => {
    const url = new URL("https://www.rijksmuseum.nl/api/en/collection");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("imgonly", "true");
    url.searchParams.set("ps", String(rowsForDepth(plan.depth)));
    const data = await fetchJsonWithTimeout<{ artObjects?: RijksItem[] }>(url.toString(), {}, 7500);
    return (data?.artObjects ?? []).map((item, index) => {
      const image = item.webImage?.url ?? item.headerImage?.url;
      return {
        id: `rijksmuseum_${queryIndex}_${item.objectNumber ?? index}`,
        type: image ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} Rijksmuseum record`,
        description: [item.principalOrFirstMaker, item.longTitle].filter(Boolean).map(stripHtml).join(" · ").slice(0, 260) || undefined,
        thumbnail_url: image,
        image_url: image,
        width: item.webImage?.width,
        height: item.webImage?.height,
        source_url: item.links?.web ?? (item.objectNumber ? `https://www.rijksmuseum.nl/en/collection/${encodeURIComponent(item.objectNumber)}` : ""),
        source_domain: "rijksmuseum.nl",
        provider: "rijksmuseum",
        source_access_mode: "backend_free_key_required",
        rights_status: "check_required",
        reuse_risk: "medium",
        license_detected: "unclear",
        license_confidence: 0.5,
        tags: ["rijksmuseum", "museum-open-access", "free-key-provider", `query-${queryIndex + 1}`]
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface WellcomeWork {
  id?: string;
  title?: string;
  thumbnail?: { url?: string };
  production?: Array<{ label?: string }>;
  workType?: { label?: string };
  availabilities?: Array<{ id?: string; label?: string }>;
}

export async function searchWellcomeCollection(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "wellcome").map((query, queryIndex) => async () => {
    const url = new URL("https://api.wellcomecollection.org/catalogue/v2/works");
    url.searchParams.set("query", query);
    url.searchParams.set("pageSize", String(rowsForDepth(plan.depth)));
    url.searchParams.set("include", "items");
    const data = await fetchJsonWithTimeout<{ results?: WellcomeWork[] }>(url.toString(), {}, 7500);
    return (data?.results ?? []).map((item, index) => {
      const thumb = item.thumbnail?.url ? `https://iiif.wellcomecollection.org/image/${item.thumbnail.url.replace(/^.*\//, "")}/full/760,/0/default.jpg` : undefined;
      return {
        id: `wellcome_${queryIndex}_${item.id ?? index}`,
        type: thumb ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} Wellcome Collection record`,
        description: [item.production?.[0]?.label, item.workType?.label, item.availabilities?.[0]?.label].filter(Boolean).map(stripHtml).join(" · ") || undefined,
        thumbnail_url: thumb,
        image_url: thumb,
        source_url: item.id ? `https://wellcomecollection.org/works/${encodeURIComponent(item.id)}` : "",
        source_domain: "wellcomecollection.org",
        provider: "wellcome",
        tags: ["wellcome-collection", "museum-open-access", "medical-history", `query-${queryIndex + 1}`],
        ...checkRequiredLicense()
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface BhlPublication {
  BHLType?: string;
  Title?: string;
  Authors?: Array<{ Name?: string }>;
  Date?: string;
  ItemID?: string | number;
  TitleID?: string | number;
}

export async function searchBiodiversityHeritageLibrary(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "bhl").map((query, queryIndex) => async () => {
    const url = new URL("https://www.biodiversitylibrary.org/api3");
    url.searchParams.set("op", "PublicationSearch");
    url.searchParams.set("searchterm", query);
    url.searchParams.set("format", "json");
    const data = await fetchJsonWithTimeout<{ Result?: BhlPublication[] }>(url.toString(), {}, 8000);
    return (data?.Result ?? []).slice(0, rowsForDepth(plan.depth)).map((item, index) => {
      const titleId = item.TitleID ?? item.ItemID ?? "";
      const source = titleId ? `https://www.biodiversitylibrary.org/bibliography/${encodeURIComponent(String(titleId))}` : "";
      return {
        id: `bhl_${queryIndex}_${slug(String(titleId || index))}`,
        type: "archive",
        title: stripHtml(item.Title) || `${plan.original_topic} Biodiversity Heritage Library record`,
        description: [item.Authors?.[0]?.Name, item.Date, item.BHLType].filter(Boolean).map(stripHtml).join(" · ") || undefined,
        source_url: source,
        source_domain: "biodiversitylibrary.org",
        provider: "bhl",
        tags: ["biodiversity-heritage-library", "natural-history", "scientific-plate-source", `query-${queryIndex + 1}`],
        ...checkRequiredLicense()
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

function xmlText(record: string, tag: string): string | undefined {
  const match = record.match(new RegExp(`<[^>]*${tag}[^>]*>([\\s\\S]*?)<\\/[^>]*${tag}>`, "i"));
  return match ? stripHtml(match[1]).trim() : undefined;
}

export async function searchGallicaBnf(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "gallica").map((query, queryIndex) => async () => {
    const url = new URL("https://gallica.bnf.fr/SRU");
    url.searchParams.set("operation", "searchRetrieve");
    url.searchParams.set("version", "1.2");
    url.searchParams.set("maximumRecords", String(rowsForDepth(plan.depth)));
    url.searchParams.set("query", `dc.title all \"${query.replace(/\"/g, "")}\"`);
    const xml = await fetchTextWithTimeout(url.toString(), {}, 8000);
    const records = xml.match(/<srw:record>[\s\S]*?<\/srw:record>/g) ?? [];
    return records.map((record, index) => {
      const identifier = xmlText(record, "identifier");
      const title = xmlText(record, "title");
      const creator = xmlText(record, "creator");
      const date = xmlText(record, "date");
      const source = identifier?.startsWith("http") ? identifier : identifier ? `https://gallica.bnf.fr/ark:/${identifier}` : "";
      const encoded = source ? encodeURIComponent(source.split("/ark:/")[1] ?? "") : "";
      const thumbnail = encoded ? `https://gallica.bnf.fr/iiif/ark:/${encoded}/f1/full/600,/0/native.jpg` : undefined;
      return {
        id: `gallica_${queryIndex}_${slug(identifier ?? String(index))}`,
        type: thumbnail ? "image" : "archive",
        title: stripHtml(title) || `${plan.original_topic} Gallica record`,
        description: [creator, date].filter(Boolean).map(stripHtml).join(" · ") || undefined,
        thumbnail_url: thumbnail,
        image_url: thumbnail,
        source_url: source,
        source_domain: "gallica.bnf.fr",
        provider: "gallica",
        tags: ["gallica", "bnf", "digital-library", "archive-open-access", `query-${queryIndex + 1}`],
        ...checkRequiredLicense()
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface NyplCapture { imageLink?: string; highResLink?: string; }
interface NyplItem { uuid?: string; title?: string; imageID?: string; apiItemURL?: string; itemLink?: string; captures?: NyplCapture[]; }

export async function searchNyplDigitalCollections(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = readServerProviderKey("NYPL_API_KEY");
  if (!apiKey || !shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "nypl").map((query, queryIndex) => async () => {
    const url = new URL("https://api.repo.nypl.org/api/v1/items/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("publicDomainOnly", "true");
    const data = await fetchJsonWithTimeout<{ nyplAPI?: { response?: { result?: NyplItem[] } } }>(url.toString(), { headers: { Authorization: `Token token=${apiKey}` } }, 8000);
    return (data?.nyplAPI?.response?.result ?? []).slice(0, rowsForDepth(plan.depth)).map((item, index) => {
      const capture = item.captures?.[0];
      const image = capture?.highResLink ?? capture?.imageLink;
      const source = item.itemLink ?? item.apiItemURL ?? (item.uuid ? `https://digitalcollections.nypl.org/items/${encodeURIComponent(item.uuid)}` : "");
      return {
        id: `nypl_${queryIndex}_${item.uuid ?? index}`,
        type: image ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} NYPL record`,
        thumbnail_url: image,
        image_url: image,
        source_url: source,
        source_domain: "nypl.org",
        provider: "nypl",
        source_access_mode: "backend_free_key_required",
        rights_status: "public_domain",
        reuse_risk: "low",
        license_detected: "public_domain",
        license_confidence: 0.72,
        tags: ["nypl-digital-collections", "public-domain", "free-key-provider", `query-${queryIndex + 1}`]
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface NaraRecord { title?: string; naId?: string | number; description?: string; objectType?: string; objects?: Array<{ thumbnailUrl?: string; fileUrl?: string }> }

export async function searchNaraCatalog(plan: SearchPlan): Promise<RawProviderResult[]> {
  if (!shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "nara").map((query, queryIndex) => async () => {
    const url = new URL("https://catalog.archives.gov/api/v1/");
    url.searchParams.set("q", query);
    url.searchParams.set("availableOnline", "true");
    url.searchParams.set("rows", String(rowsForDepth(plan.depth)));
    const data = await fetchJsonWithTimeout<{ body?: { hits?: { hits?: Array<{ _source?: { record?: NaraRecord } }> } } }>(url.toString(), {}, 8000);
    return (data?.body?.hits?.hits ?? []).map((hit, index) => {
      const item = hit._source?.record ?? {};
      const object = item.objects?.[0];
      const source = item.naId ? `https://catalog.archives.gov/id/${encodeURIComponent(String(item.naId))}` : "";
      return {
        id: `nara_${queryIndex}_${item.naId ?? index}`,
        type: object?.thumbnailUrl || object?.fileUrl ? "image" : "archive",
        title: stripHtml(item.title) || `${plan.original_topic} National Archives record`,
        description: stripHtml(item.description).slice(0, 260) || item.objectType,
        thumbnail_url: object?.thumbnailUrl ?? object?.fileUrl,
        image_url: object?.fileUrl ?? object?.thumbnailUrl,
        source_url: source,
        source_domain: "catalog.archives.gov",
        provider: "nara",
        tags: ["nara", "national-archives", "public-record", `query-${queryIndex + 1}`],
        ...checkRequiredLicense()
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}

interface DplaDoc { id?: string; title?: string | string[]; object?: string; isShownAt?: string; sourceResource?: { title?: string | string[]; creator?: string[]; date?: Array<{ displayDate?: string }> }; provider?: { name?: string } }

export async function searchDpla(plan: SearchPlan): Promise<RawProviderResult[]> {
  const apiKey = readServerProviderKey("DPLA_API_KEY");
  if (!apiKey || !shouldRunMuseumProvider(plan)) return [];
  const tasks = providerQuerySlice(plan, "dpla").map((query, queryIndex) => async () => {
    const url = new URL("https://api.dp.la/v2/items");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("page_size", String(rowsForDepth(plan.depth)));
    const data = await fetchJsonWithTimeout<{ docs?: DplaDoc[] }>(url.toString(), {}, 8000);
    return (data?.docs ?? []).map((item, index) => {
      const titleValue = item.title ?? item.sourceResource?.title;
      const title = Array.isArray(titleValue) ? titleValue[0] : titleValue;
      const source = item.isShownAt ?? (item.id ? `https://dp.la/item/${encodeURIComponent(item.id)}` : "");
      return {
        id: `dpla_${queryIndex}_${item.id ?? index}`,
        type: item.object ? "image" : "archive",
        title: stripHtml(title) || `${plan.original_topic} DPLA record`,
        description: [item.sourceResource?.creator?.[0], item.sourceResource?.date?.[0]?.displayDate, item.provider?.name].filter(Boolean).map(stripHtml).join(" · ") || undefined,
        thumbnail_url: item.object,
        image_url: item.object,
        source_url: source,
        source_domain: source ? domainFromUrl(source) : "dp.la",
        provider: "dpla",
        source_access_mode: "backend_free_key_required",
        rights_status: "check_required",
        reuse_risk: "medium",
        license_detected: "unclear",
        license_confidence: 0.48,
        tags: ["dpla", "cultural-heritage-aggregator", "free-key-provider", `query-${queryIndex + 1}`]
      } satisfies RawProviderResult;
    }).filter((item) => item.source_url);
  });
  const batches = await runLimited(tasks, 2);
  return batches.flat();
}
