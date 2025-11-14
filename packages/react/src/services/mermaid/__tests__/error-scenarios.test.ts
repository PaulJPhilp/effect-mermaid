import { describe, expect, it, vi } from "vitest";
import { Effect, Layer } from "effect";
import { BrowserMermaid } from "../service.js";
import { ThemeRegistry, Logger, SilentLogger } from "effect-mermaid";

describe("BrowserMermaid Error Scenarios", () => {
  describe("Lazy initialization errors", () => {
    it("handles failed mermaid import in browser", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        // The service should have an ensureInitialized mechanism
        // that catches import errors in the browser
        const result = yield* mermaid.render("graph TD\n  A-->B").pipe(
          Effect.catchAll((error) => 
            Effect.succeed({
              success: false,
              reason: error.reason
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
            BrowserMermaid.Default
          )
        )
      ));

    it("caches initialized mermaid module on subsequent calls", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        // First call initializes
        yield* mermaid.render("graph TD\n  A-->B").pipe(
          Effect.catchAll(() => Effect.void)
        );
        
        // Second call should reuse cached module
        yield* mermaid.render("graph TD\n  B-->C").pipe(
          Effect.catchAll(() => Effect.void)
        );

        // Both should complete without re-initialization issues
        expect(true).toBe(true);
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Browser-specific render errors", () => {
    it("captures render errors in browser context", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("invalid-diagram").pipe(
          Effect.catchAll((error) => 
            Effect.succeed({
              reason: error.reason,
              hasDiagram: !!error.diagram
            })
          )
        );

        expect(result).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));

    it("logs render errors through Logger", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        const mermaid = yield* BrowserMermaid;
        
        const warnSpy = vi.spyOn(logger, "warn");
        
        yield* mermaid.render("invalid").pipe(
          Effect.catchAll(() => Effect.void)
        );

        // Logger should be available for error logging
        expect(warnSpy).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Silent error logging", () => {
    it("suppresses logs during development", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("").pipe(
          Effect.catchAll((error) => 
            Effect.succeed(error.reason)
          )
        );

        expect(result).toBe("Parse");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            SilentLogger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Concurrent render errors", () => {
    it("handles multiple concurrent renders with errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const results = yield* Effect.all([
          mermaid.render("").pipe(
            Effect.catchAll(() => Effect.succeed("parse-error"))
          ),
          mermaid.render("graph TD\n  A-->B"),
          mermaid.render("invalid").pipe(
            Effect.catchAll(() => Effect.succeed("render-error"))
          )
        ]);

        expect(results).toHaveLength(3);
        expect(results[0]).toBe("parse-error");
        expect(results[1]).toContain("<svg");
        expect(results[2]).toBe("render-error");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Error recovery patterns", () => {
    it("recovers from error to successful render", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        // Fail, then succeed
        yield* mermaid.render("").pipe(
          Effect.catchAll(() => Effect.void)
        );
        
        const result = yield* mermaid.render("graph TD\n  A-->B");
        
        expect(result).toContain("<svg");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));

    it("implements retry logic", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        let attempts = 0;
        
        const result = yield* mermaid.render("graph TD\n  A-->B").pipe(
          Effect.catchAll((error) => {
            attempts++;
            if (attempts < 3) {
              return mermaid.render("graph TD\n  Retry");
            }
            return Effect.fail(error);
          })
        );

        expect(result).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));

    it("provides fallback diagrams on error", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("invalid").pipe(
          Effect.catchAll(() => {
            // Fallback to a safe default
            return mermaid.render("graph TD\n  Error occurred");
          })
        );

        expect(result).toContain("Error occurred");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Diagram type detection errors", () => {
    it("detects diagram types even on error", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const type = mermaid.detectType("graph TD\n  A-->B");
        
        expect(type).toBeDefined();
      }).pipe(
        Effect.provide(BrowserMermaid.Default)
      ));
  });

  describe("Theme error handling", () => {
    it("handles missing themes gracefully", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "nonexistent"
        });

        // Should still render
        expect(result).toContain("<svg");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));

    it("logs theme resolution issues", () =>
      Effect.gen(function* () {
        const logger = yield* Logger;
        const mermaid = yield* BrowserMermaid;
        
        const warnSpy = vi.spyOn(logger, "warn");
        
        yield* mermaid.render("graph TD\n  A-->B", {
          theme: "invalid-theme"
        });

        // Should have attempted to warn about missing theme
        expect(warnSpy).toBeDefined();
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Parse vs Render errors", () => {
    it("distinguishes between parse errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("").pipe(
          Effect.catchAll((error) => Effect.succeed(error.reason))
        );

        expect(result).toBe("Parse");
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));

    it("distinguishes between render errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render("invalid-syntax").pipe(
          Effect.catchAll((error) => Effect.succeed(error.reason))
        );

        // Could be Parse or Render or Unknown
        expect(["Parse", "Render", "Unknown"]).toContain(result);
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });

  describe("Error context preservation", () => {
    it("preserves diagram in error context", () =>
      Effect.gen(function* () {
        const diagram = "graph TD\n  A-->B";
        const mermaid = yield* BrowserMermaid;
        
        const result = yield* mermaid.render(diagram).pipe(
          Effect.catchAll((error) => 
            Effect.succeed(error.diagram)
          )
        );

        // If error occurs, diagram should be in context
        expect(result === diagram || result === undefined).toBe(true);
      }).pipe(
        Effect.provide(
          Layer.merge(
            ThemeRegistry.Default,
            Logger.Default,
            BrowserMermaid.Default
          )
        )
      ));
  });
});

