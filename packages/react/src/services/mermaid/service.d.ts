import { Effect } from "effect";
import { type MermaidConfig } from "effect-mermaid";
declare const BrowserMermaid_base: Effect.Service.Class<BrowserMermaid, "effect-mermaid/BrowserMermaid", {
    readonly effect: Effect.Effect<{
        render: (diagram: string, config?: MermaidConfig) => Effect.Effect<string, import("effect-mermaid").MermaidError, never>;
        detectType: (diagram: string) => Effect.Effect<import("effect-mermaid").DiagramType, import("effect-mermaid").MermaidError, never>;
    }, import("effect-mermaid").MermaidError, import("effect-mermaid").ThemeRegistryApi>;
    readonly dependencies: readonly [import("effect/Layer").Layer<import("effect-mermaid").ThemeRegistryApi, never, never>];
}>;
/**
 * BrowserMermaid service that provides client-side Mermaid diagram rendering
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * Integrates with Mermaid.js via dynamic import for browser environments
 * and applies theme variables from ThemeRegistry for custom styling.
 */
export declare class BrowserMermaid extends BrowserMermaid_base {
}
export {};
//# sourceMappingURL=service.d.ts.map