import { Effect } from "effect";
import { Logger } from "../logger/service.js";
import { ThemeRegistry } from "../themeRegistry/service.js";
import { detectDiagramType } from "./detectType.js";
import { makeParseError } from "./errors.js";
import { makeRenderId, validateDiagram } from "./helpers.js";
/**
 * Mermaid service implementation using Effect.Service pattern
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * This is a stub implementation used for testing. Real implementations
 * (NodeMermaid, BrowserMermaid) override this in their respective packages.
 */
export class Mermaid extends Effect.Service()("effect-mermaid/Mermaid", {
    scoped: Effect.gen(function* () {
        // Acquire dependencies
        const themeRegistry = yield* ThemeRegistry;
        const logger = yield* Logger;
        return {
            render: (diagram, config) => {
                return Effect.gen(function* () {
                    // Validate the diagram
                    const validationError = validateDiagram(diagram);
                    if (validationError) {
                        return yield* Effect.fail(makeParseError(validationError, diagram));
                    }
                    // Generate a unique ID for this render
                    const id = makeRenderId();
                    // Resolve theme from registry if provided
                    const themeName = config?.theme || "default";
                    if (themeName && themeName !== "default") {
                        // Try to resolve from registry to validate theme exists
                        yield* themeRegistry.getTheme(themeName).pipe(Effect.catchAll((error) => {
                            // Log theme resolution error for debugging using Logger service
                            return Effect.gen(function* () {
                                const errorMsg = error instanceof Error ? error.message : String(error);
                                yield* logger.warn(`Failed to resolve theme "${themeName}": ${errorMsg}. Using default theme.`);
                                return Effect.succeed({ primaryColor: "#fff4e6" });
                            }).pipe(Effect.flatten);
                        }));
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
            detectType: (diagram) => detectDiagramType(diagram),
        };
    }),
}) {
}
/**
 * Test implementation of Mermaid service that returns stub data
 * (kept for backward compatibility)
 */
export const TestMermaid = {
    render: (diagram, config) => {
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
    detectType: (diagram) => detectDiagramType(diagram),
};
//# sourceMappingURL=service.js.map