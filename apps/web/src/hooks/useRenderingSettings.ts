import { useState, useEffect } from 'react'
import {
  ElementLevelRenderConfig,
  DEFAULT_RENDER_CONFIG,
  PRESETS,
  RenderPreset,
  toMermaidConfig,
} from '../types/renderConfig'

const STORAGE_KEY = 'effect-mermaid-render-config'

/**
 * Hook for managing rendering settings state and persistence
 */
export function useRenderingSettings() {
  const [renderConfig, setRenderConfig] = useState<ElementLevelRenderConfig>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load render config from storage:', error)
    }
    return DEFAULT_RENDER_CONFIG
  })

  const [showSettingsPanel, setShowSettingsPanel] = useState(false)

  // Persist to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(renderConfig))
    } catch (error) {
      console.error('Failed to save render config to storage:', error)
    }
  }, [renderConfig])

  // Setters for each config section
  const updateNodes = (updates: Partial<ElementLevelRenderConfig['nodes']>) => {
    setRenderConfig(prev => ({
      ...prev,
      nodes: { ...prev.nodes, ...updates },
    }))
  }

  const updateEdges = (updates: Partial<ElementLevelRenderConfig['edges']>) => {
    setRenderConfig(prev => ({
      ...prev,
      edges: { ...prev.edges, ...updates },
    }))
  }

  const updateLabels = (updates: Partial<ElementLevelRenderConfig['labels']>) => {
    setRenderConfig(prev => ({
      ...prev,
      labels: { ...prev.labels, ...updates },
    }))
  }

  const updateLayout = (updates: Partial<ElementLevelRenderConfig['layout']>) => {
    setRenderConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, ...updates },
    }))
  }

  const updateContainer = (updates: Partial<ElementLevelRenderConfig['container']>) => {
    setRenderConfig(prev => ({
      ...prev,
      container: { ...prev.container, ...updates },
    }))
  }

  const applyPreset = (preset: RenderPreset) => {
    setRenderConfig(PRESETS[preset])
  }

  const resetToDefaults = () => {
    setRenderConfig(DEFAULT_RENDER_CONFIG)
  }

  const getMermaidConfig = () => {
    return toMermaidConfig(renderConfig)
  }

  const exportConfig = () => {
    return JSON.stringify(renderConfig, null, 2)
  }

  const importConfig = (configJson: string) => {
    try {
      const imported = JSON.parse(configJson)
      setRenderConfig(imported)
      return true
    } catch (error) {
      console.error('Failed to import render config:', error)
      return false
    }
  }

  return {
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
    getMermaidConfig,
    exportConfig,
    importConfig,
  }
}
