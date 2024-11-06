import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "next/core-web-vitals",
      "prettier",
      "plugin:import/recommended",
      "plugin:import/typescript",
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        JSX: "readonly",
      },
    },

    rules: {
      "import/order": ["error"],
      "import/no-unused-modules": ["error"],
      "import/no-useless-path-segments": ["error"],
    },
  },
];
