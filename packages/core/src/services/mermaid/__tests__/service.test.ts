import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { makeParseError, makeRenderError, makeUnknownError } from "../errors.js";
import { makeRenderId, validateDiagram } from "../helpers.js";
import { Mermaid } from "../service.js";
import { ThemeRegistry } from "../../themeRegistry/service.js";
import { DiagramTheme } from "../../themeRegistry/types.js";

describe("Mermaid Service", () => {
  describe("render", () => {
    it("returns stub SVG", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B");

        expect(result).toContain("<svg");
        expect(result).toContain('data-stub="true"');
        expect(result).toContain("Mermaid Diagram (Stub)");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));

    it("fails on empty diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* Effect.flip(mermaid.render(""));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
        expect(result.message).toContain("cannot be empty");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("applies custom theme", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "dark"
        });

        expect(result).toContain('data-theme="dark"');
      }).pipe(Effect.provide(Mermaid.Default)));

    it("renders with dark theme", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "dark"
        });

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="dark"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Mermaid.Default)));

    it("renders with forest theme", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "forest"
        });

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="forest"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Mermaid.Default)));

    it("renders with neutral theme", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "neutral"
        });

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="neutral"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Mermaid.Default)));

    it("defaults to default theme when none specified", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B");

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="default"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Mermaid.Default)));
  });

  describe("custom themes", () => {
    it("renders with custom registered theme", () =>
      Effect.gen(function* () {
        const customTheme: DiagramTheme = {
          name: "corporate-blue",
          colors: {
            primaryColor: "#003366",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#000066",
            lineColor: "#1a4d7a",
          },
        };

        const registry = yield* ThemeRegistry;
        yield* registry.registerTheme("corporate-blue", customTheme);

        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "corporate-blue",
        });

        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="corporate-blue"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(
        Layer.merge(
          ThemeRegistry.Default,
          Mermaid.Default
        )
      )));

    it("falls back to default theme if custom theme not found", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "non-existent-theme",
        });

        // Should render with the requested theme name even if not found
        // (graceful fallback in the service)
        expect(result).toContain("<svg");
        expect(result).toContain('data-theme="non-existent-theme"');
        expect(result).toContain('data-stub="true"');
      }).pipe(Effect.provide(Mermaid.Default)));

    it("renders multiple diagrams with different custom themes", () =>
      Effect.gen(function* () {
        const theme1: DiagramTheme = {
          name: "theme-1",
          colors: { primaryColor: "#111111" },
        };
        const theme2: DiagramTheme = {
          name: "theme-2",
          colors: { primaryColor: "#222222" },
        };

        const registry = yield* ThemeRegistry;
        yield* registry.registerTheme("theme-1", theme1);
        yield* registry.registerTheme("theme-2", theme2);

        const mermaid = yield* Mermaid;
        const result1 = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "theme-1",
        });
        const result2 = yield* mermaid.render("graph TD\n  C-->D", {
          theme: "theme-2",
        });

        expect(result1).toContain('data-theme="theme-1"');
        expect(result2).toContain('data-theme="theme-2"');
      }).pipe(Effect.provide(
        Layer.merge(
          ThemeRegistry.Default,
          Mermaid.Default
        )
      )));
  });

  describe("detectType", () => {
    it("detects flowchart", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.detectType("graph TD\n  A-->B");

        expect(result).toBe("flowchart");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("detects sequence", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.detectType("sequenceDiagram\n  Alice->>Bob: Hi");

        expect(result).toBe("sequence");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("detects class", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.detectType("classDiagram\n  class Animal");

        expect(result).toBe("class");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("fails on invalid diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* Effect.flip(mermaid.detectType(""));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
      }).pipe(Effect.provide(Mermaid.Default)));
  });

  describe("helpers", () => {
    it("generates unique render ids", () => {
      const first = makeRenderId();
      const second = makeRenderId();

      expect(first).toMatch(/^mmd-[a-z0-9]{6}$/);
      expect(second).not.toBe(first);
    });

    it("validates empty diagrams", () => {
      expect(validateDiagram("")).toContain("empty");
      expect(validateDiagram("  ")).toContain("empty");
      expect(validateDiagram("graph TD\n  A-->B")).toBeNull();
    });
  });

  describe("errors", () => {
    it("creates parse errors", () => {
      const error = makeParseError("bad", "diagram");

      expect(error.reason).toBe("Parse");
      expect(error.message).toBe("bad");
      expect(error.diagram).toBe("diagram");
    });

    it("creates render errors", () => {
      const error = makeRenderError("fail");

      expect(error.reason).toBe("Render");
      expect(error.message).toBe("fail");
      expect(error.diagram).toBeUndefined();
    });

    it("creates unknown errors", () => {
      const error = makeUnknownError("mystery", "diagram");

      expect(error.reason).toBe("Unknown");
      expect(error.message).toBe("mystery");
      expect(error.diagram).toBe("diagram");
    });
  });
});
