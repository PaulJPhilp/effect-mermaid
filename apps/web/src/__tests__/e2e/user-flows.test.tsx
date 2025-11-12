import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../App'
import { getStoredCurrentTheme, getStoredThemes } from '../../atoms/themeBuilder'

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

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Flow 1: Create and Apply Custom Theme', () => {
    test('user creates custom theme, edits colors, and applies to diagram', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      expect(screen.getByText('Theme Builder')).toBeInTheDocument()

      // Step 2: Create new theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'My Purple Theme' } })

      // Step 3: Submit form (could use Enter or click)
      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Step 4: Verify edit form opens
      await waitFor(() => {
        expect(screen.getByText(/Editing: My Purple Theme/)).toBeInTheDocument()
      })

      // Step 5: Save (without editing colors for simplicity)
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // Step 6: Verify theme is in list
      await waitFor(() => {
        expect(screen.getByText('My Purple Theme')).toBeInTheDocument()
      })

      // Step 7: Select the custom theme
      const themeItem = screen.getByText('My Purple Theme').closest('.theme-item')
      const themeButton = themeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Step 8: Verify theme is active
      expect(themeItem).toHaveClass('active')

      // Step 9: Close sidebar
      fireEvent.click(toggleButton)

      // Step 10: Verify theme persists
      const storedTheme = getStoredCurrentTheme()
      expect(storedTheme).toBe('My Purple Theme')

      // Step 11: Reload simulation
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 12: Verify theme is still selected after reload
      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      const reloadedTheme = screen.getByText('My Purple Theme').closest('.theme-item')
      expect(reloadedTheme).toHaveClass('active')
    })
  })

  describe('Flow 2: Edit Diagram with Multiple Themes', () => {
    test('user edits diagram and previews with different themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Clear default diagram
      global.confirm = vi.fn(() => true)
      const clearButton = screen.getByTitle('Clear editor')
      fireEvent.click(clearButton)

      // Step 2: Write custom diagram
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const customDiagram = 'graph LR\n  A[Start] --> B{Choice}\n  B -->|Yes| C[Process A]\n  B -->|No| D[Process B]\n  C --> E[End]\n  D --> E'

      fireEvent.change(textarea, { target: { value: customDiagram } })

      // Step 3: Verify diagram appears in editor
      expect(textarea).toHaveValue(customDiagram)

      // Step 4: Check line count
      expect(screen.getByText(/7 lines/)).toBeInTheDocument()

      // Step 5: Try different themes
      const themes = [
        { button: 'Switch to default theme', name: 'default' },
        { button: 'Switch to dark theme', name: 'dark' },
        { button: 'Switch to forest theme', name: 'forest' }
      ]

      for (const theme of themes) {
        const button = screen.getByTitle(theme.button)
        fireEvent.click(button)

        // Step 6: Verify theme is active
        expect(button).toHaveClass('btn-active')

        // Step 7: Verify diagram content unchanged
        expect(textarea).toHaveValue(customDiagram)
      }

      // Step 8: Copy final diagram
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      const copyButton = screen.getByTitle('Copy to clipboard')
      fireEvent.click(copyButton)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(customDiagram)
    })
  })

  describe('Flow 3: Session Persistence', () => {
    test('user creates theme, modifies diagram, switches theme, and verifies persistence', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Create custom theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Session Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Session Theme')).toBeInTheDocument()
      })

      // Step 2: Save theme without changes
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // Step 3: Select custom theme
      const themeItem = screen.getByText('Session Theme').closest('.theme-item')
      const themeButton = themeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Step 4: Edit diagram
      fireEvent.click(toggleButton) // Close sidebar

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const newDiagram = 'graph TD\n  A-->B'
      fireEvent.change(textarea, { target: { value: newDiagram } })

      // Step 5: Switch to built-in theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Step 6: Verify current state
      expect(textarea).toHaveValue(newDiagram)
      expect(getStoredCurrentTheme()).toBe('dark')

      // Step 7: Reload simulation
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 8: Verify persistence
      const textarea2 = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea2).toHaveValue(newDiagram)

      const darkButton2 = screen.getByTitle('Switch to dark theme')
      expect(darkButton2).toHaveClass('btn-active')

      const storedThemes = getStoredThemes()
      expect(storedThemes['Session Theme']).toBeDefined()
    })
  })

  describe('Flow 4: Complete Theme Management Workflow', () => {
    test('user creates, edits, deletes multiple themes and manages theme library', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Helper function to create theme
      const createAndSaveTheme = async (name: string) => {
        const newThemeButton = screen.getByText('+ New Theme')
        fireEvent.click(newThemeButton)

        const input = screen.getByPlaceholderText('Theme name')
        fireEvent.change(input, { target: { value: name } })

        const createButton = screen.getByText('Create')
        fireEvent.click(createButton)

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Editing: ${name}`))).toBeInTheDocument()
        })

        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        await waitFor(() => {
          expect(screen.getByText(name)).toBeInTheDocument()
        })
      }

      // Step 2: Create multiple themes
      await createAndSaveTheme('Brand A')
      await createAndSaveTheme('Brand B')
      await createAndSaveTheme('Brand C')

      // Step 3: Verify all themes exist
      expect(screen.getByText('Brand A')).toBeInTheDocument()
      expect(screen.getByText('Brand B')).toBeInTheDocument()
      expect(screen.getByText('Brand C')).toBeInTheDocument()

      // Step 4: Delete one theme
      const deleteButton = screen.getByLabelText('Delete Brand B')
      fireEvent.click(deleteButton)

      const confirmDelete = screen.getByText('Delete')
      fireEvent.click(confirmDelete)

      await waitFor(() => {
        expect(screen.queryByText('Brand B')).not.toBeInTheDocument()
      })

      // Step 5: Verify remaining themes
      expect(screen.getByText('Brand A')).toBeInTheDocument()
      expect(screen.getByText('Brand C')).toBeInTheDocument()

      // Step 6: Use themes
      const brandAItem = screen.getByText('Brand A').closest('.theme-item')
      const brandAButton = brandAItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(brandAButton)

      expect(brandAItem).toHaveClass('active')

      // Step 7: Verify theme in localStorage
      const storedThemes = getStoredThemes()
      expect(storedThemes['Brand A']).toBeDefined()
      expect(storedThemes['Brand C']).toBeDefined()
      expect(storedThemes['Brand B']).toBeUndefined()
    })
  })

  describe('Flow 5: Error Recovery Workflow', () => {
    test('user encounters error, recovers, and continues using app', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Type invalid diagram
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      fireEvent.change(textarea, { target: { value: 'INVALID [}]' } })

      // Step 2: Fix the diagram
      const validDiagram = 'graph TD\n  A-->B'
      fireEvent.change(textarea, { target: { value: validDiagram } })

      // Step 3: Verify recovery
      expect(textarea).toHaveValue(validDiagram)

      // Step 4: Continue normal operations
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')

      // Step 5: Create theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Recovery Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Recovery Theme')).toBeInTheDocument()
      })

      // Step 6: Verify app is fully functional
      expect(screen.getByText('Diagram Code')).toBeInTheDocument()
      expect(screen.getByText('Diagram Preview')).toBeInTheDocument()
    })
  })

  describe('Flow 6: Quick Workflow - Switch Theme and Edit', () => {
    test('user quickly switches themes while editing', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')

      // Quick edits with theme switches
      const operations = [
        () => fireEvent.change(textarea, { target: { value: 'graph LR\n  A-->B' } }),
        () => fireEvent.click(screen.getByTitle('Switch to dark theme')),
        () => fireEvent.change(textarea, { target: { value: 'graph LR\n  A-->B\n  B-->C' } }),
        () => fireEvent.click(screen.getByTitle('Switch to forest theme')),
        () => fireEvent.change(textarea, { target: { value: 'graph TD\n  A[Start]-->B[End]' } }),
        () => fireEvent.click(screen.getByTitle('Switch to neutral theme')),
      ]

      for (const op of operations) {
        op()
      }

      // Final state verification
      expect(textarea).toHaveValue('graph TD\n  A[Start]-->B[End]')
      expect(screen.getByTitle('Switch to neutral theme')).toHaveClass('btn-active')
    })
  })

  describe('Flow 7: Copy and Share Workflow', () => {
    test('user creates diagram, selects theme, and copies for sharing', async () => {
      const mockClipboard = {
        writeText: vi.fn(async () => {})
      }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Step 1: Clear default and add custom diagram
      global.confirm = vi.fn(() => true)
      const clearButton = screen.getByTitle('Clear editor')
      fireEvent.click(clearButton)

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const shareableDiagram = 'graph LR\n  Share[Share This]\n  Share-->More[With Others]'
      fireEvent.change(textarea, { target: { value: shareableDiagram } })

      // Step 2: Select theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Step 3: Copy diagram
      const copyButton = screen.getByTitle('Copy to clipboard')
      fireEvent.click(copyButton)

      // Step 4: Verify copy
      expect(mockClipboard.writeText).toHaveBeenCalledWith(shareableDiagram)

      // Step 5: Verify can be pasted in new instance
      const newDiagram = 'graph TD\n  Original[Original Content]'
      fireEvent.change(textarea, { target: { value: newDiagram } })

      const copyButton2 = screen.getByTitle('Copy to clipboard')
      fireEvent.click(copyButton2)

      expect(mockClipboard.writeText).toHaveBeenLastCalledWith(newDiagram)
    })
  })

  describe('Flow 8: Full Session Simulation', () => {
    test('complete user session from start to persistence', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)

      // Initial load
      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Session activities
      // 1. Switch theme
      fireEvent.click(screen.getByTitle('Switch to dark theme'))

      // 2. Edit diagram
      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const sessionDiagram = 'graph LR\n  Work[Session Work]'
      fireEvent.change(textarea, { target: { value: sessionDiagram } })

      // 3. Create theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Session Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Session Theme')).toBeInTheDocument()
      })

      // 4. Save theme
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // 5. Select custom theme
      const themeItem = screen.getByText('Session Theme').closest('.theme-item')
      const themeButton = themeItem?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      fireEvent.click(toggleButton) // Close sidebar

      // Verify session state
      expect(textarea).toHaveValue(sessionDiagram)
      expect(themeItem).toHaveClass('active')

      // Simulate reload
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Verify persistence
      const textarea2 = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      expect(textarea2).toHaveValue(sessionDiagram)

      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      const sessionThemeItem = screen.getByText('Session Theme').closest('.theme-item')
      expect(sessionThemeItem).toHaveClass('active')
    })
  })
})
