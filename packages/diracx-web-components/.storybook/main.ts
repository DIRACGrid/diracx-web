import { join, dirname } from "path";
import type { StorybookConfig } from "@storybook/nextjs";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "./*.mdx",
    "../**/*.mdx",
    "../stories/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-mdx-gfm"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },

  staticDirs: ["../public"],

  webpackFinal: async (config) => {
    if (!config.resolve) {
      return config;
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@axa-fr/react-oidc": require.resolve(
        "../stories/mocks/react-oidc.mock.tsx",
      ),
      "../../hooks/metadata": require.resolve(
        "../stories/mocks/metadata.mock.tsx",
      ),
      "./jobDataService": require.resolve(
        "../stories/mocks/jobDataService.mock.ts",
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
