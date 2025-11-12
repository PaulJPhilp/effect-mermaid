import { Effect } from "effect";
import { validateDiagram } from "./helpers.js";
import { makeParseError } from "./errors.js";
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
export const detectDiagramType = (diagram) => {
    return Effect.gen(function* () {
        // Validate the diagram
        const validationError = validateDiagram(diagram);
        if (validationError) {
            return yield* Effect.fail(makeParseError(validationError, diagram));
        }
        // Extract the first line and determine diagram type
        const firstLine = diagram.trim().split("\n")[0].trim();
        let diagramType;
        if (firstLine.startsWith("graph ") || firstLine.startsWith("flowchart ")) {
            diagramType = "flowchart";
        }
        else if (firstLine.startsWith("sequenceDiagram")) {
            diagramType = "sequence";
        }
        else if (firstLine.startsWith("classDiagram")) {
            diagramType = "class";
        }
        else if (firstLine.startsWith("stateDiagram")) {
            diagramType = "state";
        }
        else if (firstLine.startsWith("gantt")) {
            diagramType = "gantt";
        }
        else {
            diagramType = "unknown";
        }
        return diagramType;
    });
};
//# sourceMappingURL=detectType.js.map