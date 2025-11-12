/**
 * Custom React hooks for accessing Mermaid services
 *
 * These hooks provide access to the Effect layer containing Mermaid services
 * and allow you to check the initialization status of the Mermaid provider.
 *
 * Both hooks must be called within a component tree that includes a MermaidProvider.
 *
 * @example
 * ```tsx
 * import { useMermaidLayer, useMermaidInitialized } from 'effect-mermaid-react';
 *
 * function MyComponent() {
 *   const isReady = useMermaidInitialized();
 *   const layer = useMermaidLayer();
 *
 *   if (!isReady) {
 *     return <div>Initializing Mermaid services...</div>;
 *   }
 *
 *   // Render using services
 *   return <div>Services ready!</div>;
 * }
 * ```
 */
/**
 * Access the Effect layer containing Mermaid services
 *
 * Returns the composed Effect Layer that provides both BrowserMermaid and
 * ThemeRegistry services. Typically used internally by MermaidDiagram.
 *
 * @returns The Effect Layer with Mermaid and theme services, or null if not initialized
 *
 * @see {@link useMermaidInitialized} to check if services are ready
 * @see {@link MermaidProvider} for the parent provider component
 */
export { useMermaidLayer } from "../components/MermaidProvider.js";
/**
 * Check if Mermaid services are initialized and ready to use
 *
 * Returns true once the Mermaid service and ThemeRegistry have been successfully
 * initialized. Child components should wait for this before using diagram rendering.
 *
 * @returns true if services are initialized, false if initializing or error occurred
 *
 * @example
 * ```tsx
 * import { useMermaidInitialized, MermaidDiagram } from 'effect-mermaid-react';
 *
 * function ConditionalRenderer() {
 *   const isReady = useMermaidInitialized();
 *   return isReady ? <MermaidDiagram diagram={code} /> : <Spinner />;
 * }
 * ```
 *
 * @see {@link useMermaidLayer} to access services
 * @see {@link MermaidProvider} for the parent provider component
 */
export { useMermaidInitialized } from "../components/MermaidProvider.js";
//# sourceMappingURL=index.d.ts.map