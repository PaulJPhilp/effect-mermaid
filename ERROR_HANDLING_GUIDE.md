# Error Handling Guide

Comprehensive guide to error handling in effect-mermaid using Effect.js patterns.

---

## Table of Contents

1. [Error Types](#error-types)
2. [Creating Errors](#creating-errors)
3. [Handling Errors](#handling-errors)
4. [Common Scenarios](#common-scenarios)
5. [Best Practices](#best-practices)
6. [Error Recovery](#error-recovery)

---

## Error Types

### Core Error Types

effect-mermaid uses three main error categories:

#### 1. MermaidError

Base error type for diagram operations.

```typescript
export class MermaidError extends Data.TaggedError("MermaidError")<{
  readonly reason: "Parse" | "Render" | "Unknown";
  readonly message: string;
  readonly diagram?: string;
}> {}
```

**Reasons**:
- `Parse`: Error during diagram syntax validation
- `Render`: Error during SVG generation
- `Unknown`: Unexpected error with undetermined cause

### Custom Error Types

Create custom errors for domain-specific scenarios:

```typescript
export class ThemeNotFoundError extends Data.TaggedError("ThemeNotFoundError")<{
  readonly themeName: string;
  readonly availableThemes: string[];
}> {}

export class InvalidConfigurationError extends Data.TaggedError(
  "InvalidConfigurationError"
)<{
  readonly reason: string;
  readonly config: Record<string, unknown>;
}> {}
```

---

## Creating Errors

### Using Error Factories

```typescript
import { makeParseError, makeRenderError, makeUnknownError } from "@effect-mermaid";

// Parse error
const parseErr = makeParseError("Expected 'graph' keyword at start", "invalid source");

// Render error
const renderErr = makeRenderError(
  "SVG generation failed: timeout",
  "graph TD\n  A-->B"
);

// Unknown error
const unknownErr = makeUnknownError("Unexpected exception", undefined);
```

### Creating Custom Errors

```typescript
// Factory function for consistency
export const makeThemeNotFound = (
  themeName: string,
  available: string[]
): ThemeNotFoundError =>
  new ThemeNotFoundError({
    themeName,
    availableThemes: available,
  });

// Usage
const error = makeThemeNotFound("neon", ["default", "dark", "forest"]);
```

---

## Handling Errors

### Basic Error Catching

#### Single Error Type

```typescript
const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;

  const svg = yield* mermaid.render("invalid").pipe(
    Effect.catch((error) =>
      Effect.gen(function* () {
        console.error(`Failed: ${error.message}`);
        return yield* Effect.fail(error);
      })
    )
  );
});
```

#### Multiple Error Types (Recommended)

```typescript
const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;

  const svg = yield* mermaid.render("diagram").pipe(
    Effect.catchTags({
      MermaidError: (error) =>
        Effect.gen(function* () {
          const logger = yield* Logger;

          switch (error.reason) {
            case "Parse":
              yield* logger.warn(`Invalid syntax: ${error.message}`);
              break;
            case "Render":
              yield* logger.error(`Render failed: ${error.message}`);
              break;
            case "Unknown":
              yield* logger.error(`Unknown error: ${error.message}`);
          }

          return yield* Effect.fail(error);
        }),
    })
  );
});
```

### Handling All Errors

```typescript
const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;

  const svg = yield* mermaid.render("diagram").pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* logger.error(`Operation failed: ${error}`);
        // Return safe default
        return "<!-- Error rendering diagram -->";
      })
    )
  );
});
```

### Error Inspection with Cause

```typescript
import { Cause } from "effect";

const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;

  const svg = yield* mermaid.render("diagram").pipe(
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        // Inspect the cause for debugging
        const prettyString = Cause.pretty(cause);
        yield* logger.error(`Full error: ${prettyString}`);

        // Check error type
        if (Cause.isDie(cause)) {
          yield* logger.error("Unexpected exception");
        } else if (Cause.isFailure(cause)) {
          yield* logger.error("Expected failure");
        }

        return yield* Effect.fail(cause);
      })
    )
  );
});
```

---

## Common Scenarios

### Scenario 1: Empty Diagram

**Problem**: User submits empty diagram

```typescript
yield* mermaid.render("").pipe(
  Effect.catchTag("MermaidError", (error) => {
    if (error.reason === "Parse" && error.message.includes("empty")) {
      // Handle empty diagram
      return Effect.gen(function* () {
        yield* ui.showErrorMessage("Please enter a diagram. Start with 'graph TD' or 'sequenceDiagram'");
        return yield* Effect.fail(error);
      });
    }
    return Effect.fail(error);
  })
);
```

### Scenario 2: Invalid Syntax

**Problem**: Diagram syntax is incorrect

```typescript
yield* mermaid.render(userInput).pipe(
  Effect.catchTag("MermaidError", (error) => {
    if (error.reason === "Parse") {
      return Effect.gen(function* () {
        yield* ui.highlightSyntaxErrors(error.message);
        yield* logger.warn(`Syntax error: ${error.message}`);
        return yield* Effect.fail(error);
      });
    }
    return Effect.fail(error);
  })
);
```

### Scenario 3: Theme Not Found

**Problem**: Theme doesn't exist

```typescript
yield* mermaid.render(diagram, { theme: "custom-theme" }).pipe(
  Effect.catchTag("MermaidError", (error) => {
    if (error.reason === "Render" && error.message.includes("theme")) {
      return Effect.gen(function* () {
        yield* logger.warn("Theme not found, using default");
        // Fall back to default theme
        return yield* mermaid.render(diagram, { theme: "default" });
      });
    }
    return Effect.fail(error);
  })
);
```

### Scenario 4: Large Diagram Timeout

**Problem**: Diagram too complex to render in time

```typescript
yield* mermaid.render(complexDiagram).pipe(
  Effect.timeout(Duration.seconds(5)),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* logger.error("Rendering timeout - diagram too complex");
      yield* ui.showErrorMessage(
        "Diagram is too complex to render. Try breaking it into smaller diagrams."
      );
      return yield* Effect.fail(error);
    })
  )
);
```

### Scenario 5: Concurrent Errors

**Problem**: Multiple diagrams fail

```typescript
const renderMultiple = (diagrams: string[]) =>
  Effect.all(
    diagrams.map((diagram) =>
      mermaid.render(diagram).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* logger.warn(`Failed to render: ${error.message}`);
            // Return null on error instead of failing completely
            return null;
          })
        )
      )
    )
  );

// Results: (string | null)[] - some succeeded, some failed
```

---

## Best Practices

### 1. Always Provide Context

✅ **Good**: Error includes relevant context
```typescript
const error = makeRenderError(
  "Failed to render diagram",
  "graph TD\n  A-->B" // Include the diagram source
);
```

❌ **Bad**: No context
```typescript
const error = makeRenderError("Failed to render");
```

### 2. Use Specific Error Types

✅ **Good**: Distinguishes error types
```typescript
Effect.catchTags({
  ParseError: handleParseError,
  RenderError: handleRenderError,
  ConfigError: handleConfigError,
})
```

❌ **Bad**: Catches all errors the same way
```typescript
Effect.catchAll(handleAnyError)
```

### 3. Log Before Failing

✅ **Good**: Log provides visibility
```typescript
Effect.gen(function* () {
  yield* logger.error(`Parse failed: ${error.message}`);
  return yield* Effect.fail(error);
})
```

❌ **Bad**: Fail silently
```typescript
Effect.fail(error)
```

### 4. Provide User-Friendly Messages

✅ **Good**: Clear, actionable message
```typescript
yield* ui.showErrorMessage(
  "Diagram syntax is invalid. Expected 'graph TD' or 'sequenceDiagram' at start"
);
```

❌ **Bad**: Technical message
```typescript
yield* ui.showErrorMessage("Parse error: unexpected token");
```

### 5. Implement Recovery When Possible

✅ **Good**: Attempts recovery
```typescript
Effect.catchTag("MermaidError", (error) => {
  if (error.reason === "Render") {
    return mermaid.render(diagram, { theme: "default" }); // Retry with defaults
  }
  return Effect.fail(error);
})
```

❌ **Bad**: Always fails
```typescript
Effect.catchTag("MermaidError", () => Effect.fail(error))
```

---

## Error Recovery

### Retry Pattern

```typescript
import { Schedule } from "effect";

const renderWithRetry = (diagram: string) =>
  mermaid.render(diagram).pipe(
    Effect.retry(
      Schedule.exponential(Duration.millis(100)).pipe(
        Schedule.compose(Schedule.recurs(3)) // Max 3 retries
      )
    ),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* logger.error(`Failed after retries: ${error.message}`);
        return yield* Effect.fail(error);
      })
    )
  );
```

### Fallback Pattern

```typescript
const renderWithFallback = (diagram: string) =>
  mermaid.render(diagram).pipe(
    Effect.orElse(() =>
      Effect.gen(function* () {
        yield* logger.warn("Primary render failed, using fallback");
        return "<svg><!-- Fallback placeholder --></svg>";
      })
    )
  );
```

### Graceful Degradation

```typescript
const renderSafely = (diagram: string) =>
  mermaid.render(diagram).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* logger.warn(`Cannot render: ${error.message}`);

        // Provide degraded experience
        const fallbackSvg = generateTextRepresentation(diagram);
        return fallbackSvg;
      })
    )
  );
```

### Circuit Breaker Pattern

```typescript
let renderFailures = 0;
const MAX_FAILURES = 5;

const renderWithCircuitBreaker = (diagram: string) =>
  Effect.gen(function* () {
    if (renderFailures >= MAX_FAILURES) {
      return yield* Effect.fail(
        new Error("Rendering service temporarily unavailable")
      );
    }

    return yield* mermaid.render(diagram).pipe(
      Effect.catchAll((error) => {
        renderFailures++;
        return Effect.fail(error);
      })
    );
  });
```

---

## Testing Error Handling

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";
import { Effect } from "effect";

describe("Error Handling", () => {
  it("handles parse errors", () =>
    Effect.gen(function* () {
      const mermaid = yield* Mermaid;

      const result = yield* Effect.flip(mermaid.render("invalid"));

      expect(result._tag).toBe("MermaidError");
      expect(result.reason).toBe("Parse");
      expect(result.message).toBeTruthy();
    }).pipe(Effect.provide(Mermaid.Default)));

  it("provides context in errors", () =>
    Effect.gen(function* () {
      const error = makeRenderError("Test error", "graph TD\n  A-->B");

      expect(error.diagram).toBe("graph TD\n  A-->B");
      expect(error.reason).toBe("Render");
    }).pipe(Effect.runSync));

  it("recovers from errors", () =>
    Effect.gen(function* () {
      const mermaid = yield* Mermaid;

      const result = yield* mermaid.render("invalid").pipe(
        Effect.catchAll(() => mermaid.render("graph TD\n  A-->B"))
      );

      expect(result).toContain("<svg");
    }).pipe(Effect.provide(Mermaid.Default)));
});
```

---

## Error Handling Checklist

When implementing error handling, verify:

- ✅ All errors are typed (MermaidError, custom errors)
- ✅ Errors include relevant context (diagram source, etc.)
- ✅ Errors are logged with appropriate level
- ✅ User-friendly messages are shown to users
- ✅ Error recovery is attempted when possible
- ✅ Errors are tested in unit tests
- ✅ Error scenarios in integration tests
- ✅ Fallback behavior is implemented
- ✅ Error tracking is integrated (telemetry)

---

## Common Error Messages

### Parse Errors

| Message | Solution |
|---------|----------|
| "Diagram cannot be empty" | Ensure input is not empty/whitespace |
| "No diagram type detected" | Start with valid type (graph, sequence, etc.) |
| "Unexpected token at..." | Check syntax near specified location |

### Render Errors

| Message | Solution |
|---------|----------|
| "Failed to initialize Mermaid" | Check if mermaid.js loaded correctly |
| "SVG generation failed" | Diagram may be too complex or malformed |
| "Theme not found" | Use default theme or register custom theme |

### Unknown Errors

| Message | Solution |
|---------|----------|
| "Unexpected exception" | Check browser console for details |
| "Operation timeout" | Diagram too complex - split into smaller diagrams |
| "Module load failed" | Check network connectivity |

---

## Resources

- [Effect.js Error Handling](https://effect.website/docs/guides/error-handling)
- [Effect.js Cause Documentation](https://effect.website/docs/api/core/Effect/catch)
- [Error Handling Best Practices](https://effect.website/docs/guides/error-handling-best-practices)

---

**Generated**: Friday, November 14, 2025  
**For Version**: 1.0.0+  
**Status**: ✅ Complete and Ready

