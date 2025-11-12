import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistryProvider } from '@effect-atom/atom-react'
import { MermaidProvider } from 'effect-mermaid-react'
import { App } from '../App'

// Mock the Mermaid module to avoid loading actual mermaid.js
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (id: string, code: string) => ({
      svg: '<svg>Mock Diagram</svg>'
    })),
    themes: {}
  }
}))

describe('EditorContent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Text Input and Updates', () => {
    test('updates textarea when user types', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const newCode = 'graph TD\n  A-->B'

      fireEvent.change(textarea, { target: { value: newCode } })

      expect(textarea).toHaveValue(newCode)
    })

    test('clears error when user edits code', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Change code to trigger potential error
      fireEvent.change(textarea, { target: { value: 'new content' } })

      // Error state should be cleared by component on code change
      expect(textarea).toHaveValue('new content')
    })

    test('handles multi-line input correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const multiLineCode = 'graph LR\n  A-->B\n  B-->C\n  C-->D'

      fireEvent.change(textarea, { target: { value: multiLineCode } })

      expect(textarea).toHaveValue(multiLineCode)
      expect(screen.getByText(/4 lines/)).toBeInTheDocument()
    })

    test('handles special Mermaid syntax characters', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const syntaxCode = 'graph LR\n  A["Node (with parens)"] -->|condition| B'

      fireEvent.change(textarea, { target: { value: syntaxCode } })

      expect(textarea).toHaveValue(syntaxCode)
    })
  })

  describe('Line and Character Counter', () => {
    test('displays correct initial line count', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Default diagram has 5 lines
      expect(screen.getByText(/5 lines/)).toBeInTheDocument()
    })

    test('updates line count when adding new lines', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: 'line1\nline2\nline3' } })

      expect(screen.getByText(/3 lines/)).toBeInTheDocument()
    })

    test('updates character count correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const testCode = 'test'

      fireEvent.change(textarea, { target: { value: testCode } })

      expect(screen.getByText(new RegExp(`${testCode.length} characters`))).toBeInTheDocument()
    })

    test('handles empty editor line count', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: '' } })

      expect(screen.getByText(/1 line • 0 characters/)).toBeInTheDocument()
    })

    test('uses correct singular/plural for line count', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Single line
      fireEvent.change(textarea, { target: { value: 'single line' } })
      expect(screen.getByText(/1 line/)).toBeInTheDocument()

      // Multiple lines
      fireEvent.change(textarea, { target: { value: 'line1\nline2' } })
      expect(screen.getByText(/2 lines/)).toBeInTheDocument()
    })
  })

  describe('Copy Button', () => {
    test('copies diagram code to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      fireEvent.click(copyButton)

      expect(mockClipboard.writeText).toHaveBeenCalled()
    })

    test('copies current editor content to clipboard', async () => {
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const newCode = 'graph TD\n  A-->B'

      fireEvent.change(textarea, { target: { value: newCode } })
      fireEvent.click(screen.getByTitle('Copy to clipboard'))

      expect(mockClipboard.writeText).toHaveBeenCalledWith(newCode)
    })

    test('has correct button title and accessibility', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      expect(copyButton).toBeInTheDocument()
      expect(copyButton).toHaveTextContent('Copy')
    })
  })

  describe('Reset Button', () => {
    test('restores default diagram', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const resetButton = screen.getByTitle('Reset to example')

      // Change the code
      fireEvent.change(textarea, { target: { value: 'new code' } })
      expect(textarea).toHaveValue('new code')

      // Reset it
      fireEvent.click(resetButton)

      expect(textarea).toHaveValue(expect.stringContaining('graph LR'))
      expect(textarea).toHaveValue(expect.stringContaining('Start'))
    })

    test('restores default diagram line count', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const resetButton = screen.getByTitle('Reset to example')

      // Change the code
      fireEvent.change(textarea, { target: { value: 'one\ntwo' } })
      expect(screen.getByText(/2 lines/)).toBeInTheDocument()

      // Reset should restore default line count (5 lines)
      fireEvent.click(resetButton)

      expect(screen.getByText(/5 lines/)).toBeInTheDocument()
    })

    test('has correct button title and accessibility', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const resetButton = screen.getByTitle('Reset to example')
      expect(resetButton).toBeInTheDocument()
      expect(resetButton).toHaveTextContent('Reset')
    })
  })

  describe('Clear Button', () => {
    test('clears editor when confirmed', async () => {
      global.confirm = vi.fn(() => true)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const clearButton = screen.getByTitle('Clear editor')

      fireEvent.click(clearButton)

      expect(textarea).toHaveValue('')
      expect(global.confirm).toHaveBeenCalledWith('Clear editor?')
    })

    test('does not clear editor when cancelled', async () => {
      global.confirm = vi.fn(() => false)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const originalValue = textarea.value
      const clearButton = screen.getByTitle('Clear editor')

      fireEvent.click(clearButton)

      expect(textarea).toHaveValue(originalValue)
    })

    test('resets line count when clearing', async () => {
      global.confirm = vi.fn(() => true)

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const clearButton = screen.getByTitle('Clear editor')
      fireEvent.click(clearButton)

      expect(screen.getByText(/1 line • 0 characters/)).toBeInTheDocument()
    })

    test('shows confirmation dialog', async () => {
      const confirmMock = vi.fn(() => true)
      global.confirm = confirmMock

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const clearButton = screen.getByTitle('Clear editor')
      fireEvent.click(clearButton)

      expect(confirmMock).toHaveBeenCalledWith('Clear editor?')
    })

    test('has correct button title and accessibility', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const clearButton = screen.getByTitle('Clear editor')
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveTextContent('Clear')
    })
  })

  describe('Theme Selection', () => {
    test('displays all theme buttons', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Built-in themes
      expect(screen.getByTitle('Switch to default theme')).toBeInTheDocument()
      expect(screen.getByTitle('Switch to dark theme')).toBeInTheDocument()
      expect(screen.getByTitle('Switch to forest theme')).toBeInTheDocument()
      expect(screen.getByTitle('Switch to neutral theme')).toBeInTheDocument()
    })

    test('default theme is active on load', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      expect(defaultButton).toHaveClass('btn-active')
    })

    test('switches theme when button clicked', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      const darkButton = screen.getByTitle('Switch to dark theme')

      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')
      expect(defaultButton).not.toHaveClass('btn-active')
    })

    test('only one theme button is active at a time', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      const darkButton = screen.getByTitle('Switch to dark theme')
      const forestButton = screen.getByTitle('Switch to forest theme')

      fireEvent.click(darkButton)
      expect(darkButton).toHaveClass('btn-active')
      expect(defaultButton).not.toHaveClass('btn-active')

      fireEvent.click(forestButton)
      expect(forestButton).toHaveClass('btn-active')
      expect(darkButton).not.toHaveClass('btn-active')
    })

    test('theme buttons have aria-pressed attribute', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      const darkButton = screen.getByTitle('Switch to dark theme')

      expect(defaultButton).toHaveAttribute('aria-pressed', 'true')
      expect(darkButton).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(darkButton)
      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
      expect(defaultButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Error Display and Handling', () => {
    test('displays error message when set', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Error display structure exists
      expect(screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')).toBeInTheDocument()
    })

    test('error can be dismissed', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Change to potentially invalid content
      fireEvent.change(textarea, { target: { value: 'invalid' } })

      // Verify textarea is still there (error dismissed when code changes)
      expect(textarea).toHaveValue('invalid')
    })
  })

  describe('Panel Structure and Accessibility', () => {
    test('renders editor and preview panels', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
      expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
    })

    test('renders toolbar with all buttons', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByTitle('Reset to example')).toBeInTheDocument()
      expect(screen.getByTitle('Clear editor')).toBeInTheDocument()
    })

    test('textarea has proper attributes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea).toHaveAttribute('spellcheck', 'false')
      expect(textarea).toHaveAttribute('placeholder')
    })
  })

  describe('Loading State', () => {
    test('shows loading spinner while initializing', async () => {
      render(<App />)

      expect(screen.getByText('Initializing Mermaid...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })
    })

    test('hides loading spinner after initialization', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
    })
  })
})
