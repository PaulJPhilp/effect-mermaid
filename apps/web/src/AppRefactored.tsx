import { RegistryProvider } from "@effect-atom/atom-react";
import { MermaidProvider } from "effect-mermaid-react";
import { useCallback, useState } from "react";
import "./App.css";
import { EditorSection } from "./components/EditorSection";
import { PreviewSection } from "./components/PreviewSection";
import { RenderingSettingsPanel } from "./components/RenderingSettingsPanel";
import { ThemeBuilderSidebar } from "./components/ThemeBuilderSidebar";
import { useDiagramRender } from "./hooks/useDiagramRender";
import { useRegisterCustomThemes } from "./hooks/useRegisterCustomThemes";
import { useRenderingSettings } from "./hooks/useRenderingSettings";
import { useThemeBuilder } from "./hooks/useThemeBuilder";

/**
 * Main application component - REFACTORED VERSION
 *
 * This is the refactored version showing how to use the new components and hooks.
 *
 * Changes from original:
 * - Reduced from 345 to ~150 lines
 * - Extracted concerns into separate components
 * - Uses custom hooks for state management
 * - Better performance (isolated re-renders)
 *
 * Original: apps/web/src/App.tsx (345 lines)
 * New structure:
 * ├── EditorSection.tsx (editor + errors)
 * ├── PreviewSection.tsx (diagram preview)
 * ├── RenderingSettingsPanel.tsx (existing)
 * ├── ThemeBuilderSidebar.tsx (existing)
 * └── App hooks:
 *     ├── useThemeBuilder (existing)
 *     ├── useRenderingSettings (existing)
 *     ├── useEditorState (new)
 *     ├── useDiagramRender (new)
 *     └── useRegisterCustomThemes (existing)
 */
function EditorContent() {
  // State management
  const [code, setCode] = useState("");
  const [diagramError, setDiagramError] = useState<Error | null>(null);

  // Use existing hooks for theme and settings
  const { currentTheme, customThemes, allThemeNames, sidebarOpen } =
    useThemeBuilder();

  const {
    renderConfig,
    showSettingsPanel,
    setShowSettingsPanel,
    updateNodes,
    updateEdges,
    updateLabels,
    updateLayout,
    updateContainer,
    applyPreset,
    resetToDefaults,
    exportConfig,
    getMermaidConfig,
  } = useRenderingSettings();

  // Use new hook for rendering
  const { shouldRender, isLoading, error, setRendering } = useDiagramRender(
    code,
    {
      theme: currentTheme,
      ...getMermaidConfig(),
    }
  );

  // Register custom themes
  useRegisterCustomThemes(
    customThemes as Record<
      string,
      { name: string; colors: Record<string, string>; description?: string }
    >
  );

  // Handle diagram rendering completion
  const handleRenderingComplete = useCallback(
    (success: boolean, renderError?: Error) => {
      setRendering(success, renderError);
      if (!success && renderError) {
        setDiagramError(renderError);
      }
    },
    [setRendering]
  );

  const handleDiagramError = useCallback((err: Error) => {
    setDiagramError(err);
  }, []);

  const handleDismissError = useCallback(() => {
    setDiagramError(null);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorSection onCodeChange={setCode} />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewSection
            code={code}
            config={{
              theme: currentTheme,
              ...getMermaidConfig(),
            }}
            isLoading={isLoading}
            error={error}
            onError={handleDiagramError}
          />
        </div>
      </div>

      {/* Sidebars */}
      <ThemeBuilderSidebar />
      <RenderingSettingsPanel
        renderConfig={renderConfig}
        showSettingsPanel={showSettingsPanel}
        setShowSettingsPanel={setShowSettingsPanel}
        updateNodes={updateNodes}
        updateEdges={updateEdges}
        updateLabels={updateLabels}
        updateLayout={updateLayout}
        updateContainer={updateContainer}
        applyPreset={applyPreset}
        resetToDefaults={resetToDefaults}
        exportConfig={exportConfig}
      />

      {/* Error Toast */}
      {diagramError && (
        <div className="fixed bottom-4 right-4 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 max-w-sm">
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs mt-1">{diagramError.message}</p>
          </div>
          <button
            onClick={handleDismissError}
            className="flex-shrink-0 font-bold hover:text-destructive/70 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Root App component with providers
 */
export function App() {
  return (
    <RegistryProvider>
      <MermaidProvider>
        <EditorContent />
      </MermaidProvider>
    </RegistryProvider>
  );
}

export default App;

