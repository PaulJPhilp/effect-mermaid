import { describe, expect, it } from "@effect/vitest";
import { beforeEach, afterEach, vi } from "vitest";
import { Effect } from "effect";
import { Logger, SilentLogger } from "../service.js";

describe("Logger Service", () => {
  let consoleSpy: {
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {})
    };
  });

  afterEach(() => {
    consoleSpy.info.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("Logger.info", () => {
    it("logs info messages to console", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.info("Test info message");

        expect(consoleSpy.info).toHaveBeenCalledOnce();
        const call = consoleSpy.info.mock.calls[0]?.[0] as string;
        expect(call).toContain("[INFO]");
        expect(call).toContain("Test info message");
      }).pipe(Effect.provide(Logger.Default)));

    it("includes ISO timestamp", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.info("Message");

        const call = consoleSpy.info.mock.calls[0]?.[0] as string;
        // Check if it contains a valid ISO timestamp pattern
        expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }).pipe(Effect.provide(Logger.Default)));
  });

  describe("Logger.warn", () => {
    it("logs warning messages to console", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.warn("Test warning message");

        expect(consoleSpy.warn).toHaveBeenCalledOnce();
        const call = consoleSpy.warn.mock.calls[0]?.[0] as string;
        expect(call).toContain("[WARN]");
        expect(call).toContain("Test warning message");
      }).pipe(Effect.provide(Logger.Default)));
  });

  describe("Logger.error", () => {
    it("logs error messages to console", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.error("Test error message");

        expect(consoleSpy.error).toHaveBeenCalledOnce();
        const call = consoleSpy.error.mock.calls[0]?.[0] as string;
        expect(call).toContain("[ERROR]");
        expect(call).toContain("Test error message");
      }).pipe(Effect.provide(Logger.Default)));
  });

  describe("Logger.debug", () => {
    it("skips debug messages by default", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.debug("Debug message");

        // Debug should not log in the default implementation
        expect(consoleSpy.info).not.toHaveBeenCalled();
        expect(consoleSpy.warn).not.toHaveBeenCalled();
        expect(consoleSpy.error).not.toHaveBeenCalled();
      }).pipe(Effect.provide(Logger.Default)));
  });

  describe("SilentLogger", () => {
    it("does not log any messages", () =>
      Effect.gen(function* () {
        const logger = yield* SilentLogger;
        yield* logger.info("Should not log");
        yield* logger.warn("Should not log");
        yield* logger.error("Should not log");
        yield* logger.debug("Should not log");

        expect(consoleSpy.info).not.toHaveBeenCalled();
        expect(consoleSpy.warn).not.toHaveBeenCalled();
        expect(consoleSpy.error).not.toHaveBeenCalled();
      }).pipe(Effect.provide(SilentLogger.Default)));

    it("is useful for testing", () =>
      Effect.gen(function* () {
        const logger = yield* SilentLogger;
        // Should complete without any side effects
        yield* logger.info("Silent operation");
        yield* logger.error("Silent error");
        return "completed";
      }).pipe(Effect.provide(SilentLogger.Default)));
  });

  describe("Multiple log calls", () => {
    it("handles sequential logging", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        yield* logger.info("First");
        yield* logger.warn("Second");
        yield* logger.error("Third");

        expect(consoleSpy.info).toHaveBeenCalledTimes(1);
        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      }).pipe(Effect.provide(Logger.Default)));
  });
});
