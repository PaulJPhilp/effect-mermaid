import { MermaidError } from "../../global/errors.js";
/**
 * Create a render error indicating failure during SVG generation
 *
 * Use this when the Mermaid.js library fails to convert a valid diagram
 * to SVG output. Common causes include invalid library configuration or
 * unsupported diagram features.
 *
 * @param message - Human-readable description of the rendering failure
 * @param diagram - Optional: The diagram source that caused the error (for debugging)
 * @returns MermaidError with reason set to "Render"
 *
 * @example
 * const error = makeRenderError("Failed to render: Library not initialized", diagram);
 *
 * @see {@link MermaidError} for error structure and usage
 */
export const makeRenderError = (message, diagram) => new MermaidError({
    reason: "Render",
    message,
    ...(diagram !== undefined ? { diagram } : {})
});
/**
 * Create a parse error indicating invalid diagram syntax
 *
 * Use this when the diagram source code cannot be parsed or validated.
 * This typically occurs before attempting to render, indicating the user
 * needs to fix the diagram syntax.
 *
 * @param message - Human-readable description of the parse failure
 * @param diagram - Optional: The diagram source that caused the error (for debugging)
 * @returns MermaidError with reason set to "Parse"
 *
 * @example
 * const error = makeParseError("Diagram cannot be empty", "");
 *
 * @see {@link MermaidError} for error structure and usage
 */
export const makeParseError = (message, diagram) => new MermaidError({
    reason: "Parse",
    message,
    ...(diagram !== undefined ? { diagram } : {})
});
/**
 * Create an unknown error when the cause cannot be determined
 *
 * Use this for unexpected errors that don't fit the "Parse" or "Render"
 * categories. Typically represents integration errors or unexpected exceptions.
 *
 * @param message - Human-readable description of the error
 * @param diagram - Optional: The diagram source associated with the error (for debugging)
 * @returns MermaidError with reason set to "Unknown"
 *
 * @example
 * const error = makeUnknownError("Unexpected error: " + unexpectedException.message);
 *
 * @see {@link MermaidError} for error structure and usage
 */
export const makeUnknownError = (message, diagram) => new MermaidError({
    reason: "Unknown",
    message,
    ...(diagram !== undefined ? { diagram } : {})
});
//# sourceMappingURL=errors.js.map