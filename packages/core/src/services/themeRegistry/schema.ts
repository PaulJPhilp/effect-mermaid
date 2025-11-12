import * as S from "effect/Schema";
import { ThemeColorMapSchema } from "../../global/schema.js";

export const DiagramThemeSchema = S.Struct({
  name: S.NonEmptyString,
  colors: ThemeColorMapSchema,
  description: S.optional(S.String),
});