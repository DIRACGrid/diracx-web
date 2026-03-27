import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "test/e2e/**/*.cy.ts",
    supportFile: "test/e2e/support/e2e.ts",
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
  chromeWebSecurity: false,
});
