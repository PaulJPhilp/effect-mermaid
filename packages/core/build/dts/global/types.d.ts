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
export declare const CSS_COLOR_NAMES: readonly ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];
export type CssColorName = (typeof CSS_COLOR_NAMES)[number];
/**
 * A color value that can be represented as a CSS string, numeric value, or typed color object
 *
 * @example
 * const color: ThemeColorValue = "#ff0000";
 * const rgbColor: ThemeColorValue = "rgb(255, 0, 0)";
 * const typed: ThemeColorValue = { kind: "rgb", red: 12, green: 34, blue: 56, alpha: 0.5 };
 */
export interface ThemeHexColor {
    readonly kind: "hex";
    readonly value: string;
}
export interface ThemeNamedColor {
    readonly kind: "named";
    readonly name: CssColorName;
}
export interface ThemeRgbColor {
    readonly kind: "rgb";
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha?: number | undefined;
}
export interface ThemeHslColor {
    readonly kind: "hsl";
    readonly hue: number;
    readonly saturation: number;
    readonly lightness: number;
    readonly alpha?: number | undefined;
}
export type ThemeColorValue = string | number | ThemeHexColor | ThemeNamedColor | ThemeRgbColor | ThemeHslColor;
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