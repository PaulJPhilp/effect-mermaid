import { Effect } from "effect";
import { makeParseError, makeRenderError, makeUnknownError, validateDiagram, makeRenderId, ThemeRegistry, detectDiagramType } from "effect-mermaid";
/**
 * NodeMermaid service that provides real Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import and applies theme
 * variables from ThemeRegistry for custom styling.
 */
export class NodeMermaid extends /*#__PURE__*/Effect.Service()("effect-mermaid/NodeMermaid", {
  effect: /*#__PURE__*/Effect.gen(function* () {
    // Dynamic import of Mermaid
    const mermaidModule = yield* Effect.tryPromise(() => import("mermaid")).pipe(Effect.catchAll(error => Effect.fail(makeUnknownError(`Failed to import Mermaid: ${error}`, undefined))));
    // Get ThemeRegistry for custom theme resolution
    const themeRegistry = yield* ThemeRegistry;
    // Initialize Mermaid with default config
    yield* Effect.try({
      try: () => mermaidModule.default.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict"
      }),
      catch: error => makeUnknownError(`Failed to initialize Mermaid: ${error}`, undefined)
    });
    return {
      render: (diagram, config) => {
        return Effect.gen(function* () {
          // Validate diagram
          const validationError = validateDiagram(diagram);
          if (validationError) {
            return yield* Effect.fail(makeParseError(validationError, diagram));
          }
          // Generate unique ID
          const id = makeRenderId();
          // Apply configuration if provided
          if (config) {
            // Resolve custom theme from registry if provided
            let themeConfig = {
              theme: config.theme || "default"
            };
            // Try to resolve theme from registry
            if (config.theme && config.theme !== "default") {
              const themeResult = yield* themeRegistry.getTheme(config.theme).pipe(Effect.catchAll(error => {
                // Log theme resolution error for debugging
                console.warn(`[NodeMermaid] Failed to resolve theme "${config.theme}": ${error instanceof Error ? error.message : String(error)}. Using built-in theme.`);
                return Effect.succeed({});
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
          // Render the diagram - mermaid.render returns { svg: string, bindFunctions?: any }
          const renderResult = yield* Effect.tryPromise(() => mermaidModule.default.render(id, diagram)).pipe(Effect.catchAll(error => Effect.fail(makeRenderError(`Mermaid rendering failed: ${error}`, diagram))));
          return renderResult.svg;
        });
      },
      detectType: diagram => detectDiagramType(diagram)
    };
  })
}) {}
//# sourceMappingURL=service.js.map