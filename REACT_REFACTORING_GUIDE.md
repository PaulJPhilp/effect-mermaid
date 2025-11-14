# React State Refactoring Guide

## Overview

This guide shows how to refactor `apps/web/src/App.tsx` (currently 345 lines) into smaller, more maintainable components with extracted custom hooks.

## Current State (Problems)

**File**: `apps/web/src/App.tsx` (345 lines)  
**Issues**:
- Mixes 12+ concerns (state management, rendering, theme building, settings, syntax checking)
- All state updates trigger full component re-render
- Hard to test individual features
- Difficult to reuse logic in other components

## Target State (Improved)

**File**: `apps/web/src/App.tsx` (100 lines)  
**Structure**:
```
App.tsx (layout orchestration)
├── EditorSection.tsx (code editor + diagram display)
├── PreviewSection.tsx (live preview)
├── SettingsPanel.tsx (already exists)
├── ThemeBuilder.tsx (theme builder UI)
└── Hooks:
    ├── useEditorState (code + syntax checking) ✅
    ├── useDiagramRender (debounced rendering) ✅
    ├── useThemeBuilder (already exists)
    ├── useRenderingSettings (already exists)
    └── useRegisterCustomThemes (already exists)
```

## Extracted Hooks

### 1. `useEditorState` (NEW) ✅

**Location**: `apps/web/src/hooks/useEditorState.ts`

**Purpose**: Manage diagram code and syntax errors

**API**:
```typescript
function useEditorState(defaultDiagram: string) {
  return {
    code: string;
    setCode: (code: string) => void;
    errors: SyntaxErrorInfo;
    lineCount: number;
    clearCode: () => void;
    resetToDefault: () => void;
  };
}
```

**Usage**:
```typescript
function EditorSection() {
  const { code, setCode, errors, lineCount } = useEditorState(DEFAULT_DIAGRAM);
  
  return (
    <CodeMirrorEditor
      value={code}
      onChange={setCode}
      errors={errors}
      lineCount={lineCount}
    />
  );
}
```

### 2. `useDiagramRender` (NEW) ✅

**Location**: `apps/web/src/hooks/useDiagramRender.ts`

**Purpose**: Manage diagram rendering with debouncing

**API**:
```typescript
function useDiagramRender(
  code: string,
  config?: MermaidConfig,
  debounceMs?: number
) {
  return {
    shouldRender: boolean;
    isLoading: boolean;
    error: Error | null;
    setRendering: (success: boolean, error?: Error) => void;
  };
}
```

**Usage**:
```typescript
function DiagramRenderer() {
  const { shouldRender, isLoading, error, setRendering } = useDiagramRender(
    code,
    { theme: "dark" },
    500
  );

  useEffect(() => {
    if (shouldRender) {
      renderDiagram().then(
        () => setRendering(true),
        (err) => setRendering(false, err)
      );
    }
  }, [shouldRender]);
}
```

## Component Architecture

### New Components

#### `EditorSection.tsx` (100 lines)

**Responsibility**: Display code editor + syntax errors

```typescript
import React from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { useEditorState } from "../hooks/useEditorState";
import { SyntaxErrorDisplay } from "./SyntaxErrorDisplay";

interface EditorSectionProps {
  onCodeChange: (code: string) => void;
}

export const EditorSection: React.FC<EditorSectionProps> = ({ onCodeChange }) => {
  const { code, setCode, errors, lineCount } = useEditorState(DEFAULT_DIAGRAM);

  React.useEffect(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Diagram Source</h2>
        <div className="text-sm text-gray-500">{lineCount} lines</div>
      </div>
      <CodeMirrorEditor
        value={code}
        onChange={setCode}
        errors={errors}
      />
      {errors.errors.length > 0 && (
        <SyntaxErrorDisplay errors={errors} />
      )}
    </div>
  );
};
```

#### `PreviewSection.tsx` (80 lines)

**Responsibility**: Display rendered diagram

```typescript
import React from "react";
import { MermaidDiagram, useMermaidInitialized } from "effect-mermaid-react";
import type { MermaidConfig } from "effect-mermaid";
import { useDiagramRender } from "../hooks/useDiagramRender";

interface PreviewSectionProps {
  code: string;
  config?: MermaidConfig;
  showError?: (error: Error) => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  code,
  config,
  showError,
}) => {
  const isInitialized = useMermaidInitialized();
  const { shouldRender, isLoading, error } = useDiagramRender(code, config);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Preview</h2>
        {isLoading && <span className="text-sm text-gray-500">Rendering...</span>}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Initializing Mermaid...
          </div>
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          shouldRender && (
            <MermaidDiagram
              diagram={code}
              config={config}
              onError={(err) => showError?.(err)}
            />
          )
        )}
      </div>
    </div>
  );
};
```

#### `SyntaxErrorDisplay.tsx` (40 lines, NEW)

**Responsibility**: Display syntax errors in a user-friendly way

```typescript
import React from "react";
import { AlertCircle } from "lucide-react";
import type { SyntaxErrorInfo } from "../hooks/useEditorState";

interface SyntaxErrorDisplayProps {
  errors: SyntaxErrorInfo;
}

export const SyntaxErrorDisplay: React.FC<SyntaxErrorDisplayProps> = ({
  errors,
}) => {
  return (
    <div className="border-t bg-red-50 p-4">
      <div className="flex items-start gap-3 mb-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Syntax Errors</h3>
          <div className="mt-2 space-y-1 text-sm text-red-800">
            {errors.errors.map((error, i) => (
              <div key={i}>
                Line {error.line}: {error.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Refactored App.tsx (100 lines)

```typescript
import { RegistryProvider } from "@effect-atom/atom-react";
import { MermaidProvider } from "effect-mermaid-react";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { EditorSection } from "./components/EditorSection";
import { PreviewSection } from "./components/PreviewSection";
import { RenderingSettingsPanel } from "./components/RenderingSettingsPanel";
import { ThemeBuilderSidebar } from "./components/ThemeBuilderSidebar";
import { useRegisterCustomThemes } from "./hooks/useRegisterCustomThemes";
import { useRenderingSettings } from "./hooks/useRenderingSettings";
import { useThemeBuilder } from "./hooks/useThemeBuilder";

const DEFAULT_DIAGRAM = `graph LR
    A[Start] --> B{Condition}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`;

function EditorContent() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [diagramError, setDiagramError] = useState<Error | null>(null);

  // Use existing hooks for theme and settings
  const { currentTheme, customThemes } = useThemeBuilder();
  const { renderConfig, getMermaidConfig } = useRenderingSettings();

  // Register custom themes
  useRegisterCustomThemes(customThemes);

  const mermaidConfig = getMermaidConfig();

  const handleError = useCallback((error: Error) => {
    setDiagramError(error);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col border-r">
        <EditorSection onCodeChange={setCode} />
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex flex-col">
        <PreviewSection
          code={code}
          config={{
            theme: currentTheme,
            ...mermaidConfig,
          }}
          showError={handleError}
        />
      </div>

      {/* Sidebars */}
      <ThemeBuilderSidebar />
      <RenderingSettingsPanel {...renderConfig} />

      {/* Error Toast */}
      {diagramError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {diagramError.message}
          <button
            onClick={() => setDiagramError(null)}
            className="ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <RegistryProvider>
      <MermaidProvider>
        <EditorContent />
      </MermaidProvider>
    </RegistryProvider>
  );
}
```

## Migration Steps

### Phase 1: Create Hooks (DONE ✅)
- [x] `useEditorState.ts`
- [x] `useDiagramRender.ts`

### Phase 2: Create Components
- [ ] `SyntaxErrorDisplay.tsx` – error display component
- [ ] `EditorSection.tsx` – editor layout
- [ ] `PreviewSection.tsx` – preview layout

### Phase 3: Update App.tsx
- [ ] Extract logic into components
- [ ] Use new hooks
- [ ] Reduce from 345 to ~100 lines
- [ ] Remove debug console.log statements ✅

### Phase 4: Test & Optimize
- [ ] Add component tests
- [ ] Measure performance improvements
- [ ] Verify no functionality lost

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **File Size** | 345 lines | 100 lines |
| **Concerns per Component** | 12+ | 3–5 |
| **Testability** | Low | High |
| **Re-render Performance** | Poor | Good |
| **Code Reusability** | None | High |
| **Maintainability** | Hard | Easy |

## Performance Impact

### Expected Improvements

- **Re-render time**: ~40% faster (memoization + isolated state)
- **Initial load**: Same (lazy loading handled separately)
- **Theme switch**: ~50% faster (isolated state update)
- **Code typing**: Visual response faster (debounced rendering)

### Measurement

```typescript
// Before refactoring
<App /> // Re-renders all children on any state change

// After refactoring
<EditorSection /> // Only re-renders when code/errors change
<PreviewSection /> // Only re-renders when config/code changes
<SettingsPanel /> // Only re-renders when settings change
```

## Example: Adding a New Feature

With the refactored structure, adding export functionality is simple:

```typescript
// 1. Add to PreviewSection or create new ExportSection
function ExportSection() {
  const { code } = useEditorState(DEFAULT_DIAGRAM);
  
  return (
    <button onClick={() => exportDiagram(code)}>
      Export as PNG
    </button>
  );
}

// 2. Add to App.tsx layout
<div className="flex">
  <EditorSection />
  <PreviewSection />
  <ExportSection /> {/* New feature, isolated */}
</div>
```

## Next Steps

1. **Create `SyntaxErrorDisplay.tsx`** component
2. **Create `EditorSection.tsx`** component  
3. **Create `PreviewSection.tsx`** component
4. **Refactor `App.tsx`** to use new components
5. **Test** all functionality still works
6. **Measure** performance improvements
7. **Document** in CONTRIBUTING.md

---

**Created**: 2025-11-14  
**Status**: Hooks created, ready for component extraction

