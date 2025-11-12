import type { MermaidConfig } from "effect-mermaid";
import type React from "react";
/**
 * Props for the MermaidDiagram component
 */
interface MermaidDiagramProps {
    /**
     * The Mermaid diagram source code to render
     * Must contain valid Mermaid syntax (e.g., "graph TD\n  A-->B")
     * Empty strings will display an error
     */
    diagram: string;
    /**
     * Optional configuration for diagram rendering
     *
     * Includes theme selection, security level, and diagram-specific options.
     * See {@link MermaidConfig} for all available options.
     *
     * @example
     * ```tsx
     * <MermaidDiagram
     *   diagram={code}
     *   config={{ theme: "dark", securityLevel: "strict" }}
     * />
     * ```
     */
    config?: MermaidConfig;
    /**
     * CSS class name to apply to the container div
     * Useful for styling the diagram container
     */
    className?: string;
    /**
     * Inline style object for the container div
     * Merged with default styles (position: relative, minHeight for loading state)
     */
    style?: React.CSSProperties;
    /**
     * Callback fired when diagram rendering completes successfully
     * Receives the rendered SVG as an HTML string
     *
     * @example
     * ```tsx
     * <MermaidDiagram
     *   diagram={code}
     *   onRender={(svg) => console.log("Rendered:", svg.substring(0, 100))}
     * />
     * ```
     */
    onRender?: (svg: string) => void;
    /**
     * Callback fired when diagram rendering fails
     * Called with an Error object containing details about the failure
     *
     * Common error reasons:
     * - "Diagram cannot be empty" - diagram prop is empty
     * - "Mermaid service not initialized" - provider not ready
     * - Parse errors - invalid Mermaid syntax
     * - Render errors - library failures
     *
     * @example
     * ```tsx
     * <MermaidDiagram
     *   diagram={code}
     *   onError={(err) => console.error("Failed:", err.message)}
     * />
     * ```
     */
    onError?: (error: Error) => void;
}
/**
 * React component that renders Mermaid diagrams with full Effect.js support
 *
 * This component handles:
 * - Diagram syntax validation
 * - Asynchronous diagram rendering
 * - Error display and reporting
 * - Loading state visualization
 * - Automatic re-rendering on prop changes
 * - Theme application from configuration
 * - SVG injection into the DOM
 *
 * Must be used within a {@link MermaidProvider} component that initializes
 * the Mermaid service and provides the necessary Effect layer.
 *
 * The component displays:
 * - Loading indicator while rendering
 * - Error message if diagram is invalid or rendering fails
 * - Rendered SVG diagram on success
 *
 * @example
 * ```tsx
 * import { MermaidProvider, MermaidDiagram } from 'effect-mermaid-react';
 *
 * export function App() {
 *   const diagram = `graph TD
 *     A[Start] --> B[End]`;
 *
 *   return (
 *     <MermaidProvider>
 *       <MermaidDiagram
 *         diagram={diagram}
 *         config={{ theme: "dark" }}
 *         onRender={(svg) => console.log("Success!")}
 *         onError={(err) => console.error("Error:", err)}
 *       />
 *     </MermaidProvider>
 *   );
 * }
 * ```
 *
 * @throws Nothing directly; errors are passed to the onError callback
 *
 * @see {@link MermaidProvider} - required ancestor component
 * @see {@link MermaidConfig} for configuration options
 * @see {@link useMermaidInitialized} to check provider initialization
 */
export declare const MermaidDiagram: React.FC<MermaidDiagramProps>;
export {};
//# sourceMappingURL=MermaidDiagram.d.ts.map