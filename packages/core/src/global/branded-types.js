/**
 * Branded types for type-safe diagram handling
 *
 * These types use TypeScript's nominal typing pattern to distinguish between
 * different uses of strings in the diagram rendering pipeline. This prevents
 * accidentally passing unsanitized diagram code where validated SVG is expected.
 *
 * @example
 * ```typescript
 * import { MermaidSource, MermaidSvg } from "effect-mermaid";
 *
 * // Only source strings can be passed to render()
 * const source: MermaidSource = makeMermaidSource("graph TD\n  A-->B");
 * const svg = yield* mermaid.render(source);
 *
 * // SVG output cannot be confused with source code
 * const svgText: MermaidSvg = svg; // Type safe!
 * ```
 */
/**
 * Create a MermaidSource from a string
 *
 * Validates the input string is not empty. Actual diagram syntax validation
 * happens during render.
 *
 * @param source - The diagram source code
 * @returns Branded MermaidSource type
 * @throws Error if source is empty
 *
 * @example
 * ```typescript
 * const source = makeMermaidSource("graph TD\n  A-->B");
 * const svg = yield* mermaid.render(source);
 * ```
 */
export function makeMermaidSource(source) {
    if (!source || source.trim().length === 0) {
        throw new Error("Diagram source cannot be empty");
    }
    return source;
}
/**
 * Create a MermaidSvg from rendered output
 *
 * This should only be called by the rendering service with output
 * from Mermaid.js. Do not call with untrusted strings.
 *
 * @internal
 * @param svg - The SVG output from mermaid.render()
 * @returns Branded MermaidSvg type
 */
export function makeMermaidSvg(svg) {
    return svg;
}
/**
 * Create a DiagramId from a string
 *
 * @internal
 * @param id - The diagram ID
 * @returns Branded DiagramId type
 */
export function makeDiagramId(id) {
    return id;
}
/**
 * Check if a value is a MermaidSource
 *
 * Runtime check for branded type (note: branded types provide compile-time
 * safety only; this is primarily for documentation).
 *
 * @param value - Value to check
 * @returns true if value is a string (all MermaidSources are strings)
 */
export function isMermaidSource(value) {
    return typeof value === "string" && value.length > 0;
}
/**
 * Check if a value is MermaidSvg
 *
 * Runtime check for branded type (note: branded types provide compile-time
 * safety only; this is primarily for documentation).
 *
 * @param value - Value to check
 * @returns true if value is a string containing SVG
 */
export function isMermaidSvg(value) {
    return (typeof value === "string" &&
        (value.includes("<svg") || value.includes("<SVG")));
}
//# sourceMappingURL=branded-types.js.map