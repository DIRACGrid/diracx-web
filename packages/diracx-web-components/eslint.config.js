import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// This config is only for typescript files
export default [
  ...fixupConfigRules(
    compat.extends(
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:storybook/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "prettier",
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
    },

    languageOptions: {
      globals: {
        JSX: "readonly",
      },

      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "@typescript-eslint/no-deprecated": "warn",
      "import/order": ["error"],
      "import/no-unused-modules": ["error"],
      "import/no-useless-path-segments": ["error"],
      "import/no-unresolved": ["off"],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/destructuring-assignment": ["error", "always"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "React",
          property: "useCallback",
          message:
            "Please import 'useCallback' directly from 'react' instead of 'React.useCallback'.",
        },
        {
          object: "React",
          property: "useContext",
          message:
            "Please import 'useContext' directly from 'react' instead of 'React.useContext'.",
        },
        {
          object: "React",
          property: "useEffect",
          message:
            "Please import 'useEffect' directly from 'react' instead of 'React.useEffect'.",
        },
        {
          object: "React",
          property: "useMemo",
          message:
            "Please import 'useMemo' directly from 'react' instead of 'React.useMemo'.",
        },
        {
          object: "React",
          property: "useReducer",
          message:
            "Please import 'useReducer' directly from 'react' instead of 'React.useReducer'.",
        },
        {
          object: "React",
          property: "useRef",
          message:
            "Please import 'useRef' directly from 'react' instead of 'React.useRef'.",
        },
        {
          object: "React",
          property: "useState",
          message:
            "Please import 'useState' directly from 'react' instead of 'React.useState'.",
        },
      ],
    },
  },
];
