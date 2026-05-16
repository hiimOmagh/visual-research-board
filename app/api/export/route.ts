import { NextResponse } from "next/server";

const routeSurface = {
  app_version: "2.4.0",
  schema_version: "2.4.0",
  route: "/api/export",
  status: "available",
  mode: "local-first",
  purpose: "Evidence pack export endpoint contract",
  live_claims: "none",
  fallback: "transparent fixture/demo mode when real providers are unavailable",
};

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  return NextResponse.json(routeSurface);
}

export async function POST(request: Request) {
  const body = await readBody(request);

  return NextResponse.json({
    ...routeSurface,
    received_payload: Boolean(body),
    note: "v2.4.0 route surface integrity stub preserves the endpoint contract without adding paid APIs, OAuth, or live scraping.",
  });
}
