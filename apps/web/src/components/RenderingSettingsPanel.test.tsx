import { test, expect, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RenderingSettingsPanel } from './RenderingSettingsPanel'

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

describe('RenderingSettingsPanel Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  test('renders toggle button', () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle')
    expect(toggleButton).toBeInTheDocument()
  })

  test('panel is hidden by default', () => {
    render(<RenderingSettingsPanel />)

    const panel = document.querySelector('.rendering-settings-panel')
    expect(panel).not.toBeInTheDocument()
  })

  test('opens panel when toggle button is clicked', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      const panel = document.querySelector('.rendering-settings-panel')
      expect(panel).toBeInTheDocument()
    })
  })

  test('closes panel when close button is clicked', async () => {
    render(<RenderingSettingsPanel />)

    // Open panel
    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(document.querySelector('.rendering-settings-panel')).toBeInTheDocument()
    })

    // Close panel
    const closeButton = document.querySelector('.close-button') as HTMLElement
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(document.querySelector('.rendering-settings-panel')).not.toBeInTheDocument()
    })
  })

  test('renders preset buttons', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Presentation')).toBeInTheDocument()
      expect(screen.getByText('Print')).toBeInTheDocument()
      expect(screen.getByText('Compact')).toBeInTheDocument()
    })
  })

  test('renders collapsible sections', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Nodes')).toBeInTheDocument()
      expect(screen.getByText('Edges / Lines')).toBeInTheDocument()
      expect(screen.getByText('Labels')).toBeInTheDocument()
      expect(screen.getByText('Layout')).toBeInTheDocument()
      expect(screen.getByText('Container')).toBeInTheDocument()
    })
  })

  test('renders action buttons', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
      expect(screen.getByText('Export Config')).toBeInTheDocument()
    })
  })

  test('expands and collapses sections', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Nodes')).toBeInTheDocument()
    })

    // Click section header to toggle
    const nodesHeader = Array.from(document.querySelectorAll('.section-header'))
      .find(el => el.textContent?.includes('Nodes')) as HTMLElement

    fireEvent.click(nodesHeader)

    // Check if section content becomes visible
    await waitFor(() => {
      const sectionContent = nodesHeader.nextElementSibling
      expect(sectionContent?.className).toContain('section-content')
    })
  })

  test('preset buttons are clickable', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    const defaultPreset = screen.getByText('Default') as HTMLElement
    expect(defaultPreset).not.toBeDisabled()

    fireEvent.click(defaultPreset)
    // Should not throw
  })

  test('shows correct number of sections', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      const sections = document.querySelectorAll('.settings-section')
      expect(sections.length).toBe(5) // Nodes, Edges, Labels, Layout, Container
    })
  })

  test('header has title and close button', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('Rendering Settings')).toBeInTheDocument()
    })

    const closeButton = document.querySelector('.close-button')
    expect(closeButton).toBeInTheDocument()
  })

  test('nodes section has controls', async () => {
    render(<RenderingSettingsPanel />)

    const toggleButton = document.querySelector('.rendering-settings-toggle') as HTMLElement
    fireEvent.click(toggleButton)

    // Expand Nodes section
    const nodesHeader = Array.from(document.querySelectorAll('.section-header'))
      .find(el => el.textContent?.includes('Nodes')) as HTMLElement

    await waitFor(() => {
      expect(nodesHeader).toBeInTheDocument()
    })

    fireEvent.click(nodesHeader)

    // Look for Font Size Select label
    await waitFor(() => {
      const labels = Array.from(document.querySelectorAll('label'))
      expect(labels.some(label => label.textContent?.includes('Font Size'))).toBe(true)
    })
  })
})
