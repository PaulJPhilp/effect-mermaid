/**
 * Supported diagram types in Mermaid
 *
 * - `flowchart`: Flowchart and graph diagrams (graph TD, graph LR, flowchart, etc.)
 * - `sequence`: Sequence diagrams for showing interactions between actors
 * - `class`: Class diagrams for object-oriented design
 * - `state`: State diagrams for finite state machines
 * - `gantt`: Gantt charts for project timelines
 * - `unknown`: Type could not be determined from diagram source
 *
 * @example
 * const type: DiagramType = "flowchart";
 */
export type DiagramType = "flowchart" | "sequence" | "class" | "state" | "gantt" | "unknown";
/**
 * A color value that can be represented as a hex string or CSS value
 *
 * @example
 * const color: ThemeColorValue = "#ff0000";
 * const rgbColor: ThemeColorValue = "rgb(255, 0, 0)";
 */
export type ThemeColorValue = string | number;
/**
 * A mapping of theme property names to color values
 * Used for defining custom theme colors
 *
 * @example
 * const colors: ThemeColorMap = {
 *   primaryColor: "#003366",
 *   primaryTextColor: "#ffffff",
 *   lineColor: "#1a4d7a"
 * };
 */
export type ThemeColorMap = Record<string, ThemeColorValue>;
/**
 * Represents a complete theme definition with color configuration
 *
 * @see {@link ThemeConfig} for the configuration object passed to Mermaid.js
 */
export type { DiagramTheme } from "../services/themeRegistry/types.js";
//# sourceMappingURL=types.d.ts.map