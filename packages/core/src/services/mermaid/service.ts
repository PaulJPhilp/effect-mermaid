import { Effect } from "effect";
import { MermaidApi } from "./api.js";
import { MermaidConfig } from "../../global/schema.js";
import { makeParseError } from "./errors.js";
import { makeRenderId, validateDiagram } from "./helpers.js";
import { detectDiagramType } from "./detectType.js";
import { ThemeRegistry } from "../themeRegistry/service.js";

/**
 * Mermaid service implementation using Effect.Service pattern
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * This is a stub implementation used for testing. Real implementations
 * (NodeMermaid, BrowserMermaid) override this in their respective packages.
 */
export class Mermaid extends Effect.Service<Mermaid>()(
  "effect-mermaid/Mermaid",
  {
    effect: Effect.gen(function* () {
      // Acquire ThemeRegistry dependency
      const themeRegistry = yield* ThemeRegistry;

      return {
        render: (diagram: string, config?: MermaidConfig) => {
          return Effect.gen(function* () {
            // Validate the diagram
            const validationError = validateDiagram(diagram);
            if (validationError) {
              return yield* Effect.fail(makeParseError(validationError, diagram));
            }

            // Generate a unique ID for this render
            const id = makeRenderId();

            // Resolve theme from registry if provided
            let themeName = config?.theme || "default";
            if (themeName && themeName !== "default") {
              // Try to resolve from registry to validate theme exists
              yield* themeRegistry.getTheme(themeName).pipe(
                Effect.catchAll((error) => {
                  // Log theme resolution error for debugging
                  console.warn(
                    `[Mermaid] Failed to resolve theme "${themeName}": ${error instanceof Error ? error.message : String(error)}. Using default theme.`
                  );
                  return Effect.succeed({ primaryColor: "#fff4e6" });
                })
              );
            }

            // Create stub SVG with basic structure
            const stubSvg = `<svg data-id="${id}" data-stub="true" data-theme="${themeName}">
  <text x="10" y="20" font-family="Arial" font-size="12" fill="#333">
    Mermaid Diagram (Stub)
  </text>
  <text x="10" y="35" font-family="Arial" font-size="10" fill="#666">
    ${diagram.slice(0, 50)}${diagram.length > 50 ? "..." : ""}
  </text>
</svg>`;

            return stubSvg;
          });
        },

        detectType: (diagram: string) => detectDiagramType(diagram),
      } satisfies MermaidApi;
    }),
  }
) {}

/**
 * Test implementation of Mermaid service that returns stub data
 * (kept for backward compatibility)
 */
export const TestMermaid: MermaidApi = {
  render: (diagram: string, config?: MermaidConfig) => {
    return Effect.gen(function* () {
      // Validate the diagram
      const validationError = validateDiagram(diagram);
      if (validationError) {
        return yield* Effect.fail(makeParseError(validationError, diagram));
      }

      // Generate a unique ID for this render
      const id = makeRenderId();

      // Create stub SVG with basic structure
      const theme = config?.theme || "default";
      const stubSvg = `<svg data-id="${id}" data-stub="true" data-theme="${theme}">
  <text x="10" y="20" font-family="Arial" font-size="12" fill="#333">
    Mermaid Diagram (Stub)
  </text>
  <text x="10" y="35" font-family="Arial" font-size="10" fill="#666">
    ${diagram.slice(0, 50)}${diagram.length > 50 ? "..." : ""}
  </text>
</svg>`;

      return stubSvg;
    });
  },

  detectType: (diagram: string) => detectDiagramType(diagram),
};
