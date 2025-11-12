import { Data } from "effect";
export class ThemeNotFoundError extends /*#__PURE__*/Data.TaggedError("ThemeNotFoundError") {
  constructor(name) {
    super({
      name
    });
  }
}
export class InvalidThemeError extends /*#__PURE__*/Data.TaggedError("InvalidThemeError") {
  constructor(message) {
    super({
      message
    });
  }
}
export class DuplicateThemeError extends /*#__PURE__*/Data.TaggedError("DuplicateThemeError") {
  constructor(name) {
    super({
      name
    });
  }
}
//# sourceMappingURL=errors.js.map