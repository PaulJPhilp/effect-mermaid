# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**effect-mermaid** is a type-safe, functional diagram rendering library built on Effect.js that enables TypeScript applications to render Mermaid diagrams with full functional programming patterns, error handling, and dependency injection.

**Monorepo structure**: Three main packages (core, node, react) plus a demo web application.

## Quick Commands

### Development
```bash
bun install            # Install dependencies
bun run dev            # Run demo web app (Vite on :5173)
bun run test           # Run tests in watch mode
bun run test:ci        # Run tests with coverage
bun run check          # TypeScript type checking
bun run build          # Build all packages (ESM + CJS)
```

### Running Tests
```bash
bun run test                                      # All packages, watch mode
bun run --filter effect-mermaid test              # Core package only
bun run test:ci                                   # With coverage reporting
```

### Building Individual Packages
```bash
bun run --filter effect-mermaid build             # Core
bun run --filter effect-mermaid-node build        # Node.js
bun run --filter effect-mermaid-react build       # React
bun run --filter @effect-mermaid/web build        # Demo web app
```

## Architecture

### Core Concepts
- **Effect.Service Pattern**: All services use Effect's dependency injection system
- **Layered Architecture**: Services composed via `Layer.merge()` for swappable implementations
- **Tagged Error Types**: `MermaidError` and `ThemeRegistryError` for explicit error handling
- **Stub Implementation**: Core package provides `TestMermaid` for testing

### Package Organization
```
packages/core/       # Types, interfaces, stub implementation, ThemeRegistry service
packages/node/       # Real Mermaid.js rendering for Node.js
packages/react/      # React components and hooks
apps/web/           # Interactive demo web editor (Vite + React)
```

### Service Dependencies
- `Mermaid` service renders diagrams
- `ThemeRegistry` service manages built-in and custom themes
- Node.js and React implementations depend on both services

### Key Entry Points
- **Core**: `packages/core/src/index.ts` - exports Mermaid, ThemeRegistry, error types
- **Node**: `packages/node/src/index.ts` - exports NodeMermaid service
- **React**: `packages/react/src/index.ts` - exports MermaidProvider, MermaidDiagram
- **Web Demo**: `apps/web/src/App.tsx` - interactive editor with live preview

## Typical Development Workflow

### Working with Services
Services use Effect's pattern for composable dependency injection:

```typescript
const appLayer = Layer.merge(
  ThemeRegistryWithThemes(customThemes),
  Mermaid.Default,
  NodeMermaid.Default
);

const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;
  const svg = yield* mermaid.render(diagram, { theme: "dark" });
});

Effect.runPromise(Effect.provide(program, appLayer));
```

### Testing Services
Use `TestMermaid` from core for testing without loading Mermaid.js:

```typescript
const testLayer = Layer.merge(
  ThemeRegistry.Default,
  Mermaid.Default  // stub implementation
);
```

### Adding Tests
Tests use Vitest with Effect.runSync/runPromise:

```typescript
import { test, expect } from "vitest";
import { Effect } from "effect";
import { Mermaid } from "@effect-mermaid";

test("renders diagram", async () => {
  const svg = await Effect.runPromise(
    Effect.gen(function* () {
      const mermaid = yield* Mermaid;
      return yield* mermaid.render("graph TD\n  A-->B");
    }).pipe(Effect.provide(Mermaid.Default))
  );
  expect(svg).toContain("<svg");
});
```

## TypeScript Configuration

Strict mode enabled with:
- `exactOptionalPropertyTypes: true`
- `strict: true`
- Declaration maps for source mapping
- Effect language service plugin configured in `tsconfig.base.json`

Run `pnpm check` to type-check all packages.

## Key Files to Know

| File | Purpose |
|------|---------|
| `packages/core/src/services/mermaid/service.ts` | Core Mermaid service interface and stub |
| `packages/core/src/services/themeRegistry/service.ts` | Theme management service (16 tests) |
| `packages/node/src/services/mermaid/service.ts` | Real Mermaid.js rendering |
| `packages/react/src/components/MermaidDiagram.tsx` | React diagram component |
| `packages/react/src/components/MermaidProvider.tsx` | Context provider for services |
| `apps/web/src/App.tsx` | Demo web editor application |
| `pnpm-workspace.yaml` | Monorepo workspace definition |
| `tsconfig.base.json` | Base TypeScript config with plugins |

## Build Output

Each package builds to ESM and CommonJS:
```
packages/*/dist/
├── esm/          # ES modules (tree-shakeable)
├── cjs/          # CommonJS modules
├── index.js      # Main entry
└── index.d.ts    # TypeScript declarations
```

Build process: `tsc` → Babel with pure annotation → CommonJS transform → pack-v2

## Test Status

- Core: 35/35 passing (19 Mermaid + 16 ThemeRegistry)
- Node: 16/16 passing
- React: 13/15 passing (2 pre-existing failures)
- Total: 51+ tests passing

## Phase Completion

- **Phase 1** (Nov 8, 2025): Built-in themes - COMPLETE ✅
- **Phase 2** (Nov 8, 2025): Custom themes via ThemeRegistry - COMPLETE ✅

## Important Notes

### Package Manager: Bun
This project uses **Bun** for all package management, testing, and scripting:
- **Bun** for package management (monorepo with workspaces)
- **Vitest** for testing (runs via `bun run test`)
- **Vite** for web app bundling (runs via `bun run build`)
- **Node.js** and **Bun** runtime compatibility

Use the commands listed above in the Quick Commands section.

### Common Patterns

**Effect Error Handling**:
```typescript
const result = yield* Effect.try({
  try: () => mermaid.render(diagram),
  catch: (e) => new MermaidError({ reason: "Render", message: String(e) })
});
```

**Schema Validation**:
```typescript
import { Schema } from "effect";
const result = yield* Schema.validate(MermaidConfig)(config);
```

**Theme Resolution**:
ThemeRegistry resolves custom themes first, falls back to built-ins. All implementations support custom themes.

## Effect.js Pattern References

This project uses Effect.js extensively. For detailed guidance on Effect patterns at different levels, see the rule files in `.cursor/rules/`:

### Beginner Patterns (`.cursor/rules/effect-beginner-patterns.mdc`)
Essential patterns for Effect fundamentals:
- Effects as lazy blueprints
- The three channels (A, E, R)
- Execution methods: `runSync`, `runPromise`
- Wrapping synchronous and asynchronous code
- Writing sequential code with `Effect.gen`
- Streams, collections, and side effects

**Use this when**: Learning Effect basics, getting started with a new pattern

### Intermediate Patterns (`.cursor/rules/effect-intermediate-patterns.mdc`)
Production patterns for real-world applications:
- Configuration and dependency injection
- Error handling with typed errors
- Automatic retries and timeouts
- Streams and concurrent processing
- Service layers and layers composition
- HTTP client services with testing
- Metrics and observability
- Testing strategies

**Use this when**: Building services, implementing error handling, testing, setting up configurations

### Advanced Patterns (`.cursor/rules/effect-advanced-patterns.mdc`)
Sophisticated patterns for complex applications:
- Wrapping layers with caching and cross-cutting concerns
- Building HTTP servers with managed resources
- Fiber management and background tasks
- Resource lifecycle management with Scope
- Graceful shutdown and signal handling
- Circuit breakers and resilience patterns
- Plugin architecture with dynamic layers
- Observability with span hierarchies

**Use this when**: Building production systems, implementing resilience, managing complex lifecycles, scaling concurrency

## Effect Patterns in This Codebase

This project demonstrates several key Effect patterns:

1. **Effect.Service Pattern**: All major components (Mermaid, ThemeRegistry, etc.) are services
2. **Layered Architecture**: Services composed via `Layer.merge()` and `Layer.provide()`
3. **Tagged Error Types**: `MermaidError`, `ThemeRegistryError` for composable error handling
4. **Stub Implementations**: `TestMermaid` for testing without dependencies
5. **Scoped Resources**: Database connections and managed resources use `Effect.scoped`
6. **Dependency Injection**: All services injected via the Effect context system

When working with this codebase, refer to the appropriate pattern level above for guidance on how to extend or refactor using Effect idioms.

## Debugging

- **Type errors**: Run `bun run check` to see all type issues across packages
- **Test failures**: Run `bun run test -- <filename>` to focus on specific file
- **Web app**: Vite HMR is enabled in dev mode, check console for errors
- **Service resolution**: Check Layer composition and Effect.provide calls
- **Effect patterns**: Refer to the pattern rules above if unsure how to structure a new Effect
- **Error handling**: Use `Effect.catchTag` for tagged errors, inspect `Cause` for unexpected failures
