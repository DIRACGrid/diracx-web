import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/**/*.ts", "src/**/*.tsx"],
    format: ["esm"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    target: "es6",
    bundle: false,
    sourcemap: true,
    clean: true,
  },
]);
