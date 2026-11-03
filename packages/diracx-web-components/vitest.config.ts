import { defineConfig } from "vitest/config";
import { storyMockAliases } from "./stories/mocks/aliases";

export default defineConfig({
  resolve: {
    alias: storyMockAliases,
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
