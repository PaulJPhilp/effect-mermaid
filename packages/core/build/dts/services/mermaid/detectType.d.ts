import { Effect } from "effect";
import { DiagramType } from "../../global/types.js";
import { MermaidError } from "../../global/errors.js";
/**
 * Detects the type of a Mermaid diagram from its source code
 *
 * Parses the diagram source to identify its type by examining the first line.
 * This is useful for determining which diagram-specific configuration to apply
 * or for routing diagrams to specialized renderers.
 *
 * Detection logic:
 * - `flowchart`: Diagrams starting with "graph " or "flowchart "
 * - `sequence`: Diagrams starting with "sequenceDiagram"
 * - `class`: Diagrams starting with "classDiagram"
 * - `state`: Diagrams starting with "stateDiagram"
 * - `gantt`: Diagrams starting with "gantt"
 * - `unknown`: Type could not be determined
 *
 * @param diagram - The Mermaid diagram source code to analyze
 * @returns Effect that resolves to the detected diagram type,
 *          or fails with MermaidError if diagram is invalid
 *
 * @example
 * const type = yield* detectDiagramType("graph TD\\n  A-->B");
 * console.log(type); // "flowchart"
 *
 * @throws MermaidError with reason "Parse" if diagram is empty or invalid
 *
 * @see {@link DiagramType} for all supported diagram types
 */
export declare const detectDiagramType: (diagram: string) => Effect.Effect<DiagramType, MermaidError, never>;
//# sourceMappingURL=detectType.d.ts.map