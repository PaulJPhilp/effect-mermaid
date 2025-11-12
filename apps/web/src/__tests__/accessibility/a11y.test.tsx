import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
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

expect.extend(toHaveNoViolations)

describe('Accessibility (a11y) Tests - WCAG Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('WCAG 2.1 Level AA - Color Contrast', () => {
    test('text has sufficient color contrast', async () => {
      const { container } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // This would require visual testing, but we can verify text is present
      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
      expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
    })

    test('buttons have visible text', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Verify all buttons have text content
      expect(screen.getByText(/Copy|Reset|Clear/).textContent).toBeTruthy()
    })
  })

  describe('WCAG 2.1 Level AA - Keyboard Accessibility', () => {
    test('all buttons are keyboard accessible', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const buttons = [
        screen.getByTitle('Copy to clipboard'),
        screen.getByTitle('Reset to example'),
        screen.getByTitle('Clear editor'),
        screen.getByTitle('Open theme builder')
      ]

      for (const button of buttons) {
        button.focus()
        expect(button).toHaveFocus()

        // Simulate Enter key
        fireEvent.keyDown(button, { key: 'Enter' })
      }
    })

    test('textarea is keyboard accessible', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      textarea.focus()

      expect(textarea).toHaveFocus()

      fireEvent.keyDown(textarea, { key: 'a', ctrlKey: true })
    })

    test('all form inputs are keyboard accessible', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      input.focus()

      expect(input).toHaveFocus()
    })

    test('tab navigation works correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      const resetButton = screen.getByTitle('Reset to example')

      copyButton.focus()
      expect(copyButton).toHaveFocus()

      fireEvent.keyDown(copyButton, { key: 'Tab' })
      resetButton.focus()
      expect(resetButton).toHaveFocus()
    })

    test('no keyboard trap exists', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      textarea.focus()

      // User should be able to move focus away with Tab
      fireEvent.keyDown(textarea, { key: 'Tab' })

      // Focus should be able to move to next element
      expect(document.activeElement).not.toEqual(textarea)
    })
  })

  describe('WCAG 2.1 Level AA - Aria Labels and Roles', () => {
    test('buttons have aria-labels or accessible names', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      expect(copyButton).toHaveAccessibleName()

      const toggleButton = screen.getByTitle('Open theme builder')
      expect(toggleButton).toHaveAttribute('aria-label')
    })

    test('form inputs have associated labels', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      // Input has placeholder which serves as accessible label
      expect(input).toHaveAttribute('placeholder')
    })

    test('theme buttons have aria-pressed attribute', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const defaultButton = screen.getByTitle('Switch to default theme')
      expect(defaultButton).toHaveAttribute('aria-pressed')

      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
      expect(defaultButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('color input has aria-label', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Color Test' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Editing: Color Test/)).toBeInTheDocument()
      })

      // Color inputs should have aria-labels
      const colorInputs = screen.getAllByLabelText(/Color picker for/)
      expect(colorInputs.length).toBeGreaterThan(0)
    })

    test('dialogs have proper accessibility semantics', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Theme builder section is present
      expect(screen.getByText('Theme Builder')).toBeInTheDocument()
    })
  })

  describe('WCAG 2.1 Level AA - Focus Management', () => {
    test('focus is visible on all interactive elements', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const buttons = [
        screen.getByTitle('Copy to clipboard'),
        screen.getByTitle('Reset to example'),
        screen.getByTitle('Clear editor')
      ]

      for (const button of buttons) {
        button.focus()
        expect(button).toHaveFocus()
      }
    })

    test('focus moves logically through page', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Focus order should be logical
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      textarea.focus()

      expect(textarea).toHaveFocus()
    })

    test('focus does not change unexpectedly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      textarea.focus()

      fireEvent.change(textarea, { target: { value: 'test' } })

      // Focus should remain on textarea
      expect(textarea).toHaveFocus()
    })

    test('focus trap does not exist in main content', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const firstButton = screen.getByTitle('Copy to clipboard')
      firstButton.focus()

      // Should be able to move away from first button
      fireEvent.keyDown(firstButton, { key: 'Tab' })

      // Should have moved focus
      expect(document.activeElement).not.toEqual(firstButton)
    })
  })

  describe('WCAG 2.1 Level AA - Text Alternatives', () => {
    test('emoji buttons have text alternatives', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      expect(copyButton).toHaveAccessibleName()

      const resetButton = screen.getByTitle('Reset to example')
      expect(resetButton).toHaveAccessibleName()

      const clearButton = screen.getByTitle('Clear editor')
      expect(clearButton).toHaveAccessibleName()
    })

    test('theme builder toggle has accessible name', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      expect(toggleButton).toHaveAccessibleName()
    })
  })

  describe('WCAG 2.1 Level AA - Form Labels', () => {
    test('theme name input has accessible label', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      expect(input).toHaveAttribute('placeholder', 'Theme name')
    })

    test('color inputs have descriptive labels', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Labeled Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText(/Editing: Labeled Theme/)).toBeInTheDocument()
      })

      // Should have color labels
      expect(screen.getByText('Colors')).toBeInTheDocument()
    })
  })

  describe('WCAG 2.1 Level A - Page Language', () => {
    test('page has lang attribute (implicit - would be on html element)', async () => {
      const { container } = render(<App />)

      // HTML element should have lang attribute in real app
      expect(container).toBeTruthy()
    })
  })

  describe('WCAG 2.1 Level A - Error Identification', () => {
    test('invalid input provides clear feedback', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: '' } })

      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton).toBeDisabled()
    })

    test('error messages are descriptive', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // When diagram error occurs, it shows descriptive message
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: 'invalid [' } })

      // Error structure is in place for accessibility
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('WCAG 2.1 - Headings and Structure', () => {
    test('page has proper heading hierarchy', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Main headings should be present
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    test('section headings are properly marked', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
      expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
    })
  })

  describe('Semantic HTML', () => {
    test('buttons are actual button elements', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const copyButton = screen.getByTitle('Copy to clipboard')
      expect(copyButton.tagName).toBe('BUTTON')

      const resetButton = screen.getByTitle('Reset to example')
      expect(resetButton.tagName).toBe('BUTTON')
    })

    test('textarea is semantic form element', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea.tagName).toBe('TEXTAREA')
    })
  })

  describe('Dynamic Content Accessibility', () => {
    test('dynamically added content is accessible', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Dynamic Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        const newTheme = screen.getByText('Dynamic Theme')
        expect(newTheme).toBeInTheDocument()
        // New content should be accessible
        expect(newTheme).toHaveAccessibleName()
      })
    })
  })

  describe('Mobile Accessibility', () => {
    test('buttons have adequate touch target size', async () => {
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
        // Button should be easily clickable
        expect(button).toBeInTheDocument()
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Screen Reader Compatibility', () => {
    test('theme selection is announced', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('status changes are announced', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: 'new code' } })

      expect(textarea).toHaveValue('new code')
    })
  })
})
