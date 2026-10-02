import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/**/*.ts", "src/**/*.tsx"],
    format: ["esm"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    // es6 has no equivalent for import.meta; es2020 is the minimum target that supports it.
    target: "es2020",
    bundle: false,
    sourcemap: true,
    clean: true,
  },
]);
