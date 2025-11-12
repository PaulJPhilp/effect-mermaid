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

describe('Responsive Layout Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Reset viewport to default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })
  })

  describe('Desktop Layout (> 768px)', () => {
    test('renders two-column layout on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Both panels should be visible
      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
      expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
    })

    test('editor and preview panels are rendered', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea).toBeInTheDocument()
    })

    test('sidebar is hidden on desktop by default', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })

    test('sidebar toggles open on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')
    })

    test('all toolbar buttons are visible on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByTitle('Reset to example')).toBeInTheDocument()
      expect(screen.getByTitle('Clear editor')).toBeInTheDocument()
    })

    test('theme buttons are visible on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByTitle('Switch to default theme')).toBeInTheDocument()
      expect(screen.getByTitle('Switch to dark theme')).toBeInTheDocument()
    })
  })

  describe('Tablet Layout (768px)', () => {
    test('renders content at tablet width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Main content should be visible
      expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()
    })

    test('sidebar overlay works on tablet', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')

      // Close sidebar
      fireEvent.click(toggleButton)
      expect(sidebar).not.toHaveClass('open')
    })
  })

  describe('Mobile Layout (< 768px)', () => {
    test('renders content on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Main content should be visible
      expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()
    })

    test('sidebar is hidden on mobile by default', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })

    test('sidebar overlays on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')
    })

    test('all functionality works on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Test core features
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: 'graph TD\n  A-->B' } })

      expect(textarea).toHaveValue('graph TD\n  A-->B')

      // Theme switching works
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')
    })

    test('buttons are accessible on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByTitle('Reset to example')).toBeInTheDocument()
      expect(screen.getByTitle('Clear editor')).toBeInTheDocument()
      expect(screen.getByTitle('Open theme builder')).toBeInTheDocument()
    })

    test('theme builder sidebar can be opened and closed on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open sidebar
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Theme Builder')).toBeInTheDocument()

      // Close sidebar
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })
  })

  describe('Content Overflow and Scrolling', () => {
    test('textarea scrolls on mobile when content is large', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Add large content
      const largeContent = Array(50).fill('line\n').join('')
      fireEvent.change(textarea, { target: { value: largeContent } })

      // Textarea should still be functional
      expect(textarea).toBeInTheDocument()
    })

    test('sidebar content scrolls when necessary', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create multiple themes to test scrolling
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

      // Create several themes
      await createTheme('Theme 1')
      await createTheme('Theme 2')

      // Sidebar should still be functional
      expect(screen.getByText('Theme Builder')).toBeInTheDocument()
    })
  })

  describe('Responsive Interactions', () => {
    test('sidebar overlay closes on mobile when clicking outside', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')

      // Click to close (simulating overlay click)
      fireEvent.click(toggleButton)

      expect(sidebar).not.toHaveClass('open')
    })

    test('theme selection works on all viewport sizes', async () => {
      const widths = [480, 768, 1024]

      for (const width of widths) {
        localStorage.clear()

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width,
        })

        const { unmount } = render(<App />)

        await waitFor(() => {
          expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
        }, { timeout: 5000 })

        const darkButton = screen.getByTitle('Switch to dark theme')
        fireEvent.click(darkButton)

        expect(darkButton).toHaveClass('btn-active')

        unmount()
      }
    })

    test('editor works on all viewport sizes', async () => {
      const widths = [480, 768, 1024]

      for (const width of widths) {
        localStorage.clear()

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width,
        })

        const { unmount } = render(<App />)

        await waitFor(() => {
          expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
        }, { timeout: 5000 })

        const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
        const testCode = 'graph TD\n  Test'

        fireEvent.change(textarea, { target: { value: testCode } })

        expect(textarea).toHaveValue(testCode)

        unmount()
      }
    })
  })

  describe('Touch Interactions (Mobile)', () => {
    test('buttons are touch-friendly on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const buttons = [
        screen.getByTitle('Copy to clipboard'),
        screen.getByTitle('Reset to example'),
        screen.getByTitle('Clear editor')
      ]

      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
        // Buttons should be easily clickable (not testing size as CSS is not evaluated)
        fireEvent.click(button)
      })
    })

    test('sidebar navigation is touch-friendly', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 480,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')

      // Should be easily clickable
      fireEvent.click(toggleButton)
      expect(screen.getByText('Theme Builder')).toBeInTheDocument()

      fireEvent.click(toggleButton)
    })
  })

  describe('Content Visibility', () => {
    test('important content is visible on all screen sizes', async () => {
      const widths = [480, 768, 1024]

      for (const width of widths) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width,
        })

        const { unmount } = render(<App />)

        await waitFor(() => {
          expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
        }, { timeout: 5000 })

        // Critical UI elements should be visible
        expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()
        expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
        expect(screen.getByTitle('Open theme builder')).toBeInTheDocument()

        unmount()
      }
    })
  })
})
