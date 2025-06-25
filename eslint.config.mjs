import js from "@eslint/js";
import json from "@eslint/json";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  json.configs.recommended,
  {
    ignores: ["dist", "node_modules", "xinyin_wasm.js"],
  },
];
