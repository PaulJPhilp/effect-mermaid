import { RegistryProvider } from "@effect-atom/atom-react"
import { MermaidProvider } from "effect-mermaid-react"
import { Palette, SlidersHorizontal, Moon, SunMedium, FileCode } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import "./App.css"
import { EditorSection } from "./components/EditorSection"
import { PreviewSection } from "./components/PreviewSection"
import { RenderingSettingsPanel } from "./components/RenderingSettingsPanel"
import { ThemeBuilderSidebar } from "./components/ThemeBuilderSidebar"
import { Button } from "./components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import { useDiagramRender } from "./hooks/useDiagramRender"
import { useRegisterCustomThemes } from "./hooks/useRegisterCustomThemes"
import { useRenderingSettings } from "./hooks/useRenderingSettings"
import { useThemeBuilder } from "./hooks/useThemeBuilder"
import { DIAGRAM_EXAMPLES } from "./utils/examples"

function EditorContent() {
  const [code, setCode] = useState("")
  const [diagramError, setDiagramError] = useState<Error | null>(null)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  const [exampleToLoad, setExampleToLoad] = useState<string | null>(null)

  const {
    currentTheme,
    customThemes,
    sidebarOpen,
    toggleSidebar,
  } = useThemeBuilder()

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
  } = useRenderingSettings()

  const { isLoading, error, setRendering } = useDiagramRender(code, {
    theme: currentTheme,
    ...getMermaidConfig(),
  })

  useRegisterCustomThemes(
    customThemes as Record<
      string,
      { name: string; colors: Record<string, string>; description?: string }
    >,
  )

  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setIsDarkMode(root.classList.contains("dark"))
  }, [])

  const handleToggleThemeMode = useCallback(() => {
    const root = document.documentElement
    setIsDarkMode((previous) => {
      const next = !previous
      if (next) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
      return next
    })
  }, [])

  const handleDiagramError = useCallback((err: Error) => {
    setDiagramError(err)
  }, [])

  const handleDismissError = useCallback(() => {
    setDiagramError(null)
  }, [])

  const handleLoadExample = useCallback((exampleName: string) => {
    const example = DIAGRAM_EXAMPLES.find((ex) => ex.name === exampleName)
    if (example) {
      setSelectedExample(exampleName)
      setExampleToLoad(example.code)
      setDiagramError(null)
    }
  }, [])

  // Reset example selection after it's been loaded
  useEffect(() => {
    if (exampleToLoad && code === exampleToLoad) {
      // Example has been loaded, reset the selection
      setExampleToLoad(null)
      setSelectedExample(null)
    }
  }, [code, exampleToLoad])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Effect Mermaid
          </span>
          <h1 className="text-sm font-semibold text-foreground sm:text-base">
            Diagram Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Examples dropdown */}
          <Select
            value={selectedExample || undefined}
            onValueChange={handleLoadExample}
          >
            <SelectTrigger className="hidden h-9 w-[180px] gap-2 sm:flex">
              <FileCode className="h-4 w-4" />
              <SelectValue placeholder="Examples" />
            </SelectTrigger>
            <SelectContent>
              {DIAGRAM_EXAMPLES.map((example) => (
                <SelectItem key={example.name} value={example.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{example.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {example.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="rounded-full border border-border bg-muted px-2 py-1">
              Theme: <span className="font-medium">{currentTheme}</span>
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleThemeMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden gap-2 sm:inline-flex"
            onClick={toggleSidebar}
            aria-pressed={sidebarOpen}
          >
            <Palette className="h-4 w-4" />
            <span>Theme Builder</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowSettingsPanel(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Rendering Settings</span>
            <span className="sm:hidden">Settings</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 gap-4 overflow-hidden px-4 py-4">
        <section className="flex flex-1 flex-col overflow-hidden">
          <EditorSection
            onCodeChange={setCode}
            loadExample={exampleToLoad}
          />
        </section>

        <section className="flex flex-1 flex-col overflow-hidden">
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
        </section>
      </main>

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

      {diagramError && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive shadow-lg">
          <div>
            <p className="text-sm font-semibold">Error</p>
            <p className="mt-1 text-xs">{diagramError.message}</p>
          </div>
          <button
            type="button"
            onClick={handleDismissError}
            className="flex-shrink-0 font-bold transition-colors hover:text-destructive/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export function App() {
  return (
    <RegistryProvider>
      <MermaidProvider>
        <EditorContent />
      </MermaidProvider>
    </RegistryProvider>
  )
}

export default App

