import { NextResponse } from "next/server";
import { buildProviderRuntimeReport } from "@/lib/provider-runtime";
import { detectPublicSecretEnvKeys, getProviderKeyPresenceFromEnv } from "@/lib/provider-key-security";

const MOCK_ONLY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);

function isMockOnlyMode(): boolean {
  return MOCK_ONLY_ENV_VALUES.has(String(process.env.VISUAL_RESEARCH_BOARD_MOCK_ONLY ?? "").trim().toLowerCase());
}

export async function GET() {
  return NextResponse.json(buildProviderRuntimeReport({
    mockOnly: isMockOnlyMode(),
    staticDemo: false,
    ...getProviderKeyPresenceFromEnv(),
    publicSecretEnvNames: detectPublicSecretEnvKeys()
  }));
}
