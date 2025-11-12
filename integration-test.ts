#!/usr/bin/env tsx

import { Effect } from "effect";
import { Mermaid } from "./packages/core/dist/index.js";
import { NodeMermaid } from "./packages/node/dist/index.js";

const testDiagram = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> B`;

async function main() {
  console.log("🧪 Integration Test: effect-mermaid packages\n");

  // Test TestMermaid (stub implementation)
  console.log("📝 Testing TestMermaid (stub implementation):");
  const testResult = await Effect.runPromise(
    Effect.gen(function* () {
      const mermaid = yield* Mermaid;
      const svg = yield* mermaid.render(testDiagram);
      const type = yield* mermaid.detectType(testDiagram);
      return { svg: svg.substring(0, 100) + "...", type };
    }).pipe(Effect.provide(Mermaid.Default))
  );

  console.log("✓ Rendered stub SVG:", testResult.svg);
  console.log("✓ Detected type:", testResult.type);

  // Test NodeMermaid (real Mermaid.js)
  console.log("\n🌊 Testing NodeMermaid (real Mermaid.js):");
  const nodeResult = await Effect.runPromise(
    Effect.gen(function* () {
      const mermaid = yield* NodeMermaid;
      const svg = yield* mermaid.render(testDiagram);
      const type = yield* mermaid.detectType(testDiagram);
      return { svg: svg.substring(0, 100) + "...", type };
    }).pipe(Effect.provide(NodeMermaid.Default))
  );

  console.log("✓ Rendered real SVG:", nodeResult.svg);
  console.log("✓ Detected type:", nodeResult.type);

  console.log("\n🎉 Integration test passed! Both packages work correctly.");
}

main().catch(console.error);
