"use strict";
"use client";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MermaidDiagram = void 0;
var _jsxRuntime = require("react/jsx-runtime");
var _effect = require("effect");
var Either = _interopRequireWildcard(require("effect/Either"));
var _react = require("react");
var _service = require("../services/mermaid/service.js");
var _MermaidProvider = require("./MermaidProvider.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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
const MermaidDiagram = ({
  diagram,
  config,
  className,
  style,
  onRender,
  onError
}) => {
  const layer = (0, _MermaidProvider.useMermaidLayer)();
  const isInitialized = (0, _MermaidProvider.useMermaidInitialized)();
  const [svg, setSvg] = (0, _react.useState)("");
  const [error, setError] = (0, _react.useState)(null);
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    const renderDiagram = async () => {
      if (!diagram.trim()) {
        setError("Diagram cannot be empty");
        setSvg("");
        return;
      }
      if (!isInitialized || !layer) {
        setError("Mermaid service not initialized");
        setSvg("");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const renderEffect = _effect.Effect.gen(function* () {
          const service = yield* _service.BrowserMermaid;
          const svg = yield* service.render(diagram, config);
          return svg;
        }).pipe(_effect.Effect.either, _effect.Effect.provide(layer), _effect.Effect.scoped);
        const result = await _effect.Effect.runPromise(renderEffect);
        if (Either.isRight(result)) {
          const renderedSvg = result.right;
          setSvg(renderedSvg);
          setError(null);
          onRender?.(renderedSvg);
        } else {
          const errorValue = result.left;
          const handledError = errorValue instanceof Error ? errorValue : new Error(String(errorValue ?? "Unknown error"));
          setError(handledError.message || "Unknown error");
          setSvg("");
          onError?.(handledError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    renderDiagram();
  }, [diagram, config, layer, isInitialized, onRender, onError]);
  // Update the container with the rendered SVG
  (0, _react.useEffect)(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svg;
    }
  }, [svg]);
  if (error) {
    return (0, _jsxRuntime.jsxs)("div", {
      className: className,
      style: {
        ...style,
        border: "1px solid #ff6b6b",
        borderRadius: "4px",
        padding: "16px",
        backgroundColor: "#ffebee",
        color: "#c62828"
      },
      children: [(0, _jsxRuntime.jsx)("div", {
        style: {
          fontWeight: "bold",
          marginBottom: "8px"
        },
        children: "Diagram Error"
      }), (0, _jsxRuntime.jsx)("div", {
        style: {
          fontFamily: "monospace",
          fontSize: "14px"
        },
        children: error
      })]
    });
  }
  return (0, _jsxRuntime.jsx)("div", {
    ref: containerRef,
    role: "presentation",
    "aria-hidden": true,
    "data-testid": "mermaid-diagram",
    className: className,
    style: {
      ...style,
      position: "relative",
      minHeight: isLoading ? "100px" : "auto"
    },
    children: isLoading && (0, _jsxRuntime.jsx)("div", {
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#666",
        fontSize: "14px"
      },
      children: "Rendering diagram..."
    })
  });
};
exports.MermaidDiagram = MermaidDiagram;
//# sourceMappingURL=MermaidDiagram.js.map