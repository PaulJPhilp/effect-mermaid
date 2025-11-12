import { Schema } from "effect";
/**
 * Schema for theme color values
 * Accepts either string (hex, rgb, etc.) or numeric color values
 *
 * @example
 * "#ff0000" // hex color
 * "rgb(255, 0, 0)" // rgb color
 * 0xff0000 // numeric color
 */
export declare const ThemeColorValueSchema: Schema.Union<[typeof Schema.String, typeof Schema.Number]>;
/**
 * Schema for a mapping of theme color property names to their values
 * Used to validate custom theme color definitions
 *
 * @example
 * {
 *   primaryColor: "#003366",
 *   primaryTextColor: "#ffffff",
 *   lineColor: "rgb(26, 77, 122)"
 * }
 */
export declare const ThemeColorMapSchema: Schema.Record$<typeof Schema.String, Schema.Union<[typeof Schema.String, typeof Schema.Number]>>;
/**
 * Configuration schema for Mermaid rendering
 *
 * Defines all valid configuration options for the Mermaid service:
 *
 * - `theme`: Theme identifier (built-in: "default", "dark", "forest", "neutral", or custom)
 * - `themeVariables`: Custom theme variable overrides
 * - `securityLevel`: Security level for rendering ("strict", "loose", "antiscript")
 * - `flowchart`: Flowchart-specific configuration options
 * - `sequence`: Sequence diagram-specific configuration options
 * - `class`: Class diagram-specific configuration options
 * - `state`: State diagram-specific configuration options
 *
 * @example
 * const config: MermaidConfig = {
 *   theme: "dark",
 *   securityLevel: "strict",
 *   themeVariables: {
 *     primaryColor: "#003366"
 *   }
 * };
 */
export declare const MermaidConfig: Schema.Struct<{
    theme: Schema.optional<typeof Schema.String>;
    themeVariables: Schema.optional<Schema.Record$<typeof Schema.String, typeof Schema.Unknown>>;
    securityLevel: Schema.optional<Schema.Union<[Schema.Literal<["strict"]>, Schema.Literal<["loose"]>, Schema.Literal<["antiscript"]>]>>;
    flowchart: Schema.optional<Schema.Record$<typeof Schema.String, typeof Schema.Unknown>>;
    sequence: Schema.optional<Schema.Record$<typeof Schema.String, typeof Schema.Unknown>>;
    class: Schema.optional<Schema.Record$<typeof Schema.String, typeof Schema.Unknown>>;
    state: Schema.optional<Schema.Record$<typeof Schema.String, typeof Schema.Unknown>>;
}>;
/**
 * Type extracted from the MermaidConfig schema
 *
 * Represents all valid configuration options for rendering Mermaid diagrams.
 * All properties are optional.
 *
 * @see {@link MermaidConfig} for the schema definition and validation rules
 */
export type MermaidConfig = Schema.Schema.Type<typeof MermaidConfig>;
//# sourceMappingURL=schema.d.ts.map