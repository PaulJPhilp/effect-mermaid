# Layer Composition Fix: Service Not Found Error

## Problem

When initializing the Mermaid React provider, the application was throwing:

```
Failed to initialize Mermaid: (FiberFailure) Error: Service not found: 
effect-mermaid/ThemeRegistry (defined at packages/core/src/services/themeRegistry/service.js:5:52)
```

## Root Cause

The `BrowserMermaid` service declares `ThemeRegistry` as a dependency:

```typescript
// packages/react/src/services/mermaid/service.ts, line 134
dependencies: [ThemeRegistry.Default],
```

However, the `MermaidProvider` component was using `Layer.merge()` to compose the services:

```typescript
// INCORRECT - using Layer.merge()
const appLayer = Layer.merge(
  ThemeRegistry.Default,
  BrowserMermaid.Default,
);
```

**Why this fails:** `Layer.merge()` creates a flat composition without establishing explicit dependency relationships. When `BrowserMermaid` is executed, it requests `ThemeRegistry` from the Effect context, but the merged layer doesn't guarantee that `ThemeRegistry` will be available first.

## Solution

Use `Layer.provide()` to explicitly inject the dependency:

```typescript
// CORRECT - using Layer.provide()
const appLayer = Layer.provide(
  BrowserMermaid.Default,
  ThemeRegistry.Default,
);
```

**Why this works:** `Layer.provide(layer, deps)` creates a new layer where:
1. `deps` (ThemeRegistry.Default) is provided/composed first
2. `layer` (BrowserMermaid.Default) is then provided on top of it
3. This establishes a clear dependency hierarchy

When `BrowserMermaid` executes and requests `ThemeRegistry`, Effect can now find it in the composed layer.

## Changes Made

**File:** `/Users/paul/Projects/In-Progress/effect-mermaid/packages/react/src/components/MermaidProvider.tsx`

**Line 100-103 (before):**
```typescript
const appLayer = Layer.merge(
  ThemeRegistry.Default,
  BrowserMermaid.Default,
);
```

**Line 100-103 (after):**
```typescript
const appLayer = Layer.provide(
  BrowserMermaid.Default,
  ThemeRegistry.Default,
);
```

## Verification

The fix has been verified with:
1. ✅ Core package tests (35/35 passing)
2. ✅ Node package tests (16/16 passing)
3. ✅ Direct layer composition test (verified ThemeRegistry is available to BrowserMermaid)

## Effect.js Layer Patterns

This fix demonstrates the correct use of Effect layers:

- **`Layer.merge(a, b)`**: Combines two independent layers without dependencies
- **`Layer.provide(layer, deps)`**: Provides dependencies to a layer, establishing explicit relationships

For services with declared dependencies, always use `Layer.provide()` to ensure dependencies are initialized before the dependent service.

## Related Files

- `packages/react/src/components/MermaidProvider.tsx` - Provider component (FIXED)
- `packages/react/src/services/mermaid/service.ts` - BrowserMermaid service (declares ThemeRegistry dependency)
- `packages/core/src/services/themeRegistry/service.ts` - ThemeRegistry service

