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

describe('Integration Tests: Diagram Rendering with Theme Changes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Theme Application to Diagrams', () => {
    test('diagram renders with selected theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Default theme should be active
      const defaultButton = screen.getByTitle('Switch to default theme')
      expect(defaultButton).toHaveClass('btn-active')

      // Switch to dark theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Dark theme should now be active
      expect(darkButton).toHaveClass('btn-active')
      expect(defaultButton).not.toHaveClass('btn-active')
    })

    test('all built-in themes are available and switchable', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const themeButtons = [
        { title: 'Switch to default theme', name: 'default' },
        { title: 'Switch to dark theme', name: 'dark' },
        { title: 'Switch to forest theme', name: 'forest' },
        { title: 'Switch to neutral theme', name: 'neutral' }
      ]

      for (const theme of themeButtons) {
        const button = screen.getByTitle(theme.title)
        fireEvent.click(button)

        expect(button).toHaveClass('btn-active')
        expect(button).toHaveAttribute('aria-pressed', 'true')
      }
    })

    test('theme persists when switching back to it', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      const darkButton = screen.getByTitle('Switch to dark theme')

      // Start with default (already active)
      expect(defaultButton).toHaveClass('btn-active')

      // Switch to dark
      fireEvent.click(darkButton)
      expect(darkButton).toHaveClass('btn-active')

      // Switch back to default
      fireEvent.click(defaultButton)
      expect(defaultButton).toHaveClass('btn-active')
      expect(darkButton).not.toHaveClass('btn-active')
    })
  })

  describe('Diagram Code with Theme Changes', () => {
    test('diagram code is preserved when changing themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const originalCode = (textarea as HTMLTextAreaElement).value

      // Change theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Code should remain unchanged
      expect(textarea).toHaveValue(originalCode)
    })

    test('modifying diagram and changing themes works correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const newCode = 'graph TD\n  A-->B\n  B-->C'

      // Modify diagram
      fireEvent.change(textarea, { target: { value: newCode } })
      expect(textarea).toHaveValue(newCode)

      // Change theme
      const forestButton = screen.getByTitle('Switch to forest theme')
      fireEvent.click(forestButton)

      // Code and theme should both be updated
      expect(textarea).toHaveValue(newCode)
      expect(forestButton).toHaveClass('btn-active')
    })
  })

  describe('Custom Theme Application to Diagrams', () => {
    test('custom theme is applied to diagram when selected', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create custom theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Custom Blue' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Wait for theme to be created
      await waitFor(() => {
        expect(screen.getByText('Custom Blue')).toBeInTheDocument()
      })

      // Verify edit form is shown
      expect(screen.getByText(/Editing: Custom Blue/)).toBeInTheDocument()

      // Save the theme
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // Should return to theme list
      await waitFor(() => {
        expect(screen.getByText('+ New Theme')).toBeInTheDocument()
      })

      // Select the custom theme
      const customThemeItem = screen.getByText('Custom Blue').closest('.theme-item')
      const themeButton = customThemeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Custom theme should be active
      expect(customThemeItem).toHaveClass('active')
    })

    test('changes to custom theme are reflected in diagram', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Dynamic Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Dynamic Theme')).toBeInTheDocument()
      })

      // Edit form should be open
      expect(screen.getByText(/Editing: Dynamic Theme/)).toBeInTheDocument()

      // Save theme
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('+ New Theme')).toBeInTheDocument()
      })

      // Select the theme
      const themeItem = screen.getByText('Dynamic Theme').closest('.theme-item')
      const themeButton = themeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Theme should be active
      expect(themeItem).toHaveClass('active')
    })
  })

  describe('Theme Switching During Diagram Editing', () => {
    test('user can edit diagram while switching themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type some code
      const code1 = 'graph LR\n  A-->B'
      fireEvent.change(textarea, { target: { value: code1 } })
      expect(textarea).toHaveValue(code1)

      // Switch theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Continue editing
      const code2 = code1 + '\n  B-->C'
      fireEvent.change(textarea, { target: { value: code2 } })
      expect(textarea).toHaveValue(code2)

      // Switch theme again
      const forestButton = screen.getByTitle('Switch to forest theme')
      fireEvent.click(forestButton)

      // Code should still be there
      expect(textarea).toHaveValue(code2)
      expect(forestButton).toHaveClass('btn-active')
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

      // Rapidly switch themes
      buttons.forEach(btn => fireEvent.click(btn))

      // Final button should be active
      expect(buttons[3]).toHaveClass('btn-active')
    })
  })

  describe('Theme Selection UI', () => {
    test('theme buttons display theme names correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Check that all theme buttons exist and display correct text
      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('Forest')).toBeInTheDocument()
      expect(screen.getByText('Neutral')).toBeInTheDocument()
    })

    test('theme button active state updates correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      const darkButton = screen.getByTitle('Switch to dark theme')

      // Check initial state
      expect(defaultButton).toHaveClass('btn-active')
      expect(defaultButton).toHaveAttribute('aria-pressed', 'true')
      expect(darkButton).not.toHaveClass('btn-active')
      expect(darkButton).toHaveAttribute('aria-pressed', 'false')

      // Switch theme
      fireEvent.click(darkButton)

      // Check updated state
      expect(defaultButton).not.toHaveClass('btn-active')
      expect(defaultButton).toHaveAttribute('aria-pressed', 'false')
      expect(darkButton).toHaveClass('btn-active')
      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Error Handling with Themes', () => {
    test('error display persists when switching themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Change to potentially invalid syntax
      fireEvent.change(textarea, { target: { value: 'invalid syntax' } })

      // Switch theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Verify theme change happened
      expect(darkButton).toHaveClass('btn-active')
    })

    test('clearing error when editing works with any theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Change to invalid syntax
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Switch theme
      const forestButton = screen.getByTitle('Switch to forest theme')
      fireEvent.click(forestButton)

      // Edit code to clear error
      const validCode = 'graph TD\n  A-->B'
      fireEvent.change(textarea, { target: { value: validCode } })

      // Should have valid code
      expect(textarea).toHaveValue(validCode)
    })
  })
})
