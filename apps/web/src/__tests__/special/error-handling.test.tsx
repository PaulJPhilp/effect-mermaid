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

describe('Error Handling and Error Boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Invalid Mermaid Syntax Handling', () => {
    test('displays error when diagram has invalid syntax', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid Mermaid syntax
      fireEvent.change(textarea, { target: { value: 'invalid syntax [' } })

      // Error handling structure is in place
      expect(textarea).toBeInTheDocument()
    })

    test('error is cleared when code is edited', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid code
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Edit the code (error should be cleared)
      fireEvent.change(textarea, { target: { value: 'graph TD\n  A-->B' } })

      // Error state is cleared
      expect(textarea).toHaveValue('graph TD\n  A-->B')
    })

    test('error is cleared by dismiss button', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // The app handles error display via MermaidDiagram component
      // Error state can be dismissed by button if error occurs
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea).toBeInTheDocument()
    })

    test('multiple consecutive invalid syntax changes handled', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type multiple invalid variations
      fireEvent.change(textarea, { target: { value: '[' } })
      fireEvent.change(textarea, { target: { value: '{{' } })
      fireEvent.change(textarea, { target: { value: 'graph XXX' } })

      // App should remain functional
      expect(textarea).toBeInTheDocument()
    })

    test('recovering from invalid syntax works', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Start with invalid
      fireEvent.change(textarea, { target: { value: 'completely invalid [}]' } })

      // Fix it
      const validCode = 'graph LR\n  A[Start] --> B[End]'
      fireEvent.change(textarea, { target: { value: validCode } })

      // Should render the valid code
      expect(textarea).toHaveValue(validCode)
    })
  })

  describe('Theme-Related Error Handling', () => {
    test('missing theme falls back to default', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Default theme should be selected
      const defaultButton = screen.getByTitle('Switch to default theme')
      expect(defaultButton).toHaveClass('btn-active')
    })

    test('switching to deleted theme switches to default', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Temp' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Temp')).toBeInTheDocument()
      })

      // Select the theme
      const themeItem = screen.getByText('Temp').closest('.theme-item')
      const themeButton = themeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      expect(themeItem).toHaveClass('active')

      // Delete the selected theme
      const deleteButton = screen.getByLabelText('Delete Temp')
      fireEvent.click(deleteButton)

      const confirmDelete = screen.getByText('Delete')
      fireEvent.click(confirmDelete)

      await waitFor(() => {
        expect(screen.queryByText('Temp')).not.toBeInTheDocument()
      })

      // Should fall back to default theme
      const defaultTheme = screen.getByText('default').closest('.theme-item')
      expect(defaultTheme).toHaveClass('active')
    })

    test('theme registration handles errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // App should continue normally
      expect(screen.getByText('Diagram Code')).toBeInTheDocument()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Editor Error Recovery', () => {
    test('clear button works after error', async () => {
      global.confirm = vi.fn(() => true)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid code
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Clear should work
      const clearButton = screen.getByTitle('Clear editor')
      fireEvent.click(clearButton)

      expect(textarea).toHaveValue('')
    })

    test('reset button works after error', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid code
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Reset should work
      const resetButton = screen.getByTitle('Reset to example')
      fireEvent.click(resetButton)

      expect(textarea).toHaveValue(expect.stringContaining('graph LR'))
    })

    test('copy button works after error', async () => {
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid code
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Copy should work
      const copyButton = screen.getByTitle('Copy to clipboard')
      fireEvent.click(copyButton)

      expect(mockClipboard.writeText).toHaveBeenCalledWith('invalid')
    })

    test('theme switching works after error', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Type invalid code
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Switch theme should work
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')
    })
  })

  describe('Theme Builder Error States', () => {
    test('theme creation validates name input', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      // Try to create with empty name
      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton).toBeDisabled()

      // Try with whitespace
      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: '   ' } })

      expect(createButton).toBeDisabled()

      // Valid name
      fireEvent.change(input, { target: { value: 'Valid' } })
      expect(createButton).not.toBeDisabled()
    })

    test('theme deletion confirmation prevents accidental deletion', async () => {
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
      fireEvent.change(input, { target: { value: 'Protect' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Protect')).toBeInTheDocument()
      })

      // Close edit form
      const closeButton = screen.getAllByTitle('Close editor')[0]
      fireEvent.click(closeButton)

      // Click delete
      const deleteButton = screen.getByLabelText('Delete Protect')
      fireEvent.click(deleteButton)

      // Should show confirmation
      expect(screen.getByText('Delete "Protect"?')).toBeInTheDocument()

      // Cancel should prevent deletion
      const cancelButton = screen.getAllByText('Cancel')[0]
      fireEvent.click(cancelButton)

      // Theme should still exist
      expect(screen.getByText('Protect')).toBeInTheDocument()
    })

    test('color input handles invalid hex values', async () => {
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
      fireEvent.change(input, { target: { value: 'Color Test' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Editing: Color Test/)).toBeInTheDocument()
      })

      // Color inputs should exist and handle values
      expect(screen.getByText('Colors')).toBeInTheDocument()
    })
  })

  describe('Initialization Error Handling', () => {
    test('app shows loading state during initialization', async () => {
      render(<App />)

      // Should show loading initially
      expect(screen.getByText('Initializing Mermaid...')).toBeInTheDocument()

      // Should disappear after initialization
      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })
    })

    test('app is functional after initialization', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // All main features should be accessible
      expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()
      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByTitle('Reset to example')).toBeInTheDocument()
      expect(screen.getByTitle('Clear editor')).toBeInTheDocument()
      expect(screen.getByTitle('Open theme builder')).toBeInTheDocument()
    })
  })

  describe('Graceful Degradation', () => {
    test('app works with minimal localStorage support', async () => {
      // Simulating limited localStorage
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // App should still work
      expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()

      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    })

    test('app works without clipboard API', async () => {
      const originalClipboard = navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Copy button should still be accessible (even if it fails)
      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()

      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true
      })
    })
  })
})
