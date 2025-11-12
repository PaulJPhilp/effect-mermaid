# Architecture Document: effect-mermaid v0.1.0

**Purpose**: Explain the design decisions, system structure, and rationale behind effect-mermaid.

**Audience**: Contributors, maintainers, and engineers integrating this library.

---

## 1. System Overview

### High-Level Vision

effect-mermaid is a **universal Mermaid rendering SDK** that works identically across Node.js, Bun, and browsers. The core insight: **one service interface, multiple implementations per runtime**.

```
┌─────────────────────────────────────────────────────────┐
│                    User Code                            │
│              (render diagram to SVG)                    │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              Effect.Service<Mermaid>                    │
│         (render, detectType methods)                    │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Core Package │ │ Test Stub    │ │ Live Layers  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└──────────────┬──────────────────────────────────────────┘
               │
        ┌──────┴───────┬──────────┬──────────┐
        ▼              ▼          ▼          ▼
   ┌────────┐    ┌────────┐  ┌────────┐ ┌────────┐
   │ Node.js│    │Browser │  │  Bun   │ │  CLI   │
   │ Layer  │    │ Layer  │  │ Layer  │ │ Layer  │
   └────────┘    └────────┘  └────────┘ └────────┘
        │              │          │          │
        ▼              ▼          ▼          ▼
   ┌────────┐    ┌────────┐  ┌────────┐ ┌────────┐
   │ Mermaid│    │Lazy-   │  │Mermaid │ │FS I/O  │
   │(JSDOM) │    │loaded  │  │(JSDOM) │ │& Logs  │
   └────────┘    │Mermaid │  └────────┘ └────────┘
                 └────────┘
```

---

## 2. Component Architecture

### 2.1 Package Structure

Four independent packages implement the Mermaid service:

#### **Package: `effect-mermaid` (Core)**
- **Role**: Service interface, global types, test stub
- **Responsibilities**:
  - Define `Mermaid` service interface (`MermaidApi`)
  - Define global error types (`MermaidError`)
  - Define global types (`DiagramType`)
  - Define global schemas (`MermaidConfig`)
  - Provide `TestMermaid` layer for unit testing
- **Dependencies**: `effect` only
- **No Runtime Coupling**: Core has no knowledge of Node.js, browser, or mermaid library

#### **Package: `@effect-mermaid/node`**
- **Role**: Node.js runtime implementation
- **Responsibilities**:
  - Implement `MermaidLive` layer using Node.js APIs
  - Dynamically import mermaid module
  - Return live Mermaid service instance
- **Dependencies**: `effect`, `effect-mermaid`, `mermaid` (peer)
- **Lifetime**: One layer instance per application

#### **Package: `@effect-mermaid/browser`**
- **Role**: Browser runtime implementation with lazy-loading
- **Responsibilities**:
  - Implement `MermaidLive` layer for browser
  - Lazy-load mermaid via native dynamic import (Vite code-splits)
  - Return live Mermaid service instance
  - Ensure initial bundle < 50KB
- **Dependencies**: `effect`, `effect-mermaid`, `mermaid` (peer)
- **Vite Integration**: Mermaid moved to separate chunk automatically

#### **Package: `@effect-mermaid/bun`**
- **Role**: Bun runtime support
- **Responsibilities**:
  - Re-export Node.js implementation (Bun has Node.js API compatibility)
  - Future: Bun-specific optimizations (native HTML parsing, faster JSDOM)
- **Dependencies**: `effect`, `effect-mermaid`, `@effect-mermaid/node`

#### **Package: `@effect-mermaid/cli`** (Example)
- **Role**: Command-line interface
- **Responsibilities**:
  - CLI commands: `render`, `detect`
  - File I/O using `@effect/platform-node`
  - Integration with `effect-cli-tui`
  - Exit code handling
- **Dependencies**: `@effect-mermaid/node`, `effect-cli-tui`, `@effect/platform-node`

---

### 2.2 Service Pattern: Why Effect.Service?

**Definition**: `Effect.Service` is Effect's formalized way to define a tagged service with dependency injection support.

**Why not Context.Tag directly?**

| Approach | Pros | Cons |
|----------|------|------|
| **Context.Tag** | Lightweight | Boilerplate for error handling, testing |
| **Effect.Service** | Built-in test support, `.of()` helper, cleaner DI | Slightly more ceremony |

**We chose Effect.Service because:**
1. Explicit service interface makes testing trivial (`.of()` returns service directly)
2. Built-in support for `.extend()` in future versions
3. Aligns with Effect ecosystem best practices
4. Clear tag-based dependency resolution

---

### 2.3 Service-Based Architecture: Per-Runtime Implementation

Each runtime package implements the **same interface** (`MermaidApi`) but with runtime-specific logic:

- **Node.js**: Uses `Effect.promise()` to wrap mermaid's async render
- **Browser**: Uses `Effect.promise()` + lazy dynamic import
- **Bun**: Re-exports Node.js (compatible at API level)

**Why duplicate instead of shared abstraction?**

1. **Runtime differences are real**: Node.js can hold JSDOM state across renders; browser must reload mermaid on page navigation
2. **Keep dependencies clean**: Core doesn't depend on mermaid; each runtime owns that dependency
3. **Future flexibility**: Bun might use native HTML parsing; Deno might use different async APIs
4. **Publish separately**: Users install only what they need (`@effect-mermaid/browser` for frontend, `@effect-mermaid/node` for backend)

---

## 3. Data Flow

### 3.1 Render Flow (Happy Path)

```
User calls:
  yield* mermaid.render("graph TD\n A-->B", { theme: "dark" })

Step 1: Validation
  - Check diagram is not empty
  - If invalid: return Effect.fail(MermaidError)

Step 2: Setup
  - Generate unique render ID
  - Re-initialize mermaid if config override provided

Step 3: Async Bridge
  - Call mermaid.render(id, diagram)
  - Wrap in Effect.promise() to lift async into Effect

Step 4: Return
  - Extract SVG from result
  - Return Effect.succeed(svg)

Step 5: Span & Metrics
  - Add distributed trace span "mermaid.render"
  - Include diagram length in attributes
```

### 3.2 Error Flow

All errors flow through `MermaidError` with reason tags:

```
┌─────────────────────────────────────────┐
│ MermaidError (tagged)                   │
├─────────────────────────────────────────┤
│ reason: "Parse" | "Render" | "Unknown"  │
│ message: string                         │
│ diagram: string (optional)              │
└─────────────────────────────────────────┘

Parse Errors:
  - Empty diagram
  - Invalid syntax
  - Unknown diagram type

Render Errors:
  - JSDOM rendering failed
  - Mermaid library crashed
  - Config reconfiguration failed

Unknown Errors:
  - Module loading failed
  - Initialization crashed
```

**Why tagged errors?**

1. **Predictable matching**: `error.reason` tells caller what went wrong
2. **Structured logging**: Include diagram context (first 100 chars)
3. **User-friendly**: Map to HTTP status codes or CLI exit codes

---

## 4. Service Initialization & Lifetime

### 4.1 Node.js Layer Initialization

```
MermaidLive(defaultConfig)
  │
  ├─ Layer.effect(Mermaid, ...)
  │   │
  │   └─ Effect.gen(...):
  │       1. Dynamic import("mermaid")
  │       2. mermaid.initialize(defaultConfig)
  │       3. Return Mermaid.of({ render, detectType })
  │
  └─ Result: Layer<never, never, Mermaid>

Lifetime: Once per Layer.provide() in Effect program
Instance: Mermaid module + initialized state shared across renders
```

### 4.2 Browser Layer Initialization

```
MermaidLive(defaultConfig)
  │
  ├─ Layer.effect(Mermaid, ...)
  │   │
  │   └─ Effect.gen(...):
  │       1. Dynamic import("mermaid")  ← Vite code-splits here
  │       2. mermaid.initialize(defaultConfig)
  │       3. Return Mermaid.of({ render, detectType })
  │
  └─ Result: Layer<never, never, Mermaid>

Initial Bundle: < 50KB (mermaid not included)
On First Render: Mermaid chunk (~760KB) loads asynchronously
Subsequent Renders: Reuse loaded module
```

---

### 4.3 Test Stub Lifetime

```
TestMermaid = Mermaid.of({
  render: (diagram, config) => 
    Effect.gen(...): returns stub SVG immediately
  detectType: (diagram) => 
    Effect.gen(...): parses firstLine, returns type
})

Lifetime: Synchronous, no I/O, perfect for unit tests
No Dependencies: Effect.succeed() directly, no layers needed
```

---

## 5. Runtime Strategy: Why Three Packages?

### 5.1 Node.js Package: Always Available

- Mermaid renders via JSDOM (Puppeteer-like behavior)
- State persists across renders (initialize once)
- No bundle size concerns (server-side)
- Ideal for: APIs, batch rendering, CLI tools

### 5.2 Browser Package: Lazy-Loaded

- Mermaid loads on first render call
- Vite automatically code-splits (no magic comments needed)
- Initial page load: no mermaid
- First diagram: async chunk download
- Subsequent diagrams: instant (already loaded)

**Why Vite over Webpack?**

| Bundler | Dynamic Import | Code-Split | Bundle Size |
|---------|---|---|---|
| Vite | Native `import()` | Automatic | Smaller initial |
| Webpack 5 | `import()` + magic comments | Manual config | Manual tuning |
| esbuild | Via `splitting: true` | Requires wrapper | Good but less flexible |

**We chose Vite because:**
1. Native ES modules (no transpilation overhead)
2. Automatic code-splitting for `import()`
3. Fast dev server (HMR)
4. No webpack.config.js boilerplate
5. Aligns with modern frontend tooling

### 5.3 Bun Package: Node.js API Parity

- Bun implements Node.js APIs
- Re-export Node.js layer initially
- Future: Native Bun optimizations (faster JSDOM, FFI to mermaid-rs)

---

## 6. Error Handling Strategy

### 6.1 Error Constructors

Each service defines domain-specific error makers:

```
makeRenderError(message, diagram?)
  └─ Failure during SVG generation

makeParseError(message, diagram?)
  └─ Failure during diagram parsing

makeUnknownError(message, diagram?)
  └─ Unexpected error (module load, init)
```

**Why not throw exceptions?**

1. **Functional**: All paths explicit (success or failure)
2. **Composable**: Errors flow through Effect stack
3. **Traceable**: Span attributes capture diagram context
4. **Testable**: Easy to assert on specific error reasons

### 6.2 Error Recovery

Users can handle errors predictably:

```
Effect.gen(function* () {
  const svg = yield* mermaid.render(diagram)
}).pipe(
  Effect.catchTag("MermaidError", (error) => {
    if (error.reason === "Parse") {
      // Handle parse error
    } else if (error.reason === "Render") {
      // Handle render error
    }
  }),
  Effect.retry(Schedule.exponential("100 millis")),
  Effect.timeout("10 seconds")
)
```

---

## 7. Testing Architecture

### 7.1 Test Layers

```
Unit Tests (services/mermaid/__tests__)
  └─ Core service logic (validation, error construction, type detection)
  └─ Dependencies: Effect, TestMermaid (no I/O)

Integration Tests (services/mermaid/__tests__)
  └─ Node.js: Real mermaid rendering via JSDOM
  └─ Browser: Happy-DOM simulation
  └─ Dependencies: mermaid library, 10-second timeout

Visual Regression (scripts/visual-regression.ts)
  └─ Render 5 diagram types
  └─ Snapshot raw SVG strings (not screenshots)
  └─ CI fails if SVG changes unexpectedly
  └─ Human review required for legitimate changes
```

### 7.2 Why Raw SVG Snapshots (Not Screenshots)?

| Approach | Pros | Cons |
|----------|------|------|
| **Raw SVG** | Small diffs, no font rendering issues, deterministic | Less visual validation |
| **Screenshots** | Visual verification | Font differences across OS, flaky, large diffs |

**We chose raw SVG because:**
1. Deterministic (no OS font variation)
2. Git-friendly diffs (text-based)
3. Fast CI (no browser rendering)
4. Still validates diagram structure + content

---

## 8. Configuration Strategy

### 8.1 Global Config vs Per-Render Config

```
Layer.provide(MermaidLive({ theme: "dark" }))
  │
  └─ Global default: all renders use "dark" theme

Later:
  yield* mermaid.render(diagram, { theme: "light" })
  │
  └─ Override: this render uses "light" theme
  └─ Re-initializes mermaid with new config
  └─ Next render reverts to global default
```

**Why re-init on override?**

Mermaid's configuration is stateful. Once `initialize()` is called, subsequent renders use that config. Overriding requires re-init to ensure correct behavior.

---

## 9. Extension Points

### 9.1 Adding a New Runtime (e.g., Deno)

```
1. Create @effect-mermaid/deno package
2. Implement MermaidLive layer using Deno APIs
3. Export from src/index.ts
4. Add to CI test matrix (--allow-net, --allow-env)
5. Tests auto-discover (same test structure)
```

### 9.2 Adding Custom Theme Support

```
1. Extend MermaidConfig schema in src/global/schema.ts
2. Add themeVariables or custom CSS reference
3. Pass through to mermaid.initialize(config)
4. No changes needed in runtimes (they accept config as-is)
```

### 9.3 Adding Diagram Format Export (e.g., PNG)

```
1. Create new service: @effect-mermaid/png
2. Implement: SVG → PNG converter (Puppeteer, sharp)
3. Depends on @effect-mermaid/node for rendering
4. CLI: add `--format png` flag
```

---

## 10. Trade-offs & Decisions

### 10.1 Lazy Loading: Browser Only

**Decision**: Lazy-load mermaid in browser, eager-load in Node.js

**Rationale**:
- Browser: Every KB matters for page load (50KB target)
- Node.js: Server-side bundles aren't page-critical
- Lazy-load adds complexity (async on first render)

**Alternative**: Always lazy-load
- Pro: Consistent API
- Con: Node.js CLI has startup delay (unused complexity)

### 10.2 Monorepo: Separate Packages vs Single Package

**Decision**: Four separate packages (core, node, browser, bun)

**Rationale**:
- Users install only what they need
- Core has no transitive mermaid dependency
- Clear dependency boundaries (no accidental coupling)

**Alternative**: Single monolithic package
- Pro: Simpler initial setup
- Con: Browser users forced to download Node.js code

### 10.3 Effect.Service vs Simple Factory Functions

**Decision**: Effect.Service for consistency

**Rationale**:
- Aligns with Effect ecosystem
- Built-in testing support (`.of()`)
- Future-proof for middleware/extensions

**Alternative**: Export `{ render, detectType }` directly
- Pro: Simpler API (no tag references)
- Con: Less composable with other Effects services

### 10.4 Raw SVG vs Screenshots

Already covered in Section 7.2.

---

## 11. Future Considerations

### 11.1 Performance Optimizations (v0.2.0)

- **Browser**: Preload mermaid chunk if user has fast connection
- **Node.js**: Browser instance pooling for high-volume rendering
- **Shared**: Mermaid render caching (memoize identical diagrams)

### 11.2 Format Support (v0.2.0)

- PNG/PDF export via Playwright or sharp
- SVGZ (compressed SVG)
- Interactive SVG with click handlers

### 11.3 Custom Diagram Types (v0.3.0)

- Allow registration of custom mermaid extensions
- Versioned plugin system

### 11.4 Monitoring & Observability (v0.3.0)

- Metrics: render duration, error rate, cache hit rate
- Structured logging: all mermaid operations
- OpenTelemetry integration (already using `Effect.withSpan`)

---

## 12. Security Considerations

### 12.1 XSS Prevention

**Default**: Mermaid's `securityLevel: "strict"` strips inline JavaScript

**If user sets** `securityLevel: "loose"`:
- Browser package docs must warn about XSS
- SVGs generated with loose security should never render user-provided content
- CLI sanitizes file paths (no directory traversal)

### 12.2 Input Validation

- Diagram validated (non-empty) before passing to mermaid
- Config schema-validated before passing to mermaid
- Render ID generated server-side (not user input)

---

## 13. Deployment Model

### 13.1 Browser: Client-Side Rendering

```
User's Browser:
  1. Load page (no mermaid code)
  2. React mounts <MermaidDiagram diagram={code} />
  3. Component calls Effect.runPromise(mermaid.render(code))
  4. First render triggers dynamic import("mermaid")
  5. Vite lazy-loads mermaid chunk (~760KB)
  6. SVG rendered in-place
  7. Subsequent renders instant (mermaid already loaded)
```

### 13.2 Node.js: Server-Side Rendering

```
Node.js Server:
  1. API route: POST /render
  2. Body: { diagram: "graph TD..." }
  3. Effect.runPromise(Mermaid.render(diagram).pipe(Effect.provide(MermaidLive())))
  4. Return SVG response
  5. Optional: Store in Redis/cache layer
```

### 13.3 CLI: Batch Rendering

```
$ effect-mermaid render diagrams/*.mmd -t dark

For each file:
  1. Read file
  2. Render with MermaidLive layer
  3. Write SVG
  4. Log result or error
```

---

## 14. API Stability

### 14.1 Public API (Stable)

```
Mermaid.render(diagram, config?) → Effect<string, MermaidError>
Mermaid.detectType(diagram) → Effect<DiagramType, MermaidError>
MermaidLive(config?) → Layer<never, never, Mermaid>
TestMermaid → Layer<never, never, Mermaid>
```

Semver: Breaking changes only in major version.

### 14.2 Internal API (Unstable)

```
makeRenderId() → string
validateDiagram(code) → null | string
Service-specific error constructors
Helper functions
```

Semver: Can change in minor versions.

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **Service** | Effect-managed resource (Mermaid instance) |
| **Layer** | Provides a service to an Effect program |
| **Effect** | Computation that may fail, require dependencies, or perform I/O |
| **Span** | Distributed trace unit for observability |
| **Dynamic Import** | `import()` expression that loads module at runtime (Vite code-splits) |
| **JSDOM** | JavaScript DOM implementation (used by mermaid in Node.js) |
| **Code-split** | Bundler splits large modules into separate chunks |

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-07  
**Status**: Approved for implementation
