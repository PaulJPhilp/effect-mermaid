/**
 * React components and hooks for rendering Mermaid diagrams
 *
 * This module exports the main components and hooks used to render
 * Mermaid diagrams in React applications with full Effect.js integration.
 *
 * Components:
 * - {@link MermaidProvider}: Context provider that initializes Mermaid services
 * - {@link MermaidDiagram}: Component for rendering individual diagrams
 *
 * Hooks:
 * - {@link useMermaidLayer}: Access the Effect layer containing services
 * - {@link useMermaidInitialized}: Check if services are initialized
 *
 * @example
 * ```tsx
 * import { MermaidProvider, MermaidDiagram, useMermaidInitialized } from 'effect-mermaid-react';
 *
 * function App() {
 *   return (
 *     <MermaidProvider config={{ theme: "dark" }}>
 *       <DiagramContainer />
 *     </MermaidProvider>
 *   );
 * }
 *
 * function DiagramContainer() {
 *   const isReady = useMermaidInitialized();
 *   if (!isReady) return <div>Loading...</div>;
 *
 *   return (
 *     <MermaidDiagram
 *       diagram="graph TD\n  A-->B"
 *       onRender={(svg) => console.log("Done!")}
 *     />
 *   );
 * }
 * ```
 */

/**
 * Context provider that initializes Mermaid services
 *
 * Must wrap all MermaidDiagram components and users of the Mermaid hooks.
 * Handles service initialization and provides the Effect layer to child components.
 *
 * @see {@link MermaidProvider} for full documentation
 */
export { MermaidProvider, useMermaidLayer, useMermaidInitialized } from "./MermaidProvider.js";

/**
 * React component for rendering Mermaid diagrams
 *
 * Renders a Mermaid diagram to SVG with support for theming, configuration,
 * error handling, and loading states. Must be used within a MermaidProvider.
 *
 * @see {@link MermaidDiagram} for full documentation
 */
export { MermaidDiagram } from "./MermaidDiagram.js";
