import { test, expect, describe, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRenderingSettings } from './useRenderingSettings'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useRenderingSettings Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  test('initializes with default config', () => {
    const { result } = renderHook(() => useRenderingSettings())

    expect(result.current.renderConfig).toBeDefined()
    expect(result.current.renderConfig.nodes).toBeDefined()
    expect(result.current.renderConfig.edges).toBeDefined()
    expect(result.current.renderConfig.labels).toBeDefined()
    expect(result.current.renderConfig.layout).toBeDefined()
    expect(result.current.renderConfig.container).toBeDefined()
  })

  test('updates node settings', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateNodes({ fontSize: 20 })
    })

    expect(result.current.renderConfig.nodes.fontSize).toBe(20)
  })

  test('updates edge settings', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateEdges({ lineWidth: 3 })
    })

    expect(result.current.renderConfig.edges.lineWidth).toBe(3)
  })

  test('updates label settings', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateLabels({ fontSize: 16 })
    })

    expect(result.current.renderConfig.labels.fontSize).toBe(16)
  })

  test('updates layout settings', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateLayout({ nodeSpacing: 100 })
    })

    expect(result.current.renderConfig.layout.nodeSpacing).toBe(100)
  })

  test('updates container settings', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateContainer({ useMaxWidth: true })
    })

    expect(result.current.renderConfig.container.useMaxWidth).toBe(true)
  })

  test('applies preset configuration', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.applyPreset('presentation')
    })

    // Presentation preset should have larger fonts
    expect(result.current.renderConfig.nodes.fontSize).toBeGreaterThan(14)
  })

  test('resets to default configuration', () => {
    const { result } = renderHook(() => useRenderingSettings())

    // Change some values
    act(() => {
      result.current.updateNodes({ fontSize: 25 })
    })

    // Reset
    act(() => {
      result.current.resetToDefaults()
    })

    expect(result.current.renderConfig.nodes.fontSize).toBe(14)
  })

  test('toggles settings panel visibility', () => {
    const { result } = renderHook(() => useRenderingSettings())

    expect(result.current.showSettingsPanel).toBe(false)

    act(() => {
      result.current.setShowSettingsPanel(true)
    })

    expect(result.current.showSettingsPanel).toBe(true)
  })

  test('exports config as JSON string', () => {
    const { result } = renderHook(() => useRenderingSettings())

    const exported = result.current.exportConfig()

    expect(typeof exported).toBe('string')
    expect(() => JSON.parse(exported)).not.toThrow()

    const parsed = JSON.parse(exported)
    expect(parsed.nodes).toBeDefined()
    expect(parsed.edges).toBeDefined()
  })

  test('imports config from JSON string', () => {
    const { result } = renderHook(() => useRenderingSettings())

    // Create a custom config
    act(() => {
      result.current.updateNodes({ fontSize: 25 })
    })

    const exported = result.current.exportConfig()

    // Reset to defaults
    act(() => {
      result.current.resetToDefaults()
    })

    expect(result.current.renderConfig.nodes.fontSize).toBe(14)

    // Import the saved config
    act(() => {
      result.current.importConfig(exported)
    })

    expect(result.current.renderConfig.nodes.fontSize).toBe(25)
  })

  test('generates mermaid config with themeVariables', () => {
    const { result } = renderHook(() => useRenderingSettings())

    const mermaidConfig = result.current.getMermaidConfig()

    expect(mermaidConfig).toBeDefined()
    expect(typeof mermaidConfig).toBe('object')
  })

  test('persists config to localStorage', () => {
    const { result } = renderHook(() => useRenderingSettings())

    act(() => {
      result.current.updateNodes({ fontSize: 22 })
    })

    const saved = localStorage.getItem('mermaid-render-config')
    expect(saved).toBeTruthy()

    const parsed = JSON.parse(saved!)
    expect(parsed.nodes.fontSize).toBe(22)
  })

  test('loads config from localStorage on initialization', () => {
    // Pre-populate localStorage
    const savedConfig = {
      nodes: { fontSize: 18, fontFamily: 'arial, sans-serif', borderWidth: 2, padding: 12, backgroundColor: '#ff0000' },
      edges: { lineWidth: 2, color: '#000000', style: 'solid' as const, curve: 'linear' as const },
      labels: { fontSize: 12, backgroundColor: '#ffffff' },
      layout: { nodeSpacing: 50, rankSpacing: 50, padding: 10 },
      container: { useMaxWidth: false, backgroundColor: '#ffffff' }
    }

    localStorage.setItem('mermaid-render-config', JSON.stringify(savedConfig))

    const { result } = renderHook(() => useRenderingSettings())

    expect(result.current.renderConfig.nodes.fontSize).toBe(18)
    expect(result.current.renderConfig.nodes.backgroundColor).toBe('#ff0000')
  })
})
