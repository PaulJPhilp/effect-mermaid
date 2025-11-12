"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeMermaid = void 0;
var _effect = require("effect");
var _effectMermaid = require("effect-mermaid");
/**
 * NodeMermaid service that provides real Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import and applies theme
 * variables from ThemeRegistry for custom styling.
 */
class NodeMermaid extends /*#__PURE__*/_effect.Effect.Service()("effect-mermaid/NodeMermaid", {
  effect: /*#__PURE__*/_effect.Effect.gen(function* () {
    // Dynamic import of Mermaid
    const mermaidModule = yield* _effect.Effect.tryPromise(() => import("mermaid")).pipe(_effect.Effect.catchAll(error => _effect.Effect.fail((0, _effectMermaid.makeUnknownError)(`Failed to import Mermaid: ${error}`, undefined))));
    // Get ThemeRegistry for custom theme resolution
    const themeRegistry = yield* _effectMermaid.ThemeRegistry;
    // Initialize Mermaid with default config
    yield* _effect.Effect.try({
      try: () => mermaidModule.default.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict"
      }),
      catch: error => (0, _effectMermaid.makeUnknownError)(`Failed to initialize Mermaid: ${error}`, undefined)
    });
    return {
      render: (diagram, config) => {
        return _effect.Effect.gen(function* () {
          // Validate diagram
          const validationError = (0, _effectMermaid.validateDiagram)(diagram);
          if (validationError) {
            return yield* _effect.Effect.fail((0, _effectMermaid.makeParseError)(validationError, diagram));
          }
          // Generate unique ID
          const id = (0, _effectMermaid.makeRenderId)();
          // Apply configuration if provided
          if (config) {
            // Resolve custom theme from registry if provided
            let themeConfig = {
              theme: config.theme || "default"
            };
            // Try to resolve theme from registry
            if (config.theme && config.theme !== "default") {
              const themeResult = yield* themeRegistry.getTheme(config.theme).pipe(_effect.Effect.catchAll(error => {
                // Log theme resolution error for debugging
                console.warn(`[NodeMermaid] Failed to resolve theme "${config.theme}": ${error instanceof Error ? error.message : String(error)}. Using built-in theme.`);
                return _effect.Effect.succeed({});
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
            yield* _effect.Effect.try({
              try: () => mermaidModule.default.initialize(mermaidConfig),
              catch: error => (0, _effectMermaid.makeRenderError)(`Failed to apply config: ${error}`, diagram)
            });
          }
          // Render the diagram - mermaid.render returns { svg: string, bindFunctions?: any }
          const renderResult = yield* _effect.Effect.tryPromise(() => mermaidModule.default.render(id, diagram)).pipe(_effect.Effect.catchAll(error => _effect.Effect.fail((0, _effectMermaid.makeRenderError)(`Mermaid rendering failed: ${error}`, diagram))));
          return renderResult.svg;
        });
      },
      detectType: diagram => (0, _effectMermaid.detectDiagramType)(diagram)
    };
  })
}) {}
exports.NodeMermaid = NodeMermaid;
//# sourceMappingURL=service.js.map