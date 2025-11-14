"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Effect } from "effect";
import * as Either from "effect/Either";
import { useEffect, useRef, useState } from "react";
import { BrowserMermaid } from "../services/mermaid/service.js";
import { useMermaidInitialized, useMermaidLayer, } from "./MermaidProvider.js";
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
export const MermaidDiagram = ({ diagram, config, className, style, onRender, onError, }) => {
    const layer = useMermaidLayer();
    const isInitialized = useMermaidInitialized();
    const [svg, setSvg] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
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
                const renderEffect = Effect.gen(function* () {
                    const service = yield* BrowserMermaid;
                    const svg = yield* service.render(diagram, config);
                    return svg;
                }).pipe(Effect.either, Effect.provide(layer), Effect.scoped);
                const result = await Effect.runPromise(renderEffect);
                if (Either.isRight(result)) {
                    const renderedSvg = result.right;
                    setSvg(renderedSvg);
                    setError(null);
                    onRender?.(renderedSvg);
                }
                else {
                    const errorValue = result.left;
                    const handledError = errorValue instanceof Error
                        ? errorValue
                        : new Error(String(errorValue ?? "Unknown error"));
                    setError(handledError.message || "Unknown error");
                    setSvg("");
                    onError?.(handledError);
                }
            }
            finally {
                setIsLoading(false);
            }
        };
        renderDiagram();
    }, [diagram, config, layer, isInitialized, onRender, onError]);
    // Update the container with the rendered SVG
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = svg;
        }
    }, [svg]);
    if (error) {
        return (_jsxs("div", { className: className, style: {
                ...style,
                border: "1px solid #ff6b6b",
                borderRadius: "4px",
                padding: "16px",
                backgroundColor: "#ffebee",
                color: "#c62828",
            }, children: [_jsx("div", { style: { fontWeight: "bold", marginBottom: "8px" }, children: "Diagram Error" }), _jsx("div", { style: { fontFamily: "monospace", fontSize: "14px" }, children: error })] }));
    }
    return (_jsx("div", { ref: containerRef, role: "presentation", "aria-hidden": true, "data-testid": "mermaid-diagram", className: className, style: {
            ...style,
            position: "relative",
            minHeight: isLoading ? "100px" : "auto",
        }, children: isLoading && (_jsx("div", { style: {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#666",
                fontSize: "14px",
            }, children: "Rendering diagram..." })) }));
};
//# sourceMappingURL=MermaidDiagram.js.map