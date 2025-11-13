# ShadCn UI Migration Plan

## Overview
Complete migration of effect-mermaid web UI from custom components to ShadCn/UI components. This includes the main editor, theme builder sidebar, rendering settings panel, and all control components.

---

## Current UI Components Audit

### 1. **Layout Components** (Custom)
- **Container & Panels** - Custom CSS flexbox layout
  - `.container`, `.panel`, `.editor`, `.preview`
  - Status: Custom CSS, can be replaced with ShadCn patterns

### 2. **Button Components** (Custom + Partial ShadCn)
- **Custom buttons with variants**
  - `.btn`, `.btn-small`, `.btn-active`
  - Status: Replace with ShadCn Button component
  
### 3. **Form Controls** (Custom)
- **ColorPicker** - Color input + hex text input (custom)
- **NumberSlider** - Range slider (custom)
- **FontSizeSelect** - Select dropdown (custom)
- **StyleSelect** - Select dropdowns (custom)
- **ColorInput** - Color field (custom)
- Status: Replace with ShadCn Input, Select, and form components

### 4. **Sidebar Components** (Custom)
- **ThemeBuilderSidebar** - Theme management sidebar
  - Custom CSS animations (`.sidebar-open`, `.sidebar-closed`)
  - Custom form controls
  - Status: Replace with ShadCn Sheet + Form components

### 5. **Panel Components** (Custom)
- **RenderingSettingsPanel** - Settings sidebar with collapsible sections
  - Custom toggle button and animations
  - Custom collapsible sections
  - Status: Replace with ShadCn Sheet + Accordion components

### 6. **Editor Components** (Third-party + Custom)
- **CodeMirrorEditor** - Syntax highlighting (third-party, keep as-is)
- **Status:** Keep as-is, just style with ShadCn theme

### 7. **Data Display** (Custom)
- **Syntax Error Panel** - Error/warning list display
- **Diagram Error Display** - Error message box
- **Status:** Replace with ShadCn Alert component

### 8. **Dialog/Modal** (Partial ShadCn)
- **Dialog component** exists in `components/ui/`
- Status: Already present, used but may need expansion

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
- [ ] Install required ShadCn components via CLI
- [ ] Update color palette to match ShadCn standards (already done)
- [ ] Create custom form hook or wrapper for form controls
- [ ] Set up proper component file structure

**Components to install:**
```bash
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add input
bunx shadcn-ui@latest add select
bunx shadcn-ui@latest add slider
bunx shadcn-ui@latest add sheet
bunx shadcn-ui@latest add accordion
bunx shadcn-ui@latest add alert
bunx shadcn-ui@latest add form
bunx shadcn-ui@latest add label
bunx shadcn-ui@latest add separator
```

### Phase 2: Core Controls (Week 2)
- [ ] **ColorPicker** → ShadCn Input + custom color picker component
- [ ] **NumberSlider** → ShadCn Slider component
- [ ] **FontSizeSelect** → ShadCn Select component
- [ ] **StyleSelect** → ShadCn Select component
- [ ] **ColorInput** → ShadCn Input component

### Phase 3: Layout & Containers (Week 2-3)
- [ ] **App.tsx Layout** - Replace custom panel CSS with ShadCn layout patterns
  - Remove custom `.container`, `.panel` styles
  - Use CSS Grid/Flexbox with ShadCn spacing utilities
  
- [ ] **Panel Headers** - Replace with consistent header component
  - Create reusable `PanelHeader` component
  - Use ShadCn Button for toolbar actions

### Phase 4: Sidebar Panels (Week 3)
- [ ] **ThemeBuilderSidebar**
  - Replace custom sidebar with ShadCn `Sheet` component
  - Replace custom form controls with Phase 2 results
  - Replace custom toggle with ShadCn Button
  - Add ShadCn Form for theme editing

- [ ] **RenderingSettingsPanel**
  - Replace custom panel with ShadCn `Sheet` component
  - Replace collapsible sections with ShadCn `Accordion`
  - Replace custom toggle with ShadCn Button
  - Add ShadCn Form for settings

### Phase 5: Error & Data Display (Week 3-4)
- [ ] **Syntax Error Panel** → ShadCn Alert component
- [ ] **Diagram Error Display** → ShadCn Alert component
- [ ] **Loading State** → ShadCn Spinner/Skeleton (if available)

### Phase 6: Polish & Testing (Week 4)
- [ ] Dark mode testing and refinement
- [ ] Accessibility audit (keyboard nav, ARIA labels)
- [ ] Animation smoothness and transitions
- [ ] Component prop validation and TypeScript types
- [ ] Unit test updates for new components

---

## Detailed Component Migration Map

### Button Component
```
BEFORE: Custom .btn, .btn-small, .btn-active with inline styles
AFTER:  ShadCn Button with variants
  - size: "sm" | "default" | "lg"
  - variant: "default" | "outline" | "ghost" | "destructive"
```

### ColorPicker Component
```
BEFORE: Custom input with color picker + hex text input
AFTER:  
  - ShadCn Input for hex value
  - Native HTML <input type="color"> wrapped with ShadCn styling
  - Form validation with ShadCn Form
```

### NumberSlider Component
```
BEFORE: Custom <input type="range">
AFTER:  ShadCn Slider component with label
```

### Sidebar Components
```
BEFORE: Custom fixed positioning + custom CSS animations
AFTER:  ShadCn Sheet (Drawer) with smooth slide animation
  - Uses Radix UI primitives
  - Built-in overlay and close functionality
```

### Collapsible Sections
```
BEFORE: Custom toggle state + manual render logic
AFTER:  ShadCn Accordion component
  - Multiple items can expand/collapse
  - Smooth animations built-in
```

### Error Display
```
BEFORE: Custom styled div with inline styles
AFTER:  ShadCn Alert component
  - Variant: "default" | "destructive"
  - Built-in icon support (via Lucide)
```

---

## File Structure After Migration

```
apps/web/src/
├── components/
│   ├── ui/
│   │   ├── button.tsx          (ShadCn - Auto-installed)
│   │   ├── input.tsx           (ShadCn - Auto-installed)
│   │   ├── select.tsx          (ShadCn - Auto-installed)
│   │   ├── slider.tsx          (ShadCn - Auto-installed)
│   │   ├── sheet.tsx           (ShadCn - Auto-installed)
│   │   ├── accordion.tsx        (ShadCn - Auto-installed)
│   │   ├── alert.tsx           (ShadCn - Auto-installed)
│   │   ├── form.tsx            (ShadCn - Auto-installed)
│   │   ├── label.tsx           (ShadCn - Auto-installed)
│   │   ├── separator.tsx        (ShadCn - Auto-installed)
│   │   ├── dialog.tsx          (ShadCn - Existing)
│   │   ├── index.ts            (Updated exports)
│   │   └── examples.tsx        (Delete after migration)
│   ├── controls/
│   │   ├── ColorPicker.tsx      (Migrated to ShadCn)
│   │   ├── NumberSlider.tsx     (Migrated to ShadCn)
│   │   ├── FontSizeSelect.tsx   (Migrated to ShadCn)
│   │   ├── StyleSelect.tsx      (Migrated to ShadCn)
│   │   └── *.test.tsx           (Updated tests)
│   ├── CodeMirrorEditor.tsx     (Keep as-is, style with ShadCn)
│   ├── ColorInput.tsx           (Migrated to ShadCn Input)
│   ├── ThemeBuilderSidebar.tsx  (Migrated to Sheet + Accordion)
│   ├── RenderingSettingsPanel.tsx (Migrated to Sheet + Accordion)
│   └── (Delete RenderingSettingsPanel.css after migration)
├── styles/
│   ├── globals.css              (Already migrated)
│   ├── App.css                  (Refactor: remove custom panel styles)
│   ├── ThemeBuilderSidebar.css  (Delete after migration)
│   └── ColorPicker.css          (Delete after migration)
├── App.tsx                       (Update to use new components)
└── (Other files unchanged)
```

---

## CSS Cleanup

### Files to Delete/Merge
- `RenderingSettingsPanel.css` → Use ShadCn utility classes
- `ThemeBuilderSidebar.css` → Use ShadCn utility classes
- `ColorPicker.css` → Use ShadCn utility classes
- Custom button styles in `App.css` → Rely on ShadCn Button variants

### Files to Refactor
- `App.css` - Remove:
  - `.container`, `.panel`, `.editor`, `.preview` (replace with ShadCn patterns)
  - `.btn*` variants (use ShadCn Button)
  - Custom panel-header styling (use ShadCn consistent patterns)

---

## Testing Strategy

### Unit Tests
- Update component tests to use new ShadCn components
- Test form submissions with new form controls
- Test sheet open/close animations
- Test accordion expand/collapse behavior

### Integration Tests
- Verify sidebars work with main layout
- Test theme switching with new UI
- Test settings apply correctly
- Test error display in all scenarios

### Accessibility Tests
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility
- Focus management in modals/sheets
- Color contrast in both light and dark modes

### Visual Tests
- Dark mode appearance
- Responsive design (mobile, tablet, desktop)
- Animation smoothness
- Button hover/active states

---

## Success Criteria

- ✅ All custom CSS panels removed
- ✅ All form controls use ShadCn equivalents
- ✅ Dark mode works perfectly
- ✅ No console warnings or errors
- ✅ All tests pass
- ✅ Accessibility score improved
- ✅ Code duplication reduced by >50%
- ✅ File size reduced (fewer custom CSS files)
- ✅ Type safety improved with ShadCn types

---

## Dependencies Already Installed

✅ `clsx` - Class merging
✅ `tailwind-merge` - Utility merging
✅ `tailwindcss-animate` - Animation library
✅ `class-variance-authority` - Component variants
✅ `lucide-react` - Icons

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1: Install ShadCn components
3. Work through phases 2-6 sequentially
4. Create GitHub PRs for each phase
5. Test thoroughly before merging
