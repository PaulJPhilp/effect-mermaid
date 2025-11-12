import * as S from "effect/Schema";
export declare const DiagramThemeSchema: S.Struct<{
    name: typeof S.NonEmptyString;
    colors: S.Record$<typeof S.String, S.Union<[typeof S.String, typeof S.Number]>>;
    description: S.optional<typeof S.String>;
}>;
//# sourceMappingURL=schema.d.ts.map