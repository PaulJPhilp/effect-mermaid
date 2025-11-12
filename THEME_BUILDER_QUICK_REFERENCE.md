# Theme Builder Quick Reference Guide

## Key Files and Locations

### Core Theme System
```
packages/core/src/services/themeRegistry/
├── service.ts          # ThemeRegistry service (main API)
├── api.ts             # ThemeRegistryApi interface
├── types.ts           # DiagramTheme, ThemeConfig types
├── schema.ts          # DiagramThemeSchema validation
├── built-in-themes.ts # 4 built-in themes (default, dark, forest, neutral)
├── errors.ts          # DuplicateThemeError, InvalidThemeError, ThemeNotFoundError
├── helpers.ts         # normalizeThemeColors, convertThemeToMermaidConfig
└── __tests__/         # 16 tests for ThemeRegistry
```

### React Integration
```
packages/react/src/
├── components/
│   ├── MermaidProvider.tsx   # Initializes services, provides context
│   └── MermaidDiagram.tsx    # Renders diagram with theme
├── hooks/
│   ├── useMermaidInitialized() # Check if ready
│   └── useMermaidLayer()       # Get Effect layer
└── services/mermaid/service.ts # BrowserMermaid service
```

### Web App
```
apps/web/src/
├── App.tsx          # Main editor component (235 lines)
├── App.css          # Component styles
├── main.tsx         # React DOM entry
└── styles/
    └── index.css    # Global CSS variables
```

---

## ThemeRegistry Service API

### Example Usage

```typescript
import { ThemeRegistry } from "effect-mermaid";
import { Effect } from "effect";

// Get reference to layer
const layer = useMermaidLayer();

// Register a custom theme
const registerCustomTheme = async () => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const registry = yield* ThemeRegistry;
      
      yield* registry.registerTheme("my-theme", {
        name: "my-theme",
        colors: {
          primaryColor: "#ff0000",
          primaryTextColor: "#ffffff",
          // ... other color properties
        }
      });
    }).pipe(Effect.provide(layer))
  );
};

// Get list of themes
const getThemes = async () => {
  const themes = await Effect.runPromise(
    Effect.gen(function* () {
      const registry = yield* ThemeRegistry;
      return yield* registry.listThemes();
    }).pipe(Effect.provide(layer))
  );
  return themes; // ['default', 'dark', 'forest', 'neutral', 'my-theme']
};

// Get theme configuration
const getThemeConfig = async (themeName: string) => {
  const config = await Effect.runPromise(
    Effect.gen(function* () {
      const registry = yield* ThemeRegistry;
      return yield* registry.getTheme(themeName);
    }).pipe(Effect.provide(layer))
  );
  return config; // ThemeConfig (ThemeColorMap)
};
```

### Error Handling

```typescript
import { Effect } from "effect";
import { ThemeRegistry, DuplicateThemeError, InvalidThemeError } from "effect-mermaid";

const handleErrors = async () => {
  try {
    await Effect.runPromise(
      Effect.gen(function* () {
        const registry = yield* ThemeRegistry;
        
        // This might fail with DuplicateThemeError
        yield* registry.registerTheme("dark", { colors: {} });
      }).pipe(
        Effect.catchTag("DuplicateThemeError", (error) => {
          console.error("Theme already exists:", error);
          return Effect.fail(error);
        }),
        Effect.catchTag("InvalidThemeError", (error) => {
          console.error("Invalid theme colors:", error);
          return Effect.fail(error);
        })
      )
    );
  } catch (error) {
    console.error("Theme operation failed:", error);
  }
};
```

---

## Available Color Properties

### All 11 Supported Colors

```typescript
interface ThemeColors {
  // Background color
  background?: string | number;
  
  // Primary (main shapes/elements)
  primaryColor?: string | number;
  primaryTextColor?: string | number;
  primaryBorderColor?: string | number;
  
  // Secondary (secondary elements)
  secondaryColor?: string | number;
  secondaryTextColor?: string | number;
  secondaryBorderColor?: string | number;
  
  // Tertiary (less important elements)
  tertiaryColor?: string | number;
  tertiaryTextColor?: string | number;
  tertiaryBorderColor?: string | number;
  
  // Lines and text
  lineColor?: string | number;
  textColor?: string | number;
}
```

### Color Format Support

```typescript
// Hex colors
primaryColor: "#ff0000"
primaryColor: "#f00"

// RGB/RGBA
primaryColor: "rgb(255, 0, 0)"
primaryColor: "rgba(255, 0, 0, 0.5)"

// Named colors
primaryColor: "red"

// Numeric (hex representation)
primaryColor: 0xff0000
```

---

## Built-in Themes Reference

### Default Theme
```typescript
{
  name: "default",
  colors: {} // Uses Mermaid.js defaults
}
```

### Dark Theme
```typescript
{
  name: "dark",
  colors: {
    background: "#333",
    primaryColor: "#1f1f1f",
    secondaryColor: "#2c2c2c",
    primaryTextColor: "#fff",
    secondaryTextColor: "#eee",
    tertiaryTextColor: "#ddd",
    primaryBorderColor: "#666",
    secondaryBorderColor: "#888",
    tertiaryBorderColor: "#aaa",
    lineColor: "#aaa",
    textColor: "#fff",
  }
}
```

### Forest Theme (Nord Palette)
```typescript
{
  name: "forest",
  colors: {
    background: "#2e3440",
    primaryColor: "#3b4252",
    secondaryColor: "#434c5e",
    primaryTextColor: "#d8dee9",
    secondaryTextColor: "#e5e9f0",
    tertiaryTextColor: "#eceff4",
    primaryBorderColor: "#4c566a",
    secondaryBorderColor: "#5e81ac",
    tertiaryBorderColor: "#81a1c1",
    lineColor: "#a3be8c",
    textColor: "#d8dee9",
  }
}
```

### Neutral Theme
```typescript
{
  name: "neutral",
  colors: {
    background: "#f5f5f5",
    primaryColor: "#ffffff",
    secondaryColor: "#eeeeee",
    primaryTextColor: "#000000",
    secondaryTextColor: "#333333",
    tertiaryTextColor: "#555555",
    primaryBorderColor: "#dddddd",
    secondaryBorderColor: "#cccccc",
    tertiaryBorderColor: "#bbbbbb",
    lineColor: "#aaaaaa",
    textColor: "#000000",
  }
}
```

---

## Current App Implementation Details

### EditorContent Component State

```typescript
const [code, setCode] = useState(DEFAULT_DIAGRAM);
const [theme, setTheme] = useState<AllThemes>('default');
const [availableThemes, setAvailableThemes] = useState<AllThemes[]>(
  ['default', 'dark', 'forest', 'neutral']
);
const [registrationError, setRegistrationError] = useState<string | null>(null);
const [diagramError, setDiagramError] = useState<Error | null>(null);
const [lineCount, setLineCount] = useState(DEFAULT_DIAGRAM.split('\n').length);
```

### Hardcoded Custom Themes (App.tsx lines 15-40)

```typescript
const CUSTOM_THEMES = {
  'corporate-blue': {
    primaryColor: '#003366',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#000066',
    lineColor: '#1a4d7a',
    secondaryColor: '#0052cc',
    secondaryTextColor: '#ffffff',
    secondaryBorderColor: '#003d99',
    tertiaryColor: '#0066ff',
    tertiaryTextColor: '#ffffff',
    tertiaryBorderColor: '#0052cc',
  },
  'tech-green': {
    primaryColor: '#00a86b',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#006b47',
    lineColor: '#00c896',
    secondaryColor: '#2ecc71',
    secondaryTextColor: '#ffffff',
    secondaryBorderColor: '#27ae60',
    tertiaryColor: '#1abc9c',
    tertiaryTextColor: '#ffffff',
    tertiaryBorderColor: '#16a085',
  }
} as const
```

### Theme Registration Pattern (App.tsx lines 57-90)

```typescript
useEffect(() => {
  if (!isInitialized || !mermaidLayer) return;

  const registerThemes = async () => {
    try {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const registry = yield* ThemeRegistry;

          // Register custom themes
          for (const [themeName, themeConfig] of Object.entries(CUSTOM_THEMES)) {
            yield* registry.registerTheme(themeName, { colors: themeConfig });
          }

          // Get list of all available themes
          const themes = yield* registry.listThemes();
          return themes;
        }).pipe(
          Effect.provide(mermaidLayer as any)
        ) as any
      );

      setAvailableThemes(result as AllThemes[]);
      setRegistrationError(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setRegistrationError(`Failed to register custom themes: ${errorMsg}`);
      console.error('Custom theme registration error:', error);
    }
  }

  registerThemes();
}, [isInitialized, mermaidLayer])
```

### Theme Application (App.tsx line 219)

```typescript
<MermaidDiagram
  diagram={code}
  config={theme !== 'default' ? { theme } : {}}
  onError={(error) => {
    setDiagramError(error)
    console.error('Diagram error:', error)
  }}
/>
```

---

## CSS Variables (App UI - Not Diagram)

### Global Variables (styles/index.css)

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

### Usage in Components

```css
/* Panel styling */
.panel {
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
}

/* Button styling */
.btn {
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
```

---

## For Theme Builder Implementation

### What Already Works
- ThemeRegistry service (fully functional)
- Theme registration with Effect pattern
- Built-in themes + custom themes
- MermaidDiagram rendering with theme config
- Error handling for theme registration

### What Needs to be Built
- UI for visual color picking (HTML5 input + react-colorful)
- State management for editing themes (useThemeBuilder hook)
- localStorage persistence
- Real-time preview as colors change
- Theme export/import functionality
- Visual guide showing color purposes

### Recommended Implementation Order
1. Create ThemeColorPicker component with HTML5 color input
2. Create useThemeBuilder hook with state management
3. Create ThemeBuilderSidebar component to host the UI
4. Add localStorage persistence to useThemeBuilder
5. Add export/import JSON functionality
6. Create ThemePropertyGuide with visual examples

---

## Integration Checklist for Theme Builder

- [ ] Add react-colorful to package.json
- [ ] Create `apps/web/src/components/ThemeColorPicker.tsx`
- [ ] Create `apps/web/src/components/ThemeBuilderSidebar.tsx`
- [ ] Create `apps/web/src/components/ThemePropertyGuide.tsx`
- [ ] Create `apps/web/src/hooks/useThemeBuilder.ts`
- [ ] Update `apps/web/src/App.tsx` to include sidebar
- [ ] Add sidebar styles to `apps/web/src/App.css`
- [ ] Update layout to accommodate sidebar (flex layout)
- [ ] Add localStorage persistence
- [ ] Add export/import buttons
- [ ] Test with all built-in themes
- [ ] Test mobile responsiveness
- [ ] Add error handling for registration failures
- [ ] Add validation for color format
- [ ] Document new components in README

