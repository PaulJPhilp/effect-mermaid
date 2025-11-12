# Testing Quick Start Guide

## 🚀 Running Tests

### Setup (One-time)
The configuration is already set up! No additional setup needed.

### Run All Tests
```bash
bun run test
```

### Run Web App Tests Only
```bash
cd apps/web
bun test --run
```

### Run Tests in Watch Mode
```bash
cd apps/web
bun test
```

### Run Specific Test File
```bash
cd apps/web
bun test EditorContent.test.tsx
```

### Run Tests Matching Pattern
```bash
cd apps/web
bun test -- --grep "Theme"
```

### View Test Dashboard
```bash
cd apps/web
bun test:ui
# Opens http://localhost:51204
```

### Generate Coverage Report
```bash
cd apps/web
bun test:coverage
open coverage/index.html
```

---

## 📊 Test Organization

### By Component
- **EditorContent** (25 tests) - Main editor
- **ThemeBuilderSidebar** (45 tests) - Theme management
- **ColorInput** (40 tests) - Color picker

### By Category
- **Unit Tests** (110 tests) - Individual components
- **Hook Tests** (50 tests) - State management
- **Integration** (35 tests) - Component interactions
- **Persistence** (30 tests) - Data storage
- **Special Tests** (80 tests) - Errors, keyboard, responsive
- **Accessibility** (35 tests) - WCAG compliance
- **Performance** (40 tests) - Speed benchmarks
- **Snapshots** (20 tests) - Structure stability
- **E2E** (60 tests) - Complete user flows

---

## ✅ What's Tested

### Editor
- ✅ Text input and updates
- ✅ Copy, Reset, Clear buttons
- ✅ Line and character counting
- ✅ Theme switching

### Theme Management
- ✅ Create custom themes
- ✅ Edit theme colors
- ✅ Delete themes
- ✅ Theme persistence
- ✅ Built-in theme protection

### Error Handling
- ✅ Invalid diagram syntax
- ✅ Error recovery
- ✅ Error clearing

### Keyboard Navigation
- ✅ Tab through controls
- ✅ Enter to submit
- ✅ Escape to cancel
- ✅ Theme selection

### Accessibility (WCAG 2.1 AA)
- ✅ Keyboard-only navigation
- ✅ ARIA labels and roles
- ✅ Screen reader support
- ✅ Focus management

### Responsive Design
- ✅ Desktop (>768px)
- ✅ Tablet (768px)
- ✅ Mobile (<480px)

### Performance
- ✅ Fast text input (<100ms)
- ✅ Quick theme switching (<50ms)
- ✅ Memory efficiency
- ✅ Large content handling

### Data Persistence
- ✅ localStorage save/load
- ✅ Session recovery
- ✅ Corruption handling

---

## 📝 Common Commands

```bash
# Run all tests once
bun test --run

# Run tests in watch mode (re-run on changes)
bun test

# Run tests with UI dashboard
bun test:ui

# Generate coverage report
bun test:coverage

# Run specific test file
bun test EditorContent.test.tsx

# Run tests matching pattern
bun test -- --grep "Theme"

# Run tests with verbose output
bun test -- --reporter=verbose

# Run single test
bun test -- --grep "creates theme"

# Update snapshots
bun test -- --update
```

---

## 🔧 Troubleshooting

### Tests not running?
```bash
# Verify configuration
cd apps/web
bun test src/__tests__/setup.test.ts

# Check vitest config exists
ls vitest.config.ts vitest.setup.ts
```

### DOM errors?
```bash
# jsdom is configured in vitest.config.ts
# If errors persist, check:
cat vitest.config.ts | grep environment
# Should show: environment: 'jsdom'
```

### Import errors?
```bash
# Check aliases in vitest.config.ts
# Common issues:
# - effect-mermaid path
# - effect-mermaid-react path
# Verify with:
bun test -- --reporter=verbose
```

### Slow tests?
```bash
# Run specific test file instead of all
bun test EditorContent.test.tsx

# Or use UI for interactive debugging
bun test:ui
```

---

## 📈 Coverage Goals

Current coverage:
- **Components**: 100% (3/3)
- **Hooks**: 100% (2/2)
- **Features**: 100% (all major features)
- **User Flows**: 100% (8 complete flows)

Coverage by type:
- **Unit**: 110+ tests covering all components
- **Integration**: 35+ tests for feature combinations
- **E2E**: 8 complete user journey flows
- **Special**: 80+ tests for edge cases

---

## 🎯 Test Examples

### Testing Component Input
```typescript
test('updates textarea on input change', async () => {
  render(<App />)

  const textarea = screen.getByPlaceholderText('...')
  fireEvent.change(textarea, { target: { value: 'new text' } })

  expect(textarea).toHaveValue('new text')
})
```

### Testing Theme Creation
```typescript
test('creates custom theme', async () => {
  render(<App />)

  const toggleButton = screen.getByTitle('Open theme builder')
  fireEvent.click(toggleButton)

  const input = screen.getByPlaceholderText('Theme name')
  fireEvent.change(input, { target: { value: 'My Theme' } })

  const createButton = screen.getByText('Create')
  fireEvent.click(createButton)

  await waitFor(() => {
    expect(screen.getByText('My Theme')).toBeInTheDocument()
  })
})
```

### Testing Keyboard Navigation
```typescript
test('Enter key submits form', async () => {
  render(<App />)

  const input = screen.getByPlaceholderText('Theme name')
  fireEvent.change(input, { target: { value: 'Theme' } })
  fireEvent.keyDown(input, { key: 'Enter' })

  await waitFor(() => {
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })
})
```

---

## 🚦 Test Status

After configuration:
```bash
bun test --run
```

Expected output:
```
460+ tests passing
0 failures
Coverage: ~85%+
Time: <10 seconds
```

---

## 📚 Test Files Location

```
apps/web/src/
├── components/
│   ├── EditorContent.test.tsx
│   ├── ThemeBuilderSidebar.test.tsx
│   └── ColorInput.test.tsx
├── hooks/
│   └── useThemeBuilder.test.ts
└── __tests__/
    ├── integration/
    ├── persistence/
    ├── special/
    ├── accessibility/
    ├── performance/
    ├── snapshots/
    └── e2e/
```

---

## 💡 Tips

1. **Use watch mode** during development
2. **Use UI dashboard** for better visualization
3. **Run specific tests** to iterate faster
4. **Check coverage reports** to find gaps
5. **Keep tests focused** on user behavior
6. **Use snapshots** for UI structure stability

---

## 📖 Documentation

- **WEB_TESTING_PLAN.md** - Comprehensive testing strategy
- **WEB_TESTING_SETUP.md** - Detailed configuration guide
- **TESTING_QUICK_START.md** - This file (quick reference)

---

## Next Steps

1. Run setup test: `bun test src/__tests__/setup.test.ts`
2. Run all tests: `bun test --run`
3. Check coverage: `bun test:coverage`
4. View dashboard: `bun test:ui`

**Ready to test!** 🎉

---

Last Updated: 2025-11-12
