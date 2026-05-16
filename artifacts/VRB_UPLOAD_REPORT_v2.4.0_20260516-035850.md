# VRB full validation upload report

- Generated at: 2026-05-16T03:58:51.0170452+02:00
- Repo root: C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2
- App version: 2.4.0
- Report path: C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2\artifacts\VRB_UPLOAD_REPORT_v2.4.0_20260516-035850.md


## Environment - Node version

- Status: PASS
- Exit code: 0
- Duration seconds: 0.06
- Command: `node --version`

```text
v24.15.0
```

## Environment - npm version

- Status: PASS
- Exit code: 0
- Duration seconds: 0.43
- Command: `npm --version`

```text
11.12.1
```

## Package version

- Status: PASS
- Exit code: 0
- Duration seconds: 0.1
- Command: `node -p "require('./package.json').version"`

```text
2.4.0
```

## Package scripts snapshot

- Status: PASS
- Exit code: 0
- Duration seconds: 0.12
- Command: `node -e "const p=require('./package.json'); const scripts=Object.keys(p.scripts || {}).sort(); console.log(JSON.stringify({version:p.version,scripts:scripts}, null, 2));"`

```text
{
  "version": "2.4.0",
  "scripts": [
    "activation-pack:export-preview:check",
    "activation-pack:export:check",
    "activation-pack:ui:check",
    "attribution:generator:check",
    "board:organization:check",
    "book-reference:check",
    "broad-discovery:check",
    "broad-reference:model:check",
    "broad:retrieval:test",
    "build",
    "build:static",
    "build:static:pages",
    "build:static:repo",
    "ci-parity:workflow:check",
    "claim:mapping:check",
    "clean:rc",
    "coverage:bias:check",
    "creator-session:quality:check",
    "creator-session:quality:review",
    "creator-workflow:interaction:check",
    "creator-workflow:manual-review",
    "creator-workflow:mvp:check",
    "creator-workflow:usability:check",
    "creator-workflow:usability:review",
    "dependency:audit:safe-lock",
    "dependency:audit:safe-lock:check",
    "dependency:audit:triage:check",
    "deployed:browser:check",
    "deployed:browser:test",
    "dev",
    "e2e:fixtures",
    "evidence-pack:v2:check",
    "evidence:deploy",
    "evidence:pack:check",
    "evidence:tuning:check",
    "evidence:tuning:test",
    "first-run:demo-script",
    "first-run:demo-script:check",
    "first-run:evidence-review",
    "first-run:evidence-review:check",
    "first-run:panel:check",
    "first-run:ux:check",
    "first-run:visual:check",
    "first-run:visual:evidence",
    "free:image:check",
    "full:qa:check",
    "hosted-demo:evidence:check",
    "library:conflict:test",
    "lint",
    "lockfile:registry:check",
    "manual:review:check",
    "museum-open-access:check",
    "museum-open-access:report",
    "museum:providers:check",
    "nested:verification:warnings:check",
    "normalization:dedupe:check",
    "normalization:test",
    "project:review:memory:check",
    "provider-runtime:pack:check",
    "provider-runtime:pack:report",
    "provider-runtime:report",
    "provider:inspector:check",
    "provider:runtime:check",
    "provider:runtime:test",
    "provider:smoke",
    "public-demo:check",
    "public-demo:evidence:check",
    "public-demo:final:check",
    "public-demo:screenshot:check",
    "public-demo:stable:check",
    "qa",
    "qa:baseline",
    "qa:exports",
    "qa:list",
    "qa:providers",
    "qa:public-demo",
    "qa:release",
    "qa:retrieval",
    "qa:security",
    "qa:workflow",
    "query:routing:check",
    "ranking:explain:check",
    "reference-activation:check",
    "reference-workflow:stable:check",
    "reference:intelligence:check",
    "release:check",
    "release:evidence:index",
    "release:evidence:index:check",
    "release:package:audit:check",
    "release:verify:runner:check",
    "release:warning:check",
    "retrieval:autotune:check",
    "retrieval:calibration:check",
    "retrieval:evidence:test",
    "retrieval:quality:test",
    "review:evidence:check",
    "route-surface:check",
    "route-surface:review",
    "security:key:check",
    "single-command:verification:check",
    "social-reference:check",
    "stable:hygiene:check",
    "start",
    "stock-illustrative:report",
    "stock:providers:check",
    "storage:hardening:check",
    "test:ci:no-browser",
    "topic:matrix:check",
    "topic:matrix:test",
    "typecheck",
    "ux:reliability:check",
    "validate",
    "validate:deploy",
    "validate:evidence",
    "validate:full",
    "verification:artifact-schema:check",
    "verification:freshness:check",
    "verify:all",
    "verify:artifacts",
    "verify:ci-parity",
    "verify:release"
  ]
}
```

## Root patch script hygiene

- Status: PASS
- Exit code: 0
- Duration seconds: 0.43
- Command: `powershell -NoProfile -Command "Get-ChildItem . -File -Include 'apply-v*.py','fix-v*.py','fix-*.py' | Select-Object Name,Length,LastWriteTime | Format-Table -AutoSize"`

```text
```

## Evidence Pack v2 contract

- Status: PASS
- Exit code: 0
- Duration seconds: 0.56
- Command: `npm run evidence-pack:v2:check`

```text

> visual-research-board@2.4.0 evidence-pack:v2:check
> node tests/evidence-pack-v2-check.mjs

Evidence Pack Export v2 + Usable Creator Output checks passed for v2.4.0.
```

## Creator Workflow MVP

- Status: PASS
- Exit code: 0
- Duration seconds: 0.53
- Command: `npm run creator-workflow:mvp:check`

```text

> visual-research-board@2.4.0 creator-workflow:mvp:check
> node tests/creator-workflow-mvp-check.mjs

End-to-End Creator Research Workflow MVP checks passed for v2.4.0.
```

## Creator Workflow Interaction

- Status: PASS
- Exit code: 0
- Duration seconds: 0.53
- Command: `npm run creator-workflow:interaction:check`

```text

> visual-research-board@2.4.0 creator-workflow:interaction:check
> node tests/creator-workflow-interaction-polish-check.mjs

Creator Workflow Interaction Polish checks passed for v2.4.0.
```

## Creator Workflow Usability

- Status: PASS
- Exit code: 0
- Duration seconds: 0.53
- Command: `npm run creator-workflow:usability:check`

```text

> visual-research-board@2.4.0 creator-workflow:usability:check
> node tests/creator-workflow-usability-depth-check.mjs

Creator Workflow Usability Depth checks passed for v2.4.0.
```

## Creator Session Quality

- Status: PASS
- Exit code: 0
- Duration seconds: 0.53
- Command: `npm run creator-session:quality:check`

```text

> visual-research-board@2.4.0 creator-session:quality:check
> node tests/creator-session-quality-pass-check.mjs

Real Creator Session Quality Pass checks passed for v2.4.0.
```

## Route Surface Integrity

- Status: PASS
- Exit code: 0
- Duration seconds: 0.56
- Command: `npm run route-surface:check`

```text

> visual-research-board@2.4.0 route-surface:check
> node tests/route-surface-integrity-check.mjs

Route Surface Integrity + Creator Workflow Landing checks passed for v2.4.0.
```

## Lint

- Status: FAIL
- Exit code: 1
- Duration seconds: 6.91
- Command: `npm run lint`

```text

> visual-research-board@2.4.0 lint
> eslint .


C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2\scripts\full-qa-gate.mjs
  1:29  error  Parsing error: ';' expected

Ô£û 1 problem (1 error, 0 warnings)
```

## Full QA

- Status: FAIL
- Exit code: 1
- Duration seconds: 0.69
- Command: `npm run qa`

```text

> visual-research-board@2.4.0 qa
> node scripts/full-qa-gate.mjs

cmd.exe : file:///C:/Users/labid/Downloads/Athar/VRB/ViisualResearchBoarchGit/visual-research-board-2/scripts/full-qa-gate.mjs:1
At C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2\run-vrb-full-validation-upload-report.ps1:21 char:15
+     $output = & cmd.exe /d /s /c $Command 2>&1
+               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (file:///C:/User...l-qa-gate.mjs:1:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
  { category: "exports", name: "evidence-pack-v2", command: ["node", "tests/evidence-pack-v2-check.mjs"] },\n#!/usr/bin/env node
                             ^

SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:90:18)
    at #translate (node:internal/modules/esm/loader:451:20)
    at afterLoad (node:internal/modules/esm/loader:507:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:512:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:555:36)
    at afterResolve (node:internal/modules/esm/loader:603:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:609:12)
    at node:internal/modules/esm/loader:628:32
    at TracingChannel.tracePromise (node:diagnostics_channel:362:14)

Node.js v24.15.0
```

## Typecheck

- Status: FAIL
- Exit code: 2
- Duration seconds: 9.47
- Command: `npm run typecheck`

```text

> visual-research-board@2.4.0 typecheck
> tsc --noEmit

src/lib/evidence-pack-v2.ts(201,3): error TS2352: Conversion of type '{ [k: string]: never[]; }' to type 'Record<"Primary Visual References" | "Historical / Source Evidence" | "Style / Mood References" | "Rejected / Weak References" | "Export Candidates", EvidencePackV2SavedReference[]>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ [k: string]: never[]; }' is missing the following properties from type 'Record<"Primary Visual References" | "Historical / Source Evidence" | "Style / Mood References" | "Rejected / Weak References" | "Export Candidates", EvidencePackV2SavedReference[]>': "Primary Visual References", "Historical / Source Evidence", "Style / Mood References", "Rejected / Weak References", "Export Candidates"
```

## CI parity

- Status: FAIL
- Exit code: 1
- Duration seconds: 2.05
- Command: `npm run verify:ci-parity`

```text

> visual-research-board@2.4.0 verify:ci-parity
> npm ci && npm run verify:all

cmd.exe : npm error code ETARGET
At C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2\run-vrb-full-validation-upload-report.ps1:21 char:15
+     $output = & cmd.exe /d /s /c $Command 2>&1
+               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (npm error code ETARGET:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
npm error notarget No matching version found for picomatch@^2.4.0.
npm error notarget In most cases you or one of your dependencies are requesting a package version that doesn't exist.
npm error A complete log of this run can be found in: C:\Users\labid\AppData\Local\npm-cache\_logs\2026-05-16T01_59_16_666Z-debug-0.log
```

## Git status short

- Status: PASS
- Exit code: 0
- Duration seconds: 0.14
- Command: `git status --short`

```text
 M PATCH_MANIFEST.md
 M README.md
 M RUNBOOK-v2.3.0.md
 M artifacts/creator-session-quality-review.json
 M artifacts/creator-workflow-manual-review.json
 M artifacts/creator-workflow-usability-review.json
 M artifacts/dependency-audit-safe-upgrade-lock.json
 M artifacts/first-run-demo-script.json
 M artifacts/first-run-evidence-review.json
 M artifacts/first-run-visual-evidence.json
 M artifacts/full-qa-gate-report.json
 M artifacts/museum-open-access-evidence.json
 M artifacts/museum-open-access-pack-evidence.json
 M artifacts/museum-open-access-pack-report.json
 M artifacts/museum-open-access-pack.json
 M artifacts/museum-open-access-provider-pack-evidence.json
 M artifacts/museum-open-access-provider-pack-report.json
 M artifacts/museum-open-access-provider-pack.json
 M artifacts/museum-open-access-report.json
 M artifacts/museum-open-access.json
 M artifacts/provider-runtime-evidence.json
 M artifacts/provider-runtime-pack-evidence.json
 M artifacts/provider-runtime-pack-report.json
 M artifacts/provider-runtime-pack.json
 M artifacts/provider-runtime-report.json
 M artifacts/provider-runtime.json
 M artifacts/release-evidence-index.json
 M artifacts/release-verify-report.json
 M artifacts/stock-illustrative-pack-evidence.json
 M artifacts/stock-illustrative-pack-report.json
 M artifacts/stock-illustrative-pack.json
 M artifacts/stock-illustrative-provider-pack-evidence.json
 M artifacts/stock-illustrative-provider-pack-report.json
 M artifacts/stock-illustrative-provider-pack.json
 M docs/activation-pack-export-integration-boundaries.md
 M docs/activation-pack-export-integration.md
 M docs/activation-pack-export-preview-boundaries.md
 M docs/activation-pack-export-preview.md
 M docs/activation-pack-ui-integration.md
 M docs/activation-pack-ui-workflow.md
 M docs/audit-warning-review.md
 M docs/book-bibliographic-discovery.md
 M docs/book-reference-safety-boundaries.md
 M docs/broad-reference-result-model.md
 M docs/broad-web-image-discovery.md
 M docs/browser-qa-checklist.md
 M docs/ci-parity-workflow-badge.md
 M docs/controlled-first-run-panel-mount.md
 M docs/creator-workflow-mvp.md
 M docs/dependency-audit-safe-upgrade-lock.md
 M docs/dependency-audit-triage-checklist.md
 M docs/dependency-audit-triage.md
 M docs/discovery-mode-taxonomy.md
 M docs/final-demo-review-checklist.md
 M docs/first-run-demo-capture-notes.md
 M docs/first-run-demo-script.md
 M docs/first-run-evidence-artifact-review.md
 M docs/first-run-responsive-screenshot-checklist.md
 M docs/first-run-ux-checklist.md
 M docs/first-run-ux-workflow-clarity.md
 M docs/first-run-visual-qa-screenshot-evidence.md
 M docs/full-qa-gate.md
 M docs/hosted-demo-evidence-review.md
 M docs/hosted-demo-review-checklist.md
 M docs/local-storage-import-export-hardening.md
 M docs/museum-open-access-provider-pack.md
 M docs/nested-verification-warning-silence.md
 M docs/provider-runtime-test-pack.md
 M docs/public-demo-evidence-lock.md
 M docs/public-demo-evidence-screenshot-lock.md
 M docs/public-demo-final-acceptance.md
 M docs/public-demo-screenshot-checklist.md
 M docs/public-demo-stable-release.md
 M docs/public-demo.md
 M docs/public-walkthrough-copy.md
 M docs/reference-activation-pack.md
 M docs/reference-activation-safety-boundaries.md
 M docs/reference-intelligence-layer.md
 M docs/reference-intelligence-workflow.md
 M docs/reference-workflow-stable-release.md
 M docs/release-artifact-hygiene.md
 M docs/release-candidate-checklist.md
 M docs/release-checklist.md
 M docs/release-command-compression.md
 M docs/release-evidence-index.md
 M docs/release-evidence-lock.md
 M docs/release-package-audit-checklist.md
 M docs/release-package-audit.md
 M docs/release-verification-runner-checklist.md
 M docs/security-and-key-handling.md
 M docs/single-command-verification.md
 M docs/social-reference-discovery.md
 M docs/social-reference-safety-boundaries.md
 M docs/source-class-taxonomy.md
 M docs/stable-reference-workflow-checklist.md
 M docs/stable-release-checklist.md
 M docs/stable-release-hygiene-audit-review.md
 M docs/stock-illustrative-provider-pack.md
 M docs/ui-consistency-first-run-checklist.md
 M docs/unified-release-verification-runner.md
 M docs/ux-reliability-empty-state-polish.md
 M docs/v2.1.10-dependency-audit-safe-upgrade-lock.md
 M docs/validation-report.md
 M docs/verification-artifact-schema-lock.md
 M docs/verification-docs-lock.md
 M docs/verification-report-freshness-lock.md
 M docs/warning-suppression.md
 M package-lock.json
 M package.json
 M reports/museum-open-access-provider-pack-report.json
 M reports/provider-runtime-report.json
 M reports/stock-illustrative-provider-pack-report.json
 M scripts/creator-session-quality-review.mjs
 M scripts/creator-workflow-manual-review.mjs
 M scripts/creator-workflow-usability-review.mjs
 M scripts/dependency-audit-safe-upgrade-lock.mjs
 M scripts/first-run-demo-script.mjs
 M scripts/first-run-evidence-review.mjs
 M scripts/first-run-visual-evidence.mjs
 M scripts/full-qa-gate.mjs
 M scripts/verify-artifacts.mjs
 M src/app/page.tsx
 M src/components/search/CreatorWorkflowPanel.tsx
 M src/components/search/ProjectLibraryPanel.tsx
 M src/components/search/ProviderTogglePanel.tsx
 M src/components/search/ResultGrid.tsx
 M src/components/search/SearchPanel.tsx
 M src/lib/creator-session-quality.ts
 M src/lib/creator-workflow-usability.ts
 M src/lib/creator-workflow.ts
 M src/lib/provider-runtime.ts
 M src/lib/storage-hardening.ts
 M src/lib/ux-reliability.ts
 M tests/activation-pack-export-integration-check.mjs
 M tests/activation-pack-export-preview-check.mjs
 M tests/activation-pack-ui-integration-check.mjs
 M tests/attribution-generator-check.mjs
 M tests/board-organization-check.mjs
 M tests/book-bibliographic-discovery-check.mjs
 M tests/broad-reference-result-model-check.mjs
 M tests/broad-web-image-discovery-check.mjs
 M tests/ci-parity-workflow-badge-check.mjs
 M tests/claim-mapping-check.mjs
 M tests/coverage-bias-check.mjs
 M tests/creator-session-quality-pass-check.mjs
 M tests/creator-workflow-interaction-polish-check.mjs
 M tests/creator-workflow-mvp-check.mjs
 M tests/creator-workflow-usability-depth-check.mjs
 M tests/dependency-audit-safe-upgrade-lock-check.mjs
 M tests/dependency-audit-triage-check.mjs
 M tests/deployed-browser-evidence-check.mjs
 M tests/evidence-driven-tuning-check.mjs
 M tests/evidence-pack-export-check.mjs
 M tests/first-run-demo-script-check.mjs
 M tests/first-run-evidence-review-check.mjs
 M tests/first-run-panel-mount-check.mjs
 M tests/first-run-ux-workflow-check.mjs
 M tests/first-run-visual-qa-check.mjs
 M tests/free-image-retrieval-check.mjs
 M tests/full-qa-gate-check.mjs
 M tests/hosted-demo-evidence-review-check.mjs
 M tests/manual-quality-review-check.mjs
 M tests/museum-open-access-provider-pack-check.mjs
 M tests/nested-verification-warning-silence-check.mjs
 M tests/normalization-dedupe-check.mjs
 M tests/project-review-memory-check.mjs
 M tests/provider-result-inspector-check.mjs
 M tests/provider-runtime-pack-check.mjs
 M tests/public-demo-evidence-lock-check.mjs
 M tests/public-demo-final-acceptance-check.mjs
 M tests/public-demo-release-candidate-check.mjs
 M tests/public-demo-screenshot-lock-check.mjs
 M tests/public-demo-stable-release-check.mjs
 M tests/qa-check.mjs
 M tests/query-routing-check.mjs
 M tests/ranking-explainability-check.mjs
 M tests/real-topic-matrix-check.mjs
 M tests/reference-activation-pack-check.mjs
 M tests/reference-intelligence-check.mjs
 M tests/reference-workflow-stable-release-check.mjs
 M tests/release-evidence-index-check.mjs
 M tests/release-package-audit-check.mjs
 M tests/release-verify-runner-check.mjs
 M tests/release-warning-cleanup-check.mjs
 M tests/retrieval-autotuning-check.mjs
 M tests/retrieval-calibration-check.mjs
 M tests/retrieval-evidence-check.mjs
 M tests/review-evidence-feedback-check.mjs
 M tests/security-key-handling-check.mjs
 M tests/single-command-verification-check.mjs
 M tests/social-reference-discovery-check.mjs
 M tests/stable-release-hygiene-check.mjs
 M tests/stock-illustrative-provider-pack-check.mjs
 M tests/storage-hardening-check.mjs
 M tests/ux-reliability-check.mjs
?? RUNBOOK-v2.3.1.md
?? RUNBOOK-v2.4.0.md
?? app/api/
?? app/page.tsx
?? artifacts/VRB_UPLOAD_REPORT_v2.4.0_20260516-035850.md
?? artifacts/route-surface-integrity-review.json
?? docs/evidence-pack-v2.md
?? run-vrb-full-validation-upload-report-fixed.ps1
?? run-vrb-full-validation-upload-report-v2.ps1
?? run-vrb-full-validation-upload-report.ps1
?? scripts/route-surface-integrity-review.mjs
?? src/components/search/EvidencePackV2Preview.tsx
?? src/lib/evidence-pack-v2.ts
?? tests/evidence-pack-v2-check.mjs
?? tests/route-surface-integrity-check.mjs
```

## Git diff stat

- Status: PASS
- Exit code: 0
- Duration seconds: 0.27
- Command: `git diff --stat`

```text
cmd.exe : warning: in the working copy of 'PATCH_MANIFEST.md', LF will be replaced by CRLF the next time Git touches it
At C:\Users\labid\Downloads\Athar\VRB\ViisualResearchBoarchGit\visual-research-board-2\run-vrb-full-validation-upload-report.ps1:21 char:15
+     $output = & cmd.exe /d /s /c $Command 2>&1
+               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (warning: in the... Git touches it:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK-v2.3.0.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/creator-session-quality-review.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/creator-workflow-manual-review.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/creator-workflow-usability-review.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/dependency-audit-safe-upgrade-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/first-run-demo-script.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/first-run-evidence-review.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/first-run-visual-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/full-qa-gate-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-pack-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-pack.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-provider-pack-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-provider-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-provider-pack.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/museum-open-access.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime-pack-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime-pack.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/provider-runtime.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/release-evidence-index.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/release-verify-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-pack-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-pack.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-provider-pack-evidence.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-provider-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'artifacts/stock-illustrative-provider-pack.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-export-integration-boundaries.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-export-integration.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-export-preview-boundaries.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-export-preview.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-ui-integration.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/activation-pack-ui-workflow.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/audit-warning-review.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/book-bibliographic-discovery.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/book-reference-safety-boundaries.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/broad-reference-result-model.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/broad-web-image-discovery.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/browser-qa-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ci-parity-workflow-badge.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/controlled-first-run-panel-mount.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/creator-workflow-mvp.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/dependency-audit-safe-upgrade-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/dependency-audit-triage-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/dependency-audit-triage.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/discovery-mode-taxonomy.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/final-demo-review-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-demo-capture-notes.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-demo-script.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-evidence-artifact-review.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-responsive-screenshot-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-ux-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-ux-workflow-clarity.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/first-run-visual-qa-screenshot-evidence.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/full-qa-gate.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/hosted-demo-evidence-review.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/hosted-demo-review-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/local-storage-import-export-hardening.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/museum-open-access-provider-pack.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/nested-verification-warning-silence.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/provider-runtime-test-pack.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo-evidence-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo-evidence-screenshot-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo-final-acceptance.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo-screenshot-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo-stable-release.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-demo.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/public-walkthrough-copy.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/reference-activation-pack.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/reference-activation-safety-boundaries.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/reference-intelligence-layer.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/reference-intelligence-workflow.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/reference-workflow-stable-release.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-artifact-hygiene.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-candidate-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-command-compression.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-evidence-index.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-evidence-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-package-audit-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-package-audit.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/release-verification-runner-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/security-and-key-handling.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/single-command-verification.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/social-reference-discovery.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/social-reference-safety-boundaries.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/source-class-taxonomy.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/stable-reference-workflow-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/stable-release-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/stable-release-hygiene-audit-review.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/stock-illustrative-provider-pack.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ui-consistency-first-run-checklist.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/unified-release-verification-runner.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/ux-reliability-empty-state-polish.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/v2.1.10-dependency-audit-safe-upgrade-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/validation-report.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/verification-artifact-schema-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/verification-docs-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/verification-report-freshness-lock.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/warning-suppression.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'reports/museum-open-access-provider-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'reports/provider-runtime-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'reports/stock-illustrative-provider-pack-report.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/creator-session-quality-review.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/creator-workflow-manual-review.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/creator-workflow-usability-review.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/dependency-audit-safe-upgrade-lock.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/first-run-demo-script.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/first-run-evidence-review.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/first-run-visual-evidence.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/full-qa-gate.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'scripts/verify-artifacts.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/page.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/search/CreatorWorkflowPanel.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/search/ProjectLibraryPanel.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/search/ProviderTogglePanel.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/search/ResultGrid.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/search/SearchPanel.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/creator-session-quality.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/creator-workflow-usability.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/creator-workflow.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/provider-runtime.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/storage-hardening.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/lib/ux-reliability.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/activation-pack-export-integration-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/activation-pack-export-preview-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/activation-pack-ui-integration-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/attribution-generator-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/board-organization-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/book-bibliographic-discovery-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/broad-reference-result-model-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/broad-web-image-discovery-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/ci-parity-workflow-badge-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/claim-mapping-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/coverage-bias-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/creator-session-quality-pass-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/creator-workflow-interaction-polish-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/creator-workflow-mvp-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/creator-workflow-usability-depth-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/dependency-audit-safe-upgrade-lock-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/dependency-audit-triage-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/deployed-browser-evidence-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/evidence-driven-tuning-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/evidence-pack-export-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/first-run-demo-script-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/first-run-evidence-review-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/first-run-panel-mount-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/first-run-ux-workflow-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/first-run-visual-qa-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/free-image-retrieval-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/full-qa-gate-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/hosted-demo-evidence-review-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/manual-quality-review-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/museum-open-access-provider-pack-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/nested-verification-warning-silence-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/normalization-dedupe-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/project-review-memory-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/provider-result-inspector-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/provider-runtime-pack-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/public-demo-evidence-lock-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/public-demo-final-acceptance-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/public-demo-release-candidate-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/public-demo-screenshot-lock-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/public-demo-stable-release-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/qa-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/query-routing-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/ranking-explainability-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/real-topic-matrix-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/reference-activation-pack-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/reference-intelligence-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/reference-workflow-stable-release-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/release-evidence-index-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/release-package-audit-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/release-verify-runner-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/release-warning-cleanup-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/retrieval-autotuning-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/retrieval-calibration-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/retrieval-evidence-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/review-evidence-feedback-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/security-key-handling-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/single-command-verification-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/social-reference-discovery-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/stable-release-hygiene-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/stock-illustrative-provider-pack-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/storage-hardening-check.mjs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tests/ux-reliability-check.mjs', LF will be replaced by CRLF the next time Git touches it
 PATCH_MANIFEST.md                                  |  164 +-
 README.md                                          |   88 +-
 RUNBOOK-v2.3.0.md                                  |    2 +-
 artifacts/creator-session-quality-review.json      |    6 +-
 artifacts/creator-workflow-manual-review.json      |   10 +-
 artifacts/creator-workflow-usability-review.json   |   12 +-
 artifacts/dependency-audit-safe-upgrade-lock.json  |    6 +-
 artifacts/first-run-demo-script.json               |    6 +-
 artifacts/first-run-evidence-review.json           |   16 +-
 artifacts/first-run-visual-evidence.json           |    6 +-
 artifacts/full-qa-gate-report.json                 |  156 +-
 artifacts/museum-open-access-evidence.json         | 2150 ++++++++++----------
 artifacts/museum-open-access-pack-evidence.json    | 2150 ++++++++++----------
 artifacts/museum-open-access-pack-report.json      | 2150 ++++++++++----------
 artifacts/museum-open-access-pack.json             | 2150 ++++++++++----------
 .../museum-open-access-provider-pack-evidence.json | 2150 ++++++++++----------
 .../museum-open-access-provider-pack-report.json   | 2150 ++++++++++----------
 artifacts/museum-open-access-provider-pack.json    | 2150 ++++++++++----------
 artifacts/museum-open-access-report.json           | 2150 ++++++++++----------
 artifacts/museum-open-access.json                  | 2150 ++++++++++----------
 artifacts/provider-runtime-evidence.json           | 2150 ++++++++++----------
 artifacts/provider-runtime-pack-evidence.json      | 2150 ++++++++++----------
 artifacts/provider-runtime-pack-report.json        | 2150 ++++++++++----------
 artifacts/provider-runtime-pack.json               | 2150 ++++++++++----------
 artifacts/provider-runtime-report.json             | 2150 ++++++++++----------
 artifacts/provider-runtime.json                    | 2150 ++++++++++----------
 artifacts/release-evidence-index.json              |   28 +-
 artifacts/release-verify-report.json               |   82 +-
 artifacts/stock-illustrative-pack-evidence.json    | 2150 ++++++++++----------
 artifacts/stock-illustrative-pack-report.json      | 2150 ++++++++++----------
 artifacts/stock-illustrative-pack.json             | 2150 ++++++++++----------
 .../stock-illustrative-provider-pack-evidence.json | 2150 ++++++++++----------
 .../stock-illustrative-provider-pack-report.json   | 2150 ++++++++++----------
 artifacts/stock-illustrative-provider-pack.json    | 2150 ++++++++++----------
 ...ctivation-pack-export-integration-boundaries.md |    2 +-
 docs/activation-pack-export-integration.md         |    4 +-
 docs/activation-pack-export-preview-boundaries.md  |    2 +-
 docs/activation-pack-export-preview.md             |    4 +-
 docs/activation-pack-ui-integration.md             |    4 +-
 docs/activation-pack-ui-workflow.md                |    2 +-
 docs/audit-warning-review.md                       |    2 +-
 docs/book-bibliographic-discovery.md               |    4 +-
 docs/book-reference-safety-boundaries.md           |    2 +-
 docs/broad-reference-result-model.md               |    4 +-
 docs/broad-web-image-discovery.md                  |    4 +-
 docs/browser-qa-checklist.md                       |    2 +-
 docs/ci-parity-workflow-badge.md                   |    4 +-
 docs/controlled-first-run-panel-mount.md           |    6 +-
 docs/creator-workflow-mvp.md                       |    2 +-
 docs/dependency-audit-safe-upgrade-lock.md         |    2 +-
 docs/dependency-audit-triage-checklist.md          |   12 +-
 docs/dependency-audit-triage.md                    |    8 +-
 docs/discovery-mode-taxonomy.md                    |    2 +-
 docs/final-demo-review-checklist.md                |    6 +-
 docs/first-run-demo-capture-notes.md               |    2 +-
 docs/first-run-demo-script.md                      |    4 +-
 docs/first-run-evidence-artifact-review.md         |    4 +-
 docs/first-run-responsive-screenshot-checklist.md  |    2 +-
 docs/first-run-ux-checklist.md                     |    2 +-
 docs/first-run-ux-workflow-clarity.md              |    4 +-
 docs/first-run-visual-qa-screenshot-evidence.md    |    4 +-
 docs/full-qa-gate.md                               |   12 +-
 docs/hosted-demo-evidence-review.md                |    4 +-
 docs/hosted-demo-review-checklist.md               |    6 +-
 docs/local-storage-import-export-hardening.md      |   16 +-
 docs/museum-open-access-provider-pack.md           |    4 +-
 docs/nested-verification-warning-silence.md        |    4 +-
 docs/provider-runtime-test-pack.md                 |    4 +-
 docs/public-demo-evidence-lock.md                  |    6 +-
 docs/public-demo-evidence-screenshot-lock.md       |    4 +-
 docs/public-demo-final-acceptance.md               |    4 +-
 docs/public-demo-screenshot-checklist.md           |   18 +-
 docs/public-demo-stable-release.md                 |    6 +-
 docs/public-demo.md                                |    6 +-
 docs/public-walkthrough-copy.md                    |    2 +-
 docs/reference-activation-pack.md                  |    4 +-
 docs/reference-activation-safety-boundaries.md     |    2 +-
 docs/reference-intelligence-layer.md               |    4 +-
 docs/reference-intelligence-workflow.md            |    2 +-
 docs/reference-workflow-stable-release.md          |    4 +-
 docs/release-artifact-hygiene.md                   |    2 +-
 docs/release-candidate-checklist.md                |    2 +-
 docs/release-checklist.md                          |   68 +-
 docs/release-command-compression.md                |    6 +-
 docs/release-evidence-index.md                     |    4 +-
 docs/release-evidence-lock.md                      |    2 +-
 docs/release-package-audit-checklist.md            |   18 +-
 docs/release-package-audit.md                      |   16 +-
 docs/release-verification-runner-checklist.md      |    2 +-
 docs/security-and-key-handling.md                  |    2 +-
 docs/single-command-verification.md                |    6 +-
 docs/social-reference-discovery.md                 |    4 +-
 docs/social-reference-safety-boundaries.md         |    2 +-
 docs/source-class-taxonomy.md                      |    2 +-
 docs/stable-reference-workflow-checklist.md        |   18 +-
 docs/stable-release-checklist.md                   |    8 +-
 docs/stable-release-hygiene-audit-review.md        |   14 +-
 docs/stock-illustrative-provider-pack.md           |    4 +-
 docs/ui-consistency-first-run-checklist.md         |    2 +-
 docs/unified-release-verification-runner.md        |    4 +-
 docs/ux-reliability-empty-state-polish.md          |    2 +-
 docs/v2.1.10-dependency-audit-safe-upgrade-lock.md |    2 +-
 docs/validation-report.md                          |  128 +-
 docs/verification-artifact-schema-lock.md          |    4 +-
 docs/verification-docs-lock.md                     |    4 +-
 docs/verification-report-freshness-lock.md         |    4 +-
 docs/warning-suppression.md                        |    4 +-
 package-lock.json                                  |   22 +-
 package.json                                       |    7 +-
 .../museum-open-access-provider-pack-report.json   | 2150 ++++++++++----------
 reports/provider-runtime-report.json               | 2150 ++++++++++----------
 .../stock-illustrative-provider-pack-report.json   | 2150 ++++++++++----------
 scripts/creator-session-quality-review.mjs         |    2 +-
 scripts/creator-workflow-manual-review.mjs         |    2 +-
 scripts/creator-workflow-usability-review.mjs      |    4 +-
 scripts/dependency-audit-safe-upgrade-lock.mjs     |    2 +-
 scripts/first-run-demo-script.mjs                  |    2 +-
 scripts/first-run-evidence-review.mjs              |    2 +-
 scripts/first-run-visual-evidence.mjs              |    2 +-
 scripts/full-qa-gate.mjs                           |   16 +-
 scripts/verify-artifacts.mjs                       |    3 +-
 src/app/page.tsx                                   |   97 +-
 src/components/search/CreatorWorkflowPanel.tsx     |    5 +-
 src/components/search/ProjectLibraryPanel.tsx      |    2 +-
 src/components/search/ProviderTogglePanel.tsx      |   12 +-
 src/components/search/ResultGrid.tsx               |    2 +-
 src/components/search/SearchPanel.tsx              |   14 +-
 src/lib/creator-session-quality.ts                 |    2 +-
 src/lib/creator-workflow-usability.ts              |    8 +-
 src/lib/creator-workflow.ts                        |    2 +-
 src/lib/provider-runtime.ts                        |    2 +-
 src/lib/storage-hardening.ts                       |    6 +-
 src/lib/ux-reliability.ts                          |   14 +-
 tests/activation-pack-export-integration-check.mjs |    6 +-
 tests/activation-pack-export-preview-check.mjs     |    6 +-
 tests/activation-pack-ui-integration-check.mjs     |    6 +-
 tests/attribution-generator-check.mjs              |    2 +-
 tests/board-organization-check.mjs                 |    6 +-
 tests/book-bibliographic-discovery-check.mjs       |    6 +-
 tests/broad-reference-result-model-check.mjs       |    2 +-
 tests/broad-web-image-discovery-check.mjs          |    6 +-
 tests/ci-parity-workflow-badge-check.mjs           |    2 +-
 tests/claim-mapping-check.mjs                      |    6 +-
 tests/coverage-bias-check.mjs                      |    6 +-
 tests/creator-session-quality-pass-check.mjs       |   10 +-
 .../creator-workflow-interaction-polish-check.mjs  |    4 +-
 tests/creator-workflow-mvp-check.mjs               |   10 +-
 tests/creator-workflow-usability-depth-check.mjs   |    6 +-
 tests/dependency-audit-safe-upgrade-lock-check.mjs |    2 +-
 tests/dependency-audit-triage-check.mjs            |    8 +-
 tests/deployed-browser-evidence-check.mjs          |    2 +-
 tests/evidence-driven-tuning-check.mjs             |    6 +-
 tests/evidence-pack-export-check.mjs               |    2 +-
 tests/first-run-demo-script-check.mjs              |    4 +-
 tests/first-run-evidence-review-check.mjs          |    4 +-
 tests/first-run-panel-mount-check.mjs              |    6 +-
 tests/first-run-ux-workflow-check.mjs              |    4 +-
 tests/first-run-visual-qa-check.mjs                |    4 +-
 tests/free-image-retrieval-check.mjs               |    6 +-
 tests/full-qa-gate-check.mjs                       |   16 +-
 tests/hosted-demo-evidence-review-check.mjs        |    8 +-
 tests/manual-quality-review-check.mjs              |    2 +-
 tests/museum-open-access-provider-pack-check.mjs   |   14 +-
 .../nested-verification-warning-silence-check.mjs  |    6 +-
 tests/normalization-dedupe-check.mjs               |    6 +-
 tests/project-review-memory-check.mjs              |    6 +-
 tests/provider-result-inspector-check.mjs          |    2 +-
 tests/provider-runtime-pack-check.mjs              |    2 +-
 tests/public-demo-evidence-lock-check.mjs          |    8 +-
 tests/public-demo-final-acceptance-check.mjs       |    6 +-
 tests/public-demo-release-candidate-check.mjs      |   14 +-
 tests/public-demo-screenshot-lock-check.mjs        |    8 +-
 tests/public-demo-stable-release-check.mjs         |    8 +-
 tests/qa-check.mjs                                 |    4 +-
 tests/query-routing-check.mjs                      |    4 +-
 tests/ranking-explainability-check.mjs             |    6 +-
 tests/real-topic-matrix-check.mjs                  |    2 +-
 tests/reference-activation-pack-check.mjs          |    6 +-
 tests/reference-intelligence-check.mjs             |    2 +-
 tests/reference-workflow-stable-release-check.mjs  |   10 +-
 tests/release-evidence-index-check.mjs             |    2 +-
 tests/release-package-audit-check.mjs              |    8 +-
 tests/release-verify-runner-check.mjs              |    4 +-
 tests/release-warning-cleanup-check.mjs            |    6 +-
 tests/retrieval-autotuning-check.mjs               |    6 +-
 tests/retrieval-calibration-check.mjs              |    4 +-
 tests/retrieval-evidence-check.mjs                 |    2 +-
 tests/review-evidence-feedback-check.mjs           |    6 +-
 tests/security-key-handling-check.mjs              |    8 +-
 tests/single-command-verification-check.mjs        |    2 +-
 tests/social-reference-discovery-check.mjs         |    6 +-
 tests/stable-release-hygiene-check.mjs             |    8 +-
 tests/stock-illustrative-provider-pack-check.mjs   |   16 +-
 tests/storage-hardening-check.mjs                  |   20 +-
 tests/ux-reliability-check.mjs                     |   22 +-
 195 files changed, 26755 insertions(+), 26595 deletions(-)
```

## Artifact freshness snapshot

- Status: PASS
- Exit code: 0
- Duration seconds: 0.42
- Command: `powershell -NoProfile -Command "if (Test-Path artifacts) { Get-ChildItem artifacts -File | Sort-Object LastWriteTime -Descending | Select-Object -First 40 Name,Length,LastWriteTime | Format-Table -AutoSize } else { Write-Output 'No artifacts directory.' }"`

```text

Name                                           Length LastWriteTime       
----                                           ------ -------------       
VRB_UPLOAD_REPORT_v2.4.0_20260516-035850.md     59154 5/16/2026 3:59:19 AM
stock-illustrative-provider-pack.json           45918 5/16/2026 3:40:38 AM
stock-illustrative-provider-pack-report.json    45918 5/16/2026 3:40:38 AM
stock-illustrative-provider-pack-evidence.json  45918 5/16/2026 3:40:38 AM
stock-illustrative-pack.json                    45918 5/16/2026 3:40:38 AM
stock-illustrative-pack-report.json             45918 5/16/2026 3:40:38 AM
stock-illustrative-pack-evidence.json           45918 5/16/2026 3:40:38 AM
route-surface-integrity-review.json              1869 5/16/2026 3:40:38 AM
release-verify-report.json                      19870 5/16/2026 3:40:38 AM
release-evidence-index.json                      2177 5/16/2026 3:40:38 AM
provider-runtime.json                           45918 5/16/2026 3:40:38 AM
provider-runtime-report.json                    45918 5/16/2026 3:40:38 AM
provider-runtime-pack.json                      45918 5/16/2026 3:40:38 AM
provider-runtime-pack-report.json               45918 5/16/2026 3:40:38 AM
provider-runtime-pack-evidence.json             45918 5/16/2026 3:40:38 AM
provider-runtime-evidence.json                  45918 5/16/2026 3:40:38 AM
museum-open-access.json                         45918 5/16/2026 3:40:38 AM
museum-open-access-report.json                  45918 5/16/2026 3:40:38 AM
museum-open-access-provider-pack.json           45918 5/16/2026 3:40:38 AM
museum-open-access-provider-pack-report.json    45918 5/16/2026 3:40:38 AM
museum-open-access-provider-pack-evidence.json  45918 5/16/2026 3:40:38 AM
museum-open-access-pack.json                    45918 5/16/2026 3:40:38 AM
museum-open-access-pack-report.json             45918 5/16/2026 3:40:38 AM
museum-open-access-pack-evidence.json           45918 5/16/2026 3:40:38 AM
museum-open-access-evidence.json                45918 5/16/2026 3:40:38 AM
full-qa-gate-report.json                        15705 5/16/2026 3:40:38 AM
first-run-visual-evidence.json                   2119 5/16/2026 3:40:38 AM
first-run-evidence-review.json                   2437 5/16/2026 3:40:38 AM
first-run-demo-script.json                       3925 5/16/2026 3:40:38 AM
dependency-audit-safe-upgrade-lock.json          2754 5/16/2026 3:40:38 AM
creator-workflow-usability-review.json            595 5/16/2026 3:40:38 AM
creator-workflow-manual-review.json              4361 5/16/2026 3:40:38 AM
creator-session-quality-review.json              1237 5/16/2026 3:40:38 AM
```

# Summary

| Status | Exit | Seconds | Step |
|---|---:|---:|---|
| PASS | 0 | 0.06 | Environment - Node version |
| PASS | 0 | 0.43 | Environment - npm version |
| PASS | 0 | 0.1 | Package version |
| PASS | 0 | 0.12 | Package scripts snapshot |
| PASS | 0 | 0.43 | Root patch script hygiene |
| PASS | 0 | 0.56 | Evidence Pack v2 contract |
| PASS | 0 | 0.53 | Creator Workflow MVP |
| PASS | 0 | 0.53 | Creator Workflow Interaction |
| PASS | 0 | 0.53 | Creator Workflow Usability |
| PASS | 0 | 0.53 | Creator Session Quality |
| PASS | 0 | 0.56 | Route Surface Integrity |
| FAIL | 1 | 6.91 | Lint |
| FAIL | 1 | 0.69 | Full QA |
| FAIL | 2 | 9.47 | Typecheck |
| FAIL | 1 | 2.05 | CI parity |
| PASS | 0 | 0.14 | Git status short |
| PASS | 0 | 0.27 | Git diff stat |
| PASS | 0 | 0.42 | Artifact freshness snapshot |

Overall: FAIL

Failed steps:
- Lint: exit 1
- Full QA: exit 1
- Typecheck: exit 2
- CI parity: exit 1
