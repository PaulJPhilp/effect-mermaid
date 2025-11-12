import { Data } from "effect";

export class ThemeNotFoundError extends Data.TaggedError("ThemeNotFoundError")<{
  readonly name: string;
}> {
  constructor(name: string) {
    super({ name });
  }
}

export class InvalidThemeError extends Data.TaggedError("InvalidThemeError")<{
  readonly message: string;
}> {
  constructor(message: string) {
    super({ message });
  }
}

export class DuplicateThemeError extends Data.TaggedError(
  "DuplicateThemeError"
)<{
  readonly name: string;
}> {
  constructor(name: string) {
    super({ name });
  }
}