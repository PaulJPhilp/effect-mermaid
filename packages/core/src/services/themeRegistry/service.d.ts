import { Effect } from "effect";
import { ThemeRegistryApi } from "./api.js";
import type { DiagramTheme, ThemeConfig } from "./types.js";
import { DuplicateThemeError, InvalidThemeError, ThemeNotFoundError } from "./errors.js";
declare const ThemeRegistry_base: Effect.Service.Class<ThemeRegistryApi, "effect-mermaid/ThemeRegistry", {
    readonly scoped: Effect.Effect<{
        registerTheme: (name: string, theme: DiagramTheme) => Effect.Effect<void, DuplicateThemeError | InvalidThemeError>;
        getTheme: (name: string) => Effect.Effect<ThemeConfig, ThemeNotFoundError>;
        listThemes: () => Effect.Effect<string[], never>;
    }, never, never>;
    readonly dependencies: readonly [];
}>;
export declare class ThemeRegistry extends ThemeRegistry_base {
}
export {};
//# sourceMappingURL=service.d.ts.map