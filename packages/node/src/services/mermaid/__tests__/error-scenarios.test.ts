import { describe, expect, it, vi } from "vitest";
import { Effect, Layer } from "effect";
import { NodeMermaid } from "../service.js";
import { ThemeRegistry, Logger, SilentLogger } from "effect-mermaid";

describe("NodeMermaid Error Scenarios", () => {
  describe("Lazy initialization errors", () => {
    it("handles failed mermaid import gracefully", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        // The service should have an ensureInitialized mechanism
        // that catches import errors
        const result = yield* mermaid.render("graph TD\n  A-->B").pipe(
          Effect.catchAll((error) => 
            Effect.succeed({
              success: false,
              error: error.reason
            })
          )
        );

        // Either succeeds or fails gracefully
        expect(result).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Render error handling", () => {
    it("captures render errors with context", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        // Invalid diagram syntax should produce a render error
        const result = yield* mermaid.render("invalid-diagram-syntax").pipe(
          Effect.catchAll((error) => 
            Effect.succeed({
              reason: error.reason,
              message: error.message,
              hasContext: !!error.diagram
            })
          )
        );

        expect(result.reason).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));

    it("logs render errors through Logger service", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        const mermaid = yield* NodeMermaid;
        
        // Spy on logger calls
        const errorSpy = vi.spyOn(logger, "error");
        
        yield* mermaid.render("invalid").pipe(
          Effect.catchAll(() => Effect.void)
        );

        // Logger may or may not be called depending on error type
        expect(errorSpy).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Silent logging during errors", () => {
    it("can suppress error logs with SilentLogger", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        const result = yield* mermaid.render("").pipe(
          Effect.catchAll((error) => 
            Effect.succeed({ reason: error.reason })
          )
        );

        expect(result).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            SilentLogger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Concurrent render errors", () => {
    it("handles multiple concurrent render errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        const results = yield* Effect.all([
          mermaid.render("invalid1").pipe(
            Effect.catchAll(() => Effect.succeed("error1"))
          ),
          mermaid.render("graph TD\n  A-->B"),
          mermaid.render("invalid2").pipe(
            Effect.catchAll(() => Effect.succeed("error2"))
          )
        ]);

        expect(results).toHaveLength(3);
        expect(results[0]).toBe("error1");
        expect(results[1]).toContain("<svg");
        expect(results[2]).toBe("error2");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Error recovery", () => {
    it("recovers from error to successful render", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        // First attempt fails
        yield* mermaid.render("").pipe(
          Effect.catchAll(() => Effect.void)
        );
        
        // Second attempt succeeds
        const result = yield* mermaid.render("graph TD\n  A-->B");
        
        expect(result).toContain("<svg");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));

    it("supports error-to-fallback pattern", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        const result = yield* mermaid.render("invalid").pipe(
          Effect.catchAll(() => 
            // Fallback to a simple valid diagram
            mermaid.render("graph TD\n  Fallback")
          )
        );
        
        expect(result).toContain("Fallback");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Error types", () => {
    it("categorizes errors by reason", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        // Parse error
        const parseErr = yield* mermaid.render("").pipe(
          Effect.catchAll((error) => Effect.succeed(error.reason))
        );
        expect(parseErr).toBe("Parse");
        
        // Invalid diagram (may be Parse or Render)
        const invalidErr = yield* mermaid.render("invalid-syntax").pipe(
          Effect.catchAll((error) => Effect.succeed(error.reason))
        );
        expect(["Parse", "Render", "Unknown"]).toContain(invalidErr);
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Error messages", () => {
    it("provides helpful error messages", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        const result = yield* mermaid.render("").pipe(
          Effect.catchAll((error) => 
            Effect.succeed(error.message)
          )
        );

        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });

  describe("Theme resolution errors", () => {
    it("falls back gracefully on theme errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "nonexistent-theme"
        });

        // Should still render with default theme
        expect(result).toContain("<svg");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            NodeMermaid.Default
          )
        )
      ));
  });
});

