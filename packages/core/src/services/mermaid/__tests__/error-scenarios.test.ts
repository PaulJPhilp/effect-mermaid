import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Cause } from "effect";
import { makeParseError, makeRenderError, makeUnknownError } from "../errors.js";
import { Mermaid } from "../service.js";
import { ThemeRegistry } from "../../themeRegistry/service.js";

describe("Mermaid Error Scenarios", () => {
  describe("Parse errors", () => {
    it("rejects empty diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* Effect.flip(mermaid.render(""));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
        expect(result.message).toContain("cannot be empty");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("rejects whitespace-only diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* Effect.flip(mermaid.render("   \n\t  "));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("rejects very long diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const veryLongDiagram = "graph TD\n" + "A --> B\n".repeat(10000);
        const result = yield* Effect.flip(mermaid.render(veryLongDiagram));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
      }).pipe(Effect.provide(Mermaid.Default)));

    it("provides actionable error messages", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* Effect.flip(mermaid.render(""));

        expect(result.message).toBeTruthy();
        expect(result.message.length).toBeGreaterThan(0);
        // Error message should be helpful, not just "error"
        expect(result.message.toLowerCase()).not.toBe("error");
      }).pipe(Effect.provide(Mermaid.Default)));
  });

  describe("Render error handling", () => {
    it("captures render errors with diagram context", () =>
      Effect.gen(function* () {
        const error = makeRenderError("Test render failure", "graph TD\n  A-->B");

        expect(error._tag).toBe("MermaidError");
        expect(error.reason).toBe("Render");
        expect(error.message).toContain("Test render failure");
        expect(error.diagram).toBe("graph TD\n  A-->B");
      }));

    it("handles unknown render errors gracefully", () =>
      Effect.gen(function* () {
        const error = makeUnknownError("Unexpected error occurred", undefined);

        expect(error._tag).toBe("MermaidError");
        expect(error.reason).toBe("Unknown");
        expect(error.message).toContain("Unexpected error occurred");
      }));
  });

  describe("Error recovery", () => {
    it("recovers from single error", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        // First call fails
        const errorResult = yield* Effect.flip(mermaid.render(""));
        expect(errorResult._tag).toBe("MermaidError");

        // Second call should succeed
        const successResult = yield* mermaid.render("graph TD\n  A-->B");
        expect(successResult).toContain("<svg");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));

    it("handles catch and recover pattern", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        const result = yield* mermaid.render("").pipe(
          Effect.catchAll((_error) =>
            Effect.gen(function* () {
              // Fall back to a safe default
              return yield* mermaid.render("graph TD\n  A-->B");
            })
          )
        );

        expect(result).toContain("<svg");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));

    it("supports error mapping", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        const userFriendlyError = yield* mermaid.render("").pipe(
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* Effect.logError(
                `Cannot render diagram: ${error.message}`
              );
              return yield* Effect.fail(new Error("Failed to render diagram"));
            })
          ),
          Effect.flip
        );

        expect(userFriendlyError.message).toBe("Failed to render diagram");
      }).pipe(Effect.provide(Mermaid.Default)));
  });

  describe("Theme error handling", () => {
    it("falls back to default theme on missing theme", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "nonexistent-theme"
        });

        // Should still render successfully with default theme
        expect(result).toContain("<svg");
        expect(result).toContain("data-stub");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));
  });

  describe("Concurrent error handling", () => {
    it("handles multiple concurrent errors", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        const results = yield* Effect.all(
          ["", "graph TD\n  A-->B", "   \n"].map((diagram) =>
            mermaid.render(diagram).pipe(
              Effect.catchAll(() => Effect.succeed("error-handled"))
            )
          )
        );

        expect(results).toHaveLength(3);
        expect(results[0]).toBe("error-handled");
        expect(results[1]).toContain("<svg");
        expect(results[2]).toBe("error-handled");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));

    it("preserves error details in concurrent scenarios", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        const result = yield* Effect.all(
          ["", "graph TD\n  A-->B"].map((diagram, i) =>
            mermaid.render(diagram).pipe(
              Effect.catchAll((error) =>
                Effect.succeed({
                  index: i,
                  reason: error.reason,
                  message: error.message
                })
              )
            )
          )
        );

        expect(result[0].reason).toBe("Parse");
        expect(result[1]).toContain("<svg");
      }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default))));
  });

  describe("Cause inspection", () => {
    it("provides inspectable causes for debugging", () =>
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;

        const cause = yield* mermaid.render("").pipe(
          Effect.catchAllCause((c) => Effect.succeed(c))
        );

        expect(cause).toBeTruthy();
        // The cause should be inspectable
        const prettyStr = Cause.pretty(cause);
        expect(typeof prettyStr).toBe("string");
      }).pipe(Effect.provide(Mermaid.Default)));
  });

  describe("Error types", () => {
    it("distinguishes between error reasons", () =>
      Effect.gen(function* () {
        const parseErr = makeParseError("Parse failed");
        const renderErr = makeRenderError("Render failed", "diagram");
        const unknownErr = makeUnknownError("Unknown", undefined);

        expect(parseErr.reason).toBe("Parse");
        expect(renderErr.reason).toBe("Render");
        expect(unknownErr.reason).toBe("Unknown");

        // All should have consistent structure
        expect(parseErr._tag).toBe("MermaidError");
        expect(renderErr._tag).toBe("MermaidError");
        expect(unknownErr._tag).toBe("MermaidError");
      }).pipe(Effect.runPromise));

    it("includes optional context in errors", () =>
      Effect.gen(function* () {
        const err = makeRenderError("Render failed", "graph TD\n  A-->B");

        expect(err.diagram).toBe("graph TD\n  A-->B");
        
        const errNoContext = makeRenderError("Render failed", undefined);
        expect(errNoContext.diagram).toBeUndefined();
      }).pipe(Effect.runPromise));
  });
});

