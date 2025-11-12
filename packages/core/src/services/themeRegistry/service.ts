import { Effect } from "effect";
import { ThemeRegistryApi } from "./api.js";
import type { DiagramTheme, ThemeConfig } from "./types.js";
import {
  DuplicateThemeError,
  InvalidThemeError,
  ThemeNotFoundError,
} from "./errors.js";
import {
  convertThemeToMermaidConfig,
  decodeTheme,
  normalizeThemeColors,
} from "./helpers.js";
import { BUILT_IN_THEMES } from "./built-in-themes.js";

export class ThemeRegistry extends Effect.Service<ThemeRegistryApi>()(
  "effect-mermaid/ThemeRegistry",
  {
    scoped: Effect.gen(function* ($) {
      const themes = new Map<string, DiagramTheme>(
        Object.entries(BUILT_IN_THEMES).map(([name, theme]) => [
          name,
          {
            ...theme,
            colors: normalizeThemeColors(theme.colors),
          },
        ])
      );

      const registerTheme = (
        name: string,
        theme: DiagramTheme
      ): Effect.Effect<void, DuplicateThemeError | InvalidThemeError> =>
        Effect.gen(function* ($) {
          if (themes.has(name)) {
            return yield* $(Effect.fail(new DuplicateThemeError(name)));
          }

          const decoded = yield* $(decodeTheme(theme));
          const normalized: DiagramTheme = {
            ...decoded,
            colors: normalizeThemeColors(decoded.colors),
          };

          yield* $(
            Effect.sync(() => {
              themes.set(name, normalized);
            })
          );
        });

      const getTheme = (
        name: string
      ): Effect.Effect<ThemeConfig, ThemeNotFoundError> =>
        Effect.gen(function* ($) {
          const theme = themes.get(name);
          if (!theme) {
            return yield* $(Effect.fail(new ThemeNotFoundError(name)));
          }
          return convertThemeToMermaidConfig(theme);
        });

      const listThemes = (): Effect.Effect<string[], never> =>
        Effect.sync(() => Array.from(themes.keys()));

      return {
        registerTheme,
        getTheme,
        listThemes,
      } satisfies ThemeRegistryApi;
    }),
    dependencies: [],
  }
) {}
