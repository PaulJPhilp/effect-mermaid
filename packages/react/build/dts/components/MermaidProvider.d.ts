import { Layer } from "effect";
import type { MermaidError, ThemeRegistryApi } from "effect-mermaid";
import type React from "react";
import { type ReactNode } from "react";
import { BrowserMermaid } from "../services/mermaid/service.js";
export type MermaidLayer = Layer.Layer<BrowserMermaid | ThemeRegistryApi, MermaidError, never>;
/**
 * Props for the MermaidProvider component
 */
interface MermaidProviderProps {
    /**
     * Child components that will have access to Mermaid services
     * Must include at least one MermaidDiagram component or hook user
     */
    children: ReactNode;
    /**
     * Optional configuration for Mermaid initialization
     *
     * @property theme - Built-in theme to apply globally (default, dark, forest, neutral)
     * @property themeVariables - Additional theme variable overrides
     */
    config?: {
        theme?: "default" | "dark" | "forest" | "neutral";
        themeVariables?: Record<string, unknown>;
    };
}
/**
 * Provider component that initializes Mermaid.js and provides Effect layer context
 *
 * This component initializes the Mermaid service and ThemeRegistry on mount,
 * creating an Effect Layer that composes both services. All child components
 * can access Mermaid functionality through the provided hooks.
 *
 * The provider handles:
 * - Loading and initializing Mermaid.js
 * - Creating and composing Effect services (Mermaid + ThemeRegistry)
 * - Managing initialization state
 * - Providing context to child components
 *
 * Must wrap all MermaidDiagram components and any components using
 * useMermaidInitialized() or useMermaidLayer() hooks.
 *
 * @example
 * ```tsx
 * export function App() {
 *   return (
 *     <MermaidProvider config={{ theme: "dark" }}>
 *       <MermaidDiagram diagram={myDiagram} />
 *     </MermaidProvider>
 *   );
 * }
 * ```
 *
 * @throws Nothing directly, but logs to console.error if initialization fails.
 *         Child components should check initialization state before rendering.
 *
 * @see {@link useMermaidInitialized} to check if initialization is complete
 * @see {@link useMermaidLayer} to access the Effect layer in child components
 * @see {@link MermaidDiagram} for using diagrams within the provider
 */
export declare const MermaidProvider: React.FC<MermaidProviderProps>;
/**
 * Hook to access the Effect layer containing Mermaid and ThemeRegistry services
 *
 * Returns the composed Effect Layer that provides both the BrowserMermaid service
 * and ThemeRegistry service. This is typically used internally by MermaidDiagram
 * to render diagrams with theme support.
 *
 * @returns The Effect Layer with Mermaid services composed, or null if provider
 *          is not initialized or component is outside MermaidProvider context
 *
 * @throws Error if called outside of a MermaidProvider component
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const layer = useMermaidLayer();
 *   if (!layer) return <div>Initializing...</div>;
 *
 *   // Use layer with Effect.provide() to run diagram operations
 * }
 * ```
 *
 * @see {@link MermaidProvider} - must be a descendant of this component
 * @see {@link useMermaidInitialized} - check initialization status
 */
export declare const useMermaidLayer: () => MermaidLayer | null;
/**
 * Hook to check if Mermaid services are fully initialized
 *
 * Returns true once the Mermaid service and ThemeRegistry have been successfully
 * initialized and are ready for use. Child components should typically wait for
 * initialization before rendering diagrams.
 *
 * The initialization process:
 * 1. Component mounts
 * 2. Mermaid.js library loads (if not cached)
 * 3. Effect services are composed into a Layer
 * 4. Services are verified to work correctly
 * 5. Hook returns true
 *
 * @returns true if Mermaid is initialized and ready to use,
 *          false if initializing, failed to initialize, or outside provider context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isReady = useMermaidInitialized();
 *   if (!isReady) return <Spinner />;
 *
 *   return <MermaidDiagram diagram={diagram} />;
 * }
 * ```
 *
 * @see {@link MermaidProvider} - must be a descendant of this component
 * @see {@link useMermaidLayer} - access the services after initialization
 */
export declare const useMermaidInitialized: () => boolean;
export {};
//# sourceMappingURL=MermaidProvider.d.ts.map