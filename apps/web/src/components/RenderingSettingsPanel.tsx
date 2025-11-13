import React from 'react'
import { useRenderingSettings } from '../hooks/useRenderingSettings'
import { NumberSlider } from './controls/NumberSlider'
import { FontSizeSelect } from './controls/FontSizeSelect'
import { StyleSelect, LINE_STYLE_OPTIONS, CURVE_OPTIONS, FONT_FAMILY_OPTIONS } from './controls/StyleSelect'
import { ColorPicker } from './controls/ColorPicker'
import './RenderingSettingsPanel.css'

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

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    nodes: true,
    edges: true,
    labels: false,
    layout: false,
    container: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

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
    <>
      {/* Toggle Button */}
      <button
        className="rendering-settings-toggle"
        onClick={() => setShowSettingsPanel(!showSettingsPanel)}
        title="Rendering Settings"
        aria-label="Toggle rendering settings panel"
      >
        ⚙️
      </button>

      {/* Sidebar Panel */}
      {showSettingsPanel && (
        <div className="rendering-settings-panel">
          <div className="panel-header">
            <h3>Rendering Settings</h3>
            <button
              className="close-button"
              onClick={() => setShowSettingsPanel(false)}
              title="Close"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Presets */}
          <div className="presets-section">
            <label className="section-label">Presets</label>
            <div className="presets-buttons">
              <button className="preset-btn" onClick={() => applyPreset('default')}>
                Default
              </button>
              <button className="preset-btn" onClick={() => applyPreset('presentation')}>
                Presentation
              </button>
              <button className="preset-btn" onClick={() => applyPreset('print')}>
                Print
              </button>
              <button className="preset-btn" onClick={() => applyPreset('compact')}>
                Compact
              </button>
            </div>
          </div>

          {/* Nodes Section */}
          <div className="settings-section">
            <button
              className="section-header"
              onClick={() => toggleSection('nodes')}
            >
              <span className="toggle-icon">{expandedSections.nodes ? '▼' : '▶'}</span>
              Nodes
            </button>
            {expandedSections.nodes && (
              <div className="section-content">
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
              </div>
            )}
          </div>

          {/* Edges Section */}
          <div className="settings-section">
            <button
              className="section-header"
              onClick={() => toggleSection('edges')}
            >
              <span className="toggle-icon">{expandedSections.edges ? '▼' : '▶'}</span>
              Edges / Lines
            </button>
            {expandedSections.edges && (
              <div className="section-content">
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
              </div>
            )}
          </div>

          {/* Labels Section */}
          <div className="settings-section">
            <button
              className="section-header"
              onClick={() => toggleSection('labels')}
            >
              <span className="toggle-icon">{expandedSections.labels ? '▼' : '▶'}</span>
              Labels
            </button>
            {expandedSections.labels && (
              <div className="section-content">
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
              </div>
            )}
          </div>

          {/* Layout Section */}
          <div className="settings-section">
            <button
              className="section-header"
              onClick={() => toggleSection('layout')}
            >
              <span className="toggle-icon">{expandedSections.layout ? '▼' : '▶'}</span>
              Layout
            </button>
            {expandedSections.layout && (
              <div className="section-content">
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
              </div>
            )}
          </div>

          {/* Container Section */}
          <div className="settings-section">
            <button
              className="section-header"
              onClick={() => toggleSection('container')}
            >
              <span className="toggle-icon">{expandedSections.container ? '▼' : '▶'}</span>
              Container
            </button>
            {expandedSections.container && (
              <div className="section-content">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={renderConfig.container.useMaxWidth}
                    onChange={(e) => updateContainer({ useMaxWidth: e.target.checked })}
                  />
                  Use Max Width
                </label>
                <ColorPicker
                  label="Background Color"
                  value={renderConfig.container.backgroundColor}
                  onChange={(value) => updateContainer({ backgroundColor: value })}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="panel-actions">
            <button className={`action-btn apply-btn ${applyFeedback ? 'apply-confirmed' : ''}`} onClick={handleApply}>
              {applyFeedback ? '✓ Applied!' : '✓ Apply Settings'}
            </button>
            <button className="action-btn reset-btn" onClick={resetToDefaults}>
              Reset to Defaults
            </button>
            <button className="action-btn export-btn" onClick={handleExport}>
              Export Config
            </button>
          </div>
        </div>
      )}
    </>
  )
}
