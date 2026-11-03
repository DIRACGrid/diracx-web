import type { StorybookConfig } from "@storybook/nextjs";
import { storyMockAliases } from "../stories/mocks/aliases";

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
      ...storyMockAliases,
    };
    return config;
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};
export default config;
