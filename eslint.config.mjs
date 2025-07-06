import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      reactHooks,
    },
    rules: {
      "reactHooks/rules-of-hooks": "error",
      "reactHooks/exhaustive-deps": "warn",
    },
  },
  globalIgnores(
    ["dist", "src/xinyin/xinyinWasm.js"],
    "ignore dist folder and wasm js file"
  ),
];
