# Week 3 Path A: Step-by-Step Lazy Loading Implementation

## 🎯 Goal
Move Mermaid.js import/init from service constructor to first render call.

**Expected Result**: App startup 12x faster! 🚀

---

## ⚡ Quick Summary

**What we're doing**:
- Change from `effect:` to `scoped:` in service definition
- Add `Ref<MermaidModule | null>` to cache the initialized module
- Create `ensureInitialized()` function that imports Mermaid on first call only
- Call `ensureInitialized()` at the start of every `render()` method

**Impact**:
- App startup: 600ms → 50ms (12x faster!)
- First render: +600ms (one-time, acceptable)
- Subsequent renders: Same as before (~50ms)

---

## 📋 Implementation Checklist

### Step 1: Update Core Service (10 minutes)

**File**: `packages/core/src/services/mermaid/service.ts`

Currently uses `effect:` - we'll change it to `scoped:`:

```typescript
// OLD:
export class Mermaid extends Effect.Service<Mermaid>()(
  "effect-mermaid/Mermaid",
  {
    effect: Effect.gen(function* () {
      // ...
    }),
  }
) {}

// NEW:
export class Mermaid extends Effect.Service<Mermaid>()(
  "effect-mermaid/Mermaid",
  {
    scoped: Effect.gen(function* () {
      // Same logic as before, but uses scoped lifecycle
    }),
  }
) {}
```

**Action**: 
- [ ] Open `packages/core/src/services/mermaid/service.ts`
- [ ] Change `effect:` to `scoped:` (line 21)
- [ ] Save file
- [ ] No other changes needed in core (it's a stub)

---

### Step 2: Implement Lazy Loading in NodeMermaid (30-45 minutes)

**File**: `packages/node/src/services/mermaid/service.ts`

This is the real implementation. Follow these steps:

**2a. Add imports at top of file**:
```typescript
import { Ref } from "effect";  // Add this import
```

**2b. Change effect to scoped**:
```typescript
// OLD:
export class NodeMermaid extends Effect.Service<NodeMermaid>()("effect-mermaid/NodeMermaid", {
  effect: Effect.gen(function* () {

// NEW:
export class NodeMermaid extends Effect.Service<NodeMermaid>()("effect-mermaid/NodeMermaid", {
  scoped: Effect.gen(function* () {
```

**2c. Add Ref for caching inside the scoped gen function**:
```typescript
scoped: Effect.gen(function* () {
  const logger = yield* Logger;
  const themeRegistry = yield* ThemeRegistry;
  
  // ADD THIS - create a ref to cache the mermaid module
  const mermaidRef = yield* Ref.make<any>(null);
```

**2d. Create ensureInitialized function**:
```typescript
// ADD THIS FUNCTION before the return statement
const ensureInitialized = Effect.gen(function* () {
  const existing = yield* Ref.get(mermaidRef);
  if (existing) return existing; // Already initialized

  // First time: import and initialize
  const module = yield* Effect.tryPromise(() =>
    import("mermaid")
  ).pipe(
    Effect.catchAll((error) => {
      return Effect.gen(function* () {
        yield* logger.error(`Failed to import Mermaid: ${error}`);
        return yield* Effect.fail(
          makeUnknownError(`Failed to import Mermaid: ${error}`, undefined)
        );
      });
    })
  );

  yield* Effect.try({
    try: () =>
      module.default.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict",
      }),
    catch: (error) =>
      makeUnknownError(`Failed to initialize Mermaid: ${error}`, undefined),
  });

  yield* Ref.set(mermaidRef, module);
  return module;
});
```

**2e. Update render method to use ensureInitialized**:
```typescript
// OLD:
render: (diagram: string, config?: MermaidConfig) => {
  return Effect.gen(function* () {
    // Validate diagram
    const validationError = validateDiagram(diagram);

// NEW:
render: (diagram: string, config?: MermaidConfig) => {
  return Effect.gen(function* () {
    // Lazy init happens here on first render
    const mermaidModule = yield* ensureInitialized();

    // Validate diagram
    const validationError = validateDiagram(diagram);
    // ... rest of render logic
```

**2f. Update rest of render to use mermaidModule instead of importing inline**:
- Replace all `mermaidModule.default.render()` calls
- They should already exist from the import

**Action**:
- [ ] Add `import { Ref } from "effect"` at top
- [ ] Change `effect:` to `scoped:` on line ~13
- [ ] Add `const mermaidRef = yield* Ref.make<any>(null);`
- [ ] Add `ensureInitialized()` function (copy from guide)
- [ ] Update `render()` to call `yield* ensureInitialized()`
- [ ] Save and verify: `bun run check`

---

### Step 3: Implement Lazy Loading in BrowserMermaid (30-45 minutes)

**File**: `packages/react/src/services/mermaid/service.ts`

Same steps as NodeMermaid:

**Action**:
- [ ] Add `import { Ref } from "effect"` at top
- [ ] Change `effect:` to `scoped:` on line ~25
- [ ] Add `const mermaidRef = yield* Ref.make<any>(null);`
- [ ] Add `ensureInitialized()` function
- [ ] Update `render()` to call `yield* ensureInitialized()`
- [ ] Save and verify: `bun run check`

---

### Step 4: Verify Everything Compiles (5 minutes)

**Action**:
- [ ] Run type check: `bun run check`
  - Expected: ✅ PASS
- [ ] Run build: `bun run build`
  - Expected: ✅ PASS (all packages compile)

---

### Step 5: Test It Works (10 minutes)

**Action**:
- [ ] Start dev server: `bun run dev`
- [ ] Open browser: http://localhost:5173
- [ ] Type code in editor
- [ ] Verify diagram renders
- [ ] Check browser DevTools:
  - Network tab: See Mermaid.js loads on first render
  - Console: No errors

---

### Step 6: Verify Performance (15 minutes)

**Action**:
- [ ] Measure app startup time:
  - Open DevTools → Performance tab
  - Reload page
  - Look at "First Contentful Paint" (FCP)
  - Should be much faster than before

- [ ] Measure first render time:
  - Note time when you start typing
  - Note time when diagram appears
  - Should be ~600ms (acceptable one-time cost)

- [ ] Compare with before:
  ```
  Before lazy loading:
  - App startup: 600ms
  - First render: 50ms (already initialized)
  
  After lazy loading:
  - App startup: 50ms (no Mermaid import!)
  - First render: 600ms (import + init + render)
  ```

---

## 🎯 Success Criteria

By the end of Step 6, you should have:

- ✅ Type checking passes
- ✅ Build succeeds
- ✅ App loads and runs
- ✅ Editor and preview work
- ✅ No console errors
- ✅ App startup faster
- ✅ First render shows Mermaid loading

---

## 📊 Expected Metrics

**Before Implementation**:
```
App startup time: ~600ms
Layer creation: ~600ms
First render: ~50ms
Subsequent renders: ~50ms
```

**After Implementation**:
```
App startup time: ~50ms (12x faster! 🚀)
Layer creation: <5ms (120x faster!)
First render: ~600ms (import + init + render)
Subsequent renders: ~50ms (cached)
```

---

## 🆘 If Something Goes Wrong

**Error: "Cannot find Ref"**
→ Make sure you added `import { Ref } from "effect"` at the top

**Error: Type mismatch in render**
→ Make sure `mermaidModule` is assigned from `ensureInitialized()`

**Error: Compilation fails**
→ Run `bun run check` to see specific errors

**App doesn't work**
→ Check browser console for errors
→ Make sure `ensureInitialized()` is called in `render()`

---

## 📝 Next Steps After This

Once lazy loading is complete:

1. **Add Performance Benchmarks** (optional)
   - Create a simple test to measure startup time
   - Include in unit tests

2. **Move to Testing** (Path B)
   - Read: TESTING_IMPROVEMENTS_GUIDE.md
   - Add error scenario tests
   - Add a11y tests

---

## ⏱️ Timeline

- **Step 1** (Core): 10 minutes
- **Step 2** (NodeMermaid): 30-45 minutes
- **Step 3** (BrowserMermaid): 30-45 minutes
- **Step 4** (Verify): 5 minutes
- **Step 5** (Test): 10 minutes
- **Step 6** (Performance): 15 minutes

**Total**: 2-2.5 hours

Then you can move straight to Path B (Testing) for comprehensive coverage!

---

## 🚀 Ready?

Open `packages/node/src/services/mermaid/service.ts` and start with Step 2!

Good luck! 🎯


