"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemeRegistry = void 0;
var _effect = require("effect");
var _errors = require("./errors.js");
var _helpers = require("./helpers.js");
var _builtInThemes = require("./built-in-themes.js");
class ThemeRegistry extends /*#__PURE__*/_effect.Effect.Service()("effect-mermaid/ThemeRegistry", {
  scoped: /*#__PURE__*/_effect.Effect.gen(function* ($) {
    const themes = new Map(Object.entries(_builtInThemes.BUILT_IN_THEMES).map(([name, theme]) => [name, {
      ...theme,
      colors: (0, _helpers.normalizeThemeColors)(theme.colors)
    }]));
    const registerTheme = (name, theme) => _effect.Effect.gen(function* ($) {
      if (themes.has(name)) {
        return yield* $(_effect.Effect.fail(new _errors.DuplicateThemeError(name)));
      }
      const decoded = yield* $((0, _helpers.decodeTheme)(theme));
      const normalized = {
        ...decoded,
        colors: (0, _helpers.normalizeThemeColors)(decoded.colors)
      };
      yield* $(_effect.Effect.sync(() => {
        themes.set(name, normalized);
      }));
    });
    const getTheme = name => _effect.Effect.gen(function* ($) {
      const theme = themes.get(name);
      if (!theme) {
        return yield* $(_effect.Effect.fail(new _errors.ThemeNotFoundError(name)));
      }
      return (0, _helpers.convertThemeToMermaidConfig)(theme);
    });
    const listThemes = () => _effect.Effect.sync(() => Array.from(themes.keys()));
    return {
      registerTheme,
      getTheme,
      listThemes
    };
  }),
  dependencies: []
}) {}
exports.ThemeRegistry = ThemeRegistry;
//# sourceMappingURL=service.js.map