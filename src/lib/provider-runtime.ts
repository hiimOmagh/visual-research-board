import type { ProviderRuntimeEntry, ProviderRuntimeReport, SearchProviderName } from "@/types/research";
import { buildProviderKeySecurityReport } from "@/lib/provider-key-security";

export const APP_VERSION = "1.8.0";

const ENDPOINT_SAMPLES: Record<SearchProviderName, string[]> = {
  mock: ["local/mock"],
  wikimedia: ["commons.wikimedia.org/w/api.php"],
  openverse: ["api.openverse.org/v1/images"],
  loc: ["loc.gov/search/?fo=json"],
  internet_archive: ["archive.org/advancedsearch.php"],
  nasa: ["images-api.nasa.gov/search"],
  smithsonian: ["api.si.edu/openaccess/api/v1.0/search"],
  europeana: ["api.europeana.eu/record/v2/search.json"],
  met: ["collectionapi.metmuseum.org/public/collection/v1"],
  artic: ["api.artic.edu/api/v1/artworks/search"],
  cleveland_museum: ["openaccess-api.clevelandart.org/api/artworks"],
  rijksmuseum: ["www.rijksmuseum.nl/api/en/collection"],
  wellcome: ["api.wellcomecollection.org/catalogue/v2/works"],
  bhl: ["biodiversitylibrary.org/api3"],
  gallica: ["gallica.bnf.fr/SRU"],
  nypl: ["api.repo.nypl.org/api/v1/items/search.json"],
  nara: ["catalog.archives.gov/api/v1"],
  dpla: ["api.dp.la/v2/items"],
  pixabay: ["pixabay.com/api"],
  pexels: ["api.pexels.com/v1/search"],
  unsplash: ["api.unsplash.com/search/photos"],
  brave: ["api.search.brave.com/res/v1/images/search", "api.search.brave.com/res/v1/web/search"],
  tavily: ["api.tavily.com/search"]
};

function readinessForFreeProvider(staticDemo: boolean, mockOnly: boolean) {
  if (staticDemo) return "static_demo_disabled" as const;
  if (mockOnly) return "forced_mock_disabled" as const;
  return "available_no_key_needed" as const;
}

function readinessForFreeKeyProvider(staticDemo: boolean, mockOnly: boolean, keyPresent: boolean) {
  if (staticDemo) return "static_demo_disabled" as const;
  if (mockOnly) return "forced_mock_disabled" as const;
  return keyPresent ? "configured" as const : "missing_key" as const;
}

function optionalProviderReadiness(staticDemo: boolean, mockOnly: boolean, keyPresent: boolean) {
  if (staticDemo) return "static_demo_disabled" as const;
  if (mockOnly) return "forced_mock_disabled" as const;
  return keyPresent ? "configured" as const : "optional_paid_disabled" as const;
}

export function buildProviderRuntimeReport(params: {
  mockOnly: boolean;
  staticDemo?: boolean;
  braveKeyPresent?: boolean;
  tavilyKeyPresent?: boolean;
  smithsonianKeyPresent?: boolean;
  europeanaKeyPresent?: boolean;
  rijksmuseumKeyPresent?: boolean;
  nyplKeyPresent?: boolean;
  dplaKeyPresent?: boolean;
  pixabayKeyPresent?: boolean;
  pexelsKeyPresent?: boolean;
  unsplashKeyPresent?: boolean;
  publicSecretEnvNames?: string[];
  generatedAt?: string;
}): ProviderRuntimeReport {
  const generatedAt = params.generatedAt ?? new Date().toISOString();
  const staticDemo = Boolean(params.staticDemo);
  const runtimeHost = staticDemo ? "static_client_demo" : "nextjs_runtime";
  const keySecurity = buildProviderKeySecurityReport({
    generatedAt,
    staticDemo,
    mockOnly: params.mockOnly,
    publicSecretEnvNames: params.publicSecretEnvNames,
    keyPresence: {
      brave: params.braveKeyPresent,
      tavily: params.tavilyKeyPresent,
      smithsonian: params.smithsonianKeyPresent,
      europeana: params.europeanaKeyPresent,
      rijksmuseum: params.rijksmuseumKeyPresent,
      nypl: params.nyplKeyPresent,
      dpla: params.dplaKeyPresent,
      pixabay: params.pixabayKeyPresent,
      pexels: params.pexelsKeyPresent,
      unsplash: params.unsplashKeyPresent
    }
  });

  const providers: ProviderRuntimeEntry[] = [
    { provider: "mock", readiness: "configured", requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.mock, access_mode: "backend_free_no_key", message: "Mock provider is always available and keeps the app usable without API keys." },
    { provider: "wikimedia", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.wikimedia, access_mode: "backend_free_no_key", message: staticDemo ? "Static demo cannot run server-side Wikimedia fetches." : params.mockOnly ? "Mock-only mode disabled Wikimedia." : "Wikimedia Commons is a free no-key backend provider." },
    { provider: "openverse", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.openverse, access_mode: "backend_free_no_key", message: staticDemo ? "Static demo cannot run server-side Openverse fetches." : params.mockOnly ? "Mock-only mode disabled Openverse." : "Openverse is a free no-key backend provider for open-license image candidates." },
    { provider: "loc", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.loc, access_mode: "backend_free_no_key", message: staticDemo ? "Static demo cannot run server-side Library of Congress fetches." : params.mockOnly ? "Mock-only mode disabled Library of Congress." : "Library of Congress is a free no-key archive/image provider." },
    { provider: "internet_archive", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.internet_archive, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run server-side Internet Archive fetches." : params.mockOnly ? "Mock-only mode disabled Internet Archive." : "Internet Archive metadata search is a free no-key archive provider." },
    { provider: "nasa", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.nasa, access_mode: "backend_free_no_key", message: staticDemo ? "Static demo cannot run server-side NASA Images fetches." : params.mockOnly ? "Mock-only mode disabled NASA Images." : "NASA Images is a free no-key public-agency image provider." },
    { provider: "smithsonian", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.smithsonianKeyPresent)), requires_key: true, required_env: "SMITHSONIAN_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.smithsonian, access_mode: "backend_free_key_required", message: staticDemo ? "Static demo cannot run Smithsonian fetches." : params.mockOnly ? "Mock-only mode disabled Smithsonian." : params.smithsonianKeyPresent ? "Smithsonian free key is present." : "Smithsonian Open Access is free-key only; add SMITHSONIAN_API_KEY or keep it disabled." },
    { provider: "europeana", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.europeanaKeyPresent)), requires_key: true, required_env: "EUROPEANA_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.europeana, access_mode: "backend_free_key_required", message: staticDemo ? "Static demo cannot run Europeana fetches." : params.mockOnly ? "Mock-only mode disabled Europeana." : params.europeanaKeyPresent ? "Europeana free key is present." : "Europeana is free-key only; add EUROPEANA_API_KEY or keep it disabled." },
    { provider: "met", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.met, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Met Museum fetches." : params.mockOnly ? "Mock-only mode disabled Met Museum." : "Met Museum is a free no-key museum/open-access provider." },
    { provider: "artic", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.artic, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Art Institute of Chicago fetches." : params.mockOnly ? "Mock-only mode disabled Art Institute of Chicago." : "Art Institute of Chicago is a free no-key museum/open-access provider." },
    { provider: "cleveland_museum", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.cleveland_museum, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Cleveland Museum fetches." : params.mockOnly ? "Mock-only mode disabled Cleveland Museum." : "Cleveland Museum of Art is a free no-key museum/open-access provider." },
    { provider: "rijksmuseum", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.rijksmuseumKeyPresent)), requires_key: true, required_env: "RIJKSMUSEUM_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.rijksmuseum, access_mode: "backend_free_key_required", message: staticDemo ? "Static demo cannot run Rijksmuseum fetches." : params.mockOnly ? "Mock-only mode disabled Rijksmuseum." : params.rijksmuseumKeyPresent ? "Rijksmuseum free key is present." : "Rijksmuseum is free-key only in this app; add RIJKSMUSEUM_API_KEY or keep it disabled." },
    { provider: "wellcome", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.wellcome, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Wellcome Collection fetches." : params.mockOnly ? "Mock-only mode disabled Wellcome Collection." : "Wellcome Collection is a free no-key cultural/science image provider." },
    { provider: "bhl", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.bhl, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Biodiversity Heritage Library fetches." : params.mockOnly ? "Mock-only mode disabled Biodiversity Heritage Library." : "Biodiversity Heritage Library is a free no-key natural-history/archive provider." },
    { provider: "gallica", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.gallica, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run Gallica/BnF fetches." : params.mockOnly ? "Mock-only mode disabled Gallica/BnF." : "Gallica/BnF is a free no-key digital-library provider." },
    { provider: "nypl", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.nyplKeyPresent)), requires_key: true, required_env: "NYPL_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.nypl, access_mode: "backend_free_key_required", message: staticDemo ? "Static demo cannot run NYPL fetches." : params.mockOnly ? "Mock-only mode disabled NYPL." : params.nyplKeyPresent ? "NYPL free key is present." : "NYPL is free-key only in this app; add NYPL_API_KEY or keep it disabled." },
    { provider: "nara", readiness: readinessForFreeProvider(staticDemo, params.mockOnly), requires_key: false, endpoint_sample: ENDPOINT_SAMPLES.nara, access_mode: "archive_open_access", message: staticDemo ? "Static demo cannot run NARA fetches." : params.mockOnly ? "Mock-only mode disabled NARA." : "National Archives/NARA is a free no-key government archive provider." },
    { provider: "dpla", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.dplaKeyPresent)), requires_key: true, required_env: "DPLA_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.dpla, access_mode: "backend_free_key_required", message: staticDemo ? "Static demo cannot run DPLA fetches." : params.mockOnly ? "Mock-only mode disabled DPLA." : params.dplaKeyPresent ? "DPLA free key is present." : "DPLA is free-key only in this app; add DPLA_API_KEY or keep it disabled." },
    { provider: "pixabay", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.pixabayKeyPresent)), requires_key: true, required_env: "PIXABAY_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.pixabay, access_mode: "stock_illustrative", message: staticDemo ? "Static demo cannot run Pixabay fetches." : params.mockOnly ? "Mock-only mode disabled Pixabay." : params.pixabayKeyPresent ? "Pixabay free key is present." : "Pixabay is free-key stock/illustrative only; add PIXABAY_API_KEY or keep it disabled." },
    { provider: "pexels", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.pexelsKeyPresent)), requires_key: true, required_env: "PEXELS_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.pexels, access_mode: "stock_illustrative", message: staticDemo ? "Static demo cannot run Pexels fetches." : params.mockOnly ? "Mock-only mode disabled Pexels." : params.pexelsKeyPresent ? "Pexels free key is present." : "Pexels is free-key stock/illustrative only; add PEXELS_API_KEY or keep it disabled." },
    { provider: "unsplash", readiness: readinessForFreeKeyProvider(staticDemo, params.mockOnly, Boolean(params.unsplashKeyPresent)), requires_key: true, required_env: "UNSPLASH_ACCESS_KEY", endpoint_sample: ENDPOINT_SAMPLES.unsplash, access_mode: "stock_illustrative", message: staticDemo ? "Static demo cannot run Unsplash fetches." : params.mockOnly ? "Mock-only mode disabled Unsplash." : params.unsplashKeyPresent ? "Unsplash free key is present." : "Unsplash is free-key stock/illustrative only; add UNSPLASH_ACCESS_KEY or keep it disabled." },
    { provider: "brave", readiness: optionalProviderReadiness(staticDemo, params.mockOnly, Boolean(params.braveKeyPresent)), requires_key: true, required_env: "BRAVE_SEARCH_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.brave, access_mode: "rights_check_required", message: params.braveKeyPresent ? "Brave key is present, but Brave remains optional outside the free-only core." : "Brave is optional and disabled by default for free-only sourcing." },
    { provider: "tavily", readiness: optionalProviderReadiness(staticDemo, params.mockOnly, Boolean(params.tavilyKeyPresent)), requires_key: true, required_env: "TAVILY_API_KEY", endpoint_sample: ENDPOINT_SAMPLES.tavily, access_mode: "rights_check_required", message: params.tavilyKeyPresent ? "Tavily key is present, but Tavily remains optional outside the free-only core." : "Tavily is optional and disabled by default for free-only sourcing." }
  ];

  const liveProviderReadyCount = providers.filter((item) => item.provider !== "mock" && ["configured", "available_no_key_needed"].includes(item.readiness)).length;
  const missingFreeKeys = providers.filter((item) => item.readiness === "missing_key").map((item) => item.required_env).filter(Boolean);

  const recommendedNextSteps = (() => {
    if (staticDemo) return ["Static GitHub Pages is mock/reference-only. Use a Next.js runtime for free backend provider calls.", "Use the Reference Search Hub for manual Google/Bing/Yandex discovery and import selected URLs manually."];
    if (params.mockOnly) return ["Disable VISUAL_RESEARCH_BOARD_MOCK_ONLY to validate live free providers.", "Keep mock enabled as fallback while Wikimedia/Openverse/LOC/Archive/NASA run."];
    if (missingFreeKeys.length > 0) return [`Optional free-key providers missing: ${missingFreeKeys.join(", ")}.`, "The no-key free core can still run: Wikimedia, Openverse, LOC, Internet Archive, NASA Images, Met, ArtIC, Cleveland Museum, Wellcome, BHL, Gallica, and NARA. Stock providers are optional illustrative sources and can remain disabled."];
    return ["Run npm run stock:providers:check, npm run free:image:check, and provider runtime smoke checks after deployment.", "Review provider health for rights_status and source_access_mode coverage."];
  })();

  return {
    app_version: APP_VERSION,
    generated_at: generatedAt,
    runtime_host: runtimeHost,
    mock_only: params.mockOnly,
    live_provider_ready_count: liveProviderReadyCount,
    providers,
    recommended_next_steps: recommendedNextSteps,
    key_security: keySecurity
  };
}
