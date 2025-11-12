declare const ThemeNotFoundError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ThemeNotFoundError";
} & Readonly<A>;
export declare class ThemeNotFoundError extends ThemeNotFoundError_base<{
    readonly name: string;
}> {
    constructor(name: string);
}
declare const InvalidThemeError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidThemeError";
} & Readonly<A>;
export declare class InvalidThemeError extends InvalidThemeError_base<{
    readonly message: string;
}> {
    constructor(message: string);
}
declare const DuplicateThemeError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "DuplicateThemeError";
} & Readonly<A>;
export declare class DuplicateThemeError extends DuplicateThemeError_base<{
    readonly name: string;
}> {
    constructor(name: string);
}
export {};
//# sourceMappingURL=errors.d.ts.map