# PRD: effect-mermaid v0.1.0 (Effect 3.19+)

**Product**: A universal, Effect-native Mermaid diagram renderer  
**Target**: npm library for Node.js, Bun, and Browser  
**Owner**: System Architect  
**Author**: AI Assistant  
**Date**: 2025-11-07

---

## 1. Executive Summary

Build a type-safe, universal library that renders Mermaid diagrams to SVG using the Effect 3.19+ ecosystem. The library must support Node.js, Bun, and browser runtimes with identical APIs, lazy-load Mermaid core (Vite-optimized), and provide a CLI tool integrated with `effect-cli-tui`.

**Key Constraint**: Mermaid (~760KB) must never be in the initial bundle; loaded only on first render call via native dynamic import.

---

## 2. Goals & Non-Goals

### **Goals**
- ✅ Universal API: `render(diagram, config?) → Effect<string, MermaidError>`
- ✅ Runtime-specific layers: Node.js, Bun, Browser
- ✅ Type-safe configuration via Effect Schema
- ✅ Error handling with `Data.TaggedError`
- ✅ CLI tool using `effect-cli-tui`
- ✅ Diagram type detection
- ✅ Config pass-through (themes, variables)
- ✅ Lazy loading in browser (Vite-native dynamic imports)
- ✅ Unit + integration + visual regression tests (raw SVG string snapshots)

### **Non-Goals**
- ❌ No PNG/PDF output (MVP scope)
- ❌ No server-side browser pooling (low volume)
- ❌ No framework-specific components (examples only)
- ❌ No real-time collaborative editing
- ❌ No custom diagram extensions

---

## 3. Technical Requirements

### **3.1 Effect 3.19+ Patterns**
- Use `Effect.Service` for all service definitions
- Use `Layer.effect` for service construction
- Use `Effect.gen` with `yield*` syntax
- Use `Data.TaggedError` for all error types
- Add `Effect.withSpan` for distributed tracing on public methods
- Use `Effect.promise` for async operations (not `tryPromise`)

### **3.2 Service-Based Architecture**

All services follow this structure in `src/services/{serviceName}/`:

```
src/services/{serviceName}/
├── __tests__/
│   └── service.test.ts
├── api.ts              (interface definition)
├── types.ts            (service-specific types)
├── schema.ts           (service-specific schemas, if any)
├── errors.ts           (service-specific error constructors)
├── helpers.ts          (pure utility functions)
└── service.ts          (Effect.Service implementation + test stub)
```

Additionally, create global files at `src/global/`:

```
src/global/
├── errors.ts           (global error types)
├── types.ts            (global type definitions)
└── schema.ts           (global schemas)
```

### **3.3 Monorepo Structure**

Use pnpm workspaces with Changesets for publishing.

```
effect-mermaid/
├── packages/
│   ├── core/                 (Service interfaces, global types, TestMermaid)
│   ├── node/                 (Node.js implementation)
│   ├── bun/                  (Bun runtime layer)
│   └── browser/              (Browser implementation with lazy loading)
├── examples/
│   ├── cli/                  (CLI tool using effect-cli-tui)
│   └── nextjs-docs/          (Next.js integration example)
├── scripts/
│   └── visual-regression.ts  (Render diagrams, snapshot SVG strings)
├── .github/workflows/
│   ├── ci.yml                (Test on Node 18/20/22, Bun, Windows/macOS/Ubuntu)
│   └── release.yml           (Changesets + npm publishing)
├── package.json
└── pnpm-workspace.yaml
```

**Package naming**: `effect-mermaid` (core), `@effect-mermaid/node`, `@effect-mermaid/bun`, `@effect-mermaid/browser`, `@effect-mermaid/cli`

---

## 4. Core Package Specifications

### **4.1 Global Types** (`src/global/types.ts`)
- Define `DiagramType` as a union of supported diagram types: flowchart, sequence, class, state, gantt, unknown

### **4.2 Global Errors** (`src/global/errors.ts`)
- Define `MermaidError` as a `Data.TaggedError` with:
  - `reason`: "Parse" | "Render" | "Unknown"
  - `message`: string
  - `diagram`: optional string

### **4.3 Global Schema** (`src/global/schema.ts`)
- Define `MermaidConfig` schema covering:
  - theme: "default" | "dark" | "forest" | "neutral"
  - themeVariables: Record<string, unknown>
  - securityLevel: "strict" | "loose" | "antiscript"
  - flowchart, sequence, class, state: nested configs
  - All fields optional

### **4.4 Mermaid Service** (`src/services/mermaid/`)

**API Interface** (`api.ts`):
- `render(diagram: string, config?: MermaidConfig): Effect<string, MermaidError>`
- `detectType(diagram: string): Effect<DiagramType, MermaidError>`

**Service Definition** (`service.ts`):
- Use `Effect.Service` pattern
- Implement `TestMermaid` layer that returns stub SVG without rendering
- Validate diagram is not empty before rendering
- Generate unique IDs for each render

**Types** (`types.ts`):
- RenderOptions, DetectTypeOptions interfaces
- MermaidModule interface for dynamic import type safety

**Errors** (`errors.ts`):
- Error constructors: makeRenderError, makeParseError, makeUnknownError

**Helpers** (`helpers.ts`):
- makeRenderId: Generate unique render ID
- validateDiagram: Check diagram is not empty

**Tests** (`__tests__/service.test.ts`):
- Test render returns valid stub SVG
- Test render fails on empty diagram
- Test render applies custom theme
- Test detectType for flowchart, sequence, class types
- Test detectType fails on invalid diagram

---

## 5. Node.js Package Specifications

### **5.1 Mermaid Layer** (`src/services/mermaid/layer.ts`)
- Implement live Mermaid service using Node.js runtime
- Dynamically import mermaid module (avoid top-level import)
- Initialize mermaid once per layer instance
- Support config override per render call
- Wrap promise-based render in `Effect.promise`
- Return SVG string from render

### **5.2 Tests** (`src/services/mermaid/__tests__/layer.test.ts`)
- Test renders valid SVG (contains `<svg>` tag)
- Test detectType returns recognized diagram types
- Test custom theme is applied
- 10-second timeout for JSDOM rendering

---

## 6. Browser Package Specifications

### **6.1 Implementation**
- Implement Mermaid service for browser runtime
- Use native `import("mermaid")` dynamic import (Vite will code-split automatically)
- No Webpack magic comments needed (Vite handles it natively)
- Ensure mermaid is NOT in initial bundle (separate chunk)
- Lazy-load mermaid on first render call

### **6.2 Build Configuration**
- Use Vite for bundling
- Configure code-splitting to isolate mermaid into separate chunk
- Use `vite-bundle-visualizer` to verify bundle sizes
- Initial bundle must be < 50KB (verified in tests)

### **6.3 Tests**
- Verify initial chunk size < 50KB
- Verify mermaid is in separate code-split chunk
- Happy-DOM test environment

---

## 7. Bun Package Specifications

### **7.1 Implementation**
- Initially re-export Node.js implementation
- Add Bun-specific optimizations in future versions
- Ensure tests pass with `bun:test` runner

---

## 8. CLI Package Specifications

### **8.1 Commands**
- `render <input> [-o <output>] [-t <theme>]`: Render diagram to SVG file
  - Auto-replace `.mmd` with `.svg` if no output specified
  - Support theme flag (-t, --theme)
  - Exit with code 0 on success, 1 on error
  
- `detect <input>`: Print diagram type to stdout

### **8.2 Integration**
- Use `effect-cli-tui` library for command structure
- Use `@effect/platform-node` for file system operations
- Provide human-readable error messages
- Clean exit codes and logging

---

## 9. Visual Regression Testing

### **9.1 Script** (`scripts/visual-regression.ts`)
- Render 5 diagram types: flowchart, sequence, class, state, gantt
- Snapshot raw SVG strings (not screenshots)
- Save to `snapshots/{type}.svg`
- Validate each SVG contains `<svg>` tag
- CI fails if snapshots change unexpectedly

---

## 10. CI/CD Requirements

### **10.1 Test Workflow** (`.github/workflows/ci.yml`)
- Test on Node.js 18, 20, 22
- Test on Bun latest
- Test on Ubuntu, Windows, macOS
- Run linting
- Build all packages
- Run all tests with coverage
- Verify bundle size < 50KB
- Run visual regression tests

### **10.2 Release Workflow** (`.github/workflows/release.yml`)
- Use Changesets for versioning
- Auto-publish to npm on main branch
- Require NPM_TOKEN secret

---

## 11. Package Dependencies

### **Core Package**
- `effect`: ^3.19.0

### **Node Package**
- `effect`: ^3.19.0
- `effect-mermaid`: workspace:*
- `mermaid`: ^11.0.0 (peer dependency)

### **Browser Package**
- `effect`: ^3.19.0
- `effect-mermaid`: workspace:*
- `mermaid`: ^11.0.0 (peer dependency)
- `vite`: ^5.3.0 (dev)
- `vite-bundle-visualizer`: ^1.2.0 (dev)

### **Bun Package**
- `effect`: ^3.19.0
- `@effect-mermaid/node`: workspace:*

### **CLI Package**
- `effect`: ^3.19.0
- `@effect-mermaid/node`: workspace:*
- `effect-cli-tui`: latest
- `@effect/platform-node`: ^0.53.0

---

## 12. Acceptance Criteria

### **Code Quality**
- All packages build with `tsc --noEmit`
- No `any` types; use `unknown` with schema validation
- 100% code coverage on core and node packages
- JSDoc on all public methods

### **Testing**
- Unit tests for schemas, error constructors, helpers
- Integration tests for render and detectType on each runtime
- Browser bundle size < 50KB (verified in CI)
- Visual regression: 5 diagram types, raw SVG snapshots

### **Documentation**
- README with installation and usage examples
- Example: CLI usage
- Example: Next.js integration sketch
- Example: VitePress integration sketch

### **Security**
- Default `securityLevel: "strict"` prevents inline JS
- CLI sanitizes file paths (no directory traversal)
- Browser package docs warn about `securityLevel: "loose"` XSS risk

### **CI/CD**
- All tests pass on Node 18/20/22 + Bun + Windows/macOS/Ubuntu
- Bundle size check passes (< 50KB)
- Changesets publishing configured and tested

---

## 13. Implementation Phases

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | Day 1-2 | Core package + tests passing |
| Phase 2 | Day 2-3 | Node.js package + integration tests |
| Phase 3 | Day 3 | Browser package + bundle verification |
| Phase 4 | Day 3 | Bun package + CI passing |
| Phase 5 | Day 4 | CLI + examples |
| Phase 6 | Day 4 | Visual regression script |
| Phase 7 | Day 5 | CI/CD workflows + release setup |
| Phase 8 | Day 5 | Documentation + polish |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Mermaid breaking API | Pin `mermaid: ^11.0.0`; weekly CI job tests latest |
| Dynamic import fails in bundler | Provide Vite + Webpack examples |
| Bun compatibility issues | Early Bun testing; use `bun:test` runner |
| Bundle size grows | Monitor in every CI run; fail if > 50KB |