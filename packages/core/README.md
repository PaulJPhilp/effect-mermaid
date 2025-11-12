# @effect-mermaid

Effect-based Mermaid diagram rendering package.

## Installation

```bash
pnpm add @effect-mermaid
```

## Usage

```typescript
import { Effect } from "effect";
import { Mermaid } from "@effect-mermaid";

const program = Effect.gen(function* () {
  const mermaid = yield* Mermaid;
  const svg = yield* mermaid.render("graph TD\n  A-->B");
  console.log(svg);
});

Effect.runPromise(Effect.provide(program, Mermaid.Default));
```
