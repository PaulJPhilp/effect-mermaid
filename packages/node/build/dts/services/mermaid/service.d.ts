import { Effect } from "effect";
import { MermaidConfig, Logger } from "effect-mermaid";
declare const NodeMermaid_base: Effect.Service.Class<NodeMermaid, "effect-mermaid/NodeMermaid", {
    readonly scoped: Effect.Effect<{
        render: (diagram: string, config?: MermaidConfig) => Effect.Effect<any, import("effect-mermaid").MermaidError, never>;
        detectType: (diagram: string) => Effect.Effect<import("effect-mermaid").DiagramType, import("effect-mermaid").MermaidError, never>;
    }, never, Logger | import("effect-mermaid").ThemeRegistryApi>;
}>;
/**
 * NodeMermaid service that provides real Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import and applies theme
 * variables from ThemeRegistry for custom styling.
 */
export declare class NodeMermaid extends NodeMermaid_base {
}
export {};
//# sourceMappingURL=service.d.ts.map