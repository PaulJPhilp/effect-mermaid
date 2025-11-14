import { Effect, Ref } from "effect";
import { ThemeRegistry, detectDiagramType, makeParseError, makeRenderError, makeUnknownError, validateDiagram, Logger } from "effect-mermaid";
/**
 * BrowserMermaid service that provides client-side Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import for browser environments
 * and applies theme variables from ThemeRegistry for custom styling.
 */
export class BrowserMermaid extends /*#__PURE__*/Effect.Service()("effect-mermaid/BrowserMermaid", {
  scoped: /*#__PURE__*/Effect.gen(function* () {
    // Get dependencies
    const logger = yield* Logger;
    const themeRegistry = yield* ThemeRegistry;
    // Lazy initialization: cache Mermaid module after first import
    const mermaidRef = yield* Ref.make(null);
    // This function imports and initializes Mermaid only on first call
    const ensureInitialized = Effect.gen(function* () {
      const existing = yield* Ref.get(mermaidRef);
      if (existing) return existing; // Already initialized, return cached
      // First time: import Mermaid for browser
      const module = yield* Effect.tryPromise(() => import("mermaid")).pipe(Effect.catchAll(error => {
        return Effect.gen(function* () {
          yield* logger.error(`Failed to import Mermaid: ${error}`);
          return yield* Effect.fail(makeUnknownError(`Failed to import Mermaid: ${error}`, undefined));
        });
      }));
      // Initialize Mermaid with browser-safe defaults
      yield* Effect.try({
        try: () => module.default.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "strict",
          fontFamily: "arial"
        }),
        catch: error => makeUnknownError(`Failed to initialize Mermaid: ${error}`, undefined)
      });
      // Cache for future use
      yield* Ref.set(mermaidRef, module);
      return module;
    });
    return {
      render: (diagram, config) => {
        return Effect.gen(function* () {
          // Lazy load Mermaid on first render call
          const mermaidModule = yield* ensureInitialized;
          // Validate diagram
          const validationError = validateDiagram(diagram);
          if (validationError) {
            return yield* Effect.fail(makeParseError(validationError, diagram));
          }
          // Apply configuration if provided
          if (config) {
            // Resolve custom theme from registry if provided
            const themeConfig = {
              theme: config.theme || "default"
            };
            // Try to resolve theme from registry
            if (config.theme && config.theme !== "default") {
              const themeResult = yield* themeRegistry.getTheme(config.theme).pipe(Effect.catchAll(error => {
                // Log theme resolution error for debugging using Logger service
                return Effect.gen(function* () {
                  const errorMsg = error instanceof Error ? error.message : String(error);
                  yield* logger.warn(`Failed to resolve theme "${config.theme}": ${errorMsg}. Using built-in theme.`);
                  return {};
                });
              }));
              // Merge resolved theme variables
              if (Object.keys(themeResult).length > 0) {
                themeConfig.themeVariables = themeResult;
              }
            }
            const mermaidConfig = {
              ...themeConfig,
              themeVariables: config.themeVariables || themeConfig.themeVariables,
              flowchart: config.flowchart,
              sequence: config.sequence,
              class: config.class,
              state: config.state
            };
            yield* Effect.try({
              try: () => mermaidModule.default.initialize(mermaidConfig),
              catch: error => makeRenderError(`Failed to apply config: ${error}`, diagram)
            });
          }
          // Generate unique ID for this render
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          // Render the diagram
          const renderResult = yield* Effect.tryPromise(() => mermaidModule.default.render(id, diagram)).pipe(Effect.catchAll(error => Effect.fail(makeRenderError(`Mermaid rendering failed: ${error}`, diagram))));
          return renderResult.svg;
        });
      },
      detectType: diagram => detectDiagramType(diagram)
    };
  }),
  dependencies: [ThemeRegistry.Default, Logger.Default]
}) {}
//# sourceMappingURL=service.js.map