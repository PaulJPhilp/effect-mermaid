"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeThemeColors = exports.decodeTheme = exports.convertThemeToMermaidConfig = void 0;
var _effect = require("effect");
var ParseResult = _interopRequireWildcard(require("effect/ParseResult"));
var S = _interopRequireWildcard(require("effect/Schema"));
var _schema = require("./schema.js");
var _errors = require("./errors.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const COLOR_ALIASES = {
  primary: "primaryColor",
  primaryBorder: "primaryBorderColor",
  primaryText: "primaryTextColor",
  secondary: "secondaryColor",
  secondaryBorder: "secondaryBorderColor",
  secondaryText: "secondaryTextColor",
  tertiary: "tertiaryColor",
  tertiaryBorder: "tertiaryBorderColor",
  tertiaryText: "tertiaryTextColor",
  backgroundColor: "background",
  line: "lineColor",
  text: "textColor"
};
const normalizeThemeColors = colors => {
  const normalized = {};
  for (const [key, value] of Object.entries(colors)) {
    const alias = COLOR_ALIASES[key] ?? key;
    normalized[alias] = value;
  }
  return normalized;
};
/**
 * Converts a DiagramTheme object into a Mermaid-compatible theme configuration.
 * This function maps the `colors` object to the flat structure required by Mermaid.
 *
 * @example
 * const theme: DiagramTheme = {
 *   name: "my-theme",
 *   colors: { primaryColor: "#ff0000" }
 * };
 * const mermaidConfig = convertThemeToMermaidConfig(theme);
 * // mermaidConfig is { primaryColor: "#ff0000" }
 */
exports.normalizeThemeColors = normalizeThemeColors;
const convertThemeToMermaidConfig = theme => {
  return {
    ...normalizeThemeColors(theme.colors)
  };
};
exports.convertThemeToMermaidConfig = convertThemeToMermaidConfig;
const decodeTheme = theme => _effect.Effect.try({
  try: () => S.decodeUnknownSync(_schema.DiagramThemeSchema)(theme),
  catch: error => new _errors.InvalidThemeError(ParseResult.TreeFormatter.formatErrorSync(error))
});
exports.decodeTheme = decodeTheme;
//# sourceMappingURL=helpers.js.map