import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: [".next/**", "coverage/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default config;
