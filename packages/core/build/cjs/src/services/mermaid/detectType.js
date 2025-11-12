"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectDiagramType = void 0;
var _effect = require("effect");
var _helpers = require("./helpers.js");
var _errors = require("./errors.js");
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
const detectDiagramType = diagram => {
  return _effect.Effect.gen(function* () {
    // Validate the diagram
    const validationError = (0, _helpers.validateDiagram)(diagram);
    if (validationError) {
      return yield* _effect.Effect.fail((0, _errors.makeParseError)(validationError, diagram));
    }
    // Extract the first line and determine diagram type
    const firstLine = diagram.trim().split("\n")[0].trim();
    let diagramType;
    if (firstLine.startsWith("graph ") || firstLine.startsWith("flowchart ")) {
      diagramType = "flowchart";
    } else if (firstLine.startsWith("sequenceDiagram")) {
      diagramType = "sequence";
    } else if (firstLine.startsWith("classDiagram")) {
      diagramType = "class";
    } else if (firstLine.startsWith("stateDiagram")) {
      diagramType = "state";
    } else if (firstLine.startsWith("gantt")) {
      diagramType = "gantt";
    } else {
      diagramType = "unknown";
    }
    return diagramType;
  });
};
exports.detectDiagramType = detectDiagramType;
//# sourceMappingURL=detectType.js.map