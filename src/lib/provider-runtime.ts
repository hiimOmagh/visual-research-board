import type { ProviderRuntimeEntry, ProviderRuntimeReport, SearchProviderName } from "@/types/research";

export const APP_VERSION = "0.2.2";

const ENDPOINT_SAMPLES: Record<SearchProviderName, string[]> = {
  mock: ["local/mock"],
  wikimedia: ["commons.wikimedia.org/w/api.php"],
  brave: ["api.search.brave.com/res/v1/images/search", "api.search.brave.com/res/v1/web/search"],
  tavily: ["api.tavily.com/search"]
};

export function buildProviderRuntimeReport(params: {
  mockOnly: boolean;
  staticDemo?: boolean;
  braveKeyPresent?: boolean;
  tavilyKeyPresent?: boolean;
  generatedAt?: string;
}): ProviderRuntimeReport {
  const generatedAt = params.generatedAt ?? new Date().toISOString();
  const runtimeHost = params.staticDemo ? "static_client_demo" : "nextjs_runtime";

  const providers: ProviderRuntimeEntry[] = [
    {
      provider: "mock",
      readiness: "configured",
      requires_key: false,
      endpoint_sample: ENDPOINT_SAMPLES.mock,
      message: "Mock provider is always available and keeps the app usable without API keys."
    },
    {
      provider: "wikimedia",
      readiness: params.staticDemo ? "static_demo_disabled" : params.mockOnly ? "forced_mock_disabled" : "available_no_key_needed",
      requires_key: false,
      endpoint_sample: ENDPOINT_SAMPLES.wikimedia,
      message: params.staticDemo
        ? "Static demo mode cannot call server-side Wikimedia fetches. Deploy on a Next.js runtime for live Wikimedia results."
        : params.mockOnly
          ? "Server mock-only mode is active, so Wikimedia is intentionally disabled."
          : "Wikimedia Commons can run without an API key in the Next.js runtime."
    },
    {
      provider: "brave",
      readiness: params.staticDemo ? "static_demo_disabled" : params.mockOnly ? "forced_mock_disabled" : params.braveKeyPresent ? "configured" : "missing_key",
      requires_key: true,
      required_env: "BRAVE_SEARCH_API_KEY",
      endpoint_sample: ENDPOINT_SAMPLES.brave,
      message: params.staticDemo
        ? "Static demo mode cannot call Brave. Deploy on a Next.js runtime and add BRAVE_SEARCH_API_KEY."
        : params.mockOnly
          ? "Server mock-only mode is active, so Brave is intentionally disabled."
          : params.braveKeyPresent
            ? "Brave key is present. Run provider:runtime:test against a running deployment to capture live evidence."
            : "BRAVE_SEARCH_API_KEY is missing. Brave will report missing_key until configured."
    },
    {
      provider: "tavily",
      readiness: params.staticDemo ? "static_demo_disabled" : params.mockOnly ? "forced_mock_disabled" : params.tavilyKeyPresent ? "configured" : "missing_key",
      requires_key: true,
      required_env: "TAVILY_API_KEY",
      endpoint_sample: ENDPOINT_SAMPLES.tavily,
      message: params.staticDemo
        ? "Static demo mode cannot call Tavily. Deploy on a Next.js runtime and add TAVILY_API_KEY."
        : params.mockOnly
          ? "Server mock-only mode is active, so Tavily is intentionally disabled."
          : params.tavilyKeyPresent
            ? "Tavily key is present. Run provider:runtime:test against a running deployment to capture live evidence."
            : "TAVILY_API_KEY is missing. Tavily will report missing_key until configured."
    }
  ];

  const liveProviderReadyCount = providers.filter((item) => item.provider !== "mock" && ["configured", "available_no_key_needed"].includes(item.readiness)).length;
  const missingKeys = providers.filter((item) => item.readiness === "missing_key").map((item) => item.required_env).filter(Boolean);

  const recommendedNextSteps = (() => {
    if (params.staticDemo) {
      return [
        "GitHub Pages is mock-only. Use Vercel or another Next.js runtime for live provider validation.",
        "Run npm run provider:runtime:test against the deployed Next.js URL after adding provider keys."
      ];
    }
    if (params.mockOnly) {
      return [
        "Disable VISUAL_RESEARCH_BOARD_MOCK_ONLY to validate live providers.",
        "Keep mock enabled as fallback, but let Wikimedia/Brave/Tavily run during runtime evidence capture."
      ];
    }
    if (missingKeys.length > 0) {
      return [
        `Add missing environment variables: ${missingKeys.join(", ")}.`,
        "Run npm run provider:runtime:test against localhost or the deployed runtime URL."
      ];
    }
    return [
      "Run npm run provider:runtime:test against the active runtime URL.",
      "Review artifacts/provider-runtime-evidence.json and verify deep mode reaches the candidate target with real providers active."
    ];
  })();

  return {
    app_version: APP_VERSION,
    generated_at: generatedAt,
    runtime_host: runtimeHost,
    mock_only: params.mockOnly,
    live_provider_ready_count: liveProviderReadyCount,
    providers,
    recommended_next_steps: recommendedNextSteps
  };
}
