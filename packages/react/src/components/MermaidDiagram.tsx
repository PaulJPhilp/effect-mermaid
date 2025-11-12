"use client";

import { Effect } from "effect";
import type { MermaidConfig } from "effect-mermaid";
import * as Either from "effect/Either";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { BrowserMermaid } from "../services/mermaid/service.js";
import {
	useMermaidInitialized,
	useMermaidLayer,
	type MermaidLayer,
} from "./MermaidProvider.js";

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
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
	diagram,
	config,
	className,
	style,
	onRender,
	onError,
}) => {
  console.log("MermaidDiagram", diagram, config, className, style, onRender, onError);
	const layer = useMermaidLayer();
	const isInitialized = useMermaidInitialized();
	const [svg, setSvg] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

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
				}).pipe(
					Effect.either,
					Effect.provide(layer as MermaidLayer),
					Effect.scoped,
				);

				const result = await Effect.runPromise(renderEffect);

				if (Either.isRight(result)) {
					const renderedSvg = result.right;
					setSvg(renderedSvg);
					setError(null);
					onRender?.(renderedSvg);
				} else {
					const errorValue = result.left;
					const handledError =
						errorValue instanceof Error
							? errorValue
							: new Error(String(errorValue ?? "Unknown error"));

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
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.innerHTML = svg;
		}
	}, [svg]);

	if (error) {
		return (
			<div
				className={className}
				style={{
					...style,
					border: "1px solid #ff6b6b",
					borderRadius: "4px",
					padding: "16px",
					backgroundColor: "#ffebee",
					color: "#c62828",
				}}
			>
				<div style={{ fontWeight: "bold", marginBottom: "8px" }}>
					Diagram Error
				</div>
				<div style={{ fontFamily: "monospace", fontSize: "14px" }}>{error}</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			role="presentation"
			aria-hidden={true}
			data-testid="mermaid-diagram"
			className={className}
			style={{
				...style,
				position: "relative",
				minHeight: isLoading ? "100px" : "auto",
			}}
		>
			{isLoading && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						color: "#666",
						fontSize: "14px",
					}}
				>
					Rendering diagram...
				</div>
			)}
		</div>
	);
};
