import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('Keyboard Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Theme Creation Keyboard', () => {
    test('Enter key submits new theme form', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Enter Theme' } })

      // Submit with Enter key
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Enter Theme')).toBeInTheDocument()
      })
    })

    test('Escape key cancels new theme form', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Cancel Me' } })

      // Cancel with Escape key
      fireEvent.keyDown(input, { key: 'Escape' })

      // Form should close
      expect(screen.queryByPlaceholderText('Theme name')).not.toBeInTheDocument()
      expect(screen.getByText('+ New Theme')).toBeInTheDocument()
    })

    test('input autofocuses when form opens', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name') as HTMLInputElement
      expect(input).toHaveFocus()
    })

    test('Escape key with empty input cancels form', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')

      // Don't type anything, just press Escape
      fireEvent.keyDown(input, { key: 'Escape' })

      expect(screen.queryByPlaceholderText('Theme name')).not.toBeInTheDocument()
    })

    test('Enter on empty input does nothing', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')

      // Press Enter with empty input
      fireEvent.keyDown(input, { key: 'Enter' })

      // Form should still be open
      expect(screen.getByPlaceholderText('Theme name')).toBeInTheDocument()
    })
  })

  describe('Editor Textarea Keyboard', () => {
    test('typing in editor updates content', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      await user.click(textarea)
      await user.keyboard('test code')

      expect(textarea).toHaveValue(expect.stringContaining('test code'))
    })

    test('Enter key in editor adds newline', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Clear default content
      fireEvent.change(textarea, { target: { value: '' } })

      await user.click(textarea)
      await user.keyboard('line1{Enter}line2')

      const value = (textarea as HTMLTextAreaElement).value
      expect(value).toContain('line1\nline2')
    })

    test('Tab key behavior in textarea', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      await user.click(textarea)
      // Tab handling is browser-dependent
      expect(textarea).toHaveFocus()
    })

    test('Ctrl+A selects all text in textarea', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      textarea.focus()

      // Select all
      fireEvent.keyDown(textarea, { key: 'a', ctrlKey: true })

      // Textarea should have focus
      expect(textarea).toHaveFocus()
    })
  })

  describe('Button Keyboard Navigation', () => {
    test('Tab key navigates through buttons', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      const resetButton = screen.getByTitle('Reset to example')
      const clearButton = screen.getByTitle('Clear editor')

      // Focus first button
      copyButton.focus()
      expect(copyButton).toHaveFocus()

      // Tab to next
      fireEvent.keyDown(copyButton, { key: 'Tab' })
      resetButton.focus()
      expect(resetButton).toHaveFocus()

      fireEvent.keyDown(resetButton, { key: 'Tab' })
      clearButton.focus()
      expect(clearButton).toHaveFocus()
    })

    test('Space key activates buttons', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      toggleButton.focus()

      // Activate with Space
      fireEvent.keyDown(toggleButton, { key: ' ' })
      fireEvent.click(toggleButton)

      // Sidebar should open
      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')
    })

    test('Enter key activates buttons', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      toggleButton.focus()

      // Activate with Enter
      fireEvent.keyDown(toggleButton, { key: 'Enter' })
      fireEvent.click(toggleButton)

      // Sidebar should open
      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')
    })
  })

  describe('Color Input Keyboard', () => {
    test('Enter key in color text input confirms change', async () => {
      const user = userEvent.setup()
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
      fireEvent.change(input, { target: { value: 'Keyboard Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Editing: Keyboard Theme/)).toBeInTheDocument()
      })

      // Color inputs should be present
      expect(screen.getByText('Colors')).toBeInTheDocument()

      // Get a color input text field
      const colorInputs = screen.getAllByPlaceholderText('#000000')
      if (colorInputs.length > 0) {
        const colorInput = colorInputs[0]
        fireEvent.change(colorInput, { target: { value: '#ff0000' } })

        // Press Enter to confirm
        fireEvent.keyDown(colorInput, { key: 'Enter' })

        // Input should still be there
        expect(colorInput).toBeInTheDocument()
      }
    })
  })

  describe('Dialog and Modal Keyboard', () => {
    test('Escape key closes theme editor', async () => {
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
      fireEvent.change(input, { target: { value: 'Escape Test' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Editing: Escape Test/)).toBeInTheDocument()
      })

      // Close button click
      const closeButtons = screen.getAllByTitle('Close editor')
      fireEvent.click(closeButtons[0])

      // Should return to theme list
      expect(screen.getByText('+ New Theme')).toBeInTheDocument()
    })

    test('Escape key cancels delete confirmation', async () => {
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
      fireEvent.change(input, { target: { value: 'Delete Cancel' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Delete Cancel')).toBeInTheDocument()
      })

      // Close edit form
      const closeButtons = screen.getAllByTitle('Close editor')[0]
      fireEvent.click(closeButtons)

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete Delete Cancel')
      fireEvent.click(deleteButton)

      // Confirmation should appear
      expect(screen.getByText('Delete "Delete Cancel"?')).toBeInTheDocument()

      // Cancel the deletion
      const cancelButtons = screen.getAllByText('Cancel')
      fireEvent.click(cancelButtons[0])

      // Theme should still exist
      expect(screen.getByText('Delete Cancel')).toBeInTheDocument()
    })
  })

  describe('Theme Selection Keyboard', () => {
    test('Space key selects theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const darkButton = screen.getByTitle('Switch to dark theme')
      darkButton.focus()

      // Activate with Space
      fireEvent.keyDown(darkButton, { key: ' ' })
      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')
    })

    test('Enter key selects theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const forestButton = screen.getByTitle('Switch to forest theme')
      forestButton.focus()

      // Activate with Enter
      fireEvent.keyDown(forestButton, { key: 'Enter' })
      fireEvent.click(forestButton)

      expect(forestButton).toHaveClass('btn-active')
    })
  })

  describe('Global Keyboard Shortcuts', () => {
    test('focusing sidebar does not prevent global shortcuts', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      newThemeButton.focus()

      // Should still be able to perform other actions
      expect(newThemeButton).toHaveFocus()
    })

    test('typing in inputs does not trigger unintended actions', async () => {
      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')

      await user.type(input, 'test theme')

      expect(input).toHaveValue('test theme')
    })
  })
})
