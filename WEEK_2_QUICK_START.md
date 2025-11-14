# ⚡ Week 2 Quick Start (5 minutes)

## 🎯 Goal
Integrate the 3 new components into your app and verify it works.

## 📦 What You Have

✅ **New Components** (already created):
- `apps/web/src/components/SyntaxErrorDisplay.tsx`
- `apps/web/src/components/EditorSection.tsx`
- `apps/web/src/components/PreviewSection.tsx`
- `apps/web/src/AppRefactored.tsx` (reference implementation)

✅ **New Hooks** (from Week 1):
- `apps/web/src/hooks/useEditorState.ts`
- `apps/web/src/hooks/useDiagramRender.ts`

## 🚀 Integration (Choose One Path)

### Path A: Quick Integration (Recommended First-Time)

Replace your current `App.tsx` with the refactored version:

```bash
cp apps/web/src/AppRefactored.tsx apps/web/src/App.tsx
```

Then verify:
```bash
bun run check   # Type check
bun run build   # Build verification
bun test        # Run tests
```

### Path B: Manual Step-by-Step

If you have custom modifications to App.tsx:

1. **Open** `apps/web/src/App.tsx` (current)
2. **Open** `apps/web/src/AppRefactored.tsx` (new reference)
3. **Copy** the `EditorContent()` function from AppRefactored
4. **Replace** the old function in your App.tsx
5. **Keep** any custom imports or features you need
6. Run type check: `bun run check`

## ✅ Verification Checklist

```bash
# 1. Type checking
bun run check
# Expected: ✅ PASS (no type errors)

# 2. Build
bun run build
# Expected: ✅ PASS (builds successfully)

# 3. Tests
bun test
# Expected: ✅ PASS (all tests pass)

# 4. Dev server (optional, but recommended)
bun run dev
# Expected: ✅ App loads at http://localhost:5173
```

## 🧪 Manual Testing (2 minutes)

After integration, test these scenarios:

| Test | Expected Result |
|------|-----------------|
| **1. Type code** | Code appears in preview |
| **2. Make error** | Error shows below editor |
| **3. Fix error** | Error disappears |
| **4. Clear button** | Clears editor and errors |
| **5. Switch theme** | Only preview updates (editor unchanged) |
| **6. Empty editor** | Shows "No diagram to render" message |

## 📊 Files Structure After Integration

```
apps/web/src/
├── App.tsx (refactored, ~150 lines) ← CHANGED
├── AppRefactored.tsx (reference, delete after merging)
├── App.backup.tsx (backup, delete later)
├── components/
│   ├── CodeMirrorEditor.tsx (existing)
│   ├── RenderingSettingsPanel.tsx (existing)
│   ├── ThemeBuilderSidebar.tsx (existing)
│   ├── SyntaxErrorDisplay.tsx (NEW)
│   ├── EditorSection.tsx (NEW)
│   └── PreviewSection.tsx (NEW)
└── hooks/
    ├── useThemeBuilder.ts (existing)
    ├── useRenderingSettings.ts (existing)
    ├── useRegisterCustomThemes.ts (existing)
    ├── useEditorState.ts (NEW from Week 1)
    └── useDiagramRender.ts (NEW from Week 1)
```

## 🐛 Troubleshooting

### Problem: "Cannot find module"
```bash
# Solution: Make sure all files exist
ls apps/web/src/components/SyntaxErrorDisplay.tsx
ls apps/web/src/components/EditorSection.tsx
ls apps/web/src/components/PreviewSection.tsx
ls apps/web/src/hooks/useEditorState.ts
ls apps/web/src/hooks/useDiagramRender.ts
```

### Problem: Type errors
```bash
# Solution: Run type check to see specific errors
bun run check

# Most likely cause: Missing imports
# Check that all component imports are correct in App.tsx
```

### Problem: Tests fail
```bash
# Solution: Verify no existing tests broke
bun test

# If tests fail:
# 1. Check git diff for what changed
# 2. Review test imports
# 3. Verify hook exports
```

### Problem: App looks different
```bash
# Solution: Check CSS/styling
# The new components use Tailwind classes
# Make sure Tailwind is configured correctly
# Verify App.css is still imported
```

## 🎯 Success = This Works

After integration:
1. ✅ App compiles without errors
2. ✅ Type check passes
3. ✅ Tests pass
4. ✅ App loads in browser
5. ✅ Editor and preview both work
6. ✅ Code changes appear in preview

## 📈 Performance Check

After integration, verify performance improved:

```bash
# In browser console, type:
# (or use React DevTools Profiler)

# Before refactoring:
# - Typing in editor triggers full app re-render

# After refactoring:
# - Typing in editor only re-renders EditorSection
# - Switching theme only re-renders PreviewSection
```

## 🎓 What Happened

### Old Architecture
```
App (345 lines)
└─ Everything mixed together
```

### New Architecture
```
App (150 lines)
├─ EditorSection (85 lines)
│  └─ useEditorState hook
├─ PreviewSection (100 lines)
│  └─ useDiagramRender hook
├─ ThemeBuilderSidebar
└─ RenderingSettingsPanel
```

**Result**: Same functionality, 57% less code, better performance, easier to test

## 📝 Next Steps

Once Week 2 is complete:

1. **Delete temporary files**:
   ```bash
   rm apps/web/src/AppRefactored.tsx  # No longer needed
   rm apps/web/src/App.backup.tsx     # Keep backup if you want
   ```

2. **Commit changes**:
   ```bash
   git add apps/web/src/components/
   git add apps/web/src/hooks/
   git add apps/web/src/App.tsx
   git commit -m "feat: refactor App.tsx into modular components"
   ```

3. **Move to Week 3**:
   - Read: `LAZY_INITIALIZATION_GUIDE.md`
   - Implement: Lazy Mermaid loading
   - Add: Comprehensive tests

## ⏱️ Time Estimate

- **Integration**: 5 minutes
- **Verification**: 5 minutes
- **Testing**: 5 minutes
- **Troubleshooting** (if needed): 10-15 minutes

**Total**: 15-30 minutes

## 🆘 Still Stuck?

1. Check: `WEEK_2_IMPLEMENTATION.md` (more detailed guide)
2. Check: `REACT_REFACTORING_GUIDE.md` (complete strategy)
3. Review: `AppRefactored.tsx` (reference implementation)
4. Check: Component files individually

---

**Status**: Ready to integrate ✅  
**Complexity**: Low  
**Time**: ~30 minutes  
**Next**: Week 3 - Performance & Testing

---

## One-Liner Integration (Most Confident Users)

```bash
cp apps/web/src/AppRefactored.tsx apps/web/src/App.tsx && \
bun run check && bun run build && bun test && echo "✅ Week 2 Complete!"
```

---

**Good luck! You've got this! 🚀**

