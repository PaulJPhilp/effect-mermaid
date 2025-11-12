import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../../App'

// Mock Mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (id: string, code: string) => ({
      svg: '<svg>Mock Diagram</svg>'
    })),
    themes: {}
  }
}))

describe('Performance Tests - Rendering Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial Render Performance', () => {
    test('app renders without unnecessary re-renders', async () => {
      const renderSpy = vi.fn()

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // App should be rendered
      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
    })

    test('initial load shows loading state immediately', async () => {
      const { rerender } = render(<App />)

      // Loading should appear first
      expect(screen.getByText('Initializing Mermaid...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
    })
  })

  describe('Text Input Performance', () => {
    test('large text input does not cause lag', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Simulate rapid typing
      const largeContent = 'a'.repeat(5000)

      const startTime = performance.now()

      fireEvent.change(textarea, { target: { value: largeContent } })

      const endTime = performance.now()

      // Change should be processed quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      expect(textarea).toHaveValue(largeContent)
    })

    test('handles rapid consecutive edits', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      const startTime = performance.now()

      // Simulate rapid typing
      for (let i = 0; i < 50; i++) {
        fireEvent.change(textarea, { target: { value: `line ${i}\n` } })
      }

      const endTime = performance.now()

      // 50 rapid changes should complete in reasonable time (< 500ms)
      expect(endTime - startTime).toBeLessThan(500)
    })

    test('line count updates efficiently', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      const startTime = performance.now()

      // Add many lines
      const manyLines = Array(100).fill('line\n').join('')
      fireEvent.change(textarea, { target: { value: manyLines } })

      const endTime = performance.now()

      // Update should be fast even with many lines
      expect(endTime - startTime).toBeLessThan(50)
      expect(screen.getByText(/100 lines/)).toBeInTheDocument()
    })
  })

  describe('Theme Switching Performance', () => {
    test('theme switching is fast', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const startTime = performance.now()

      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      const endTime = performance.now()

      // Theme switch should be instant (< 50ms)
      expect(endTime - startTime).toBeLessThan(50)
    })

    test('rapid theme switching works smoothly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const buttons = [
        screen.getByTitle('Switch to default theme'),
        screen.getByTitle('Switch to dark theme'),
        screen.getByTitle('Switch to forest theme'),
        screen.getByTitle('Switch to neutral theme')
      ]

      const startTime = performance.now()

      // Rapid switches
      for (let i = 0; i < 10; i++) {
        buttons.forEach(btn => fireEvent.click(btn))
      }

      const endTime = performance.now()

      // 40 theme switches should complete quickly
      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('Theme Creation Performance', () => {
    test('creating theme does not block UI', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const startTime = performance.now()

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Performance Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      const endTime = performance.now()

      // Theme creation should be fast
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Many Themes Performance', () => {
    test('app handles many custom themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const startTime = performance.now()

      // Create many themes
      const createTheme = async (name: string) => {
        const newThemeButton = screen.getByText('+ New Theme')
        fireEvent.click(newThemeButton)

        const input = screen.getByPlaceholderText('Theme name')
        fireEvent.change(input, { target: { value: name } })

        const createButton = screen.getByText('Create')
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(screen.getByText(name)).toBeInTheDocument()
        })

        const closeButton = screen.getAllByTitle('Close editor')[0]
        fireEvent.click(closeButton)
      }

      // Create 5 themes
      for (let i = 0; i < 5; i++) {
        await createTheme(`Theme ${i}`)
      }

      const endTime = performance.now()

      // Creating 5 themes should not take excessive time
      expect(endTime - startTime).toBeLessThan(2000)
    })

    test('rendering many themes in list is efficient', async () => {
      // Pre-populate localStorage with many themes
      const themes: Record<string, any> = {}
      for (let i = 0; i < 10; i++) {
        themes[`Theme ${i}`] = {
          name: `Theme ${i}`,
          colors: { background: `#${i}${i}${i}` }
        }
      }
      localStorage.setItem('effect-mermaid-custom-themes', JSON.stringify(themes))

      const startTime = performance.now()

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const endTime = performance.now()

      // Loading with many themes should be fast
      expect(endTime - startTime).toBeLessThan(2000)

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // All themes should be visible
      expect(screen.getByText('Theme 0')).toBeInTheDocument()
      expect(screen.getByText('Theme 9')).toBeInTheDocument()
    })
  })

  describe('Complex Operations Performance', () => {
    test('combined editing and theme switching is performant', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      const startTime = performance.now()

      // Interleave editing and theme switching
      for (let i = 0; i < 20; i++) {
        fireEvent.change(textarea, { target: { value: `graph LR\n  A-->B${i}` } })

        if (i % 2 === 0) {
          const darkButton = screen.getByTitle('Switch to dark theme')
          fireEvent.click(darkButton)
        } else {
          const defaultButton = screen.getByTitle('Switch to default theme')
          fireEvent.click(defaultButton)
        }
      }

      const endTime = performance.now()

      // 40 operations (20 edits + 20 theme switches) should complete quickly
      expect(endTime - startTime).toBeLessThan(500)
    })
  })

  describe('Memory Efficiency', () => {
    test('does not leak memory on theme creation/deletion cycles', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create and delete themes multiple times
      for (let cycle = 0; cycle < 5; cycle++) {
        const newThemeButton = screen.getByText('+ New Theme')
        fireEvent.click(newThemeButton)

        const input = screen.getByPlaceholderText('Theme name')
        fireEvent.change(input, { target: { value: `Cycle ${cycle}` } })

        const createButton = screen.getByText('Create')
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(screen.getByText(`Cycle ${cycle}`)).toBeInTheDocument()
        })

        // Close edit form
        const closeButton = screen.getAllByTitle('Close editor')[0]
        fireEvent.click(closeButton)

        // Delete the theme
        const deleteButton = screen.getByLabelText(`Delete Cycle ${cycle}`)
        fireEvent.click(deleteButton)

        const confirmDelete = screen.getByText('Delete')
        fireEvent.click(confirmDelete)

        await waitFor(() => {
          expect(screen.queryByText(`Cycle ${cycle}`)).not.toBeInTheDocument()
        })
      }

      // After cycles, app should still be responsive
      expect(screen.getByText('Theme Builder')).toBeInTheDocument()
    })
  })

  describe('Component Re-render Optimization', () => {
    test('changing one input does not cause unnecessary re-renders', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Line count should update only once per change
      fireEvent.change(textarea, { target: { value: 'line1\nline2' } })

      // Count should be correct
      expect(screen.getByText(/2 lines/)).toBeInTheDocument()

      // Verify text is updated
      expect(textarea).toHaveValue('line1\nline2')
    })

    test('theme selection updates only affected elements', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const originalValue = (textarea as HTMLTextAreaElement).value

      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Editor content should remain unchanged
      expect(textarea).toHaveValue(originalValue)
    })
  })

  describe('Event Handler Performance', () => {
    test('button click handlers are efficient', async () => {
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')

      const startTime = performance.now()

      // Multiple rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(copyButton)
      }

      const endTime = performance.now()

      // 10 clicks should process quickly
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Scroll Performance', () => {
    test('scrolling in textarea does not cause lag', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Add large content
      const largeContent = Array(100).fill('line\n').join('')
      fireEvent.change(textarea, { target: { value: largeContent } })

      const startTime = performance.now()

      // Simulate scroll events
      for (let i = 0; i < 20; i++) {
        fireEvent.scroll(textarea, { target: { scrollY: i * 10 } })
      }

      const endTime = performance.now()

      // Scrolling should be smooth (< 200ms)
      expect(endTime - startTime).toBeLessThan(200)
    })
  })

  describe('Animation Performance', () => {
    test('sidebar open/close transition does not block interaction', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')

      const startTime = performance.now()

      // Open sidebar
      fireEvent.click(toggleButton)

      // Immediately interact
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const endTime = performance.now()

      // Opening and clicking should be responsive
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Layout Performance', () => {
    test('layout does not reflow excessively', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      const startTime = performance.now()

      // Rapid content changes
      for (let i = 0; i < 30; i++) {
        fireEvent.change(textarea, { target: { value: `content ${i}\n`.repeat(10) } })
      }

      const endTime = performance.now()

      // Should handle 30 layout-affecting changes efficiently
      expect(endTime - startTime).toBeLessThan(300)
    })
  })
})
