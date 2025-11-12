# ThemeRegistry and MermaidProvider Integration Guide

## Overview

The effect-mermaid library provides a complete theme management system through the **ThemeRegistry** service integrated with the **MermaidProvider** React component. This guide explains how themes flow through the system and how to register and use custom themes.

## Architecture Overview

### Component Hierarchy

```
MermaidProvider
  ├─ Initializes Effect Layer
  │  ├─ ThemeRegistry.Default
  │  └─ BrowserMermaid.Default
  ├─ Provides context to children
  └─ MermaidDiagram
     ├─ Consumes layer
     ├─ Resolves theme from registry
     └─ Renders with theme applied
```

### Service Dependencies

**BrowserMermaid** depends on **ThemeRegistry**:
- When rendering a diagram, BrowserMermaid calls `ThemeRegistry.getTheme()` to resolve custom themes
- The resolved theme variables are merged with explicit config overrides
- Final configuration is applied to Mermaid.js

## How Themes Work

### 1. Theme Resolution Pattern

The following pattern is used by all Mermaid implementations (core, node, react):

```
1. Check if theme name is "default" 
   → Skip registry lookup, use Mermaid's default
2. Call ThemeRegistry.getTheme(themeName)
   → Returns theme configuration object
3. On failure:
   → Log warning with service label
   → Use built-in theme fallback
4. Merge resolved theme variables with explicit config variables
5. Apply final config to Mermaid.js
```

### 2. Built-in Themes

Four built-in themes are provided by default:
- **"default"**: Mermaid's default theme
- **"dark"**: Dark color scheme with white text
- **"forest"**: Forest/nature-inspired color palette  
- **"neutral"**: Light, professional color scheme

See `packages/core/src/services/themeRegistry/built-in-themes.ts` for exact color definitions.

### 3. Custom Themes

Custom themes can be registered at runtime and are merged into the registry alongside built-in themes.

## How MermaidProvider Works

### Initialization

```typescript
// MermaidProvider.tsx (lines 96-127)
const [layer, setLayer] = useState<MermaidLayer | null>(null);
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  const initializeMermaid = async () => {
    try {
      // Create a layer that provides both services
      // Use Layer.merge to ensure both ThemeRegistry and BrowserMermaid are available
      const appLayer = Layer.merge(
        ThemeRegistry.Default,      // Theme management
        BrowserMermaid.Default,     // Diagram rendering
      );

      setLayer(appLayer);

      // Warm up the layer to trigger service initialization
      const warmupEffect = Effect.gen(function* () {
        yield* BrowserMermaid;  // Trigger initialization
      }).pipe(Effect.provide(appLayer), Effect.scoped);

      await Effect.runPromise(warmupEffect);
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize Mermaid:", err);
      setIsInitialized(false);
    }
  };

  initializeMermaid();
}, []);

return (
  <EffectLayerContext.Provider value={{ layer, isInitialized }}>
    {children}
  </EffectLayerContext.Provider>
);
```

### What Gets Composed

The `Layer.merge()` call creates a single Effect Layer containing:

1. **ThemeRegistry.Default** - Provides theme management capabilities
   - Pre-loaded with 4 built-in themes
   - Supports custom theme registration
   - Used for theme resolution during rendering

2. **BrowserMermaid.Default** - Provides diagram rendering
   - Dynamically imports Mermaid.js
   - Initializes Mermaid with browser-safe defaults
   - Depends on ThemeRegistry for theme resolution

### Context Hooks

After initialization, the provider exposes two hooks:

```typescript
// Get the Effect layer (for advanced usage)
const layer = useMermaidLayer();

// Check if services are ready
const isReady = useMermaidInitialized();
```

## How MermaidDiagram Uses Themes

### Rendering with Theme Configuration

```typescript
// MermaidDiagram.tsx (lines 170-178)
const renderEffect = Effect.gen(function* () {
  const service = yield* BrowserMermaid;
  const svg = yield* service.render(diagram, config);
  return svg;
}).pipe(
  Effect.either,
  Effect.provide(layer as MermaidLayer),
  Effect.scoped,
);
```

The config object can specify a theme:

```typescript
<MermaidDiagram
  diagram={code}
  config={{ 
    theme: "dark",
    themeVariables: {
      primaryColor: "#ff6b6b"
    }
  }}
/>
```

### BrowserMermaid Theme Resolution

```typescript
// packages/react/src/services/mermaid/service.ts (lines 64-92)
if (config) {
  const themeConfig: Record<string, unknown> = {
    theme: config.theme || "default",
  };

  // Try to resolve theme from registry
  if (config.theme && config.theme !== "default") {
    const themeResult = yield* themeRegistry
      .getTheme(config.theme)
      .pipe(
        Effect.catchAll((error) => {
          console.warn(
            `[BrowserMermaid] Failed to resolve theme "${
              config.theme
            }": ${
              error instanceof Error ? error.message : String(error)
            }. Using built-in theme.`
          );
          return Effect.succeed({});
        })
      );
    
    // Merge resolved theme variables
    if (Object.keys(themeResult).length > 0) {
      themeConfig.themeVariables = themeResult;
    }
  }

  const mermaidConfig: Record<string, unknown> = {
    ...themeConfig,
    themeVariables:
      config.themeVariables || themeConfig.themeVariables,
    flowchart: config.flowchart,
    sequence: config.sequence,
    class: config.class,
    state: config.state,
  };

  yield* Effect.try({
    try: () => mermaidModule.default.initialize(mermaidConfig),
    catch: (error) =>
      makeRenderError(`Failed to apply config: ${error}`, diagram),
  });
}
```

## Registering Custom Themes

### ThemeRegistry API

```typescript
interface ThemeRegistryApi {
  // Register a custom theme in the registry
  registerTheme: (
    name: string,
    theme: DiagramTheme
  ) => Effect.Effect<void, DuplicateThemeError | InvalidThemeError>;

  // Retrieve theme variables from the registry
  getTheme: (
    name: string
  ) => Effect.Effect<ThemeConfig, ThemeNotFoundError>;

  // List all available theme names (built-in and custom)
  listThemes: () => Effect.Effect<string[], never>;
}
```

### DiagramTheme Type

```typescript
interface DiagramTheme {
  name: string;           // Unique identifier
  colors: ThemeColorMap;  // Color definitions
  description?: string;   // Optional description
}

type ThemeColorMap = Record<string, ThemeColorValue>;

// ThemeColorValue supports multiple formats:
type ThemeColorValue = 
  | string                              // "#ff0000", "rgb(255, 0, 0)"
  | number                              // 0xff0000
  | { kind: "hex"; value: string }     // { kind: "hex", value: "#ff0000" }
  | { kind: "named"; name: string }    // { kind: "named", name: "red" }
  | {                                  // { kind: "rgb", red: 255, ... }
      kind: "rgb";
      red: number;
      green: number;
      blue: number;
      alpha?: number;
    }
  | {                                  // { kind: "hsl", hue: 0, ... }
      kind: "hsl";
      hue: number;
      saturation: number;
      lightness: number;
      alpha?: number;
    };
```

### Available Color Properties

Common theme color properties (from Mermaid.js):

- `primaryColor` - Main node/shape color
- `primaryTextColor` - Text on primary shapes
- `primaryBorderColor` - Border of primary shapes
- `secondaryColor` - Secondary shapes
- `secondaryTextColor` - Text on secondary shapes
- `secondaryBorderColor` - Border of secondary shapes
- `tertiaryColor` - Tertiary shapes
- `tertiaryTextColor` - Text on tertiary shapes
- `tertiaryBorderColor` - Border of tertiary shapes
- `lineColor` - Connection lines
- `textColor` - General text
- `background` - Diagram background

### Example: Registering Custom Themes

```typescript
// Using Effect.gen to register themes
const program = Effect.gen(function* () {
  const registry = yield* ThemeRegistry;
  const mermaid = yield* Mermaid;

  // Register a custom theme
  yield* registry.registerTheme("custom-blue", {
    name: "custom-blue",
    colors: {
      primaryColor: "#0066ff",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#0052cc",
      lineColor: "#0066ff",
      secondaryColor: "#0052cc",
      secondaryTextColor: "#ffffff",
      secondaryBorderColor: "#003d99",
      tertiaryColor: "#003366",
      tertiaryTextColor: "#ffffff",
      tertiaryBorderColor: "#0052cc",
    },
  });

  // List all available themes
  const themes = yield* registry.listThemes();
  console.log("Available themes:", themes);
  // Output: ["default", "dark", "forest", "neutral", "custom-blue"]

  // Render with custom theme
  const svg = yield* mermaid.render(diagram, {
    theme: "custom-blue",
  });

  return svg;
});

// Provide both services
const appLayer = Layer.merge(
  ThemeRegistry.Default,
  Mermaid.Default
);

await Effect.runPromise(Effect.provide(program, appLayer));
```

## Integration with React Components

### Basic Setup

```typescript
import { MermaidProvider, MermaidDiagram } from 'effect-mermaid-react';

export function App() {
  return (
    <MermaidProvider config={{ theme: "dark" }}>
      <MermaidDiagram 
        diagram={code}
        config={{ theme: "dark" }}
      />
    </MermaidProvider>
  );
}
```

### Registering Themes Before Rendering

Since themes need to be registered in the Effect context, you have a few options:

#### Option 1: Register During Provider Initialization

Extend the MermaidProvider to accept custom themes:

```typescript
interface MermaidProviderProps {
  children: ReactNode;
  config?: {
    theme?: "default" | "dark" | "forest" | "neutral";
    themeVariables?: Record<string, unknown>;
  };
  customThemes?: Record<string, DiagramTheme>;  // Add this
}

// In the initialization effect
const initializeMermaid = async () => {
  const appLayer = Layer.merge(
    ThemeRegistry.Default,
    BrowserMermaid.Default,
  );

  setLayer(appLayer);

  // Register custom themes
  const setupEffect = Effect.gen(function* () {
    if (customThemes) {
      const registry = yield* ThemeRegistry;
      for (const [name, theme] of Object.entries(customThemes)) {
        yield* registry.registerTheme(name, theme);
      }
    }
    yield* BrowserMermaid;
  }).pipe(Effect.provide(appLayer), Effect.scoped);

  await Effect.runPromise(setupEffect);
  setIsInitialized(true);
};
```

#### Option 2: Register in a Child Component

```typescript
function CustomDiagramRenderer() {
  const layer = useMermaidLayer();
  
  const registerAndRender = async () => {
    if (!layer) return;
    
    const effect = Effect.gen(function* () {
      const registry = yield* ThemeRegistry;
      
      // Register custom theme
      yield* registry.registerTheme("my-theme", {
        name: "my-theme",
        colors: { primaryColor: "#ff6b6b" },
      });
      
      // Now use it
      const mermaid = yield* BrowserMermaid;
      return yield* mermaid.render(diagram, {
        theme: "my-theme"
      });
    }).pipe(Effect.provide(layer), Effect.scoped);
    
    const result = await Effect.runPromise(effect);
    return result;
  };
  
  return <button onClick={registerAndRender}>Render</button>;
}
```

## Error Handling

### Theme Registration Errors

```typescript
const result = yield* registry.registerTheme("dark", { /* ... */ })
  .pipe(Effect.flip);  // Flip success/failure

if (result instanceof DuplicateThemeError) {
  // Handle duplicate theme name
  console.error(`Theme already exists: ${result.name}`);
}

if (result instanceof InvalidThemeError) {
  // Handle invalid theme structure
  console.error(`Invalid theme: ${result.message}`);
}
```

### Theme Resolution Errors

During rendering, if a custom theme is not found:

```typescript
// BrowserMermaid logs a warning and falls back to built-in theme
console.warn(
  `[BrowserMermaid] Failed to resolve theme "non-existent": ` +
  `Theme not found. Using built-in theme.`
);
```

## Configuration Options

### MermaidConfig Type

```typescript
interface MermaidConfig {
  theme?: string;                           // Theme name
  themeVariables?: Record<string, unknown>; // Variable overrides
  securityLevel?: "strict" | "loose" | "antiscript";
  flowchart?: Record<string, unknown>;      // Flowchart-specific options
  sequence?: Record<string, unknown>;       // Sequence-specific options
  class?: Record<string, unknown>;          // Class-specific options
  state?: Record<string, unknown>;          // State-specific options
}
```

### Combining Built-in Theme with Variables

```typescript
<MermaidDiagram
  diagram={code}
  config={{
    theme: "dark",
    themeVariables: {
      // Override specific colors from the dark theme
      primaryColor: "#ff6b6b",
      primaryTextColor: "#fff"
    }
  }}
/>
```

## Flow Diagram: Theme Resolution During Rendering

```
MermaidDiagram renders
  ├─ Calls BrowserMermaid.render(diagram, config)
  │
  ├─ Extract theme from config.theme
  │  
  ├─ If theme !== "default":
  │  │
  │  ├─ Call ThemeRegistry.getTheme(themeName)
  │  │  │
  │  │  ├─ Success: Get theme colors
  │  │  │  └─ Merge with themeVariables from config
  │  │  │
  │  │  └─ Failure: Log warning, use fallback
  │  │
  │
  ├─ Initialize Mermaid with resolved config
  │
  └─ Call mermaid.render() to generate SVG
```

## Testing Themes

See `packages/core/src/services/__tests__/mermaid-theme-integration.test.ts` for comprehensive examples:

```typescript
it("renders diagram with registered custom theme", () =>
  Effect.gen(function* () {
    const registry = yield* ThemeRegistry;
    const mermaid = yield* Mermaid;

    // Register custom theme
    yield* registry.registerTheme("custom-blue", {
      name: "custom-blue",
      colors: { primaryColor: "#0066ff" },
    });

    // Render with theme
    const result = yield* mermaid.render(testDiagram, {
      theme: "custom-blue",
    });

    expect(result).toContain("<svg");
    expect(result).toContain('data-theme="custom-blue"');
  }).pipe(Effect.provide(Layer.merge(ThemeRegistry.Default, Mermaid.Default)))
);
```

## Summary

1. **MermaidProvider** initializes both `ThemeRegistry` and `BrowserMermaid` services via `Layer.merge()`
2. **ThemeRegistry** manages built-in and custom themes, supporting registration and lookup
3. **BrowserMermaid** depends on ThemeRegistry to resolve theme colors during rendering
4. **MermaidDiagram** passes theme config to the rendering service
5. **Theme Resolution** follows a consistent pattern: check custom, fallback to built-in, merge variables
6. **Custom Themes** can be registered at any point and are immediately available for rendering
7. **Error Handling** is built-in with specific error types for duplicate/invalid/missing themes

## Key Files

| File | Purpose |
|------|---------|
| `packages/react/src/components/MermaidProvider.tsx` | React provider component |
| `packages/react/src/components/MermaidDiagram.tsx` | Diagram rendering component |
| `packages/react/src/services/mermaid/service.ts` | BrowserMermaid implementation |
| `packages/core/src/services/themeRegistry/service.ts` | Theme registry service |
| `packages/core/src/services/themeRegistry/api.ts` | Theme registry interface |
| `packages/core/src/services/themeRegistry/built-in-themes.ts` | Built-in theme definitions |
| `packages/core/src/services/__tests__/mermaid-theme-integration.test.ts` | Integration tests |

