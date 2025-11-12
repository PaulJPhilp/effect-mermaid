import { Effect } from "effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type { ThemeColorMap } from "../../global/types.js";
import type { DiagramTheme, ThemeConfig } from "./types.js";
import { DiagramThemeSchema } from "./schema.js";
import { InvalidThemeError } from "./errors.js";

const COLOR_ALIASES: Record<string, string> = {
  primary: "primaryColor",
  primaryBorder: "primaryBorderColor",
  primaryText: "primaryTextColor",
  secondary: "secondaryColor",
  secondaryBorder: "secondaryBorderColor",
  secondaryText: "secondaryTextColor",
  tertiary: "tertiaryColor",
  tertiaryBorder: "tertiaryBorderColor",
  tertiaryText: "tertiaryTextColor",
  backgroundColor: "background",
  line: "lineColor",
  text: "textColor",
};

export const normalizeThemeColors = (
  colors: Readonly<ThemeColorMap>
): ThemeColorMap => {
  const normalized: ThemeColorMap = {};

  for (const [key, value] of Object.entries(colors)) {
    const alias = COLOR_ALIASES[key] ?? key;
    normalized[alias] = value;
  }

  return normalized;
};

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
export const convertThemeToMermaidConfig = (
  theme: DiagramTheme
): ThemeConfig => {
  return { ...normalizeThemeColors(theme.colors) };
};

export const decodeTheme = (
  theme: DiagramTheme
): Effect.Effect<DiagramTheme, InvalidThemeError> =>
  Effect.try({
    try: () => S.decodeUnknownSync(DiagramThemeSchema)(theme),
    catch: (error: unknown) =>
      new InvalidThemeError(
        ParseResult.TreeFormatter.formatErrorSync(
          error as ParseResult.ParseError
        )
      ),
  });