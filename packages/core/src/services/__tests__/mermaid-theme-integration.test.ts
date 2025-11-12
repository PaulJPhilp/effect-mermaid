import { Effect, Layer } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { Mermaid } from "../mermaid/service.js";
import { ThemeRegistry } from "../themeRegistry/service.js";

/**
 * Integration tests for Mermaid + ThemeRegistry interaction
 * These tests verify that the Mermaid service correctly applies themes
 * from the ThemeRegistry when rendering diagrams
 */
describe("Mermaid + ThemeRegistry Integration", () => {
  const testDiagram = "graph TD\n  A[Start] --> B[End]";

  describe("Custom Theme Resolution", () => {
    it("renders diagram with registered custom theme", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register a custom theme
        yield* registry.registerTheme("custom-blue", {
          name: "custom-blue",
          colors: {
            primaryColor: "#0066ff",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#0052cc",
            lineColor: "#0066ff",
            secondaryColor: "#0052cc",
            secondaryTextColor: "#ffffff",
            secondaryBorderColor: "#003d99",
            tertiaryColor: "#003366",
            tertiaryTextColor: "#ffffff",
            tertiaryBorderColor: "#0052cc",
          },
        });

        // Render diagram with the custom theme
        const result = yield* mermaid.render(testDiagram, {
          theme: "custom-blue",
        });

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="custom-blue"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );

    it("falls back to built-in theme when custom theme not found", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        // Render with non-existent theme - should fall back to default
        const result = yield* mermaid.render(testDiagram, {
          theme: "non-existent",
        });

        expect(result).toContain("<svg");
        // Should fallback or use default behavior
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });

  describe("Multiple Custom Themes", () => {
    it("handles multiple custom themes registered in sequence", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register first custom theme
        yield* registry.registerTheme("theme-red", {
          name: "theme-red",
          colors: { primaryColor: "#ff0000" },
        });

        // Register second custom theme
        yield* registry.registerTheme("theme-green", {
          name: "theme-green",
          colors: { primaryColor: "#00ff00" },
        });

        // Render with first theme
        const result1 = yield* mermaid.render(testDiagram, {
          theme: "theme-red",
        });
        expect(result1).toContain('data-theme="theme-red"');

        // Render with second theme
        const result2 = yield* mermaid.render(testDiagram, {
          theme: "theme-green",
        });
        expect(result2).toContain('data-theme="theme-green"');
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });

  describe("Theme Integration with Diagram Detection", () => {
    it("detects diagram type independently of theme", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register custom theme
        yield* registry.registerTheme("custom-theme", {
          name: "custom-theme",
          colors: { primaryColor: "#ff9900" },
        });

        // Detect diagram type (should not be affected by theme)
        const diagramType = yield* mermaid.detectType(testDiagram);

        expect(diagramType).toBe("flowchart");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );

    it("renders and detects with same custom theme", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register custom theme
        yield* registry.registerTheme("integration-theme", {
          name: "integration-theme",
          colors: { primaryColor: "#ffcc00" },
        });

        // Both operations should work with the theme
        const rendered = yield* mermaid.render(testDiagram, {
          theme: "integration-theme",
        });
        const detected = yield* mermaid.detectType(testDiagram);

        expect(rendered).toContain('data-theme="integration-theme"');
        expect(detected).toBe("flowchart");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });

  describe("Theme Listing and Discovery", () => {
    it("discovers all themes when rendering custom theme", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register multiple custom themes
        yield* registry.registerTheme("custom-1", {
          name: "custom-1",
          colors: { primaryColor: "#111111" },
        });
        yield* registry.registerTheme("custom-2", {
          name: "custom-2",
          colors: { primaryColor: "#222222" },
        });

        // Get list of all themes
        const themes = yield* registry.listThemes();

        // Should include built-in themes
        expect(themes).toContain("default");
        expect(themes).toContain("dark");
        expect(themes).toContain("forest");
        expect(themes).toContain("neutral");

        // Should include registered custom themes
        expect(themes).toContain("custom-1");
        expect(themes).toContain("custom-2");

        // Render with each custom theme
        for (const theme of ["custom-1", "custom-2"]) {
          const result = yield* mermaid.render(testDiagram, { theme });
          expect(result).toContain(`data-theme="${theme}"`);
        }
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });

  describe("Built-in Theme Consistency", () => {
    it("renders with all built-in themes", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const builtInThemes = ["default", "dark", "forest", "neutral"];

        for (const theme of builtInThemes) {
          const result = yield* mermaid.render(testDiagram, { theme });
          expect(result).toContain("<svg");
          expect(result).toContain(`data-theme="${theme}"`);
          expect(result).toContain('data-stub="true"');
        }
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );

    it("renders without theme uses default behavior", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        // Render without explicit theme
        const result = yield* mermaid.render(testDiagram);

        expect(result).toContain("<svg");
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });

  describe("Complex Integration Scenarios", () => {
    it("handles theme registration and rendering in complex workflow", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Scenario 1: Register custom theme
        yield* registry.registerTheme("corporate", {
          name: "corporate",
          colors: {
            primaryColor: "#003366",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#000066",
            lineColor: "#1a4d7a",
            secondaryColor: "#0052cc",
            secondaryTextColor: "#ffffff",
            secondaryBorderColor: "#003d99",
            tertiaryColor: "#0066ff",
            tertiaryTextColor: "#ffffff",
            tertiaryBorderColor: "#0052cc",
          },
        });

        // Scenario 2: Render multiple diagrams with different themes
        const corpResult = yield* mermaid.render(testDiagram, {
          theme: "corporate",
        });
        const darkResult = yield* mermaid.render(testDiagram, {
          theme: "dark",
        });

        // Scenario 3: Verify theme in outputs
        expect(corpResult).toContain('data-theme="corporate"');
        expect(darkResult).toContain('data-theme="dark"');

        // Scenario 4: List all themes
        const allThemes = yield* registry.listThemes();
        expect(allThemes).toContain("corporate");

        // Scenario 5: Retrieve custom theme config
        const corpTheme = yield* registry.getTheme("corporate");
        expect(corpTheme.primaryColor).toBe("#003366");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );

    it("maintains theme isolation between renders", () =>
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        const mermaid = yield* Mermaid;

        // Register two different themes
        yield* registry.registerTheme("isolated-1", {
          name: "isolated-1",
          colors: { primaryColor: "#aa0000" },
        });
        yield* registry.registerTheme("isolated-2", {
          name: "isolated-2",
          colors: { primaryColor: "#00aa00" },
        });

        // Create different diagram strings
        const diagram1 = "graph TD\n  A[First]";
        const diagram2 = "graph LR\n  B[Second]";

        // Render combinations
        const result1 = yield* mermaid.render(diagram1, { theme: "isolated-1" });
        const result2 = yield* mermaid.render(diagram2, { theme: "isolated-2" });
        const result3 = yield* mermaid.render(diagram1, { theme: "isolated-2" });

        // Verify each has correct theme
        expect(result1).toContain('data-theme="isolated-1"');
        expect(result2).toContain('data-theme="isolated-2"');
        expect(result3).toContain('data-theme="isolated-2"');
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
    );
  });
});
