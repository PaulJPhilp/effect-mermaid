import { Effect } from "effect";
import type { ThemeConfig, DiagramTheme } from "./types.js";
import type {
  ThemeNotFoundError,
  InvalidThemeError,
  DuplicateThemeError,
} from "./errors.js";

/**
 * ThemeRegistry API for managing Mermaid diagram themes
 *
 * Theme Resolution Pattern (used by all Mermaid implementations):
 * 1. Check if theme name is "default" - if so, skip registry lookup
 * 2. Call getTheme(themeName) to resolve custom theme variables
 * 3. On failure, log warning with service label and use built-in theme
 * 4. Merge resolved theme variables with explicit config variables
 * 5. Apply final config to Mermaid.js
 *
 * This pattern is consistently implemented in:
 * - packages/core/src/services/mermaid/service.ts (Mermaid.render)
 * - packages/node/src/services/mermaid/service.ts (NodeMermaid.render)
 * - packages/react/src/services/mermaid/service.ts (BrowserMermaid.render)
 */
export interface ThemeRegistryApi {
  /**
   * Registers a custom theme in the registry
   *
   * @param name - Unique theme identifier (e.g., "corporate-blue")
   * @param theme - DiagramTheme object with color definitions
   * @returns Effect that completes on success or fails if theme is invalid or duplicate
   */
  readonly registerTheme: (
    name: string,
    theme: DiagramTheme
  ) => Effect.Effect<void, DuplicateThemeError | InvalidThemeError>;

  /**
   * Retrieves theme variables from the registry
   *
   * @param name - Theme identifier to look up
   * @returns Effect with theme configuration object containing color definitions
   * @throws ThemeNotFoundError if theme is not registered
   */
  readonly getTheme: (
    name: string
  ) => Effect.Effect<ThemeConfig, ThemeNotFoundError>;

  /**
   * Lists all available theme names (built-in and custom)
   *
   * @returns Effect with array of theme identifiers
   */
  readonly listThemes: () => Effect.Effect<string[], never>;
}