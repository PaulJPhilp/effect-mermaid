# Testing Improvements Guide

## Overview

This guide outlines comprehensive tests needed for error scenarios, accessibility compliance, and integration testing across all packages.

## Phase 1: Error Scenario Tests (High Priority)

### 1.1 Core Service Error Tests

**File**: `packages/core/src/services/mermaid/__tests__/error-scenarios.test.ts`

```typescript
import { test, expect, describe } from "vitest";
import { Effect } from "effect";
import { Mermaid, MermaidError, Logger, SilentLogger } from "effect-mermaid";

describe("Mermaid Error Scenarios", () => {
  // Empty diagram
  test("handles empty diagram", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const svg = yield* mermaid.render("").pipe(
          Effect.either
        );
        return svg;
      }).pipe(
        Effect.provide(Mermaid.Default),
        Effect.scoped
      )
    );

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      const error = result.left as MermaidError;
      expect(error.reason).toBe("Parse");
      expect(error.message).toContain("empty");
    }
  });

  // Invalid syntax
  test("handles invalid diagram syntax", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const svg = yield* mermaid.render("this is not valid mermaid").pipe(
          Effect.either
        );
        return svg;
      }).pipe(
        Effect.provide(Mermaid.Default),
        Effect.scoped
      )
    );

    expect(result._tag).toBe("Left");
  });

  // Theme not found
  test("handles missing theme gracefully", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* Mermaid;
        const svg = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "nonexistent-theme"
        }).pipe(
          Effect.either
        );
        return svg;
      }).pipe(
        Effect.provide(Mermaid.Default),
        Effect.scoped
      )
    );

    // Should succeed with fallback theme
    expect(result._tag).toBe("Right");
  });
});
```

### 1.2 Node Renderer Error Tests

**File**: `packages/node/src/services/mermaid/__tests__/error-scenarios.test.ts`

```typescript
import { test, expect, describe } from "vitest";
import { Effect } from "effect";
import { NodeMermaid, MermaidError, Logger, SilentLogger } from "effect-mermaid-node";

describe("NodeMermaid Error Scenarios", () => {
  // Diagram syntax errors
  test.each([
    { diagram: "", reason: "empty diagram" },
    { diagram: "graph\n  invalid", reason: "invalid syntax" },
    { diagram: "graph TD\n  A[[\n", reason: "unclosed bracket" },
  ])("handles $reason", async ({ diagram }) => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        return yield* mermaid.render(diagram).pipe(Effect.either);
      }).pipe(
        Effect.provide(NodeMermaid.Default),
        Effect.scoped
      )
    );

    expect(result._tag).toBe("Left");
  });

  // Config errors
  test("handles invalid MermaidConfig", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        return yield* mermaid.render("graph TD\n  A-->B", {
          theme: "invalid",
          securityLevel: "invalid" as any, // Invalid value
        }).pipe(Effect.either);
      }).pipe(
        Effect.provide(NodeMermaid.Default),
        Effect.scoped
      )
    );

    expect(result._tag).toBe("Left");
  });

  // All diagram types
  test.each([
    "graph TD\n  A-->B",
    "sequenceDiagram\n  participant A",
    "classDiagram\n  class A",
    "stateDiagram-v2\n  [*] --> A",
    "gantt\n  title Project",
  ])("renders different diagram types", async (diagram) => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        return yield* mermaid.render(diagram).pipe(Effect.either);
      }).pipe(
        Effect.provide(NodeMermaid.Default),
        Effect.scoped
      )
    );

    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right).toContain("<svg");
    }
  });
});
```

### 1.3 React Component Error Tests

**File**: `packages/react/src/components/__tests__/MermaidDiagram.error.test.tsx`

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { test, expect, describe } from "vitest";
import { MermaidProvider, MermaidDiagram } from "effect-mermaid-react";

describe("MermaidDiagram Error Handling", () => {
  test("displays error for empty diagram", async () => {
    render(
      <MermaidProvider>
        <MermaidDiagram diagram="" />
      </MermaidProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
    });
  });

  test("displays error for invalid syntax", async () => {
    const onError = vitest.fn();

    render(
      <MermaidProvider>
        <MermaidDiagram
          diagram="invalid mermaid syntax"
          onError={onError}
        />
      </MermaidProvider>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  test("calls onRender callback on success", async () => {
    const onRender = vitest.fn();

    render(
      <MermaidProvider>
        <MermaidDiagram
          diagram="graph TD\n  A-->B"
          onRender={onRender}
        />
      </MermaidProvider>
    );

    await waitFor(() => {
      expect(onRender).toHaveBeenCalledWith(expect.stringContaining("<svg"));
    });
  });

  test("recovers from error on diagram update", async () => {
    const { rerender } = render(
      <MermaidProvider>
        <MermaidDiagram diagram="" />
      </MermaidProvider>
    );

    expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();

    rerender(
      <MermaidProvider>
        <MermaidDiagram diagram="graph TD\n  A-->B" />
      </MermaidProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/cannot be empty/i)).not.toBeInTheDocument();
    });
  });
});
```

## Phase 2: Accessibility Tests (High Priority)

### 2.1 Install jest-axe

```bash
bun add -D @axe-core/react jest-axe @testing-library/jest-dom
```

### 2.2 Accessibility Tests for React Components

**File**: `packages/react/src/components/__tests__/MermaidDiagram.a11y.test.tsx`

```typescript
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { test, expect, describe, beforeEach } from "vitest";
import { MermaidProvider, MermaidDiagram } from "effect-mermaid-react";

expect.extend(toHaveNoViolations);

describe("MermaidDiagram Accessibility", () => {
  test("has no automated accessibility violations", async () => {
    const { container } = render(
      <MermaidProvider>
        <MermaidDiagram diagram="graph TD\n  A-->B" />
      </MermaidProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("diagram has accessible label", async () => {
    const { container } = render(
      <MermaidProvider>
        <MermaidDiagram
          diagram="graph TD\n  A-->B"
          aria-label="Simple flowchart showing A to B"
        />
      </MermaidProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("MermaidProvider Accessibility", () => {
  test("provider has no accessibility violations", async () => {
    const { container } = render(
      <MermaidProvider>
        <div>Test content</div>
      </MermaidProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Error Display Accessibility", () => {
  test("error messages are properly associated", async () => {
    const { container, getByRole } = render(
      <MermaidProvider>
        <div>
          <label htmlFor="diagram-code">Diagram Code</label>
          <textarea id="diagram-code" />
          <MermaidDiagram diagram="" />
        </div>
      </MermaidProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2.3 Keyboard Navigation Tests

**File**: `packages/react/src/components/__tests__/keyboard-navigation.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, describe } from "vitest";
import { MermaidDiagram } from "effect-mermaid-react";

describe("Keyboard Navigation", () => {
  test("diagram container is reachable via Tab", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>Focus start</button>
        <MermaidDiagram diagram="graph TD\n  A-->B" />
        <button>Focus end</button>
      </div>
    );

    const firstButton = screen.getByText("Focus start");
    await user.tab();
    expect(firstButton).toHaveFocus();

    await user.tab();
    // Diagram should be in tab order (via aria-label or role)
  });

  test("error alerts are announced", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MermaidDiagram diagram="graph TD\n  A-->B" />
    );

    rerender(<MermaidDiagram diagram="" />);

    // Error should be announced to screen readers
    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toBeInTheDocument();
  });
});
```

## Phase 3: Integration Tests

### 3.1 End-to-End Test (with Playwright)

**File**: `apps/web/e2e/editor-workflow.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Diagram Editor Workflow", () => {
  test("user can write, render, and theme a diagram", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // 1. Wait for app to load
    await page.waitForSelector("[data-testid='code-editor']");

    // 2. Clear default diagram
    const editor = page.locator("[data-testid='code-editor']");
    await editor.clear();

    // 3. Type new diagram
    await editor.type("graph LR\n  A[Start] --> B[End]");
    await page.waitForTimeout(600); // Wait for debounce

    // 4. Check diagram renders
    const preview = page.locator("[data-testid='diagram-preview']");
    await expect(preview).toContainText("<svg");

    // 5. Change theme
    const themeSelect = page.locator("[data-testid='theme-select']");
    await themeSelect.selectOption("dark");
    await page.waitForTimeout(500);

    // 6. Verify theme applied
    const diagram = page.locator("svg");
    await expect(diagram).toBeVisible();

    // 7. Export
    const exportButton = page.locator("[data-testid='export-button']");
    await exportButton.click();
    await page.waitForTimeout(500);

    // Check download
    const downloadPromise = page.waitForEvent("popup");
    // ... verify export
  });

  test("displays helpful error messages", async ({ page }) => {
    await page.goto("http://localhost:5173");

    const editor = page.locator("[data-testid='code-editor']");
    await editor.clear();
    await editor.type("invalid mermaid");
    await page.waitForTimeout(600);

    const errorMessage = page.locator("[data-testid='error-alert']");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/syntax|error/i);
  });
});
```

## Phase 4: Snapshot Tests

### 4.1 SVG Snapshot Tests

**File**: `packages/core/src/services/mermaid/__tests__/snapshots.test.ts`

```typescript
import { test, expect, describe } from "vitest";
import { Effect } from "effect";
import { Mermaid } from "effect-mermaid";

describe("Mermaid SVG Snapshots", () => {
  const diagrams = {
    flowchart: "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[End]",
    sequence: "sequenceDiagram\n  participant A\n  participant B\n  A->>B: Hello",
    class: "classDiagram\n  class A {\n    int id\n    string name\n  }",
  };

  test.each(Object.entries(diagrams))(
    "renders %s diagram consistently",
    async (name, diagram) => {
      const svg = await Effect.runPromise(
        Effect.gen(function* () {
          const mermaid = yield* Mermaid;
          return yield* mermaid.render(diagram);
        }).pipe(
          Effect.provide(Mermaid.Default),
          Effect.scoped
        )
      );

      // SVG structure should be stable
      expect(svg).toContain("<svg");
      expect(svg).toMatchSnapshot(`${name}-diagram`);
    }
  );
});
```

## Setup Instructions

### 1. Install Testing Dependencies

```bash
# All packages
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D jest-axe @axe-core/react
bun add -D @playwright/test

# Vitest already configured
```

### 2. Update Vitest Config

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/"],
    },
  },
});
```

### 3. Setup File

**File**: `vitest.setup.ts`

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});
```

## Running Tests

```bash
# All tests
bun test

# Specific package
bun test --filter effect-mermaid

# Error scenarios only
bun test error-scenarios

# A11y tests only
bun test a11y

# Watch mode
bun test --watch

# With coverage
bun test --coverage
```

## Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| **Unit Tests** | >80% | ~60% |
| **Error Paths** | 100% | ~20% |
| **A11y Tests** | 100% (Axe) | 0% |
| **Integration** | 80% | ~40% |
| **E2E** | Major flows | 0% |

## Test Matrix

```typescript
// Test all combinations
const configs = [
  { theme: "default", securityLevel: "strict" },
  { theme: "dark", securityLevel: "loose" },
  { theme: "forest", securityLevel: "antiscript" },
];

const diagrams = [
  "graph TD\n  A-->B",
  "sequenceDiagram\n  participant A",
  "classDiagram\n  class A",
  // ... etc
];

// Generates 3 themes × 5 diagrams = 15 test cases
```

## Continuous Integration

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun test:coverage
      
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test -- a11y

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run dev &
      - run: bun exec playwright test
```

## Success Criteria

- ✅ All error scenarios tested
- ✅ Zero accessibility violations (Axe)
- ✅ >80% code coverage
- ✅ E2E tests passing
- ✅ Performance benchmarks tracked
- ✅ CI/CD pipeline green

---

**Recommended Implementation Order**:
1. Error scenario tests (quick wins, high value)
2. Accessibility tests (legal + ethical responsibility)
3. Integration tests (catch regressions)
4. E2E tests (ensure workflows work)
5. Performance benchmarks (track improvements)

