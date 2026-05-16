# Verification Docs Lock — v2.3.0

v2.3.0 locks the verification documentation contract.

## verification docs lock

The docs must preserve verify:all.
The docs must preserve verify:ci-parity.
The docs must preserve verify:artifacts.
The docs must preserve clean install parity.
The docs must preserve single command.
The docs must preserve debug-only commands.

```text
docs must preserve verify:all
docs must preserve verify:ci-parity
docs must preserve verify:artifacts
docs must preserve clean install parity
docs must preserve single command
debug-only commands
```

Normal local verification: `npm run verify:all`.
Clean install parity: `npm run verify:ci-parity`.
Artifact regeneration only: `npm run verify:artifacts`.
