import { MermaidConfig } from "../../global/schema.js";
/**
 * Options for rendering a diagram
 */
export interface RenderOptions {
    /** The Mermaid diagram source code */
    diagram: string;
    /** Optional configuration for rendering */
    config?: MermaidConfig;
}
/**
 * Options for detecting diagram type
 */
export interface DetectTypeOptions {
    /** The Mermaid diagram source code */
    diagram: string;
}
/**
 * Type for dynamic import of Mermaid module
 */
export interface MermaidModule {
    default: {
        initialize: (config?: any) => Promise<void>;
        render: (id: string, code: string) => Promise<string>;
    };
}
//# sourceMappingURL=types.d.ts.map