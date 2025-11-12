"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemeNotFoundError = exports.InvalidThemeError = exports.DuplicateThemeError = void 0;
var _effect = require("effect");
class ThemeNotFoundError extends /*#__PURE__*/_effect.Data.TaggedError("ThemeNotFoundError") {
  constructor(name) {
    super({
      name
    });
  }
}
exports.ThemeNotFoundError = ThemeNotFoundError;
class InvalidThemeError extends /*#__PURE__*/_effect.Data.TaggedError("InvalidThemeError") {
  constructor(message) {
    super({
      message
    });
  }
}
exports.InvalidThemeError = InvalidThemeError;
class DuplicateThemeError extends /*#__PURE__*/_effect.Data.TaggedError("DuplicateThemeError") {
  constructor(name) {
    super({
      name
    });
  }
}
exports.DuplicateThemeError = DuplicateThemeError;
//# sourceMappingURL=errors.js.map