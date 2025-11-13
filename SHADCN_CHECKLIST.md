# ShadCn Migration Checklist

Use this checklist to track progress through each phase of the migration.

---

## Phase 1: Foundation & Setup ⚙️

- [ ] Create feature branch `feat/shadcn-phase-1`
- [ ] Install ShadCn components:
  - [ ] `bunx shadcn-ui@latest add button`
  - [ ] `bunx shadcn-ui@latest add input`
  - [ ] `bunx shadcn-ui@latest add label`
  - [ ] `bunx shadcn-ui@latest add select`
  - [ ] `bunx shadcn-ui@latest add slider`
  - [ ] `bunx shadcn-ui@latest add sheet`
  - [ ] `bunx shadcn-ui@latest add accordion`
  - [ ] `bunx shadcn-ui@latest add alert`
  - [ ] `bunx shadcn-ui@latest add form`
  - [ ] `bunx shadcn-ui@latest add separator`
- [ ] Verify all components installed in `components/ui/`
- [ ] Update `components/ui/index.ts` with new exports
- [ ] Run `bun run dev` - no errors
- [ ] Create PR and get approval
- [ ] Merge to main

**Estimated Time:** 2-4 hours

---

## Phase 2: Migrate Form Controls 🎛️

### ColorPicker Component
- [ ] Create feature branch `feat/shadcn-phase-2-colorpicker`
- [ ] Update imports in ColorPicker.tsx
- [ ] Replace custom CSS with Tailwind utilities
- [ ] Use Input component for hex value
- [ ] Keep native `<input type="color">`
- [ ] Update ColorPicker.test.tsx
- [ ] Test in browser (light + dark mode)
- [ ] Delete ColorPicker.css
- [ ] Commit and create PR

### NumberSlider Component
- [ ] Create feature branch `feat/shadcn-phase-2-slider`
- [ ] Import Slider component
- [ ] Update NumberSlider.tsx
- [ ] Replace custom `<input type="range">`
- [ ] Add Label component
- [ ] Update NumberSlider.test.tsx
- [ ] Test range input functionality
- [ ] Commit and create PR

### FontSizeSelect Component
- [ ] Create feature branch `feat/shadcn-phase-2-fontsize`
- [ ] Import Select components
- [ ] Update FontSizeSelect.tsx
- [ ] Replace custom `<select>` with Select
- [ ] Test dropdown opens/closes
- [ ] Update tests
- [ ] Commit and create PR

### StyleSelect Component
- [ ] Create feature branch `feat/shadcn-phase-2-styleselect`
- [ ] Import Select components
- [ ] Update StyleSelect.tsx for all select dropdowns
- [ ] Replace custom `<select>` elements
- [ ] Test all 3 selectors (line style, curve, font family)
- [ ] Update StyleSelect.test.tsx
- [ ] Commit and create PR

### ColorInput Component
- [ ] Create feature branch `feat/shadcn-phase-2-colorinput`
- [ ] Import Input and Label components
- [ ] Update ColorInput.tsx
- [ ] Replace custom implementation
- [ ] Test color input in theme builder
- [ ] Commit and create PR

**Phase 2 Validation:**
- [ ] All form controls work in browser
- [ ] All tests pass: `bun run test`
- [ ] No console errors or warnings
- [ ] Dark mode works for all controls
- [ ] Keyboard navigation works

**Estimated Time:** 3-5 days

---

## Phase 3: Refactor Main Layout 📐

### App.tsx Layout
- [ ] Create feature branch `feat/shadcn-phase-3-layout`
- [ ] Analyze current App.css `.container`, `.panel` styles
- [ ] Replace with Tailwind grid/flex utilities
- [ ] Update main content div layout
- [ ] Remove custom `.editor` and `.preview` styles
- [ ] Update margin calculations for sidebars
- [ ] Test responsive layout (desktop, tablet, mobile)

### Panel Headers
- [ ] Create reusable PanelHeader component (optional)
- [ ] Update "Diagram Code" panel header
- [ ] Update "Diagram Preview" panel header
- [ ] Use consistent spacing with ShadCn patterns
- [ ] Test header button alignment

### App.css Cleanup
- [ ] Remove `.container`, `.panel`, `.editor`, `.preview` classes
- [ ] Remove `.btn`, `.btn-small`, `.btn-active` classes (use Button component)
- [ ] Keep only essential styles (animations, custom layouts)
- [ ] Verify all Tailwind utilities work as expected

### Testing
- [ ] Run `bun run dev` and check layout
- [ ] Test sidebar collapse/expand
- [ ] Test responsive breakpoints
- [ ] Check all buttons work
- [ ] Verify error display still works
- [ ] Run tests: `bun run test`

**Estimated Time:** 2-3 days

---

## Phase 4: Migrate Sidebars 📊

### ThemeBuilderSidebar
- [ ] Create feature branch `feat/shadcn-phase-4-theme-sidebar`
- [ ] Import Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
- [ ] Replace custom sidebar div with Sheet component
- [ ] Update toggle button to use Button + SheetTrigger
- [ ] Move form controls inside SheetContent
- [ ] Use Button components for action buttons (Create, Edit, Delete, Save)
- [ ] Add Separator between sections (optional)
- [ ] Test sidebar open/close animation
- [ ] Update ThemeBuilderSidebar.test.tsx
- [ ] Delete ThemeBuilderSidebar.css
- [ ] Test theme switching
- [ ] Test all theme operations (create, edit, delete)

### RenderingSettingsPanel
- [ ] Create feature branch `feat/shadcn-phase-4-settings-sidebar`
- [ ] Import Sheet, SheetContent, SheetHeader, SheetTitle
- [ ] Import Accordion, AccordionContent, AccordionItem, AccordionTrigger
- [ ] Replace custom panel with Sheet component
- [ ] Replace collapsible sections with Accordion
- [ ] Convert expandedSections state to accordion value
- [ ] Update toggle button
- [ ] Use Button components for Preset/Reset/Export buttons
- [ ] Add form controls in each accordion section
- [ ] Test accordion expand/collapse
- [ ] Update RenderingSettingsPanel.test.tsx
- [ ] Delete RenderingSettingsPanel.css
- [ ] Test all settings controls
- [ ] Test presets work correctly

### Sidebar Interactions
- [ ] Test sidebar can't scroll body behind it
- [ ] Test close button works
- [ ] Test overlay click closes sidebar
- [ ] Test Escape key closes sidebar
- [ ] Test keyboard focus management
- [ ] Test mobile responsiveness

**Estimated Time:** 3-4 days

---

## Phase 5: Replace Error & Display Components ⚠️

### Syntax Error Panel
- [ ] Create feature branch `feat/shadcn-phase-5-errors`
- [ ] Replace custom error display with Alert component
- [ ] Use Alert variant="destructive" for errors
- [ ] Add warning variant for diagnostics
- [ ] Update styling to match ShadCn design
- [ ] Test error display in App.tsx
- [ ] Test dismiss button functionality

### Diagram Error Display
- [ ] Replace inline error styling with Alert
- [ ] Update error message formatting
- [ ] Test error display on invalid diagrams
- [ ] Test dismiss button

### Loading State (if needed)
- [ ] Check if Skeleton component needed
- [ ] Update loading spinner styling if applicable

### Cleanup
- [ ] Verify no custom error CSS remains
- [ ] Check all error paths in code
- [ ] Update any related tests

**Estimated Time:** 1-2 days

---

## Phase 6: Polish & Testing 🎨

### Dark Mode
- [ ] Add dark mode toggle to UI (if not present)
- [ ] Test all components in dark mode:
  - [ ] Buttons
  - [ ] Form controls
  - [ ] Sidebars
  - [ ] Error displays
  - [ ] Main layout
- [ ] Check color contrast (WCAG AA)
- [ ] Verify CSS variables work correctly
- [ ] Test theme switching speed

### Accessibility
- [ ] Install axe DevTools browser extension
- [ ] Run accessibility audit on main page
- [ ] Fix any WCAG violations
- [ ] Test keyboard navigation:
  - [ ] Tab through all controls
  - [ ] Enter to activate buttons
  - [ ] Escape to close sidebars
  - [ ] Arrow keys in selects/sliders
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check focus indicators visible
- [ ] Verify ARIA labels present

### Performance
- [ ] Run Lighthouse audit: `bun run build` then audit
- [ ] Check animation smoothness (60fps)
- [ ] Verify no layout thrashing
- [ ] Check bundle size (should be smaller)
- [ ] Test on low-end device/connection

### Testing
- [ ] Run all unit tests: `bun run test`
- [ ] Run coverage: `bun run test:coverage`
- [ ] Update tests for new components
- [ ] Add tests for new functionality
- [ ] Check no test files have .skip or .only
- [ ] Run integration tests manually

### Code Quality
- [ ] Run type check: `bun run check`
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] No unused imports
- [ ] Remove any leftover console.log statements

### Documentation
- [ ] Update SHADCN_MIGRATION_PLAN.md with completion
- [ ] Add comments to complex component logic
- [ ] Update component prop documentation
- [ ] Create/update Storybook if applicable

### Final Cleanup
- [ ] Delete all custom CSS files:
  - [ ] RenderingSettingsPanel.css
  - [ ] ThemeBuilderSidebar.css
  - [ ] ColorPicker.css
  - [ ] Any other custom CSS
- [ ] Review App.css for remaining custom styles
- [ ] Check no dead code remains
- [ ] Verify git history is clean

**Estimated Time:** 3-5 days

---

## Final Validation ✅

Run this checklist before merging to main:

### Functionality
- [ ] All buttons clickable and functional
- [ ] All form controls accept input
- [ ] Theme switching works
- [ ] Settings apply correctly
- [ ] Error messages display properly
- [ ] Diagram renders correctly
- [ ] Sidebars open/close smoothly
- [ ] No JavaScript errors in console

### Responsive Design
- [ ] Desktop (1920x1080) - full layout
- [ ] Laptop (1440x900) - layout adjusts
- [ ] Tablet (768x1024) - sidebars collapse
- [ ] Mobile (375x667) - mobile-friendly layout

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)

### Performance
- [ ] Page loads in <2s
- [ ] Interactions feel responsive
- [ ] No jank or stuttering
- [ ] Animations smooth (60fps)

### Accessibility
- [ ] Lighthouse score > 90
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Focus indicators visible

### Testing
- [ ] All unit tests pass
- [ ] No test warnings
- [ ] Coverage maintained or improved
- [ ] Integration tests pass

---

## Rollback Plan 🔄

If something breaks during a phase:

1. **Stop work** - Don't continue until issue resolved
2. **Identify issue** - Check console, test output
3. **Two options:**
   - **Quick fix** - If issue is minor (styling, prop typo)
   - **Rollback** - If issue is major (component incompatibility)
4. **Rollback command:**
   ```bash
   git reset --hard HEAD~1
   git push origin <branch> --force
   ```
5. **Re-plan** - Discuss issue with team before continuing

---

## Estimated Timeline

| Phase | Days | Status |
|-------|------|--------|
| 1: Foundation | 0.5 | ⬜ Todo |
| 2: Form Controls | 4 | ⬜ Todo |
| 3: Layout | 2 | ⬜ Todo |
| 4: Sidebars | 3 | ⬜ Todo |
| 5: Error Display | 1 | ⬜ Todo |
| 6: Polish & Test | 3 | ⬜ Todo |
| **Total** | **~13 days** | |

---

## Notes

- Keep each PR focused on one component/phase
- Request code review for each PR
- Don't merge until all checks pass
- Update this checklist as you progress
- Document any issues or learnings
- Celebrate each successful phase! 🎉

---

**Progress Summary**

```
Phase 1: ⬜ Not Started
Phase 2: ⬜ Not Started
Phase 3: ⬜ Not Started
Phase 4: ⬜ Not Started
Phase 5: ⬜ Not Started
Phase 6: ⬜ Not Started

Overall: 0 / 6 phases complete
```

Update this as you complete each phase!
