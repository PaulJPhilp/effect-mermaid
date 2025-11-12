/**
 * @module effect-mermaid-react
 *
 * React integration package for effect-mermaid - a type-safe, functional diagram
 * rendering library built on Effect.js.
 *
 * This module provides:
 * - **Components**: React components for rendering and managing Mermaid diagrams
 * - **Hooks**: Custom React hooks for accessing Mermaid services and configuration
 * - **Services**: Browser-based Mermaid rendering service for React applications
 * - **Types**: Shared types and error handling from core package
 *
 * The package follows React best practices with hooks for dependency injection,
 * context providers for service composition, and full TypeScript support.
 *
 * @example
 * ```tsx
 * import { MermaidProvider, MermaidDiagram } from 'effect-mermaid-react';
 *
 * export function DiagramViewer() {
 *   const diagram = `graph TD
 *     A[Start] --> B{Decision}
 *     B -->|Yes| C[End]
 *     B -->|No| D[Retry]`;
 *
 *   return (
 *     <MermaidProvider config={{ theme: "dark" }}>
 *       <MermaidDiagram
 *         diagram={diagram}
 *         onRender={(svg) => console.log("Rendered!")}
 *         onError={(err) => console.error("Error:", err)}
 *       />
 *     </MermaidProvider>
 *   );
 * }
 * ```
 *
 * @see {@link MermaidProvider} for the required context provider
 * @see {@link MermaidDiagram} for the diagram rendering component
 * @see {@link useMermaidLayer}, {@link useMermaidInitialized} for hooks
 * @see {@link BrowserMermaid} for browser service implementation
 */

// Re-export core types
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
 * @see {@link MermaidDiagram} for how errors are handled in React components
 */
export { MermaidError } from "effect-mermaid";

// Components
/**
 * React components for rendering Mermaid diagrams
 *
 * Exports:
 * - {@link MermaidProvider}: Context provider for Mermaid services
 * - {@link MermaidDiagram}: Component that renders diagram SVG
 *
 * @see {@link MermaidProvider} for initialization
 * @see {@link MermaidDiagram} for rendering diagrams
 */
export * from "./components/index.js";

// Hooks
/**
 * Custom React hooks for accessing Mermaid services
 *
 * Exports:
 * - {@link useMermaidLayer}: Access the Effect layer containing Mermaid services
 * - {@link useMermaidInitialized}: Check if Mermaid services are ready
 *
 * @example
 * ```tsx
 * import { useMermaidInitialized } from 'effect-mermaid-react';
 *
 * function DiagramRenderer() {
 *   const isReady = useMermaidInitialized();
 *   if (!isReady) return <div>Initializing Mermaid...</div>;
 *
 *   return <YourDiagramComponent />;
 * }
 * ```
 *
 * @see {@link useMermaidLayer} for service access
 * @see {@link useMermaidInitialized} for initialization status
 */
export * from "./hooks/index.js";

// Services (for advanced usage)
/**
 * Browser-based Mermaid rendering service for React applications
 *
 * Provides real Mermaid.js rendering using the browser library. This is the
 * production implementation used when rendering diagrams in web applications.
 *
 * Service automatically handles:
 * - Mermaid.js library loading and initialization
 * - Diagram parsing and validation
 * - SVG generation with theme support
 * - Error handling with typed errors
 *
 * Normally used through {@link MermaidProvider} context. For advanced use cases,
 * can be accessed directly via {@link useMermaidLayer}.
 *
 * @example
 * ```tsx
 * import { BrowserMermaid } from 'effect-mermaid-react';
 * import { Effect, Layer } from 'effect';
 *
 * // Direct service usage (advanced)
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* BrowserMermaid;
 *   const svg = yield* mermaid.render("graph TD\\n  A-->B");
 *   return svg;
 * });
 *
 * await Effect.runPromise(
 *   Effect.provide(program, BrowserMermaid.Default)
 * );
 * ```
 *
 * @see {@link MermaidProvider} for React integration
 * @see {@link MermaidDiagram} for component-based rendering
 */
export { BrowserMermaid } from "./services/mermaid/service.js";
