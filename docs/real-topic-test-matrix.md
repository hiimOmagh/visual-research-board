# Real Topic Test Matrix — v0.2.10

`v0.2.10` adds a real-topic test matrix for proving that broad retrieval works across creator-relevant scenarios rather than only one cherry-picked topic.

The matrix lives at `tests/fixtures/real-topic-test-matrix.json` and covers historical figure, ancient civilization, YouTube documentary topic, thumbnail inspiration topic, public-domain archive pack, news event visual pack, design moodboard, and academic source pack.

Run it against localhost or deployment:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run topic:matrix:test
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=https://your-vercel-app.vercel.app npm run topic:matrix:test
```

The command writes `artifacts/real-topic-test-matrix.json` with request payload, result count, provider health summary, retrieval evidence, quality calibration, auto-tuning trace, matrix verdict, weak checks, and warnings.
