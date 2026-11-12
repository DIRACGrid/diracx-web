import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// This config is only for typescript files
export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs["recommended-latest"].rules,
  },
  { ...reactRefresh.configs.vite, files: ["**/*.{ts,tsx}"] },
  ...fixupConfigRules(compat.extends("prettier")),
  {
    files: ["**/*.{ts,tsx}"],

    plugins: {
      "unused-imports": eslintPluginUnusedImports,
      import: fixupPluginRules(eslintPluginImport),
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
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
      // Import rules
      "import/order": ["error"],
      "import/no-unused-modules": ["error"],
      "import/no-namespace": ["error"],
      "unused-imports/no-unused-imports": ["error"],

      "import/no-useless-path-segments": ["error"],
      "react/destructuring-assignment": ["error", "always"],

      // Coding style rules
      // Formatting (commas, semicolons, indentation) is owned by Prettier;
      // re-enabling the corresponding ESLint rules after extending
      // eslint-config-prettier reintroduces the exact conflicts it prevents.
      "no-unreachable": ["error"],
      "prefer-const": ["error"],
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": ["error"],

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
