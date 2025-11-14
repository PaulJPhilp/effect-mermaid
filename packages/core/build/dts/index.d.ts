/**
 * @module effect-mermaid
 *
 * Core package for effect-mermaid - a type-safe, functional diagram rendering library
 * built on Effect.js with full TypeScript support, dependency injection, and error handling.
 *
 * This module provides:
 * - **Services**: Effect-based services for rendering Mermaid diagrams and managing themes
 * - **Types**: TypeScript types for diagram configuration and diagram types
 * - **Errors**: Tagged error types for comprehensive error handling
 * - **Utilities**: Helper functions for ID generation, validation, and type detection
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import { Mermaid, ThemeRegistry, MermaidConfig } from "effect-mermaid";
 *
 * // Render a diagram with theme support
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* Mermaid;
 *   const svg = yield* mermaid.render("graph TD\\n  A-->B", {
 *     theme: "dark"
 *   });
 *   console.log(svg); // SVG output
 * });
 *
 * // Compose services
 * const appLayer = Layer.merge(ThemeRegistry.Default, Mermaid.Default);
 * await Effect.runPromise(Effect.provide(program, appLayer));
 * ```
 *
 * @see {@link Mermaid} for the diagram rendering service
 * @see {@link ThemeRegistry} for the theme management service
 * @see {@link MermaidConfig} for configuration options
 * @see {@link MermaidError} for error handling
 */
/**
 * Branded types for Mermaid diagram handling
 *
 * Use these types to distinguish between diagram source code and rendered SVG
 * at the type level, preventing accidental mixups.
 *
 * @example
 * ```typescript
 * import { MermaidSource, MermaidSvg, makeMermaidSource } from "effect-mermaid";
 *
 * const source = makeMermaidSource("graph TD\n  A-->B");
 * const svg: MermaidSvg = yield* mermaid.render(source);
 * ```
 *
 * @see {@link makeMermaidSource} to create a MermaidSource
 * @see {@link makeMermaidSvg} to create a MermaidSvg (internal use)
 */
export type { MermaidSource, MermaidSvg, DiagramId } from "./global/branded-types.js";
export { makeMermaidSource, makeMermaidSvg, makeDiagramId, isMermaidSource, isMermaidSvg, } from "./global/branded-types.js";
/**
 * Type discriminant for Mermaid diagram types
 *
 * Represents the supported diagram type categories that can be detected from
 * diagram source code. Each type has specific rendering requirements and
 * configuration options.
 *
 * - `"flowchart"`: Graph/flowchart diagrams (graph/flowchart syntax)
 * - `"sequence"`: Sequence diagrams for interaction flows
 * - `"class"`: UML class diagrams
 * - `"state"`: State machine diagrams
 * - `"gantt"`: Gantt charts for project timelines
 * - `"unknown"`: Diagram type could not be determined
 *
 * @example
 * ```typescript
 * import { detectDiagramType } from "effect-mermaid";
 *
 * const type = yield* detectDiagramType("graph TD\\n  A-->B");
 * if (type === "flowchart") {
 *   // Apply flowchart-specific configuration
 * }
 * ```
 *
 * @see {@link detectDiagramType} to detect the type of a diagram
 */
export type { DiagramType } from "./global/types.js";
/**
 * Configuration schema and type for Mermaid diagram rendering
 *
 * Provides a comprehensive type-safe configuration object for controlling
 * how diagrams are rendered. Includes theme selection, security settings,
 * and diagram-specific options.
 *
 * @property {string} [theme] - Built-in theme name ("default", "dark", "forest", "neutral")
 * @property {Record<string, unknown>} [themeVariables] - Custom theme variable overrides
 * @property {string} [securityLevel] - Mermaid security level ("strict", "loose", "antiscript")
 * @property {unknown} [diagram-specific] - Diagram-specific configuration options
 *
 * @example
 * ```typescript
 * import { Mermaid, MermaidConfig } from "effect-mermaid";
 *
 * const config: MermaidConfig = {
 *   theme: "dark",
 *   themeVariables: {
 *     primaryColor: "#ff6b6b",
 *     primaryTextColor: "#fff"
 *   },
 *   securityLevel: "strict"
 * };
 *
 * const svg = yield* mermaid.render(diagram, config);
 * ```
 *
 * @see {@link Mermaid} for rendering with configuration
 * @see {@link ThemeRegistry} for theme management
 */
export type { MermaidConfig } from "./global/schema.js";
/**
 * Comprehensive error type for all Mermaid rendering operations
 *
 * Tagged error that provides detailed information about diagram rendering failures.
 * Use with Effect's error handling patterns to catch and handle specific error categories.
 *
 * @property {string} reason - Error category: "Parse" (invalid syntax), "Render" (rendering failure), or "Unknown"
 * @property {string} message - Human-readable error description
 * @property {string} [diagram] - Optional: the diagram source that caused the error (for debugging)
 *
 * @example
 * ```typescript
 * import { Effect } from "effect";
 * import { Mermaid, MermaidError } from "effect-mermaid";
 *
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* Mermaid;
 *   const result = yield* Effect.either(
 *     mermaid.render(diagram)
 *   );
 *
 *   if (result._tag === "Left") {
 *     const error = result.left as MermaidError;
 *     console.error(`[${error.reason}] ${error.message}`);
 *   }
 * });
 * ```
 *
 * @see {@link makeParseError}, {@link makeRenderError}, {@link makeUnknownError} for creating errors
 * @see {@link Mermaid} for the service that throws these errors
 */
export { MermaidError } from "./global/errors.js";
/**
 * Generate a unique ID for Mermaid diagram rendering
 *
 * Creates a unique identifier in the format "mmd-xxxxxx" (6 random alphanumeric characters).
 * Used internally by Mermaid.js to uniquely identify diagram containers when multiple
 * diagrams are rendered on the same page.
 *
 * @returns A unique ID string suitable for use as an HTML element ID
 *
 * @example
 * ```typescript
 * import { makeRenderId } from "effect-mermaid";
 *
 * const id = makeRenderId(); // e.g., "mmd-a4f2k9"
 * const container = document.getElementById(id);
 * ```
 *
 * @see {@link validateDiagram} for input validation
 * @see {@link Mermaid} service for full rendering pipeline
 */
export { makeRenderId, validateDiagram } from "./services/mermaid/helpers.js";
/**
 * Factory functions for creating typed Mermaid errors
 *
 * These functions create consistently-structured error objects for different
 * failure categories during diagram rendering.
 *
 * - {@link makeParseError}: Use when diagram syntax is invalid
 * - {@link makeRenderError}: Use when Mermaid.js fails to render valid syntax
 * - {@link makeUnknownError}: Use for unexpected errors
 *
 * @example
 * ```typescript
 * import { makeParseError, makeRenderError } from "effect-mermaid";
 *
 * const parseErr = makeParseError("Invalid diagram syntax", diagram);
 * const renderErr = makeRenderError("Library initialization failed", diagram);
 * ```
 *
 * @see {@link MermaidError} for the error structure
 * @see {@link Mermaid} service for error generation
 */
export { makeParseError, makeRenderError, makeUnknownError } from "./services/mermaid/errors.js";
/**
 * Detect the type of a Mermaid diagram from its source code
 *
 * Analyzes a diagram's source code to determine its type by examining the first line.
 * Useful for routing diagrams to type-specific handlers or applying type-specific configuration.
 *
 * Detection covers all major diagram types:
 * - Flowcharts: "graph" or "flowchart" prefix
 * - Sequence: "sequenceDiagram" prefix
 * - Class: "classDiagram" prefix
 * - State: "stateDiagram" prefix
 * - Gantt: "gantt" prefix
 * - Unknown: Could not be determined
 *
 * @param diagram - The Mermaid diagram source code to analyze
 * @returns Effect that resolves to the detected {@link DiagramType}, or fails with {@link MermaidError} if invalid
 *
 * @example
 * ```typescript
 * import { detectDiagramType, DiagramType } from "effect-mermaid";
 * import { Effect } from "effect";
 *
 * const type = yield* detectDiagramType("graph TD\\n  A-->B");
 * // type === "flowchart"
 *
 * // Use for type-specific behavior
 * if (type === "sequence") {
 *   // Apply sequence-specific options
 * }
 * ```
 *
 * @throws MermaidError with reason "Parse" if diagram is empty or invalid
 *
 * @see {@link DiagramType} for diagram type discriminant
 * @see {@link Mermaid.render} for full rendering with type detection
 */
export { detectDiagramType } from "./services/mermaid/detectType.js";
/**
 * Logger service for structured, testable logging
 *
 * All logging in effect-mermaid flows through this service to maintain Effect purity
 * and enable dependency injection of different logging backends.
 *
 * @example
 * ```typescript
 * import { Logger } from "effect-mermaid";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* Logger;
 *   yield* logger.info("Rendering diagram...");
 *   yield* logger.warn("Theme not found, using default");
 * });
 * ```
 *
 * @see {@link Logger} for the default console-based implementation
 * @see {@link SilentLogger} for testing
 */
export { Logger, SilentLogger } from "./services/logger/index.js";
export type { LoggerApi } from "./services/logger/index.js";
/**
 * The Mermaid diagram rendering service
 *
 * Core service that renders Mermaid diagram syntax to SVG output. Provides:
 * - Diagram validation and type detection
 * - SVG generation from diagram source
 * - Theme application and configuration
 * - Comprehensive error handling with typed errors
 *
 * Implementations available:
 * - **Core**: Stub implementation for testing (returns empty SVG)
 * - **Node**: Full implementation using Mermaid.js CLI for Node.js
 * - **Browser**: Full implementation using Mermaid.js library for React/browsers
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import { Mermaid } from "effect-mermaid";
 *
 * // Use the stub for testing
 * const program = Effect.gen(function* () {
 *   const mermaid = yield* Mermaid;
 *   const svg = yield* mermaid.render("graph TD\\n  A-->B", {
 *     theme: "dark"
 *   });
 *   return svg;
 * });
 *
 * await Effect.runPromise(Effect.provide(program, Mermaid.Default));
 * ```
 *
 * @see {@link MermaidApi} for the service interface
 * @see {@link Mermaid.Default} for default/stub implementation
 * @see {@link MermaidConfig} for configuration options
 */
export { Mermaid } from "./services/mermaid/service.js";
/**
 * Interface for the Mermaid diagram rendering service
 *
 * Defines the methods and capabilities of Mermaid service implementations.
 * All implementations follow the same interface regardless of platform (Node.js, browser, etc).
 *
 * Methods:
 * - `render(diagram, config?)`: Render a diagram to SVG
 * - `detectType(diagram)`: Detect the type of a diagram
 *
 * @example
 * ```typescript
 * import { MermaidApi } from "effect-mermaid";
 * import { Effect } from "effect";
 *
 * const mermaidService = yield* MermaidApi;
 * const svg = yield* mermaidService.render(diagram);
 * ```
 *
 * @see {@link Mermaid} for the service and default implementation
 * @see {@link detectDiagramType} for standalone type detection
 */
export type { MermaidApi } from "./services/mermaid/api.js";
/**
 * The Theme Registry service for managing Mermaid themes
 *
 * Service that manages built-in and custom themes, providing theme registration,
 * retrieval, and listing capabilities. Follows a 5-step resolution process:
 *
 * 1. Check if theme name matches a custom registered theme
 * 2. Fall back to built-in theme if not found
 * 3. Return the resolved theme object
 * 4. Handle missing themes gracefully with defaults
 * 5. Support theme variable overrides
 *
 * Implementations available:
 * - **Core**: Manages only built-in themes
 * - **Node**: Full implementation with custom theme support
 * - **React**: Full implementation with custom theme support
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import { ThemeRegistry, Mermaid } from "effect-mermaid";
 *
 * // Register and use custom themes
 * const customThemes = {
 *   myTheme: { primaryColor: "#ff6b6b" }
 * };
 *
 * const program = Effect.gen(function* () {
 *   const registry = yield* ThemeRegistry;
 *   yield* registry.registerTheme("custom", customThemes);
 *   const theme = yield* registry.getTheme("custom");
 *   return theme;
 * });
 *
 * const appLayer = Layer.merge(
 *   ThemeRegistry.Default,
 *   Mermaid.Default
 * );
 * await Effect.runPromise(Effect.provide(program, appLayer));
 * ```
 *
 * @see {@link ThemeRegistryApi} for the service interface
 * @see {@link ThemeRegistry.Default} for default implementation
 * @see {@link Mermaid} for diagram rendering with themes
 */
export { ThemeRegistry } from "./services/themeRegistry/service.js";
/**
 * Interface for the Theme Registry service
 *
 * Defines the theme management operations available through the ThemeRegistry service.
 * Implementations across all packages follow the same interface.
 *
 * Methods:
 * - `registerTheme(name, theme)`: Register a custom theme
 * - `getTheme(name)`: Retrieve a theme by name with built-in fallback
 * - `listThemes()`: List all available themes (custom + built-in)
 *
 * @example
 * ```typescript
 * import { ThemeRegistryApi } from "effect-mermaid";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const registry = yield* ThemeRegistryApi;
 *   const themes = yield* registry.listThemes();
 *   console.log("Available themes:", themes);
 * });
 * ```
 *
 * @see {@link ThemeRegistry} for the service and default implementation
 * @see {@link Mermaid} for rendering with theme support
 */
export type { ThemeRegistryApi } from "./services/themeRegistry/api.js";
//# sourceMappingURL=index.d.ts.map