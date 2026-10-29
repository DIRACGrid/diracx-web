import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@axa-fr/react-oidc",
        replacement: resolve(__dirname, "stories/mocks/react-oidc.mock.tsx"),
      },
      {
        find: "../../hooks/metadata",
        replacement: resolve(__dirname, "stories/mocks/metadata.mock.tsx"),
      },
      {
        find: "./jobDataService",
        replacement: resolve(
          __dirname,
          "stories/mocks/jobDataService.mock.tsx",
        ),
      },
      {
        find: /\.css$/,
        replacement: resolve(__dirname, "stories/mocks/style.mock.js"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "node_modules/**",
        "dist/**",
        "stories/**",
      ],
    },
  },
});
