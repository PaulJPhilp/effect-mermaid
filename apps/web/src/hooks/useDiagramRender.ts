import { useCallback, useEffect, useState } from "react";
import type { MermaidConfig } from "effect-mermaid";

/**
 * Diagram render state
 */
export interface DiagramRenderState {
  isLoading: boolean;
  error: Error | null;
  shouldRender: boolean;
}

/**
 * Hook for managing diagram rendering with debouncing
 *
 * Prevents excessive re-renders when code is being typed rapidly.
 * Separates when code updates from when diagrams actually render.
 *
 * @param code - Current diagram code
 * @param config - Mermaid render configuration
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 * @returns Render state and handlers
 *
 * @example
 * ```typescript
 * const { shouldRender, isLoading, error, setRendering } = useDiagramRender(
 *   code,
 *   { theme: "dark" },
 *   500
 * );
 *
 * // Trigger render when shouldRender becomes true
 * useEffect(() => {
 *   if (shouldRender) {
 *     // render diagram
 *     setRendering(false);
 *   }
 * }, [shouldRender, setRendering]);
 * ```
 */
export function useDiagramRender(
  code: string,
  config?: MermaidConfig,
  debounceMs = 500
) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRenderedCode, setLastRenderedCode] = useState(code);

  // Debounced render trigger
  useEffect(() => {
    if (!code.trim()) {
      setShouldRender(false);
      return;
    }

    const timer = setTimeout(() => {
      if (code !== lastRenderedCode) {
        setShouldRender(true);
        setIsLoading(true);
        setError(null);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [code, lastRenderedCode, debounceMs]);

  const setRendering = useCallback(
    (success: boolean, renderError: Error | null = null) => {
      if (success) {
        setLastRenderedCode(code);
        setShouldRender(false);
        setIsLoading(false);
        setError(null);
      } else {
        setShouldRender(false);
        setIsLoading(false);
        setError(renderError);
      }
    },
    [code]
  );

  return {
    shouldRender,
    isLoading,
    error,
    setRendering,
  };
}

