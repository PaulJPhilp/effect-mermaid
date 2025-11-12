/**
 * @module effect-mermaid-node
 *
 * Node.js integration package for effect-mermaid - a type-safe, functional diagram
 * rendering library built on Effect.js.
 *
 * This module provides:
 * - **Services**: Server-side Mermaid rendering for Node.js applications
 * - **Types**: Shared types and error handling from core package
 *
 * The package enables rendering Mermaid diagrams to SVG on the server side,
 * suitable for generating diagrams programmatically in Node.js applications.
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import { NodeMermaid } from "effect-mermaid-node";
 * import { ThemeRegistry } from "effect-mermaid";
 *
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* NodeMermaid;
 *   const svg = yield* mermaid.render("graph TD\\n  A[Start] --> B[End]", {
 *     theme: "dark"
 *   });
 *   console.log(svg); // SVG output
 *   return svg;
 * });
 *
 * // Compose services for server-side rendering
 * const appLayer = Layer.merge(ThemeRegistry.Default, NodeMermaid.Default);
 * const svg = await Effect.runPromise(Effect.provide(program, appLayer));
 * ```
 *
 * @see {@link NodeMermaid} for the Node.js service implementation
 * @see {@link DiagramType}, {@link MermaidConfig} for types
 * @see {@link MermaidError} for error handling
 */

// Re-export core types and errors
/**
 * Type discriminant for Mermaid diagram types
 *
 * Identifies the category of a diagram (flowchart, sequence, class, state, gantt, unknown).
 * Imported from the core package.
 *
 * @see {@link MermaidConfig} for diagram-specific configuration
 */
export type { DiagramType, MermaidConfig, MermaidApi } from "effect-mermaid";

/**
 * Comprehensive error type for Mermaid rendering operations
 *
 * Tagged error providing detailed information about diagram failures including
 * error category (Parse, Render, Unknown), message, and optional source diagram.
 * Imported from the core package.
 *
 * @see {@link NodeMermaid} for server-side rendering
 */
export { MermaidError } from "effect-mermaid";

// Node-specific exports
/**
 * Node.js server-side Mermaid rendering service
 *
 * Provides real Mermaid.js rendering for Node.js applications. This is the
 * production implementation for generating Mermaid diagrams on the server side.
 *
 * Service automatically handles:
 * - Mermaid.js library execution via CLI
 * - Diagram parsing and validation
 * - SVG generation with theme support
 * - Error handling with typed errors
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import { NodeMermaid } from "effect-mermaid-node";
 * import { Mermaid } from "effect-mermaid";
 *
 * // Server-side diagram generation
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* Mermaid; // Resolved to NodeMermaid
 *   const svg = yield* mermaid.render(
 *     "graph LR\\n  A[Input] --> B[Process] --> C[Output]",
 *     { theme: "dark" }
 *   );
 *   return svg;
 * });
 *
 * // Use NodeMermaid service
 * const svg = await Effect.runPromise(
 *   Effect.provide(program, NodeMermaid.Default)
 * );
 * ```
 *
 * @see {@link Mermaid} for the service interface
 * @see {@link ThemeRegistry} for theme management
 * @see {@link MermaidConfig} for configuration options
 */
export { NodeMermaid } from "./services/mermaid/service.js";
