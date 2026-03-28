import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: [
      "src/app/**/*.test.{ts,tsx}",
      "src/features/**/*.test.{ts,tsx}",
      "src/lib/**/*.test.{ts,tsx}",
      "src/server/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/app/**/*.{ts,tsx}",
        "src/features/**/*.{ts,tsx}",
        "src/lib/**/*.ts",
        "src/server/**/*.ts",
      ],
      exclude: [
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/features/**/index.ts",
        "src/features/**/*.types.ts",
        "src/features/**/types/*.ts",
      ],
      reporter: ["text", "html"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
