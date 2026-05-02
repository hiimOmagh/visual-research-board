import { NextResponse } from "next/server";
import { createAttributionExport, createCsvExport, createJsonExport, createMarkdownExport } from "@/lib/export";
import type { ResearchResult } from "@/types/research";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { format?: string; results?: ResearchResult[] } | null;

  if (!body || !Array.isArray(body.results)) {
    return NextResponse.json({ error: "Invalid export request." }, { status: 400 });
  }

  if (body.format === "markdown") {
    return new Response(createMarkdownExport(body.results), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (body.format === "csv") {
    return new Response(createCsvExport(body.results), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  if (body.format === "attribution") {
    return new Response(createAttributionExport(body.results), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  return new Response(createJsonExport(body.results), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
