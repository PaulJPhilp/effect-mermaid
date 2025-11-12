import { Effect } from "effect";
import type { ThemeColorMap } from "../../global/types.js";
import type { DiagramTheme, ThemeConfig } from "./types.js";
import { InvalidThemeError } from "./errors.js";
export declare const normalizeThemeColors: (colors: Readonly<ThemeColorMap>) => ThemeColorMap;
/**
 * Converts a DiagramTheme object into a Mermaid-compatible theme configuration.
 * This function maps the `colors` object to the flat structure required by Mermaid.
 *
 * @example
 * const theme: DiagramTheme = {
 *   name: "my-theme",
 *   colors: { primaryColor: "#ff0000" }
 * };
 * const mermaidConfig = convertThemeToMermaidConfig(theme);
 * // mermaidConfig is { primaryColor: "#ff0000" }
 */
export declare const convertThemeToMermaidConfig: (theme: DiagramTheme) => ThemeConfig;
export declare const decodeTheme: (theme: DiagramTheme) => Effect.Effect<DiagramTheme, InvalidThemeError>;
//# sourceMappingURL=helpers.d.ts.map