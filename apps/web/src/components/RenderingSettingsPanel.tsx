import React from 'react'
import { useRenderingSettings } from '../hooks/useRenderingSettings'
import { NumberSlider } from './controls/NumberSlider'
import { FontSizeSelect } from './controls/FontSizeSelect'
import { StyleSelect, LINE_STYLE_OPTIONS, CURVE_OPTIONS, FONT_FAMILY_OPTIONS } from './controls/StyleSelect'
import { ColorPicker } from './controls/ColorPicker'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Button } from './ui/button'

interface RenderingSettingsPanelProps {
  renderConfig: any
  showSettingsPanel: boolean
  setShowSettingsPanel: (show: boolean) => void
  updateNodes: (updates: any) => void
  updateEdges: (updates: any) => void
  updateLabels: (updates: any) => void
  updateLayout: (updates: any) => void
  updateContainer: (updates: any) => void
  applyPreset: (preset: string) => void
  resetToDefaults: () => void
  exportConfig: () => string
}

/**
 * Sidebar panel for controlling rendering quality and appearance
 * Provides element-level granular controls for nodes, edges, labels, and layout
 */
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
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mermaid-render-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const [applyFeedback, setApplyFeedback] = React.useState(false)

  const handleApply = () => {
    // Settings apply automatically, just show confirmation
    setApplyFeedback(true)
    setTimeout(() => {
      setApplyFeedback(false)
    }, 600)
  }

  return (
    <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
      <SheetTrigger asChild>
        <button
          className="fixed top-5 right-5 w-12 h-12 rounded-full border-2 border-border bg-background text-foreground text-2xl cursor-pointer flex items-center justify-center transition-all duration-300 z-50 hover:border-primary hover:shadow-lg hover:text-primary"
          title="Rendering Settings"
          aria-label="Toggle rendering settings panel"
        >
          ⚙️
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Rendering Settings</SheetTitle>
          <p className="hidden">Panel for controlling rendering quality and appearance settings for diagram elements.</p>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('default')}
                className="text-xs"
              >
                Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('presentation')}
                className="text-xs"
              >
                Presentation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('print')}
                className="text-xs"
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('compact')}
                className="text-xs"
              >
                Compact
              </Button>
            </div>
          </div>

          {/* Sections using Accordion */}
          <Accordion type="single" collapsible defaultValue="nodes" className="w-full">
            {/* Nodes Section */}
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

            {/* Edges Section */}
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
                  onChange={(value) => updateEdges({ style: value as 'solid' | 'dashed' | 'dotted' })}
                />
                <StyleSelect
                  label="Curve Type"
                  value={renderConfig.edges.curve}
                  options={CURVE_OPTIONS}
                  onChange={(value) => updateEdges({ curve: value as 'basis' | 'linear' | 'cardinal' | 'monotoneX' })}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Labels Section */}
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
                  onChange={(value) => updateLabels({ backgroundColor: value })}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Layout Section */}
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

            {/* Container Section */}
            <AccordionItem value="container">
              <AccordionTrigger>Container</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renderConfig.container.useMaxWidth}
                    onChange={(e) => updateContainer({ useMaxWidth: e.target.checked })}
                    className="cursor-pointer w-4 h-4"
                  />
                  Use Max Width
                </label>
                <ColorPicker
                  label="Background Color"
                  value={renderConfig.container.backgroundColor}
                  onChange={(value) => updateContainer({ backgroundColor: value })}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6 border-t border-border">
            <Button
              onClick={handleApply}
              className={`w-full ${applyFeedback ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {applyFeedback ? '✓ Applied!' : '✓ Apply Settings'}
            </Button>
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="w-full"
            >
              Reset to Defaults
            </Button>
            <Button
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
