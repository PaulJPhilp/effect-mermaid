import { Effect } from "effect";
import { DuplicateThemeError, ThemeNotFoundError, } from "./errors.js";
import { convertThemeToMermaidConfig, decodeTheme, normalizeThemeColors, } from "./helpers.js";
import { BUILT_IN_THEMES } from "./built-in-themes.js";
export class ThemeRegistry extends Effect.Service()("effect-mermaid/ThemeRegistry", {
    scoped: Effect.gen(function* ($) {
        const themes = new Map(Object.entries(BUILT_IN_THEMES).map(([name, theme]) => [
            name,
            {
                ...theme,
                colors: normalizeThemeColors(theme.colors),
            },
        ]));
        const registerTheme = (name, theme) => Effect.gen(function* ($) {
            if (themes.has(name)) {
                return yield* $(Effect.fail(new DuplicateThemeError(name)));
            }
            const decoded = yield* $(decodeTheme(theme));
            const normalized = {
                ...decoded,
                colors: normalizeThemeColors(decoded.colors),
            };
            yield* $(Effect.sync(() => {
                themes.set(name, normalized);
            }));
        });
        const getTheme = (name) => Effect.gen(function* ($) {
            const theme = themes.get(name);
            if (!theme) {
                return yield* $(Effect.fail(new ThemeNotFoundError(name)));
            }
            return convertThemeToMermaidConfig(theme);
        });
        const listThemes = () => Effect.sync(() => Array.from(themes.keys()));
        return {
            registerTheme,
            getTheme,
            listThemes,
        };
    }),
    dependencies: [],
}) {
}
//# sourceMappingURL=service.js.map