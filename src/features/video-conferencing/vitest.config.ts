/**
 * Vitest configuration for Video Conferencing feature tests
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    include: [
      "tests/**/*.test.{ts,tsx}",
      "hooks/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "services/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules/", "dist/", ".next/"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../../"),
      "@/src": path.resolve(__dirname, "../../../src"),
    },
  },
});
