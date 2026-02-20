import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
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
  ...nextCoreWebVitals,
  ...fixupConfigRules(compat.extends("prettier")),
  {
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
    },

    languageOptions: {
      globals: {
        JSX: "readonly",
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
      "comma-dangle": ["error", "always-multiline"],
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
      semi: ["error", "always"],

      // Identation rules
      indent: ["error", 2],

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
