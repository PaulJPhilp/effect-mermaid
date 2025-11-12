# Effect-Mermaid Web App Architecture Analysis

## Current App Architecture

### Directory Structure
```
apps/web/
├── index.html                 # Entry point
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite bundler config
└── src/
    ├── main.tsx             # React DOM render
    ├── App.tsx              # Main app component (235 lines)
    ├── App.css              # App styling
    └── styles/
        └── index.css        # Global CSS with CSS variables
```

### Key Technologies
- **Framework**: React 18
- **Bundler**: Vite (configured for HMR in dev)
- **Styling**: Plain CSS with CSS custom properties (variables)
- **Language**: TypeScript (strict mode)
- **Services**: Effect.js for dependency injection

### CSS Architecture
Uses CSS custom properties (variables) for theming:
```css
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #1e40af;
  --color-bg: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  --color-error: #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
}
```

---

## How Themes Are Currently Being Used

### 1. Built-in Themes (4 themes)
Located in: `/packages/core/src/services/themeRegistry/built-in-themes.ts`

- **default**: Empty theme (uses Mermaid defaults)
- **dark**: Dark background with light text (#333 bg, #fff text)
- **forest**: Nord palette (#2e3440 bg, #d8dee9 text)
- **neutral**: Grayscale (#f5f5f5 bg, #000 text)

Each theme defines 10 color properties:
- `background`, `primaryColor`, `secondaryColor`
- `primaryTextColor`, `secondaryTextColor`, `tertiaryTextColor`
- `primaryBorderColor`, `secondaryBorderColor`, `tertiaryBorderColor`
- `lineColor`, `textColor`

### 2. Custom Themes (App.tsx)
Currently hardcoded in App.tsx (lines 15-40):
```typescript
const CUSTOM_THEMES = {
  'corporate-blue': { ... 10 color properties ... },
  'tech-green': { ... 10 color properties ... }
}
```

### 3. ThemeRegistry Service
Location: `/packages/core/src/services/themeRegistry/service.ts`

**API Methods**:
- `registerTheme(name: string, theme: DiagramTheme)` - Register custom theme
- `getTheme(name: string)` - Retrieve theme config
- `listThemes()` - List all available themes

**Error Types**:
- `DuplicateThemeError` - Theme name already registered
- `InvalidThemeError` - Theme fails validation
- `ThemeNotFoundError` - Theme doesn't exist

**Usage Pattern** (current App.tsx, lines 57-90):
```typescript
const result = await Effect.runPromise(
  Effect.gen(function* () {
    const registry = yield* ThemeRegistry;
    
    // Register custom themes
    for (const [themeName, themeConfig] of Object.entries(CUSTOM_THEMES)) {
      yield* registry.registerTheme(themeName, { colors: themeConfig });
    }
    
    // Get all available themes
    const themes = yield* registry.listThemes();
    return themes;
  }).pipe(Effect.provide(mermaidLayer as any))
);
```

### 4. Theme Application
In App.tsx (line 219):
```typescript
<MermaidDiagram
  diagram={code}
  config={theme !== 'default' ? { theme } : {}}
  onError={(error) => { ... }}
/>
```

The `theme` prop is passed via MermaidConfig to the Mermaid.js rendering engine.

---

## Current UI Layout

### Two-Panel Split Design
1. **Left Panel (Editor)**
   - Title: "Diagram Code"
   - Textarea for Mermaid syntax input
   - Status bar showing line and character count
   - Toolbar with: Copy, Reset, Clear buttons
   - Responsive: stacks vertically on mobile (<768px)

2. **Right Panel (Preview)**
   - Title: "Diagram Preview"
   - Dynamic theme selector buttons (generated from available themes)
   - Error display (if diagram fails to render)
   - Diagram container with MermaidDiagram component
   - Responsive: stacks vertically on mobile

### Theme Selector
- Button per available theme (lines 166-176)
- Active theme highlighted with `btn-active` class (blue background)
- Theme names converted to title case (e.g., "corporate-blue" → "Corporate Blue")

---

## What Needs to Be Added for a Theme Builder

### Missing Features
1. **Visual Color Picker Interface**
   - No UI to edit colors without code
   - Currently requires hardcoding in App.tsx

2. **Theme Creation/Editing**
   - Cannot create new themes in the UI
   - Cannot modify existing custom themes
   - Cannot persist themes (no localStorage integration)

3. **Theme Preview/Comparison**
   - Only shows active theme
   - No way to preview color changes in real-time
   - No side-by-side theme comparison

4. **Color Properties Visibility**
   - 11 color properties available, but unclear which applies where
   - No visual guide showing what each color controls

5. **Theme Export/Import**
   - Cannot export custom themes for reuse
   - Cannot import themes from JSON

6. **Theme Persistence**
   - Custom themes lost on page reload
   - No localStorage or database integration

### Available Color Properties for Themes
```
primaryColor, primaryTextColor, primaryBorderColor,
secondaryColor, secondaryTextColor, secondaryBorderColor,
tertiaryColor, tertiaryTextColor, tertiaryBorderColor,
background, lineColor, textColor
```

---

## Recommended Location for Theme Builder Component

### Recommended Architecture

#### Option 1: New Panel (Preferred - Aligns with Current Design)
```
apps/web/src/
├── components/
│   ├── EditorPanel.tsx       # Extract left panel
│   ├── PreviewPanel.tsx      # Extract right panel
│   ├── ThemeBuilderPanel.tsx # NEW - Theme builder
│   └── ThemeColorPicker.tsx  # NEW - Color picker component
├── hooks/
│   └── useThemeBuilder.ts    # NEW - Theme management logic
└── App.tsx                   # Refactored to use components
```

**Layout**: Add a third vertical panel or toggle to switch between Preview and ThemeBuilder
- Desktop: Three-column layout (Editor | Preview/ThemeBuilder toggle)
- Mobile: Stack with tabs for Preview vs ThemeBuilder

#### Option 2: Modal Dialog
```
apps/web/src/
├── components/
│   ├── ThemeBuilderModal.tsx # NEW - Modal for theme editing
│   └── ThemeColorPicker.tsx  # NEW - Color picker
└── App.tsx                   # Add "Theme Builder" button
```

**Layout**: Add "Edit Theme" button in preview panel header
- Modal slides in over preview
- Good for focusing on theme editing without losing diagram context

#### Option 3: Sidebar (Modern Approach)
```
apps/web/src/
├── components/
│   ├── ThemeBuilderSidebar.tsx # NEW - Collapsible sidebar
│   ├── ThemeColorPicker.tsx
│   └── ThemePropertyGuide.tsx   # NEW - Visual guide
└── App.tsx                       # Add sidebar layout
```

**Layout**: Collapsible right sidebar for theme editing
- Click theme selector → sidebar opens with color picker
- Shows visual guide of what each color controls
- Diagram updates in real-time as colors change

### Recommended Choice: **Option 3 (Sidebar)**

**Why**:
1. **Non-destructive**: Keeps diagram visible while editing theme
2. **Real-time feedback**: See changes instantly in diagram
3. **Mobile-friendly**: Sidebar collapses on small screens
4. **Scalable**: Easy to add color picker library, export/import, etc.
5. **Aligns with modern UI patterns**: Similar to design tools (Figma, etc.)

### Implementation Components Needed

1. **ThemeBuilderSidebar.tsx**
   - Host container for theme building UI
   - Manages open/closed state
   - Responsive collapse on mobile

2. **ThemeColorPicker.tsx**
   - Individual color input for each property
   - Support hex, rgb, or color picker widget
   - Real-time validation using Schema from effect-mermaid/core

3. **ThemePropertyGuide.tsx**
   - Visual legend showing what each color controls
   - Small diagram snippets demonstrating each property
   - Tooltip or expandable descriptions

4. **useThemeBuilder Hook**
   - State management: editing theme, available themes, custom themes
   - Effects to sync with ThemeRegistry
   - localStorage integration for persistence
   - Methods: createTheme, updateTheme, deleteTheme, exportTheme

5. **Theme API Integration**
   - Use existing ThemeRegistry.registerTheme()
   - Add error handling for DuplicateThemeError, InvalidThemeError
   - Handle theme persistence (localStorage + ThemeRegistry sync)

### Integration Points with Existing Code

1. **ThemeRegistry Service**
   - Already handles: registerTheme, getTheme, listThemes
   - Hook will wrap these with Effect.runPromise calls

2. **App.tsx Changes**
   - Move CUSTOM_THEMES to useThemeBuilder state
   - Add sidebar toggle button
   - Pass setTheme callback to sidebar component
   - Keep current editor/preview panels

3. **CSS Updates**
   - Add --sidebar-width variable (300-400px)
   - Add responsive breakpoints for sidebar collapse
   - Ensure ThemeRegistry CSS variables don't conflict

### Color Picker Library Options

Best options for React:
1. **react-color** (React Color) - Popular, many picker styles
2. **react-colorful** - Lightweight, TypeScript-first
3. **tinycolor2** - Pure color manipulation (no UI)
4. **Native HTML5 input[type="color"]** - Built-in, simplest

**Recommendation**: `react-colorful` - Small, TypeScript-friendly, no dependencies

---

## Summary

### Current State
- Clean two-panel editor/preview layout
- 4 built-in themes + 2 hardcoded custom themes
- ThemeRegistry service fully functional
- Theme switching works end-to-end
- CSS uses variables for app theming (separate from diagram themes)

### What's Missing
- No UI for creating/editing themes
- No color picker
- No theme persistence
- No export/import

### Recommended Next Steps
1. Create sidebar component structure
2. Build color picker UI with react-colorful
3. Create useThemeBuilder hook with localStorage support
4. Integrate with existing ThemeRegistry service
5. Add visual guide component explaining color properties
6. Test persistence and error handling

### Files to Create
```
apps/web/src/components/ThemeBuilderSidebar.tsx
apps/web/src/components/ThemeColorPicker.tsx
apps/web/src/components/ThemePropertyGuide.tsx
apps/web/src/hooks/useThemeBuilder.ts
```

### Files to Modify
```
apps/web/src/App.tsx           # Add sidebar, integrate hook
apps/web/src/App.css           # Add sidebar styles
apps/web/package.json          # Add react-colorful dependency
```
