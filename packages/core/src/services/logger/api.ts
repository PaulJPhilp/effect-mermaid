import { Effect } from "effect";

/**
 * Logger service interface for structured logging
 *
 * All logging operations return Effect to maintain purity and enable testing.
 * Implementations can provide different outputs (console, file, remote, etc).
 */
export interface LoggerApi {
  /**
   * Log an informational message
   */
  info(message: string): Effect.Effect<void>;

  /**
   * Log a warning message
   */
  warn(message: string): Effect.Effect<void>;

  /**
   * Log an error message
   */
  error(message: string): Effect.Effect<void>;

  /**
   * Log a debug message (may be filtered in production)
   */
  debug(message: string): Effect.Effect<void>;
}

