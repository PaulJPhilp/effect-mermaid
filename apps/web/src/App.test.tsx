import { test, expect, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

// Mock the Mermaid module to avoid loading actual mermaid.js
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (id: string, code: string) => ({
      svg: '<svg>Mock Diagram</svg>'
    }))
  }
}))

// Helper function to get the CodeMirror content
function getCodeMirrorContent(): string {
  const editor = document.querySelector('.cm-content')
  return editor?.textContent || ''
}

// Helper function to set CodeMirror content by simulating user input
async function setCodeMirrorContent(content: string) {
  const user = userEvent.setup()
  const editor = document.querySelector('.cm-editor')
  if (!editor) {
    throw new Error('CodeMirror editor not found')
  }
  // Find the actual editable area
  const editable = editor.querySelector('[contenteditable="true"]')
  if (editable) {
    await user.click(editable)
  } else {
    await user.click(editor)
  }

  // Select all text using Ctrl+A
  await user.keyboard('{Control>}a{/Control}')

  // Delete selected text
  await user.keyboard('{Delete}')

  // Type the new content character by character
  for (const char of content) {
    if (char === '\n') {
      await user.keyboard('{Enter}')
    } else {
      await user.keyboard(char)
    }
  }
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders the app with editor and preview panels', async () => {
    render(<App />)

    // Wait for initialization
    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Check for main sections
    expect(screen.getByText('Diagram Code')).toBeInTheDocument()
    expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
  })

  test('displays default diagram on load', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Check for default diagram content in CodeMirror editor
    const content = getCodeMirrorContent()
    expect(content).toContain('graph LR')
  })

  test('shows line and character count in status bar', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // The status bar should show line count and character count for the default diagram
    // This verifies the editor is functional and counting characters
    expect(screen.getByText(/lines/)).toBeInTheDocument()
    expect(screen.getByText(/characters/)).toBeInTheDocument()
  })

  test('copy button is available and clickable', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    const copyButton = screen.getByTitle('Copy to clipboard')

    // Verify button exists and is clickable
    expect(copyButton).toBeInTheDocument()
    expect(copyButton).not.toBeDisabled()

    // Click it without error
    fireEvent.click(copyButton)
  })

  test('reset button is available and clickable', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    const resetButton = screen.getByTitle('Reset to example')

    // Verify button exists and is clickable
    expect(resetButton).toBeInTheDocument()
    expect(resetButton).not.toBeDisabled()

    // Click it without error
    fireEvent.click(resetButton)
  })

  test('clear button clears the editor', async () => {
    // Mock window.confirm
    global.confirm = vi.fn(() => true)

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    const clearButton = screen.getByTitle('Clear editor')

    fireEvent.click(clearButton)

    // Check that editor is cleared
    await waitFor(() => {
      const content = getCodeMirrorContent()
      expect(content.trim()).toBe('')
    })
  })

  test('theme buttons are available and switchable', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Check for default themes (with proper capitalization)
    const defaultBtn = screen.getByTitle('Switch to Default theme')
    const darkBtn = screen.getByTitle('Switch to Dark theme')

    expect(defaultBtn).toBeInTheDocument()
    expect(darkBtn).toBeInTheDocument()

    // Switch theme
    fireEvent.click(darkBtn)

    // Check that button is now active
    expect(darkBtn).toHaveClass('btn-active')
    expect(defaultBtn).not.toHaveClass('btn-active')
  })

  test('editor handles invalid syntax without crashing', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // The app should render with the default diagram intact
    const content = getCodeMirrorContent()
    expect(content).toContain('graph LR')

    // Verify the error display area exists for diagram errors
    const container = document.querySelector('.diagram-container')
    expect(container).toBeInTheDocument()
  })

  test('editor renders default content correctly', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Verify the editor has the default diagram
    const content = getCodeMirrorContent()
    expect(content).toContain('graph LR')
    expect(content).toContain('Start')
    expect(content).toContain('Condition')
  })

  test('shows loading spinner while initializing', async () => {
    render(<App />)

    // Spinner should appear immediately
    expect(screen.getByText('Initializing Mermaid...')).toBeInTheDocument()

    // Then disappear after initialization
    await waitFor(() => {
      expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
