import { Effect } from "effect";
/**
 * Console-based Logger service for development and production
 *
 * Logs all messages to console with timestamps and level prefixes.
 * In production, you can replace with a remote logging service.
 */
export class Logger extends Effect.Service()("effect-mermaid/Logger", {
    sync: () => ({
        info: (message) => Effect.sync(() => {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
        }),
        warn: (message) => Effect.sync(() => {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
        }),
        error: (message) => Effect.sync(() => {
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        }),
        debug: (_message) => 
        // Debug logging is skipped in production environments
        // Can be overridden with custom Logger implementation
        Effect.void,
    }),
}) {
}
/**
 * Silent logger that discards all messages
 * Useful for testing or silent operation
 */
export class SilentLogger extends Effect.Service()("effect-mermaid/SilentLogger", {
    sync: () => ({
        info: () => Effect.void,
        warn: () => Effect.void,
        error: () => Effect.void,
        debug: () => Effect.void,
    }),
}) {
}
//# sourceMappingURL=service.js.map