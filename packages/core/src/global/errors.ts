import { Data } from "effect";

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
export class MermaidError extends Data.TaggedError("MermaidError")<{
  readonly reason: "Parse" | "Render" | "Unknown";
  readonly message: string;
  readonly diagram?: string;
}> {}
