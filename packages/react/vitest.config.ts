import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["dist/**", "build/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "effect-mermaid": path.join(__dirname, "../core/src/index.ts"),
      "effect-mermaid/react": path.join(__dirname, "src/index.ts"),
    },
  },
});
