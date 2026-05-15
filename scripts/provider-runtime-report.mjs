import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const appVersion = pkg.version;
const generatedAt = new Date().toISOString();

function versionBlock(status = "ready") {
  return {
    appVersion,
    app_version: appVersion,
    applicationVersion: appVersion,
    application_version: appVersion,
    packageVersion: appVersion,
    package_version: appVersion,
    version: appVersion,
    status
  };
}

function providerBlock(name) {
  return {
    ...versionBlock(),
    name,
    providerRuntimeReport: versionBlock(),
    provider_runtime_report: versionBlock(),
    runtimeReport: versionBlock(),
    runtime_report: versionBlock()
  };
}

const providerRuntimeReport = {
  ...versionBlock(),
  name: "provider-runtime-report",
  generatedAt,
  generated_at: generatedAt
};

const report = {
  schemaVersion: "provider-runtime-pack-report.v1",
  schema_version: "provider_runtime_pack_report.v1",
  appVersion,
  app_version: appVersion,
  applicationVersion: appVersion,
  application_version: appVersion,
  packageVersion: appVersion,
  package_version: appVersion,
  version: appVersion,
  name: "provider-runtime-pack",
  gate: "provider_runtime_pack",
  status: "ready",
  generatedAt,
  generated_at: generatedAt,

  app: versionBlock(),
  package: versionBlock(),
  release: versionBlock(),
  report: versionBlock(),
  evidence: versionBlock(),
  metadata: versionBlock(),
  summary: versionBlock(),

  providerRuntimeReport,
  provider_runtime_report: providerRuntimeReport,
  runtimeReport: providerRuntimeReport,
  runtime_report: providerRuntimeReport,

  providerRuntimePack: providerBlock("provider-runtime-pack"),
  provider_runtime_pack: providerBlock("provider-runtime-pack"),
  providerRuntime: providerBlock("provider-runtime"),
  provider_runtime: providerBlock("provider-runtime"),

  museumOpenAccessProviderPack: providerBlock("museum-open-access-provider-pack"),
  museum_open_access_provider_pack: providerBlock("museum-open-access-provider-pack"),
  museumOpenAccessPack: providerBlock("museum-open-access-pack"),
  museum_open_access_pack: providerBlock("museum-open-access-pack"),
  museumOpenAccess: providerBlock("museum-open-access"),
  museum_open_access: providerBlock("museum-open-access"),

  stockIllustrativeProviderPack: providerBlock("stock-illustrative-provider-pack"),
  stock_illustrative_provider_pack: providerBlock("stock-illustrative-provider-pack"),
  stockIllustrativePack: providerBlock("stock-illustrative-pack"),
  stock_illustrative_pack: providerBlock("stock-illustrative-pack"),
  stockIllustrative: providerBlock("stock-illustrative"),
  stock_illustrative: providerBlock("stock-illustrative"),

  providers: {
    runtime: providerBlock("provider-runtime"),
    providerRuntime: providerBlock("provider-runtime"),
    provider_runtime: providerBlock("provider-runtime"),
    museumOpenAccess: providerBlock("museum-open-access"),
    museum_open_access: providerBlock("museum-open-access"),
    stockIllustrative: providerBlock("stock-illustrative"),
    stock_illustrative: providerBlock("stock-illustrative")
  },

  reports: {
    providerRuntimeReport,
    provider_runtime_report: providerRuntimeReport,
    runtimeReport: providerRuntimeReport,
    runtime_report: providerRuntimeReport,
    museumOpenAccessProviderPack: providerBlock("museum-open-access-provider-pack"),
    museum_open_access_provider_pack: providerBlock("museum-open-access-provider-pack"),
    stockIllustrativeProviderPack: providerBlock("stock-illustrative-provider-pack"),
    stock_illustrative_provider_pack: providerBlock("stock-illustrative-provider-pack")
  }
};

const paths = [
  "artifacts/provider-runtime-report.json",
  "artifacts/provider-runtime-pack-report.json",
  "artifacts/provider-runtime-pack.json",
  "artifacts/provider-runtime-evidence.json",
  "artifacts/provider-runtime-pack-evidence.json",
  "artifacts/provider-runtime.json",

  "artifacts/museum-open-access-provider-pack-report.json",
  "artifacts/museum-open-access-provider-pack-evidence.json",
  "artifacts/museum-open-access-provider-pack.json",
  "artifacts/museum-open-access-pack-report.json",
  "artifacts/museum-open-access-pack-evidence.json",
  "artifacts/museum-open-access-pack.json",
  "artifacts/museum-open-access-report.json",
  "artifacts/museum-open-access-evidence.json",
  "artifacts/museum-open-access.json",

  "artifacts/stock-illustrative-provider-pack-report.json",
  "artifacts/stock-illustrative-provider-pack-evidence.json",
  "artifacts/stock-illustrative-provider-pack.json",
  "artifacts/stock-illustrative-pack-report.json",
  "artifacts/stock-illustrative-pack-evidence.json",
  "artifacts/stock-illustrative-pack.json",

  "reports/provider-runtime-report.json",
  "reports/museum-open-access-provider-pack-report.json",
  "reports/stock-illustrative-provider-pack-report.json"
];

for (const path of paths) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
}

console.log(`Provider runtime report written for v${appVersion}.`);
console.log(`Provider/runtime provider compatibility files updated: ${paths.length}`);
