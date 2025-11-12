import * as S from "effect/Schema";
import { ThemeColorMapSchema } from "../../global/schema.js";
export const DiagramThemeSchema = /*#__PURE__*/S.Struct({
  name: S.NonEmptyString,
  colors: ThemeColorMapSchema,
  description: /*#__PURE__*/S.optional(S.String)
});
//# sourceMappingURL=schema.js.map