import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
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
    ["dist", "xinyin_wasm.js"],
    "ignore dist folder and wasm js file"
  ),
];
