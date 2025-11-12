import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "build/**"],
    globals: true,
    environment: "happy-dom",
    setupFiles: [path.resolve(__dirname, "./vitest.setup.ts")],
  },
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "effect-mermaid": path.join(__dirname, "../core/src/index.ts"),
      "effect-mermaid/react": path.join(__dirname, "src/index.ts"),
    },
  },
});
