import { Data } from "effect";
export class ThemeNotFoundError extends Data.TaggedError("ThemeNotFoundError") {
    constructor(name) {
        super({ name });
    }
}
export class InvalidThemeError extends Data.TaggedError("InvalidThemeError") {
    constructor(message) {
        super({ message });
    }
}
export class DuplicateThemeError extends Data.TaggedError("DuplicateThemeError") {
    constructor(name) {
        super({ name });
    }
}
//# sourceMappingURL=errors.js.map