# Week 2 Implementation: React Refactoring

## Status: Components Created ✅

All components have been created and are ready to integrate into your App.tsx!

## 📁 What Was Created

### New Components
1. ✅ **SyntaxErrorDisplay.tsx** (60 lines)
   - Displays errors in user-friendly format
   - Shows error count, line numbers, messages
   - Includes error suggestions
   - Dismissible with optional callback

2. ✅ **EditorSection.tsx** (85 lines)
   - Left panel with code editor
   - Integrates CodeMirrorEditor
   - Uses `useEditorState` hook
   - Shows line count and clear button
   - Displays syntax errors below

3. ✅ **PreviewSection.tsx** (100 lines)
   - Right panel with diagram preview
   - Integrates MermaidDiagram component
   - Shows loading state with spinner
   - Shows error state
   - Shows initialization state

### Reference Implementation
- **AppRefactored.tsx** (150 lines)
  - Shows how to use all new components
  - Demonstrates hook integration
  - Includes error handling
  - Ready to copy as new App.tsx

## 🚀 Integration Steps

### Step 1: Backup Current App.tsx
```bash
cp apps/web/src/App.tsx apps/web/src/App.backup.tsx
```

### Step 2: Copy New Components to App
You have two options:

**Option A: Direct Copy** (quickest)
```bash
cp apps/web/src/AppRefactored.tsx apps/web/src/App.tsx
```

**Option B: Manual Integration** (if you have custom modifications)

1. Replace the main `EditorContent()` function with the new one from `AppRefactored.tsx`
2. Keep any custom hooks or features you added
3. Replace the `App()` function at the bottom

### Step 3: Verify It Compiles
```bash
bun run check
bun run build
```

### Step 4: Run Tests
```bash
bun test
```

## 📊 What Changed

### Before (Old App.tsx)
```
App.tsx (345 lines)
├── State: code, errors, theme, settings (mixed)
├── Syntax checking (500ms debounce)
├── Diagram rendering (no debounce)
├── Theme management
├── Settings management
├── All UI inline
└── Re-renders on any state change
```

**Pain Points**:
- Hard to read (345 lines)
- Hard to test (12+ concerns)
- Performance issues (many re-renders)
- Difficult to reuse

### After (New App.tsx)
```
App.tsx (150 lines)
├── EditorSection.tsx (85 lines)
│   └── Uses: useEditorState hook
├── PreviewSection.tsx (100 lines)
│   └── Uses: useDiagramRender hook
├── RenderingSettingsPanel.tsx (existing)
├── ThemeBuilderSidebar.tsx (existing)
└── State: isolated in hooks
```

**Improvements**:
- ✅ 57% smaller (345 → 150 lines)
- ✅ Each component has 2-4 concerns
- ✅ Reusable hooks
- ✅ Better performance (isolated updates)
- ✅ Easier to test

## 🔄 Data Flow

```
App (state coordinator)
│
├─ EditorSection
│  └─ useEditorState hook
│     ├─ code
│     ├─ errors
│     └─ lineCount
│
├─ PreviewSection
│  ├─ useDiagramRender hook
│  │  ├─ shouldRender
│  │  ├─ isLoading
│  │  └─ error
│  └─ MermaidDiagram component
│
├─ ThemeBuilderSidebar
│  └─ useThemeBuilder hook
│
└─ RenderingSettingsPanel
   └─ useRenderingSettings hook
```

## ✨ Key Features

### Error Handling
- Inline syntax errors in SyntaxErrorDisplay
- Render errors in PreviewSection
- Toast notification for caught errors
- Dismissible error states

### Performance
- Editor state isolated (only re-renders on code change)
- Render state isolated (only re-renders on render state change)
- Theme/settings separate (only re-render when changed)

### UX Improvements
- Loading indicator during render
- Clear button to reset editor
- Line count display
- Error suggestions

## 🧪 Testing the New Structure

### Manual Testing
1. Type code in editor
2. Verify it appears in preview
3. Make a syntax error
4. Verify error displays below editor
5. Switch themes
6. Verify only preview updates (not editor)
7. Change settings
8. Verify only preview updates

### Performance Comparison
```bash
# Before refactoring
# - Any state change → full re-render
# - App.tsx 345 lines
# - 12+ concerns mixed together

# After refactoring
# - EditorSection only re-renders on code/error change
# - PreviewSection only re-renders on config/render change
# - App.tsx 150 lines
# - Each component has 2-4 focused concerns
```

## 🎯 Next: Week 3 Preview

Once Week 2 is complete:
1. Move to lazy Mermaid initialization (LAZY_INITIALIZATION_GUIDE.md)
2. Add error scenario tests
3. Add a11y tests
4. Run performance benchmarks

## 📋 Week 2 Checklist

- [ ] Back up current App.tsx
- [ ] Copy new components to project
- [ ] Type check: `bun run check`
- [ ] Build: `bun run build`
- [ ] Tests pass: `bun test`
- [ ] Manual testing complete
- [ ] Review performance
- [ ] Ready for Week 3!

## 🆘 Troubleshooting

### Error: "Cannot find module 'useEditorState'"
→ Make sure `apps/web/src/hooks/useEditorState.ts` exists from Week 1

### Error: "Component not found"
→ Make sure all new components are in `apps/web/src/components/`

### Types not matching
→ Run `bun run check` to see specific type errors

### Performance seems worse
→ Check React DevTools for unexpected re-renders
→ Verify hooks are properly memoized

## 📚 Related Files

- `REACT_REFACTORING_GUIDE.md` – Complete refactoring strategy
- `apps/web/src/AppRefactored.tsx` – Reference implementation
- `apps/web/src/hooks/useEditorState.ts` – Editor state hook
- `apps/web/src/hooks/useDiagramRender.ts` – Render state hook

## ✅ Success Criteria

Week 2 is complete when:
- ✅ All components created and exported
- ✅ App.tsx integrates all components
- ✅ App builds without errors: `bun run build`
- ✅ Types check pass: `bun run check`
- ✅ Tests pass: `bun test`
- ✅ Manual testing complete
- ✅ Performance improved (fewer re-renders)

---

**Timeline**: 3-4 days (done when you complete the checklist)  
**Next Phase**: Week 3 - Performance & Testing  
**Estimated Code Changes**: ~400 lines refactored into components

