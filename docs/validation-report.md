# Validation Report — Visual Research Board v0.2.2

Executed in the packaging workspace.

## Passed

```bash
npm run qa
```

The executable QA suite passed:

```text
QA checks passed for v0.2.2.
Normalization checks passed for v0.1.0.
E2E fixture checks passed for v0.1.0.
Provider smoke fixture checks passed for v0.1.0.
Library conflict checks passed for v0.1.0.
Broad retrieval checks passed for v0.2.2.
Retrieval evidence checks passed for v0.2.2.
Provider runtime pack checks passed for v0.2.2.
```

## Dependency-based validation status

The final packaging workspace did not complete dependency installation inside the sandbox, so these commands still need to be run locally or in CI after download:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

The failed sandbox typecheck was dependency-resolution noise caused by missing `node_modules`, not an identified source-code error.

## Runtime provider validation

After starting the app locally or deploying it to a Next.js runtime, run:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run provider:runtime:test
```

For a deployed runtime:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app npm run provider:runtime:test
```

The command writes:

```text
artifacts/provider-runtime-evidence.json
```

Use strict mode only after provider keys are configured:

```bash
VISUAL_RESEARCH_BOARD_REQUIRE_REAL_PROVIDERS=true \
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app \
npm run provider:runtime:test
```

## Build status

Before deployment, run locally or in CI:

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
```

For GitHub Pages static demo deployment, also run:

```bash
npm run build:static:repo
```

## Final status

`v0.2.2` is a provider-runtime validation MVP package. QA passed in the packaging workspace. Dependency-based typecheck/lint/build and live provider runtime evidence should be verified in the deployment environment.
