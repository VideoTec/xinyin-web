import js from "@eslint/js";
import tseslint from "typescript-eslint";
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
  },
  globalIgnores(
    ["dist", "xinyin_wasm.js"],
    "ignore dist folder and wasm js file"
  ),
];
