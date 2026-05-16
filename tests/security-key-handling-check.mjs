import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function read(path) { return readFileSync(join(root, path), "utf8"); }

const requiredFiles = [
  "src/lib/provider-key-security.ts",
  "src/lib/provider-runtime.ts",
  "src/app/api/provider-runtime/route.ts",
  "src/app/api/search/route.ts",
  "docs/security-and-key-handling.md"
];
for (const file of requiredFiles) assert(existsSync(join(root, file)), `Missing security/key file: ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.version === "2.3.0", "package.json version must be 2.3.0");
assert(pkg.description.includes("Security and Key Handling"), "package description must identify Security and Key Handling");
assert(pkg.scripts?.["security:key:check"] === "node tests/security-key-handling-check.mjs", "package.json must expose npm run security:key:check");
assert(pkg.scripts?.["qa:security"] === "node scripts/full-qa-gate.mjs --category=security", "package.json must expose npm run qa:security");

const securityLib = read("src/lib/provider-key-security.ts");
for (const token of [
  "SERVER_PROVIDER_SECRET_ENVS",
  "readServerProviderKey",
  "getProviderKeyPresenceFromEnv",
  "detectPublicSecretEnvKeys",
  "missingProviderSecretEnv",
  "buildProviderKeySecurityReport",
  "configured:redacted",
  "server_env_only"
]) assert(securityLib.includes(token), `provider-key-security.ts must include ${token}`);
for (const env of ["SMITHSONIAN_API_KEY", "EUROPEANA_API_KEY", "RIJKSMUSEUM_API_KEY", "NYPL_API_KEY", "DPLA_API_KEY", "PIXABAY_API_KEY", "PEXELS_API_KEY", "UNSPLASH_ACCESS_KEY", "BRAVE_SEARCH_API_KEY", "TAVILY_API_KEY"]) {
  assert(securityLib.includes(env), `provider-key-security.ts must track ${env}`);
}

const providers = [
  "src/lib/providers/brave.ts",
  "src/lib/providers/tavily.ts",
  "src/lib/providers/smithsonian.ts",
  "src/lib/providers/europeana.ts",
  "src/lib/providers/museum-open-access.ts",
  "src/lib/providers/stock-illustrative.ts"
];
for (const file of providers) {
  const source = read(file);
  assert(source.includes("readServerProviderKey"), `${file} must use readServerProviderKey`);
  assert(!/process\.env\.[A-Z0-9_]*(API_KEY|ACCESS_KEY|TOKEN|SECRET)/.test(source), `${file} must not read provider secrets directly from process.env`);
}

const searchRoute = read("src/app/api/search/route.ts");
assert(searchRoute.includes("getProviderKeyPresenceFromEnv"), "search route must build key presence through the security helper");
assert(searchRoute.includes("missingProviderSecretEnv"), "search route must centralize missing key checks through the security helper");
assert(searchRoute.includes("detectPublicSecretEnvKeys"), "search route must detect NEXT_PUBLIC secret leakage");
assert(searchRoute.includes("key_security: runtimeReport.key_security"), "search diagnostics must include key_security report");

const runtimeRoute = read("src/app/api/provider-runtime/route.ts");
assert(runtimeRoute.includes("getProviderKeyPresenceFromEnv"), "provider runtime route must use the security helper");
assert(runtimeRoute.includes("detectPublicSecretEnvKeys"), "provider runtime route must report public secret env leakage");

const runtimeLib = read("src/lib/provider-runtime.ts");
assert(runtimeLib.includes("buildProviderKeySecurityReport"), "provider runtime report must include key security report");
assert(runtimeLib.includes("key_security"), "provider runtime report must expose key_security diagnostics");

const types = read("src/types/research.ts");
for (const token of ["ProviderKeySecurityReport", "ProviderKeySecurityEntry", "ProviderKeyExposure", "ProviderKeyClass", "key_security?: ProviderKeySecurityReport"]) {
  assert(types.includes(token), `types must include ${token}`);
}

const clientFiles = [
  "src/components/search/ProviderRuntimePanel.tsx",
  "src/components/search/ProviderTogglePanel.tsx",
  "src/lib/client-search.ts"
];
for (const file of clientFiles) {
  const source = read(file);
  assert(!source.includes("readServerProviderKey"), `${file} must not import server key reader`);
  assert(!source.includes("SERVER_PROVIDER_SECRET_ENVS"), `${file} must not import the server key registry`);
}

const env = read(".env.example");
assert(!/NEXT_PUBLIC_.*(API_KEY|ACCESS_KEY|TOKEN|SECRET)/.test(env), ".env.example must not suggest public provider secret variables");

const fullGate = read("scripts/full-qa-gate.mjs");
assert(fullGate.includes('category: "security"'), "full QA gate must include security category");
assert(fullGate.includes("tests/security-key-handling-check.mjs"), "full QA gate must include security key handling check");
assert(fullGate.includes('schema_version: "2.3.0"'), "full QA report schema must identify v2.3.0");

const docs = read("docs/security-and-key-handling.md");
for (const token of ["v2.3.0", "server-only", "redacted", "NEXT_PUBLIC", "npm run security:key:check", "Reference Search Hub"]) {
  assert(docs.includes(token), `security docs must include ${token}`);
}

if (failures.length) {
  console.error("Security/key handling checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Security and Key Handling checks passed for v2.3.0.");
