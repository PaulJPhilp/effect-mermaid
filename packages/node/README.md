# @effect-mermaid-node

Node.js implementation for effect-mermaid that renders real Mermaid diagrams.

## Installation

```bash
pnpm add @effect-mermaid-node
```

## Usage

```typescript
import { Effect } from "effect";
import { NodeMermaid } from "@effect-mermaid-node";

const program = Effect.gen(function* () {
  const mermaid = yield* NodeMermaid;
  const svg = yield* mermaid.render("graph TD\n  A-->B");
  console.log(svg);
});

Effect.runPromise(Effect.provide(program, NodeMermaid.Default));
```
