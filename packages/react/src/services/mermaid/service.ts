import { Effect } from "effect";
import {
  ThemeRegistry,
  detectDiagramType,
  makeParseError,
  makeRenderError,
  makeUnknownError,
  validateDiagram,
  type MermaidApi,
  type MermaidConfig,
} from "effect-mermaid";

/**
 * BrowserMermaid service that provides client-side Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import for browser environments
 * and applies theme variables from ThemeRegistry for custom styling.
 */
export class BrowserMermaid extends Effect.Service<BrowserMermaid>()(
  "effect-mermaid/BrowserMermaid",
  {
    effect: Effect.gen(function* () {
      // Dynamic import of Mermaid for browser
      const mermaidModule = yield* Effect.tryPromise(
        () => import("mermaid")
      ).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            makeUnknownError(`Failed to import Mermaid: ${error}`, undefined)
          )
        )
      );

      // Get ThemeRegistry for custom theme resolution
      const themeRegistry = yield* ThemeRegistry;

      // Initialize Mermaid with browser-safe defaults
      yield* Effect.try({
        try: () =>
          mermaidModule.default.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "strict",
            fontFamily: "arial",
          }),
        catch: (error) =>
          makeUnknownError(`Failed to initialize Mermaid: ${error}`, undefined),
      });

      return {
        render: (diagram: string, config?: MermaidConfig) => {
          return Effect.gen(function* () {
            // Validate diagram
            const validationError = validateDiagram(diagram);
            if (validationError) {
              return yield* Effect.fail(
                makeParseError(validationError, diagram)
              );
            }

            // Apply configuration if provided
            if (config) {
              // Resolve custom theme from registry if provided
              const themeConfig: Record<string, unknown> = {
                theme: config.theme || "default",
              };

              // Try to resolve theme from registry
              if (config.theme && config.theme !== "default") {
                const themeResult = yield* themeRegistry
                  .getTheme(config.theme)
                  .pipe(
                    Effect.catchAll((error) => {
                      // Log theme resolution error for debugging
                      console.warn(
                        `[BrowserMermaid] Failed to resolve theme "${
                          config.theme
                        }": ${
                          error instanceof Error ? error.message : String(error)
                        }. Using built-in theme.`
                      );
                      return Effect.succeed({});
                    })
                  );
                // Merge resolved theme variables
                if (Object.keys(themeResult).length > 0) {
                  themeConfig.themeVariables = themeResult;
                }
              }

              const mermaidConfig: Record<string, unknown> = {
                ...themeConfig,
                themeVariables:
                  config.themeVariables || themeConfig.themeVariables,
                flowchart: config.flowchart,
                sequence: config.sequence,
                class: config.class,
                state: config.state,
              };

              yield* Effect.try({
                try: () => mermaidModule.default.initialize(mermaidConfig),
                catch: (error) =>
                  makeRenderError(`Failed to apply config: ${error}`, diagram),
              });
            }

            // Generate unique ID for this render
            const id = `mermaid-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;

            // Render the diagram
            const renderResult = yield* Effect.tryPromise(() =>
              mermaidModule.default.render(id, diagram)
            ).pipe(
              Effect.catchAll((error) =>
                Effect.fail(
                  makeRenderError(`Mermaid rendering failed: ${error}`, diagram)
                )
              )
            );

            return renderResult.svg;
          });
        },

        detectType: (diagram: string) => detectDiagramType(diagram),
      } satisfies MermaidApi;
    }),
    dependencies: [ThemeRegistry.Default],
  }
) {}
