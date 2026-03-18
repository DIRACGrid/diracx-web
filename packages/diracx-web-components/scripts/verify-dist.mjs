#!/usr/bin/env node
// Verify that `npm run build` produced every entrypoint declared in
// package.json#exports. Guards against tsup `bundle: false` + glob-entry
// misconfiguration silently shipping a broken package.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));

const required = new Set();
for (const [key, entry] of Object.entries(pkg.exports ?? {})) {
  if (key === "./package.json") continue;
  if (typeof entry === "string") {
    required.add(entry);
  } else if (entry && typeof entry === "object") {
    for (const value of Object.values(entry)) {
      if (typeof value === "string") required.add(value);
    }
  }
}

// Also validate top-level main/module/types.
for (const field of ["main", "module", "types"]) {
  if (typeof pkg[field] === "string") required.add(pkg[field]);
}

const missing = [];
for (const rel of required) {
  const abs = join(pkgRoot, rel);
  if (!existsSync(abs)) missing.push(rel);
}

if (missing.length > 0) {
  console.error("verify-dist: missing expected build outputs:");
  for (const m of missing) console.error(`  - ${m}`);
  console.error(
    "\nIf tsup's entry glob or `bundle: false` option was changed, confirm the generated layout still matches package.json#exports.",
  );
  process.exit(1);
}

console.log(`verify-dist: OK (${required.size} paths checked).`);
