"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemeColorValueSchema = exports.ThemeColorMapSchema = exports.MermaidConfig = void 0;
var _effect = require("effect");
var _types = require("./types.js");
const HexStringPattern = /^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/;
/**
 * Schema for theme color values
 * Accepts either string (hex, rgb, etc.) or numeric color values
 *
 * @example
 * "#ff0000" // hex color
 * "rgb(255, 0, 0)" // rgb color
 * 0xff0000 // numeric color
 */
const ThemeColorValueSchema = exports.ThemeColorValueSchema = /*#__PURE__*/_effect.Schema.Union(_effect.Schema.String, _effect.Schema.Number, /*#__PURE__*/_effect.Schema.Struct({
  kind: /*#__PURE__*/_effect.Schema.Literal("hex"),
  value: /*#__PURE__*/_effect.Schema.String.pipe(/*#__PURE__*/_effect.Schema.pattern(HexStringPattern))
}), /*#__PURE__*/_effect.Schema.Struct({
  kind: /*#__PURE__*/_effect.Schema.Literal("named"),
  name: /*#__PURE__*/_effect.Schema.Literal(..._types.CSS_COLOR_NAMES)
}), /*#__PURE__*/_effect.Schema.Struct({
  kind: /*#__PURE__*/_effect.Schema.Literal("rgb"),
  red: _effect.Schema.Number,
  green: _effect.Schema.Number,
  blue: _effect.Schema.Number,
  alpha: /*#__PURE__*/_effect.Schema.optional(_effect.Schema.Number)
}), /*#__PURE__*/_effect.Schema.Struct({
  kind: /*#__PURE__*/_effect.Schema.Literal("hsl"),
  hue: _effect.Schema.Number,
  saturation: _effect.Schema.Number,
  lightness: _effect.Schema.Number,
  alpha: /*#__PURE__*/_effect.Schema.optional(_effect.Schema.Number)
}));
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
const ThemeColorMapSchema = exports.ThemeColorMapSchema = /*#__PURE__*/_effect.Schema.Record({
  key: _effect.Schema.String,
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
const MermaidConfig = exports.MermaidConfig = /*#__PURE__*/_effect.Schema.Struct({
  theme: /*#__PURE__*/_effect.Schema.optional(_effect.Schema.String),
  themeVariables: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Record({
    key: _effect.Schema.String,
    value: _effect.Schema.Unknown
  })),
  securityLevel: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Union(/*#__PURE__*/_effect.Schema.Literal("strict"), /*#__PURE__*/_effect.Schema.Literal("loose"), /*#__PURE__*/_effect.Schema.Literal("antiscript"))),
  flowchart: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Record({
    key: _effect.Schema.String,
    value: _effect.Schema.Unknown
  })),
  sequence: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Record({
    key: _effect.Schema.String,
    value: _effect.Schema.Unknown
  })),
  class: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Record({
    key: _effect.Schema.String,
    value: _effect.Schema.Unknown
  })),
  state: /*#__PURE__*/_effect.Schema.optional(/*#__PURE__*/_effect.Schema.Record({
    key: _effect.Schema.String,
    value: _effect.Schema.Unknown
  }))
});
//# sourceMappingURL=schema.js.map