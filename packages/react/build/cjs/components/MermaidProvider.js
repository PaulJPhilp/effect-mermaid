"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMermaidLayer = exports.useMermaidInitialized = exports.MermaidProvider = void 0;
var _jsxRuntime = require("react/jsx-runtime");
var _effect = require("effect");
var _effectMermaid = require("effect-mermaid");
var _react = require("react");
var _service = require("../services/mermaid/service.js");
const EffectLayerContext = /*#__PURE__*/(0, _react.createContext)(null);
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
const MermaidProvider = ({
  children,
  config
}) => {
  const [layer, setLayer] = (0, _react.useState)(null);
  const [isInitialized, setIsInitialized] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    // Initialize Mermaid service and layer
    const initializeMermaid = async () => {
      try {
        // Create a layer that provides both services
        // Use Layer.merge to ensure both ThemeRegistry and BrowserMermaid are available
        // in the Effect context when BrowserMermaid initializes
        const appLayer = _effect.Layer.merge(_effectMermaid.ThemeRegistry.Default, _service.BrowserMermaid.Default);
        setLayer(appLayer);
        // Actually execute the layer to trigger service initialization
        // This ensures Mermaid.js is imported and initialized before we mark as ready
        const warmupEffect = _effect.Effect.gen(function* () {
          // Access BrowserMermaid to trigger its initialization effect
          yield* _service.BrowserMermaid;
        }).pipe(_effect.Effect.provide(appLayer), _effect.Effect.scoped);
        await _effect.Effect.runPromise(warmupEffect);
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Mermaid:", err);
        setIsInitialized(false);
      }
    };
    initializeMermaid();
  }, []);
  return (0, _jsxRuntime.jsx)(EffectLayerContext.Provider, {
    value: {
      layer,
      isInitialized
    },
    children: children
  });
};
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
exports.MermaidProvider = MermaidProvider;
const useMermaidLayer = () => {
  const context = (0, _react.useContext)(EffectLayerContext);
  return context?.layer ?? null;
};
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
exports.useMermaidLayer = useMermaidLayer;
const useMermaidInitialized = () => {
  const context = (0, _react.useContext)(EffectLayerContext);
  return context?.isInitialized ?? false;
};
exports.useMermaidInitialized = useMermaidInitialized;
//# sourceMappingURL=MermaidProvider.js.map