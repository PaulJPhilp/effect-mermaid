import React from "react"

import type {
  ElementLevelRenderConfig,
  RenderPreset,
} from "../types/renderConfig"
import { ColorPicker } from "./controls/ColorPicker"
import { FontSizeSelect } from "./controls/FontSizeSelect"
import { NumberSlider } from "./controls/NumberSlider"
import {
  CURVE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  LINE_STYLE_OPTIONS,
  StyleSelect,
} from "./controls/StyleSelect"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"

interface RenderingSettingsPanelProps {
  renderConfig: ElementLevelRenderConfig
  showSettingsPanel: boolean
  setShowSettingsPanel: (show: boolean) => void
  updateNodes: (updates: Partial<ElementLevelRenderConfig["nodes"]>) => void
  updateEdges: (updates: Partial<ElementLevelRenderConfig["edges"]>) => void
  updateLabels: (updates: Partial<ElementLevelRenderConfig["labels"]>) => void
  updateLayout: (updates: Partial<ElementLevelRenderConfig["layout"]>) => void
  updateContainer: (
    updates: Partial<ElementLevelRenderConfig["container"]>,
  ) => void
  applyPreset: (preset: RenderPreset) => void
  resetToDefaults: () => void
  exportConfig: () => string
}

export const RenderingSettingsPanel: React.FC<RenderingSettingsPanelProps> = ({
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
}) => {
  const handleExport = () => {
    const config = exportConfig()
    const blob = new Blob([config], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mermaid-render-config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const [applyFeedback, setApplyFeedback] = React.useState(false)

  const handleApply = () => {
    setApplyFeedback(true)
    setTimeout(() => {
      setApplyFeedback(false)
    }, 600)
  }

  return (
    <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
      <SheetContent
        side="right"
        className="w-96 max-w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Rendering Settings</SheetTitle>
          <p className="sr-only">
            Panel for controlling rendering quality and appearance settings for diagram elements.
          </p>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <p className="block text-xs font-semibold uppercase tracking-wider text-foreground">
              Presets
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("default")}
                className="text-xs"
              >
                Default
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("presentation")}
                className="text-xs"
              >
                Presentation
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("print")}
                className="text-xs"
              >
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("compact")}
                className="text-xs"
              >
                Compact
              </Button>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="nodes"
            className="w-full"
          >
            <AccordionItem value="nodes">
              <AccordionTrigger>Nodes</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FontSizeSelect
                  label="Font Size"
                  value={renderConfig.nodes.fontSize}
                  onChange={(value) => updateNodes({ fontSize: value })}
                />
                <StyleSelect
                  label="Font Family"
                  value={renderConfig.nodes.fontFamily}
                  options={FONT_FAMILY_OPTIONS}
                  onChange={(value) => updateNodes({ fontFamily: value })}
                />
                <NumberSlider
                  label="Border Width"
                  value={renderConfig.nodes.borderWidth}
                  min={0}
                  max={10}
                  step={0.5}
                  unit="px"
                  onChange={(value) => updateNodes({ borderWidth: value })}
                />
                <NumberSlider
                  label="Padding"
                  value={renderConfig.nodes.padding}
                  min={0}
                  max={50}
                  step={1}
                  unit="px"
                  onChange={(value) => updateNodes({ padding: value })}
                />
                <ColorPicker
                  label="Background Color"
                  value={renderConfig.nodes.backgroundColor}
                  onChange={(value) => updateNodes({ backgroundColor: value })}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="edges">
              <AccordionTrigger>Edges / Lines</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <NumberSlider
                  label="Line Width"
                  value={renderConfig.edges.lineWidth}
                  min={0.5}
                  max={10}
                  step={0.5}
                  unit="px"
                  onChange={(value) => updateEdges({ lineWidth: value })}
                />
                <ColorPicker
                  label="Line Color"
                  value={renderConfig.edges.color}
                  onChange={(value) => updateEdges({ color: value })}
                />
                <StyleSelect
                  label="Line Style"
                  value={renderConfig.edges.style}
                  options={LINE_STYLE_OPTIONS}
                  onChange={(value) =>
                    updateEdges({
                      style: value as "solid" | "dashed" | "dotted",
                    })
                  }
                />
                <StyleSelect
                  label="Curve Type"
                  value={renderConfig.edges.curve}
                  options={CURVE_OPTIONS}
                  onChange={(value) =>
                    updateEdges({
                      curve: value as
                        | "basis"
                        | "linear"
                        | "cardinal"
                        | "monotoneX",
                    })
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="labels">
              <AccordionTrigger>Labels</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <FontSizeSelect
                  label="Font Size"
                  value={renderConfig.labels.fontSize}
                  onChange={(value) => updateLabels({ fontSize: value })}
                />
                <ColorPicker
                  label="Background Color"
                  value={renderConfig.labels.backgroundColor}
                  onChange={(value) =>
                    updateLabels({ backgroundColor: value })
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger>Layout</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <NumberSlider
                  label="Node Spacing"
                  value={renderConfig.layout.nodeSpacing}
                  min={10}
                  max={200}
                  step={5}
                  unit="px"
                  onChange={(value) => updateLayout({ nodeSpacing: value })}
                />
                <NumberSlider
                  label="Rank Spacing"
                  value={renderConfig.layout.rankSpacing}
                  min={10}
                  max={200}
                  step={5}
                  unit="px"
                  onChange={(value) => updateLayout({ rankSpacing: value })}
                />
                <NumberSlider
                  label="Padding"
                  value={renderConfig.layout.padding}
                  min={0}
                  max={50}
                  step={1}
                  unit="px"
                  onChange={(value) => updateLayout({ padding: value })}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="container">
              <AccordionTrigger>Container</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={renderConfig.container.useMaxWidth}
                    onChange={(event) =>
                      updateContainer({ useMaxWidth: event.target.checked })
                    }
                    className="h-4 w-4 rounded border border-border text-primary"
                  />
                  Use Max Width
                </label>
                <ColorPicker
                  label="Background Color"
                  value={renderConfig.container.backgroundColor}
                  onChange={(value) =>
                    updateContainer({ backgroundColor: value })
                  }
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <Button
              type="button"
              onClick={handleApply}
              className="w-full"
            >
              {applyFeedback ? "✓ Applied!" : "✓ Apply Settings"}
            </Button>
            <Button
              type="button"
              onClick={resetToDefaults}
              variant="outline"
              className="w-full"
            >
              Reset to Defaults
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              className="w-full"
            >
              Export Config
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
