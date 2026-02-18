import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/nextjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/*.mdx", "../stories/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@chromatic-com/storybook",
  ],

  framework: {
    name: "@storybook/nextjs",
    options: {},
  },

  staticDirs: ["../public"],

  webpackFinal: async (config) => {
    if (!config.resolve) {
      return config;
    }
    // Handle .md files as raw text for MDX imports
    config.module?.rules?.push({
      test: /\.md$/,
      type: "asset/source",
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      "@axa-fr/react-oidc": resolve(
        __dirname,
        "../stories/mocks/react-oidc.mock.tsx",
      ),
      "../../hooks/metadata": resolve(
        __dirname,
        "../stories/mocks/metadata.mock.tsx",
      ),
      "./jobDataService": resolve(
        __dirname,
        "../stories/mocks/jobDataService.mock.tsx",
      ),
    };
    return config;
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};
export default config;
