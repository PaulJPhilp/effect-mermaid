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
 * Branded type for Mermaid diagram source code
 *
 * Represents validated Mermaid diagram syntax. Use {@link makeMermaidSource}
 * to construct this type after validation.
 */
export type MermaidSource = string & {
    readonly __brand: "MermaidSource";
};
/**
 * Branded type for rendered Mermaid SVG output
 *
 * Represents successfully rendered SVG. Safe to inject into DOM.
 */
export type MermaidSvg = string & {
    readonly __brand: "MermaidSvg";
};
/**
 * Branded type for unique diagram render IDs
 *
 * Used to uniquely identify diagram containers when multiple diagrams
 * are rendered on the same page.
 */
export type DiagramId = string & {
    readonly __brand: "DiagramId";
};
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
export declare function makeMermaidSource(source: string): MermaidSource;
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
export declare function makeMermaidSvg(svg: string): MermaidSvg;
/**
 * Create a DiagramId from a string
 *
 * @internal
 * @param id - The diagram ID
 * @returns Branded DiagramId type
 */
export declare function makeDiagramId(id: string): DiagramId;
/**
 * Check if a value is a MermaidSource
 *
 * Runtime check for branded type (note: branded types provide compile-time
 * safety only; this is primarily for documentation).
 *
 * @param value - Value to check
 * @returns true if value is a string (all MermaidSources are strings)
 */
export declare function isMermaidSource(value: unknown): value is MermaidSource;
/**
 * Check if a value is MermaidSvg
 *
 * Runtime check for branded type (note: branded types provide compile-time
 * safety only; this is primarily for documentation).
 *
 * @param value - Value to check
 * @returns true if value is a string containing SVG
 */
export declare function isMermaidSvg(value: unknown): value is MermaidSvg;
//# sourceMappingURL=branded-types.d.ts.map