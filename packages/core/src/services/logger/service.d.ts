import { Effect } from "effect";
declare const Logger_base: Effect.Service.Class<Logger, "effect-mermaid/Logger", {
    readonly sync: () => {
        info: (message: string) => Effect.Effect<void, never, never>;
        warn: (message: string) => Effect.Effect<void, never, never>;
        error: (message: string) => Effect.Effect<void, never, never>;
        debug: (_message: string) => Effect.Effect<void, never, never>;
    };
}>;
/**
 * Console-based Logger service for development and production
 *
 * Logs all messages to console with timestamps and level prefixes.
 * In production, you can replace with a remote logging service.
 */
export declare class Logger extends Logger_base {
}
declare const SilentLogger_base: Effect.Service.Class<SilentLogger, "effect-mermaid/SilentLogger", {
    readonly sync: () => {
        info: () => Effect.Effect<void, never, never>;
        warn: () => Effect.Effect<void, never, never>;
        error: () => Effect.Effect<void, never, never>;
        debug: () => Effect.Effect<void, never, never>;
    };
}>;
/**
 * Silent logger that discards all messages
 * Useful for testing or silent operation
 */
export declare class SilentLogger extends SilentLogger_base {
}
export {};
//# sourceMappingURL=service.d.ts.map