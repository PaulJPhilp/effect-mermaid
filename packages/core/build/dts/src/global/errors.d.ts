declare const MermaidError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "MermaidError";
} & Readonly<A>;
/**
 * Error type for Mermaid-related operations
 *
 * Represents errors that occur during diagram parsing, rendering, or other Mermaid operations.
 * All MermaidErrors are tagged errors compatible with Effect's error handling system.
 *
 * @property reason - The category of error:
 *   - `"Parse"`: Error occurred while parsing diagram syntax
 *   - `"Render"`: Error occurred while rendering diagram to SVG
 *   - `"Unknown"`: Error with undetermined cause
 *
 * @property message - Human-readable error description
 *
 * @property diagram - Optional: The diagram source code that caused the error (for debugging)
 *
 * @example
 * try {
 *   const result = yield* mermaid.render(invalidDiagram);
 * } catch (error) {
 *   if (error instanceof MermaidError) {
 *     if (error.reason === "Parse") {
 *       console.error("Invalid diagram syntax:", error.message);
 *     }
 *   }
 * }
 */
export declare class MermaidError extends MermaidError_base<{
    readonly reason: "Parse" | "Render" | "Unknown";
    readonly message: string;
    readonly diagram?: string;
}> {
}
export {};
//# sourceMappingURL=errors.d.ts.map