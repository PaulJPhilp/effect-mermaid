import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [],

  test: {
    environment: "jsdom",
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    include: ["./test/**/*.test.ts", "./packages/**/src/**/*.test.ts"],
    exclude: [
      "dist/**",
      "build/**",
      "**/dist/**",
      "**/build/**",
      "**/*.d.ts",
      "**/*.d.mts",
      "**/build/**/*.js",
      "**/dist/**/*.js",
    ],
    globals: true,
  },
  resolve: {
    alias: {
      "@template/basic/test": path.join(__dirname, "test"),
      "@template/basic": path.join(__dirname, "src"),
      "effect-mermaid": path.join(__dirname, "packages/core/src/index.ts"),
      "effect-mermaid-react": path.resolve(
        __dirname,
        "../../packages/react/src"
      ),
    },
  },
});
