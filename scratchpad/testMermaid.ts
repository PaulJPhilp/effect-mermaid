import { Effect, Layer } from "effect"
import { ThemeRegistry } from "effect-mermaid"
import { BrowserMermaid } from "../packages/react/src/services/mermaid/service.js"

const appLayer = Layer.provideMerge(ThemeRegistry.Default)(BrowserMermaid.Default)

const warmupEffect = Effect.gen(function* () {
  yield* BrowserMermaid
}).pipe(Effect.provide(appLayer), Effect.scoped)

Effect.runPromise(warmupEffect).then(() => {
  console.log("Warmup succeeded")
}).catch((error) => {
  console.error("Warmup failed", error)
})
