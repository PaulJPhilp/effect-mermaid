import { Effect } from "effect";
import { describe, expect, it } from "@effect/vitest";
import { ThemeRegistry } from "../service.js";
import { DuplicateThemeError, ThemeNotFoundError } from "../errors.js";

describe("ThemeRegistry", () => {
  it("registers custom theme successfully", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      yield* registry.registerTheme("my-theme", {
        name: "my-theme",
        colors: { primaryColor: "#ff0000" },
      });
      const theme = yield* registry.getTheme("my-theme");
      expect(theme).toEqual({ primaryColor: "#ff0000" });
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("retrieves registered theme", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      const theme = yield* registry.getTheme("dark");
      expect(theme.background).toBe("#333");
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("fails when registering duplicate theme name", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      const result = yield* registry.registerTheme("dark", {
        name: "dark",
        colors: {},
      }).pipe(Effect.flip);
      expect(result).toBeInstanceOf(DuplicateThemeError);
      expect(result.name).toBe("dark");
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("fails when getting non-existent theme", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      const result = yield* registry.getTheme("non-existent").pipe(
        Effect.flip
      );
      expect(result).toBeInstanceOf(ThemeNotFoundError);
      expect(result.name).toBe("non-existent");
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("lists all themes (built-ins + custom)", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      yield* registry.registerTheme("custom", {
        name: "custom",
        colors: {},
      });
      const themes = yield* registry.listThemes();
      expect(themes).toEqual(
        expect.arrayContaining(["default", "dark", "forest", "neutral", "custom"])
      );
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("returns built-in themes by default", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      const themes = yield* registry.listThemes();
      expect(themes).toEqual(["default", "dark", "forest", "neutral"]);
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("converts custom theme to mermaid config", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      yield* registry.registerTheme("custom", {
        name: "custom",
        colors: { primaryColor: "#001122" },
      });
      const theme = yield* registry.getTheme("custom");
      expect(theme).toEqual({ primaryColor: "#001122" });
    }).pipe(Effect.provide(ThemeRegistry.Default)));

  it("supports typed color values", () =>
    Effect.gen(function* (_) {
      const registry = yield* ThemeRegistry;
      yield* registry.registerTheme("typed-colors", {
        name: "typed-colors",
        colors: {
          primaryColor: { kind: "hex", value: "#336699" },
          secondaryColor: { kind: "named", name: "royalblue" },
          lineColor: { kind: "rgb", red: 12, green: 64, blue: 128, alpha: 0.75 },
          textColor: { kind: "hsl", hue: 210, saturation: 0.5, lightness: 0.4 },
        },
      });
      const theme = yield* registry.getTheme("typed-colors");
      expect(theme.primaryColor).toEqual({ kind: "hex", value: "#336699" });
      expect(theme.secondaryColor).toEqual({ kind: "named", name: "royalblue" });
      expect(theme.lineColor).toEqual({
        kind: "rgb",
        red: 12,
        green: 64,
        blue: 128,
        alpha: 0.75,
      });
      expect(theme.textColor).toEqual({
        kind: "hsl",
        hue: 210,
        saturation: 0.5,
        lightness: 0.4,
      });
    }).pipe(Effect.provide(ThemeRegistry.Default)));
});



