# Web Application Architecture Diagram

## Current Component Hierarchy

```
App (MermaidProvider)
├── MermaidProvider (React Context Provider)
│   └── EditorContent
│       ├── Theme State Management
│       │   ├── code: string (diagram code)
│       │   ├── theme: 'default' | 'dark' | 'forest' | 'neutral' | custom
│       │   ├── availableThemes: string[]
│       │   ├── registrationError: string | null
│       │   └── diagramError: Error | null
│       │
│       └── UI Layout (Two Panels)
│           ├── Panel: Editor (Left)
│           │   ├── PanelHeader
│           │   │   ├── h2: "Diagram Code"
│           │   │   └── Toolbar
│           │   │       ├── Copy Button
│           │   │       ├── Reset Button
│           │   │       └── Clear Button
│           │   ├── EditorWrapper
│           │   │   ├── textarea (code input)
│           │   │   └── EditorStatus (line/char count)
│           │   └── [Mobile: Full width below]
│           │
│           └── Panel: Preview (Right)
│               ├── PanelHeader
│               │   ├── h2: "Diagram Preview"
│               │   ├── Toolbar (Theme Selector)
│               │   │   └── Button per available theme (dynamic)
│               │   │       └── Active theme highlighted
│               │   └── Error message (if registrationError)
│               │
│               ├── DiagramContainer
│               │   ├── ErrorDisplay (if diagramError)
│               │   │   ├── Error message
│               │   │   └── Dismiss button
│               │   │
│               │   └── MermaidDiagram
│               │       ├── Props:
│               │       │   ├── diagram: code
│               │       │   ├── config: { theme }
│               │       │   └── onError: handler
│               │       └── Renders: SVG from Mermaid.js
│               │
│               └── [Mobile: Full width below editor]
```

## Service Architecture

```
React Application
│
├── MermaidProvider (initialization)
│   ├── Creates: Effect Layer
│   │   ├── Layer.merge(
│   │   │   ├── ThemeRegistry.Default
│   │   │   └── BrowserMermaid.Default
│   │   └── )
│   │
│   ├── State Management (via useState/useContext)
│   │   ├── layer: Effect.Layer<...>
│   │   └── isInitialized: boolean
│   │
│   └── Hooks for children
│       ├── useMermaidInitialized() → boolean
│       └── useMermaidLayer() → Effect.Layer
│
└── EditorContent
    │
    ├── useEffect (Theme Registration)
    │   └── Effect.runPromise(
    │       Effect.gen(function* () {
    │           const registry = yield* ThemeRegistry;
    │           for (theme in CUSTOM_THEMES)
    │               yield* registry.registerTheme(name, config);
    │           const themes = yield* registry.listThemes();
    │           return themes;
    │       }).pipe(Effect.provide(mermaidLayer))
    │   )
    │
    └── Theme State
        ├── Read from:
        │   ├── availableThemes (from registry.listThemes())
        │   └── Built-in: ['default', 'dark', 'forest', 'neutral']
        │
        └── Write to:
            └── MermaidDiagram via config={ theme }
```

## Data Flow: Theme Selection

```
User selects theme
    ↓
setTheme(selectedTheme)  [state update]
    ↓
Re-render EditorContent
    ↓
MermaidDiagram receives: config={{ theme: selectedTheme }}
    ↓
BrowserMermaid service (via ThemeRegistry.getTheme(theme))
    ↓
Mermaid.js renders diagram with theme colors
    ↓
SVG displayed in preview panel
```

## Data Flow: Custom Theme Registration

```
App mounts (useEffect)
    ↓
For each CUSTOM_THEME in hardcoded list:
    ├── registry.registerTheme(name, { colors: {...} })
    └── Theme stored in ThemeRegistry Map
    ↓
registry.listThemes() returns all themes
    ↓
availableThemes state updated
    ↓
Theme selector buttons regenerated
    ↓
User can switch to custom themes
```

## CSS Variables (App Theming - Not Diagram Theming)

```
styles/index.css (Global)
    ├── --color-primary: #3b82f6 (Button active states)
    ├── --color-bg: #ffffff (Editor/preview background)
    ├── --color-border: #e5e7eb (Panel borders)
    ├── --color-text: #1f2937 (Editor text)
    └── ... (9 more variables for UI)

App.css (Component styling)
    ├── .container { display: flex; background: var(--color-bg); }
    ├── .panel { ... uses --color-* variables ... }
    ├── .btn { ... uses --color-* variables ... }
    └── ... (more component styles)

Note: These are SEPARATE from Mermaid diagram themes!
- App CSS variables: Control UI appearance (editor, buttons, panels)
- Diagram themes: Control Mermaid.js rendering (shapes, colors, text)
```

## Current Color Properties (Diagram Themes)

```
Each theme (built-in or custom) defines:
├── name: string
├── description: optional string
└── colors: {
    ├── background: color
    ├── primaryColor: color
    ├── primaryTextColor: color
    ├── primaryBorderColor: color
    ├── secondaryColor: color
    ├── secondaryTextColor: color
    ├── secondaryBorderColor: color
    ├── tertiaryColor: color
    ├── tertiaryTextColor: color
    ├── tertiaryBorderColor: color
    └── lineColor: color (used for connectors)
    
    Plus optional:
    └── textColor: color
}

Color Format: hex, rgb, or numeric (e.g., "#ff0000", "rgb(255,0,0)", 0xff0000)
```

## Error Handling

```
Theme Registration Errors:
├── DuplicateThemeError
│   └── Triggered when: registerTheme(name) and name already exists
│
├── InvalidThemeError
│   └── Triggered when: theme fails Schema validation
│       (missing required fields, invalid color format, etc.)
│
└── ThemeNotFoundError
    └── Triggered when: getTheme(name) and name doesn't exist

Diagram Rendering Errors:
├── Caught by onError handler in MermaidDiagram
├── Set diagramError state
└── Displayed in red box above diagram
```

## Mobile Responsive Behavior

```
Desktop (>768px):
├── Horizontal split
├── Editor (left 50%) | Preview (right 50%)
└── Theme buttons on one line

Mobile (<768px):
├── Vertical stack
├── Editor (full width)
├── Preview (full width below)
├── Theme buttons wrap to multiple lines
└── Sidebar (if added) collapses to overlay or bottom sheet
```

## Data Sources

### Built-in Themes (4 themes)
Location: `packages/core/src/services/themeRegistry/built-in-themes.ts`
- default (minimal)
- dark (dark mode)
- forest (Nord palette)
- neutral (grayscale)

### Custom Themes (2 themes hardcoded)
Location: `apps/web/src/App.tsx` (lines 15-40)
- corporate-blue
- tech-green

### Theme Service
Location: `packages/core/src/services/themeRegistry/service.ts`
Methods:
- registerTheme(name, theme): Effect
- getTheme(name): Effect
- listThemes(): Effect

### Browser Mermaid Service
Location: `packages/react/src/services/mermaid/service.ts`
Renders diagrams to SVG using Mermaid.js library
```

## Proposed Sidebar Architecture (Future)

```
Current: Editor | Preview

Proposed: Editor | Preview/ThemeBuilderSidebar

ThemeBuilderSidebar (NEW)
├── ThemeSelector
│   ├── Dropdown or buttons to select theme
│   └── Create/Delete theme buttons
│
├── ThemeColorPicker (NEW)
│   ├── For each color property:
│   │   ├── Label: "Primary Color"
│   │   ├── Color input (HTML5 + custom picker)
│   │   └── Real-time preview in diagram
│   │
│   └── Validation: Schema from effect-mermaid/core
│
├── ThemePropertyGuide (NEW)
│   ├── Visual legend
│   ├── Icons showing what each color controls
│   └── Tooltip/expandable details
│
└── Export/Import (FUTURE)
    ├── Export theme as JSON
    └── Import theme from JSON
```

## Integration Points

```
1. ThemeRegistry.registerTheme()
   Location: packages/core/src/services/themeRegistry/service.ts
   Used by: EditorContent useEffect, useThemeBuilder hook (future)

2. ThemeRegistry.listThemes()
   Location: packages/core/src/services/themeRegistry/service.ts
   Used by: EditorContent useEffect to populate availableThemes

3. MermaidDiagram component
   Location: packages/react/src/components/MermaidDiagram.tsx
   Props: diagram (code), config ({ theme }), onError (handler)
   Uses: BrowserMermaid service to render SVG

4. useMermaidLayer hook
   Location: packages/react/src/components/MermaidProvider.tsx
   Returns: Effect.Layer<BrowserMermaid | ThemeRegistry>
   Used by: EditorContent for Effect.gen blocks

5. useMermaidInitialized hook
   Location: packages/react/src/components/MermaidProvider.tsx
   Returns: boolean
   Used by: EditorContent to show/hide loading spinner
```
