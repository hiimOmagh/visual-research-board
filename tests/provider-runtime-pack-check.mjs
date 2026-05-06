import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(path) { return readFileSync(join(root, path), "utf8"); }

const requiredFiles = [
  "src/lib/provider-runtime.ts",
  "src/app/api/provider-runtime/route.ts",
  "src/components/search/ProviderRuntimePanel.tsx",
  "scripts/provider-runtime-smoke.mjs",
  "tests/fixtures/provider-runtime-topics.json",
  "docs/provider-runtime-test-pack.md"
];

for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing provider runtime file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "1.1.0", "package.json version must be 1.1.0");
assert(Boolean(pkg.scripts?.["provider:runtime:test"]), "package.json must define npm run provider:runtime:test");
assert(Boolean(pkg.scripts?.["provider:runtime:check"]), "package.json must define npm run provider:runtime:check");
assert((pkg.scripts?.qa?.includes("provider-runtime-pack-check") || pkg.scripts?.qa === "node scripts/full-qa-gate.mjs"), "npm run qa must include provider-runtime-pack-check");

const types = read("src/types/research.ts");
assert(types.includes("ProviderRuntimeReport"), "types must define ProviderRuntimeReport");
assert(types.includes("ProviderRuntimeReadiness"), "types must define ProviderRuntimeReadiness");
assert(types.includes("runtime_report"), "SearchDiagnostics must include runtime_report");

const runtimeLib = read("src/lib/provider-runtime.ts");
assert(runtimeLib.includes("APP_VERSION = \"1.1.0\""), "provider runtime report must expose app version 1.1.0");
assert(runtimeLib.includes("buildProviderKeySecurityReport"), "provider runtime report must use key security helper");
assert(runtimeLib.includes("key_security"), "provider runtime report must expose key security diagnostics");
assert(runtimeLib.includes("available_no_key_needed"), "provider runtime report must mark Wikimedia as no-key provider");
assert(runtimeLib.includes("static_demo_disabled"), "provider runtime report must distinguish static demo disabled providers");

const runtimeRoute = read("src/app/api/provider-runtime/route.ts");
assert(runtimeRoute.includes("buildProviderRuntimeReport"), "provider runtime API route must use buildProviderRuntimeReport");
assert(runtimeRoute.includes("getProviderKeyPresenceFromEnv"), "provider runtime API route must inspect server key presence through security helper");
assert(runtimeRoute.includes("detectPublicSecretEnvKeys"), "provider runtime API route must detect public secret env leakage");

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("runtime_report: runtimeReport"), "search route diagnostics must include runtime_report");
assert(searchRoute.includes("buildProviderRuntimeReport"), "search route must build runtime report with search diagnostics");

const clientSearch = read("src/lib/client-search.ts");
assert(clientSearch.includes("staticDemo: true"), "client static fallback must generate static runtime report");
assert(clientSearch.includes("runtime_report"), "client static fallback diagnostics must include runtime_report");

const runtimePanel = read("src/components/search/ProviderRuntimePanel.tsx");
assert(runtimePanel.includes("Provider runtime readiness"), "runtime panel must have accessible section label");
assert(runtimePanel.includes("Free provider readiness"), "runtime panel must render free provider readiness heading");
assert(runtimePanel.includes("recommended_next_steps"), "runtime panel must show recommended next steps");

const searchPanel = read("src/components/search/SearchPanel.tsx");
assert(searchPanel.includes("ProviderRuntimePanel"), "SearchPanel must render ProviderRuntimePanel");
assert(searchPanel.includes("v1.1.0"), "SearchPanel header must show v1.1.0");

const script = read("scripts/provider-runtime-smoke.mjs");
assert(script.includes("VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL"), "runtime smoke script must support runtime base URL env");
assert(script.includes("VISUAL_RESEARCH_BOARD_REQUIRE_REAL_PROVIDERS"), "runtime smoke script must support strict real-provider gate");
assert(script.includes("artifacts/provider-runtime-evidence.json"), "runtime smoke script must write provider runtime evidence artifact");
assert(script.includes("/api/provider-runtime"), "runtime smoke script must call provider runtime endpoint");
assert(script.includes("/api/search"), "runtime smoke script must call search endpoint");

const topics = JSON.parse(read("tests/fixtures/provider-runtime-topics.json"));
assert(Array.isArray(topics) && topics.length >= 4, "provider runtime topics fixture must include at least four cases");
assert(topics.some((item) => item.depth === "deep"), "provider runtime fixture must include a deep search case");
assert(topics.every((item) => item.topic && item.mode && item.depth), "provider runtime fixture cases must include topic, mode, and depth");

const docs = read("docs/provider-runtime-test-pack.md");
assert(docs.includes("npm run provider:runtime:test"), "provider runtime docs must document runtime test command");
assert(docs.includes("VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL"), "provider runtime docs must document base URL env");
assert(docs.includes("artifacts/provider-runtime-evidence.json"), "provider runtime docs must document evidence artifact");

if (failures.length) {
  console.error("Provider runtime pack checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Provider runtime pack checks passed for v1.1.0.");
