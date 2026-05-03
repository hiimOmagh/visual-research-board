import { readFileSync } from "node:fs";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const packages = lock.packages ?? {};
for (const [path, meta] of Object.entries(packages)) {
  if (!meta || typeof meta !== "object") continue;
  const resolved = typeof meta.resolved === "string" ? meta.resolved : "";
  assert(!resolved.includes("minimatch-10.2.6.tgz"), `${path} points to unpublished minimatch 10.2.6 tarball`);
}

const nestedMinimatch = packages["node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch"];
assert(Boolean(nestedMinimatch), "Expected nested minimatch lockfile entry for @typescript-eslint/typescript-estree");
assert(nestedMinimatch?.version !== "10.2.6", "Nested minimatch must not lock to unpublished version 10.2.6");
assert(nestedMinimatch?.version === "10.2.5", "Nested minimatch should lock to available version 10.2.5");
assert(
  nestedMinimatch?.resolved === "https://registry.npmjs.org/minimatch/-/minimatch-10.2.5.tgz",
  "Nested minimatch resolved URL must point to the available 10.2.5 tarball"
);

if (failures.length > 0) {
  console.error("Lockfile registry checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Lockfile registry checks passed for v0.2.6.");
