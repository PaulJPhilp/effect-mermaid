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
export const ThemeColorValueSchema = /*#__PURE__*/Schema.Union(Schema.String, Schema.Number);
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
export const ThemeColorMapSchema = /*#__PURE__*/Schema.Record({
  key: Schema.String,
  value: ThemeColorValueSchema
});
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
export const MermaidConfig = /*#__PURE__*/Schema.Struct({
  theme: /*#__PURE__*/Schema.optional(Schema.String),
  themeVariables: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),
  securityLevel: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Union(/*#__PURE__*/Schema.Literal("strict"), /*#__PURE__*/Schema.Literal("loose"), /*#__PURE__*/Schema.Literal("antiscript"))),
  flowchart: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),
  sequence: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),
  class: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),
  state: /*#__PURE__*/Schema.optional(/*#__PURE__*/Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  }))
});
//# sourceMappingURL=schema.js.map