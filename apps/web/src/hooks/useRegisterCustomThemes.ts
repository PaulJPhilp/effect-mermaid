import { useEffect } from "react";
import { useMermaidInitialized } from "effect-mermaid-react";

/**
 * Hook to dynamically register custom themes with the Mermaid diagram renderer
 *
 * This hook applies custom themes by directly modifying the Mermaid.js configuration.
 * Themes registered this way become available for use in diagram rendering.
 *
 * @param customThemes - Record of custom theme definitions
 *
 * @example
 * ```typescript
 * const { customThemes } = useThemeBuilder();
 * useRegisterCustomThemes(customThemes);
 * ```
 */
export const useRegisterCustomThemes = (
  customThemes: Record<string, { name: string; colors: Record<string, string>; description?: string }>
) => {
  const isInitialized = useMermaidInitialized();

  useEffect(() => {
    if (!isInitialized || !customThemes || Object.keys(customThemes).length === 0) {
      return;
    }

    // Access the global Mermaid instance
    const mermaid = (globalThis as any).mermaid;
    if (!mermaid || !mermaid.mermaidAPI) {
      console.warn("Mermaid not initialized yet");
      return;
    }

    // Register each custom theme by updating Mermaid's theme configuration
    Object.values(customThemes).forEach((theme) => {
      try {
        // Add the custom theme to Mermaid's available themes
        // by updating the configuration
        if (mermaid.mermaidAPI.getConfig) {
          const currentConfig = mermaid.mermaidAPI.getConfig();

          // Add theme to Mermaid's internal theme map
          if (!currentConfig.theme || !mermaid.themes) {
            mermaid.themes = mermaid.themes || {};
          }

          // Store the theme colors for later use
          mermaid.themes[theme.name] = {
            ...theme.colors,
          };

          console.log(`Registered custom theme: ${theme.name}`);
        }
      } catch (e) {
        console.warn(`Failed to register custom theme "${theme.name}":`, e);
      }
    });
  }, [isInitialized, customThemes]);
};
