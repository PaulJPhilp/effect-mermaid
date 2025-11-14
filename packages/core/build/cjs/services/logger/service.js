"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SilentLogger = exports.Logger = void 0;
var _effect = require("effect");
/**
 * Console-based Logger service for development and production
 *
 * Logs all messages to console with timestamps and level prefixes.
 * In production, you can replace with a remote logging service.
 */
class Logger extends /*#__PURE__*/_effect.Effect.Service()("effect-mermaid/Logger", {
  sync: () => ({
    info: message => _effect.Effect.sync(() => {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }),
    warn: message => _effect.Effect.sync(() => {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }),
    error: message => _effect.Effect.sync(() => {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    }),
    debug: _message =>
    // Debug logging is skipped in production environments
    // Can be overridden with custom Logger implementation
    _effect.Effect.void
  })
}) {}
/**
 * Silent logger that discards all messages
 * Useful for testing or silent operation
 */
exports.Logger = Logger;
class SilentLogger extends /*#__PURE__*/_effect.Effect.Service()("effect-mermaid/SilentLogger", {
  sync: () => ({
    info: () => _effect.Effect.void,
    warn: () => _effect.Effect.void,
    error: () => _effect.Effect.void,
    debug: () => _effect.Effect.void
  })
}) {}
exports.SilentLogger = SilentLogger;
//# sourceMappingURL=service.js.map