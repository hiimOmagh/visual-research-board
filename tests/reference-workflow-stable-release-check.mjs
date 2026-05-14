import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const fp=(p)=>path.join(root,p);
const exists=(p)=>fs.existsSync(fp(p));
const read=(p)=>fs.readFileSync(fp(p),"utf8");
function fail(msg){ console.error(`FAIL reference workflow stable release check: ${msg}`); process.exitCode=1; }
function assert(ok,msg){ if(!ok) fail(msg); }
const pkg=JSON.parse(read("package.json"));
const VERSION=pkg.version;
assert(VERSION==="2.1.0","package.json version must be 2.1.0");
for (const phrase of ["Reference Workflow Stable Release","Activation Pack Export Integration","Activation Pack Export Preview","Activation Pack UI Integration","Reference Activation Pack MVP","Book / Bibliographic Discovery Layer","Social Reference Discovery Layer","Broad Web + Image Discovery Expansion","Broad Reference Result Model","Reference Intelligence Layer MVP","Public Demo Stable Release","Security and Key Handling"]) assert(pkg.description?.includes(phrase),`package description must preserve ${phrase}`);
for (const [script,cmd] of Object.entries({"reference-workflow:stable:check":"node tests/reference-workflow-stable-release-check.mjs","activation-pack:export:check":"node tests/activation-pack-export-integration-check.mjs","activation-pack:export-preview:check":"node tests/activation-pack-export-preview-check.mjs","activation-pack:ui:check":"node tests/activation-pack-ui-integration-check.mjs","reference-activation:check":"node tests/reference-activation-pack-check.mjs","book-reference:check":"node tests/book-bibliographic-discovery-check.mjs","social-reference:check":"node tests/social-reference-discovery-check.mjs","broad-discovery:check":"node tests/broad-web-image-discovery-check.mjs","security:key:check":"node tests/security-key-handling-check.mjs"})) assert(pkg.scripts?.[script]===cmd,`package.json must preserve ${script}`);
if (exists("package-lock.json")) { const lock=JSON.parse(read("package-lock.json")); assert(lock.version===VERSION,"package-lock.json version must match package.json"); assert(lock.packages?.[""]?.version===VERSION,"package-lock root package version must match package.json"); }
const lockText=exists("package-lock.json")?read("package-lock.json"):"";
assert(!lockText.includes('"is-finalizationregistry": "^2.1.0"'),"lockfile must not mutate dependency versions to app version");
assert(!lockText.includes('"which-boxed-primitive": "^2.1.0"'),"lockfile must not mutate dependency versions to app version");
for (const file of ["tests/reference-workflow-stable-release-check.mjs","docs/reference-workflow-stable-release.md","docs/stable-reference-workflow-checklist.md","src/types/broad-discovery.ts","src/types/broad-reference-result.ts","src/types/social-reference.ts","src/types/book-reference.ts","src/types/reference-activation-pack.ts","src/types/activation-pack-ui.ts","src/types/activation-pack-export-preview.ts","src/types/activation-pack-export-integration.ts","src/lib/broad-discovery.ts","src/lib/broad-reference-result.ts","src/lib/social-reference-discovery.ts","src/lib/book-bibliographic-discovery.ts","src/lib/reference-activation-pack.ts","src/lib/activation-pack-ui.ts","src/lib/activation-pack-export-preview.ts","src/lib/activation-pack-export-integration.ts","src/components/search/BroadDiscoveryModePanel.tsx","src/components/search/SocialReferenceDiscoveryPanel.tsx","src/components/search/BookBibliographicDiscoveryPanel.tsx","src/components/search/ReferenceActivationPackPanel.tsx","src/components/search/ActivationPackWorkflowPanel.tsx","src/components/search/ActivationPackExportPreviewPanel.tsx","src/components/search/ActivationPackExportIntegrationPanel.tsx"]) assert(exists(file),`missing required stable workflow file: ${file}`);
const gate=read("scripts/full-qa-gate.mjs");
for (const name of ["broad-web-image-discovery","social-reference-discovery","book-bibliographic-discovery","reference-activation-pack","activation-pack-ui-integration","activation-pack-export-preview","activation-pack-export-integration","reference-workflow-stable-release"]) assert(gate.includes(name),`Full QA gate must include ${name}`);
assert(read("tests/full-qa-gate-check.mjs").includes("reference-workflow-stable-release"),"Full QA manifest must check reference workflow stable release");
const doc=read("docs/reference-workflow-stable-release.md");
for (const token of ["discovery → board → activation → export","No new feature expansion","No scraping","No image generation","No copyrighted text extraction","No paywall bypass","No provider expansion","No export rewrite"]) assert(doc.includes(token),`stable release doc must include ${token}`);
const checklist=read("docs/stable-reference-workflow-checklist.md");
for (const token of ["public demo UX final pass","release docs","screenshots","full QA artifact","npm ci","tag v2.1.0"]) assert(checklist.includes(token),`stable workflow checklist must include ${token}`);
for (const file of ["README.md","PATCH_MANIFEST.md","docs/release-checklist.md","docs/validation-report.md"]) assert(exists(file)&&read(file).includes("v2.1.0"),`${file} must reference v2.1.0`);
const rootApplyScripts=fs.readdirSync(root).filter((n)=>/^apply-v.*\.(mjs|py)$/.test(n));
assert(rootApplyScripts.length===0,`root apply scripts must not remain: ${rootApplyScripts.join(", ")}`);
if (exists("artifacts/full-qa-gate-report.json")) { const report=JSON.parse(read("artifacts/full-qa-gate-report.json")); if (report.app_version!==VERSION) console.warn(`WARN reference workflow stable release: full QA artifact is ${report.app_version}, expected ${VERSION}. Run npm run qa to regenerate it.`); else if (report.status!=="passed" || report.failed_gate_count!==0) console.warn(`WARN reference workflow stable release: full QA artifact status is ${report.status} with failed_gate_count ${report.failed_gate_count}. Run npm run qa to regenerate it.`); }
if (process.exitCode) process.exit(process.exitCode);
console.log(`Reference Workflow Stable Release checks passed for v${VERSION}.`);
