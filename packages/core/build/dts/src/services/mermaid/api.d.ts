import { Effect } from "effect";
import { DiagramType } from "../../global/types.js";
import { MermaidConfig } from "../../global/schema.js";
import { MermaidError } from "../../global/errors.js";
/**
 * API interface for Mermaid diagram operations
 */
export interface MermaidApi {
    /**
     * Render a Mermaid diagram to SVG/HTML
     * @param diagram The Mermaid diagram source code
     * @param config Optional configuration for rendering
     * @returns Effect that resolves to rendered SVG/HTML string
     */
    render(diagram: string, config?: MermaidConfig): Effect.Effect<string, MermaidError>;
    /**
     * Detect the type of a Mermaid diagram
     * @param diagram The Mermaid diagram source code
     * @returns Effect that resolves to the detected diagram type
     */
    detectType(diagram: string): Effect.Effect<DiagramType, MermaidError>;
}
//# sourceMappingURL=api.d.ts.map