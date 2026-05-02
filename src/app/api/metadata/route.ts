import { NextResponse } from "next/server";
import type { UrlMetadataRequest, UrlMetadataResponse } from "@/types/research";

const MAX_HTML_BYTES = 700_000;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return undefined;
}

function absolutizeUrl(candidate: string | undefined, baseUrl: string): string | undefined {
  if (!candidate) return undefined;
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return undefined;
  }
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = windowlessTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "VisualResearchBoard/0.1 metadata extractor",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      throw new Error(`Metadata fetch failed with HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("URL did not return an HTML page suitable for metadata extraction.");
    }

    const text = await response.text();
    return text.slice(0, MAX_HTML_BYTES);
  } finally {
    clearTimeout(timeout);
  }
}

function windowlessTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
  return setTimeout(callback, delay);
}

function extractMetadata(url: string, html: string): UrlMetadataResponse {
  const title = firstMatch(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<title[^>]*>([\s\S]*?)<\/title>/i
  ]) ?? domainFromUrl(url);

  const description = firstMatch(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
  ]);

  const imageCandidate = firstMatch(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  ]);

  return {
    url,
    source_domain: domainFromUrl(url),
    title,
    description,
    thumbnail_url: absolutizeUrl(imageCandidate, url),
    fetched_at: new Date().toISOString(),
    status: title || description || imageCandidate ? "ok" : "partial"
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Partial<UrlMetadataRequest> | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!isValidHttpUrl(url)) {
    return NextResponse.json({ error: "Provide a valid http or https URL." }, { status: 400 });
  }

  try {
    const html = await fetchWithTimeout(url);
    return NextResponse.json(extractMetadata(url, html));
  } catch (error) {
    const fallback: UrlMetadataResponse = {
      url,
      source_domain: domainFromUrl(url),
      title: domainFromUrl(url),
      fetched_at: new Date().toISOString(),
      status: "error",
      message: error instanceof Error ? error.message : "Unknown metadata extraction error."
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
