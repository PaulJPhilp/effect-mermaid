import { Effect } from "effect";
import type { MermaidConfig } from "../../global/schema.js";
import { Logger } from "../logger/service.js";
import type { MermaidApi } from "./api.js";
declare const Mermaid_base: Effect.Service.Class<Mermaid, "effect-mermaid/Mermaid", {
    readonly scoped: Effect.Effect<{
        render: (diagram: string, config?: MermaidConfig) => Effect.Effect<string, import("../../index.js").MermaidError, never>;
        detectType: (diagram: string) => Effect.Effect<import("../../index.js").DiagramType, import("../../index.js").MermaidError, never>;
    }, never, Logger | import("../themeRegistry/api.js").ThemeRegistryApi>;
}>;
/**
 * Mermaid service implementation using Effect.Service pattern
 *
 * Dependencies:
 * - ThemeRegistry: For resolving custom themes during rendering
 *
 * This is a stub implementation used for testing. Real implementations
 * (NodeMermaid, BrowserMermaid) override this in their respective packages.
 */
export declare class Mermaid extends Mermaid_base {
}
/**
 * Test implementation of Mermaid service that returns stub data
 * (kept for backward compatibility)
 */
export declare const TestMermaid: MermaidApi;
export {};
//# sourceMappingURL=service.d.ts.map