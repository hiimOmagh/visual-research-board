#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path.cwd()
QA_PATH = ROOT / "tests" / "qa-check.mjs"

def fail(msg: str) -> int:
    print(f"ERROR: {msg}", file=sys.stderr)
    return 1

def main() -> int:
    if not QA_PATH.exists():
        return fail("Missing tests/qa-check.mjs")

    text = QA_PATH.read_text(encoding="utf-8")

    old = '''const pagesWorkflow = read(".github/workflows/pages-static-demo.yml");
assert(pagesWorkflow.includes("deploy-pages") && pagesWorkflow.includes("build:static:pages"), "Pages workflow must build and deploy the static demo");'''

    new = '''const pagesWorkflow = read(".github/workflows/pages-static-demo.yml");
const pagesWorkflowUsesStaticBuild =
  pagesWorkflow.includes("build:static:pages") || pagesWorkflow.includes("build:github-pages");
assert(
  pagesWorkflow.includes("deploy-pages") && pagesWorkflowUsesStaticBuild,
  "Pages workflow must build and deploy the static demo"
);'''

    if old in text:
        text = text.replace(old, new)
    elif "const pagesWorkflowUsesStaticBuild" in text:
        print("qa-check.mjs already accepts build:github-pages.")
    else:
        # More tolerant fallback for formatting drift.
        pattern = re.compile(
            r'const pagesWorkflow = read\("\.github/workflows/pages-static-demo\.yml"\);\s*'
            r'assert\(\s*pagesWorkflow\.includes\("deploy-pages"\)\s*&&\s*pagesWorkflow\.includes\("build:static:pages"\)\s*,\s*'
            r'"Pages workflow must build and deploy the static demo"\s*\);',
            re.MULTILINE,
        )
        if not pattern.search(text):
            return fail("Could not find the Pages workflow assertion in tests/qa-check.mjs")
        text = pattern.sub(new, text)

    QA_PATH.write_text(text, encoding="utf-8")

    print("Applied v2.4.0 QA contract alignment for hardened GitHub Pages workflow.")
    print("Changed files:")
    print("- tests/qa-check.mjs")
    print()
    print("Next commands:")
    print("node --check tests/qa-check.mjs")
    print("node tests/qa-check.mjs")
    print("npm run qa")
    print("npm run verify:ci-parity")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
