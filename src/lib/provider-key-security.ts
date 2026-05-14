import type { ProviderKeySecurityEntry, ProviderKeySecurityReport, SearchProviderName } from "@/types/research";

export const APP_VERSION = "2.1.0";

export const SERVER_PROVIDER_SECRET_ENVS = {
  smithsonian: "SMITHSONIAN_API_KEY",
  europeana: "EUROPEANA_API_KEY",
  rijksmuseum: "RIJKSMUSEUM_API_KEY",
  nypl: "NYPL_API_KEY",
  dpla: "DPLA_API_KEY",
  pixabay: "PIXABAY_API_KEY",
  pexels: "PEXELS_API_KEY",
  unsplash: "UNSPLASH_ACCESS_KEY",
  brave: "BRAVE_SEARCH_API_KEY",
  tavily: "TAVILY_API_KEY"
} as const satisfies Partial<Record<SearchProviderName, string>>;

export type ProviderSecretEnvName = (typeof SERVER_PROVIDER_SECRET_ENVS)[keyof typeof SERVER_PROVIDER_SECRET_ENVS];

type ProviderKeyPresence = Partial<Record<keyof typeof SERVER_PROVIDER_SECRET_ENVS, boolean>>;

const OPTIONAL_PAID_OR_LEGACY_PROVIDERS = new Set<SearchProviderName>(["brave", "tavily"]);
const PUBLIC_ENV_SECRET_PATTERN = /(API[_-]?KEY|ACCESS[_-]?KEY|TOKEN|SECRET|BEARER|PASSWORD|PRIVATE)/i;

function normalizeEnvValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function hasConfiguredServerSecret(envName: ProviderSecretEnvName, env: NodeJS.ProcessEnv = process.env): boolean {
  return normalizeEnvValue(env[envName]).length > 0;
}

export function readServerProviderKey(envName: ProviderSecretEnvName, env: NodeJS.ProcessEnv = process.env): string | undefined {
  const value = normalizeEnvValue(env[envName]);
  return value.length > 0 ? value : undefined;
}

export function detectPublicSecretEnvKeys(env: NodeJS.ProcessEnv = process.env): string[] {
  return Object.keys(env)
    .filter((key) => key.startsWith("NEXT_PUBLIC_") && PUBLIC_ENV_SECRET_PATTERN.test(key))
    .sort();
}

export function getProviderKeyPresenceFromEnv(env: NodeJS.ProcessEnv = process.env): {
  braveKeyPresent: boolean;
  tavilyKeyPresent: boolean;
  smithsonianKeyPresent: boolean;
  europeanaKeyPresent: boolean;
  rijksmuseumKeyPresent: boolean;
  nyplKeyPresent: boolean;
  dplaKeyPresent: boolean;
  pixabayKeyPresent: boolean;
  pexelsKeyPresent: boolean;
  unsplashKeyPresent: boolean;
} {
  return {
    braveKeyPresent: hasConfiguredServerSecret("BRAVE_SEARCH_API_KEY", env),
    tavilyKeyPresent: hasConfiguredServerSecret("TAVILY_API_KEY", env),
    smithsonianKeyPresent: hasConfiguredServerSecret("SMITHSONIAN_API_KEY", env),
    europeanaKeyPresent: hasConfiguredServerSecret("EUROPEANA_API_KEY", env),
    rijksmuseumKeyPresent: hasConfiguredServerSecret("RIJKSMUSEUM_API_KEY", env),
    nyplKeyPresent: hasConfiguredServerSecret("NYPL_API_KEY", env),
    dplaKeyPresent: hasConfiguredServerSecret("DPLA_API_KEY", env),
    pixabayKeyPresent: hasConfiguredServerSecret("PIXABAY_API_KEY", env),
    pexelsKeyPresent: hasConfiguredServerSecret("PEXELS_API_KEY", env),
    unsplashKeyPresent: hasConfiguredServerSecret("UNSPLASH_ACCESS_KEY", env)
  };
}

export function missingProviderSecretEnv(provider: keyof typeof SERVER_PROVIDER_SECRET_ENVS, env: NodeJS.ProcessEnv = process.env): ProviderSecretEnvName | undefined {
  const envName = SERVER_PROVIDER_SECRET_ENVS[provider];
  return hasConfiguredServerSecret(envName, env) ? undefined : envName;
}

function keyPresenceForProvider(provider: keyof typeof SERVER_PROVIDER_SECRET_ENVS, keyPresence: ProviderKeyPresence): boolean {
  return Boolean(keyPresence[provider]);
}

export function buildProviderKeySecurityReport(params: {
  keyPresence?: ProviderKeyPresence;
  staticDemo?: boolean;
  mockOnly?: boolean;
  publicSecretEnvNames?: string[];
  generatedAt?: string;
}): ProviderKeySecurityReport {
  const generatedAt = params.generatedAt ?? new Date().toISOString();
  const publicSecretEnvNames = [...new Set(params.publicSecretEnvNames ?? [])].sort();
  const entries: ProviderKeySecurityEntry[] = (Object.entries(SERVER_PROVIDER_SECRET_ENVS) as Array<[keyof typeof SERVER_PROVIDER_SECRET_ENVS, ProviderSecretEnvName]>).map(([provider, envName]) => {
    const configured = keyPresenceForProvider(provider, params.keyPresence ?? {});
    const optionalLegacy = OPTIONAL_PAID_OR_LEGACY_PROVIDERS.has(provider);
    const exposure = publicSecretEnvNames.includes(`NEXT_PUBLIC_${envName}`) ? "public_env_leak_detected" : "server_only";
    return {
      provider,
      required_env: envName,
      configured,
      server_only: exposure === "server_only",
      client_exposed: exposure !== "server_only",
      exposure,
      redacted_value: configured ? "configured:redacted" : "missing",
      provider_class: optionalLegacy ? "optional_legacy_api" : provider === "pixabay" || provider === "pexels" || provider === "unsplash" ? "stock_illustrative" : "free_key_backend",
      message: configured
        ? `${envName} is configured on the server and redacted from diagnostics.`
        : optionalLegacy
          ? `${envName} is missing; this optional legacy/API provider should remain disabled unless explicitly configured.`
          : `${envName} is missing; the provider remains disabled while the no-key free core can still run.`
    };
  });

  const configuredKeyCount = entries.filter((entry) => entry.configured).length;
  const publicEnvLeakCount = entries.filter((entry) => entry.client_exposed).length + publicSecretEnvNames.filter((name) => !name.startsWith("NEXT_PUBLIC_VISUAL_RESEARCH_BOARD_")).length;
  const warnings = [
    params.staticDemo ? "Static demo mode cannot execute server-side provider keys; use manual reference launchers or a Next.js runtime." : undefined,
    params.mockOnly ? "Mock-only mode disables live provider calls even when server keys are configured." : undefined,
    publicEnvLeakCount > 0 ? `Potential public secret env names detected: ${publicSecretEnvNames.join(", ")}. Move provider keys to server-only env names without NEXT_PUBLIC_.` : undefined
  ].filter(Boolean) as string[];

  return {
    schema_version: "2.1.0",
    app_version: APP_VERSION,
    generated_at: generatedAt,
    secret_source: "server_env_only",
    configured_key_count: configuredKeyCount,
    missing_key_count: entries.length - configuredKeyCount,
    public_env_leak_count: publicEnvLeakCount,
    entries,
    warnings
  };
}
