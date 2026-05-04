import type { ReferenceSearchEngine, ReferenceSearchLink } from "@/types/research";

type ReferenceEngineConfig = {
  engine: ReferenceSearchEngine;
  label: string;
  buildUrl: (query: string) => string;
};

const referenceEngines: ReferenceEngineConfig[] = [
  { engine: "google_images", label: "Google Images", buildUrl: (q) => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}` },
  { engine: "bing_images", label: "Bing Images", buildUrl: (q) => `https://www.bing.com/images/search?q=${encodeURIComponent(q)}` },
  { engine: "duckduckgo_images", label: "DuckDuckGo Images", buildUrl: (q) => `https://duckduckgo.com/?iax=images&ia=images&q=${encodeURIComponent(q)}` },
  { engine: "yandex_images", label: "Yandex Images", buildUrl: (q) => `https://yandex.com/images/search?text=${encodeURIComponent(q)}` },
  { engine: "startpage_images", label: "Startpage Images", buildUrl: (q) => `https://www.startpage.com/sp/search?cat=pics&query=${encodeURIComponent(q)}` },
  { engine: "qwant_images", label: "Qwant Images", buildUrl: (q) => `https://www.qwant.com/?t=images&q=${encodeURIComponent(q)}` },
  { engine: "mojeek_images", label: "Mojeek", buildUrl: (q) => `https://www.mojeek.com/search?q=${encodeURIComponent(q)}` },
  { engine: "pinterest", label: "Pinterest Reference", buildUrl: (q) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}` },
  { engine: "youtube", label: "YouTube Reference", buildUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` }
];

export function buildReferenceSearchLinks(topic: string): ReferenceSearchLink[] {
  const query = topic.trim();
  if (query.length < 2) return [];
  return referenceEngines.map((engine) => ({
    engine: engine.engine,
    label: engine.label,
    query,
    search_url: engine.buildUrl(query),
    purpose: "reference_discovery",
    fetched_by_tool: false,
    rights_status: "reference_only"
  }));
}

export function referenceSearchPolicySummary(): string {
  return "Reference search engines are launcher-only. The app does not scrape search result pages; users manually import selected source URLs for review.";
}
