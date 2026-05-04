import { NextResponse } from "next/server";
import { createAttributionExport, createAttributionPackCsvExport, createAttributionPackJsonExport, createAttributionPackMarkdownExport, createCsvExport, createEvidencePackCsvExport, createEvidencePackHtmlExport, createEvidencePackJsonExport, createEvidencePackMarkdownExport, createJsonExport, createMarkdownExport, createTemplateExport } from "@/lib/export";
import type { ExportTemplateId, ResearchProject, ResearchResult } from "@/types/research";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { format?: string; template?: ExportTemplateId; results?: ResearchResult[]; project?: ResearchProject } | null;

  if (!body || !Array.isArray(body.results)) {
    return NextResponse.json({ error: "Invalid export request." }, { status: 400 });
  }



  if (body.format === "attribution_json") {
    return new Response(createAttributionPackJsonExport(body.results, body.project), {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }

  if (body.format === "attribution_markdown") {
    return new Response(createAttributionPackMarkdownExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (body.format === "attribution_csv") {
    return new Response(createAttributionPackCsvExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  if (body.format === "evidence_pack_json") {
    return new Response(createEvidencePackJsonExport(body.results, body.project), {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }

  if (body.format === "evidence_pack_markdown") {
    return new Response(createEvidencePackMarkdownExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (body.format === "evidence_pack_csv") {
    return new Response(createEvidencePackCsvExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  if (body.format === "evidence_pack_html") {
    return new Response(createEvidencePackHtmlExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }

  if (body.format === "template" && body.template) {
    return new Response(createTemplateExport(body.template, body.results, body.project), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (body.format === "markdown") {
    return new Response(createMarkdownExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  if (body.format === "csv") {
    return new Response(createCsvExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  if (body.format === "attribution") {
    return new Response(createAttributionExport(body.results, body.project), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8"
      }
    });
  }

  return new Response(createJsonExport(body.results, body.project), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
