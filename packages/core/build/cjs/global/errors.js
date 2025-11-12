"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MermaidError = void 0;
var _effect = require("effect");
/**
 * Error type for Mermaid-related operations
 *
 * Represents errors that occur during diagram parsing, rendering, or other Mermaid operations.
 * All MermaidErrors are tagged errors compatible with Effect's error handling system.
 *
 * @property reason - The category of error:
 *   - `"Parse"`: Error occurred while parsing diagram syntax
 *   - `"Render"`: Error occurred while rendering diagram to SVG
 *   - `"Unknown"`: Error with undetermined cause
 *
 * @property message - Human-readable error description
 *
 * @property diagram - Optional: The diagram source code that caused the error (for debugging)
 *
 * @example
 * try {
 *   const result = yield* mermaid.render(invalidDiagram);
 * } catch (error) {
 *   if (error instanceof MermaidError) {
 *     if (error.reason === "Parse") {
 *       console.error("Invalid diagram syntax:", error.message);
 *     }
 *   }
 * }
 */
class MermaidError extends /*#__PURE__*/_effect.Data.TaggedError("MermaidError") {}
exports.MermaidError = MermaidError;
//# sourceMappingURL=errors.js.map