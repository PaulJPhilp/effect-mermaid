"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestMermaid = exports.Mermaid = void 0;
var _effect = require("effect");
var _errors = require("./errors.js");
var _helpers = require("./helpers.js");
var _detectType = require("./detectType.js");
var _service = require("../themeRegistry/service.js");
/**
 * Mermaid service implementation using Effect.Service pattern
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * This is a stub implementation used for testing. Real implementations
 * (NodeMermaid, BrowserMermaid) override this in their respective packages.
 */
class Mermaid extends /*#__PURE__*/_effect.Effect.Service()("effect-mermaid/Mermaid", {
  effect: /*#__PURE__*/_effect.Effect.gen(function* () {
    // Acquire ThemeRegistry dependency
    const themeRegistry = yield* _service.ThemeRegistry;
    return {
      render: (diagram, config) => {
        return _effect.Effect.gen(function* () {
          // Validate the diagram
          const validationError = (0, _helpers.validateDiagram)(diagram);
          if (validationError) {
            return yield* _effect.Effect.fail((0, _errors.makeParseError)(validationError, diagram));
          }
          // Generate a unique ID for this render
          const id = (0, _helpers.makeRenderId)();
          // Resolve theme from registry if provided
          let themeName = config?.theme || "default";
          if (themeName && themeName !== "default") {
            // Try to resolve from registry to validate theme exists
            yield* themeRegistry.getTheme(themeName).pipe(_effect.Effect.catchAll(error => {
              // Log theme resolution error for debugging
              console.warn(`[Mermaid] Failed to resolve theme "${themeName}": ${error instanceof Error ? error.message : String(error)}. Using default theme.`);
              return _effect.Effect.succeed({
                primaryColor: "#fff4e6"
              });
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
      detectType: diagram => (0, _detectType.detectDiagramType)(diagram)
    };
  })
}) {}
/**
 * Test implementation of Mermaid service that returns stub data
 * (kept for backward compatibility)
 */
exports.Mermaid = Mermaid;
const TestMermaid = exports.TestMermaid = {
  render: (diagram, config) => {
    return _effect.Effect.gen(function* () {
      // Validate the diagram
      const validationError = (0, _helpers.validateDiagram)(diagram);
      if (validationError) {
        return yield* _effect.Effect.fail((0, _errors.makeParseError)(validationError, diagram));
      }
      // Generate a unique ID for this render
      const id = (0, _helpers.makeRenderId)();
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
  detectType: diagram => (0, _detectType.detectDiagramType)(diagram)
};
//# sourceMappingURL=service.js.map