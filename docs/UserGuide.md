# effect-mermaid User Guide

## Overview

effect-mermaid provides a unified API for rendering Mermaid diagrams with the
Effect runtime. The monorepo ships a core service, a Node.js implementation, and
React components, allowing you to render diagrams in tests, on the server, and
in the browser while sharing the same Effect-powered abstraction.

## Packages at a Glance

| Package | Description |
| --- | --- |
| `effect-mermaid` | Core service, types, schemas, and in-memory test stub. |
| `@effect-mermaid-node` | Live Node.js renderer backed by Mermaid.js. |
| `@effect-mermaid-react` | React provider and diagram component for browsers. |

Each runtime package re-exports the shared types and errors from the core
module, so you can import `DiagramType`, `MermaidConfig`, and `MermaidError`
from any entry point.@packages/node/src/index.ts#1-7

## Installation

### Using Bun (recommended)

```bash
bun add effect-mermaid
bun add @effect-mermaid-node
bun add @effect-mermaid-react
```

### Using pnpm

```bash
pnpm add effect-mermaid
pnpm add @effect-mermaid-node
pnpm add @effect-mermaid-react
```

## Prerequisites

- Effect 3.19 or later (included when you install the packages).
- Node.js 18+ or Bun 1.1+ for server-side rendering.
- React 18+ for the browser components.

## Core Concepts

### Mermaid service contract

The shared `MermaidApi` exposes two Effect-based operations: `render` returns an
SVG/HTML string, and `detectType` identifies the diagram category.@packages/core/src/services/mermaid/api.ts#9-24

The core package also ships a `Mermaid` service that resolves to a test stub by
default. The stub validates the input, generates a unique render ID, and returns
an annotated SVG snippet suitable for unit tests.@packages/core/src/services/mermaid/service.ts#11-75

### Configuration schema

`MermaidConfig` models optional theme, security, and diagram-specific settings,
mirroring Mermaid.js capabilities while retaining static types via Effect
Schema.@packages/core/src/global/schema.ts#6-23

### Error handling

All failures surface as `MermaidError`, tagged with a `reason` that indicates
parse, render, or unknown issues. The error optionally captures the diagram
source to aid debugging.@packages/core/src/global/errors.ts#6-10

## Quick Start Scenarios

### 1. Test-friendly rendering (core stub)

Use the core service when you need deterministic SVG output without Mermaid.js:

```typescript
import { Effect } from "effect";
import { Mermaid } from "effect-mermaid";

const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;
  const svg = yield* mermaid.render("graph TD\n  A-->B");
  return svg;
});

Effect.runPromise(Effect.provide(program, Mermaid.Default));
```

### 2. Server-side rendering with Node.js

The Node.js layer dynamically loads Mermaid.js, validates diagrams, and returns
real SVG output. Provide the live service where you need production-grade
rendering:@packages/node/src/services/mermaid/service.ts#8-100

```typescript
import { Effect } from "effect";
import { NodeMermaid } from "@effect-mermaid-node";

const program = Effect.gen(function* () {
  const mermaid = yield* NodeMermaid;
  const svg = yield* mermaid.render("graph TD\n  Start-->End");
  return svg;
});

Effect.runPromise(Effect.provide(program, NodeMermaid.Default));
```

### 3. Browser rendering with React

Wrap your application with `MermaidProvider` to lazily initialize Mermaid.js, 
then render diagrams with the `MermaidDiagram` component.@packages/react/src/components/MermaidProvider.tsx#27-68
@packages/react/src/components/MermaidDiagram.tsx#26-130

```tsx
import { MermaidDiagram, MermaidProvider } from "@effect-mermaid-react";

export function DiagramExample() {
  return (
    <MermaidProvider>
      <MermaidDiagram
        diagram={`graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[End]`}
        config={{ theme: "dark" }}
      />
    </MermaidProvider>
  );
}
```

## Detecting Diagram Types

Call `detectType` to classify inputs (flowchart, sequence, class, state, gantt,
unknown). The helper inspects the first non-empty line, so ensure your diagrams
include the Mermaid directive on the first line.@packages/core/src/services/mermaid/service.ts#45-72

```typescript
const diagramType = yield* mermaid.detectType("sequenceDiagram\nAlice->>Bob: Hi");
```

## Customizing Rendering

- **Themes**: Supply `config.theme` (`default`, `dark`, `forest`, `neutral`).
- **Theme variables**: Use `config.themeVariables` to override individual
  Mermaid tokens.
- **Diagram-specific settings**: Pass `flowchart`, `sequence`, `class`, or
  `state` sub-configs as records.
- **Security level**: Override `config.securityLevel` when embedding untrusted
  diagrams.

Each render validates the diagram and applies your configuration before calling
Mermaid.js. Invalid input yields a `MermaidError` with `reason: "Parse"`, while
rendering issues surface as `reason: "Render"`.@packages/node/src/services/mermaid/service.ts#29-66

## Working with Effects

Because every operation returns an `Effect`, you can compose diagram rendering
within larger workflows (retry, timeout, tracing) before executing it via
`Effect.runPromise` or `Effect.runSync`.@packages/core/src/services/mermaid/service.ts#18-43

## Testing Strategies

- Use the core stub (`Mermaid.Default`) for fast, deterministic tests.
- Assert on SVG attributes such as `data-stub="true"` or the generated
  `data-theme` marker.@packages/core/src/services/mermaid/__tests__/service.test.ts#7-35
- Flip the effect to assert that invalid diagrams yield parse errors.@packages/core/src/services/mermaid/__tests__/service.test.ts#17-70
- For integration tests, provide the Node or Browser service layers to exercise
  real rendering.

## Troubleshooting

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| `MermaidError` with `Parse` | Empty or whitespace diagram | Trim input or guard
before calling `render`. |
| `MermaidError` with `Render` | Mermaid.js failed to render | Inspect the error
message, review custom config, or validate diagram syntax. |
| Dynamic import failure | Mermaid.js missing at runtime | Ensure Mermaid is
installed as a dependency in the runtime package. |
| React diagram stays blank | Provider not initialized | Wrap components in
`MermaidProvider` and wait for `useMermaidInitialized` if needed.@packages/react/src/components/MermaidProvider.tsx#31-67

## Next Steps

- Explore the architecture and PRD documents for deeper design rationale.
- Extend the service pattern to new runtimes (Bun, CLI) by implementing the same
`MermaidApi` contract.
- Add custom telemetry by decorating the Effects returned from the service to
record render timings or diagram metadata.
