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

describe('Integration Tests: Theme Builder Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Create → Use Theme Flow', () => {
    test('user can create and immediately use a custom theme', async () => {
      render(<App />)

      // Wait for initialization
      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create new theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'My Custom Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Verify theme was created
      await waitFor(() => {
        expect(screen.getByText('My Custom Theme')).toBeInTheDocument()
      })

      // Select the new theme from sidebar
      const themeName = screen.getByText('My Custom Theme')
      const themeButton = themeName.closest('.theme-item')?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Theme should now be selected
      expect(themeName.closest('.theme-item')).toHaveClass('active')
    })

    test('theme created without selection maintains diagram state', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const textarea = screen.getByPlaceholderText('Enter Mermaid diagram syntax here...')
      const originalCode = (textarea as HTMLTextAreaElement).value

      // Open theme builder and create theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Editor code should remain unchanged
      expect(textarea).toHaveValue(originalCode)
    })
  })

  describe('Create → Edit → Use Theme Flow', () => {
    test('user can create, edit colors, and use a custom theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create new theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Blue Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Verify theme was created and edit form appeared
      await waitFor(() => {
        expect(screen.getByText(/Editing: Blue Theme/)).toBeInTheDocument()
      })

      // Edit mode should be open
      expect(screen.getByText('Colors')).toBeInTheDocument()

      // Save the theme
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // Should return to theme list
      await waitFor(() => {
        expect(screen.getByText('+ New Theme')).toBeInTheDocument()
      })

      // Theme should be in the list
      expect(screen.getByText('Blue Theme')).toBeInTheDocument()
    })
  })

  describe('Create → Delete Theme Flow', () => {
    test('user can create and delete a theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create new theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Temp Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Verify theme was created
      await waitFor(() => {
        expect(screen.getByText('Temp Theme')).toBeInTheDocument()
      })

      // Delete the theme
      const deleteButton = screen.getByLabelText('Delete Temp Theme')
      fireEvent.click(deleteButton)

      const confirmDelete = screen.getByText('Delete')
      fireEvent.click(confirmDelete)

      // Theme should be removed
      await waitFor(() => {
        expect(screen.queryByText('Temp Theme')).not.toBeInTheDocument()
      })
    })

    test('switching theme before deletion prevents using deleted theme', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Open theme builder
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create new theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'To Delete' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Wait for theme to appear
      await waitFor(() => {
        expect(screen.getByText('To Delete')).toBeInTheDocument()
      })

      // Select the new theme
      const themeName = screen.getByText('To Delete')
      const themeButton = themeName.closest('.theme-item')?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      fireEvent.click(themeButton)

      // Now delete it
      const deleteButton = screen.getByLabelText('Delete To Delete')
      fireEvent.click(deleteButton)

      const confirmDelete = screen.getByText('Delete')
      fireEvent.click(confirmDelete)

      // Should fall back to default theme
      const defaultTheme = screen.getByText('default').closest('.theme-item')
      expect(defaultTheme).toHaveClass('active')
    })
  })

  describe('Multiple Theme Operations', () => {
    test('user can create multiple custom themes', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create first theme
      let newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      let input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Theme 1' } })

      let createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Theme 1')).toBeInTheDocument()
      })

      // Close edit form
      let closeButton = screen.getAllByTitle('Close editor')[0]
      fireEvent.click(closeButton)

      // Create second theme
      newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Theme 2' } })

      createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Theme 2')).toBeInTheDocument()
      })

      // Both themes should exist
      expect(screen.getByText('Theme 1')).toBeInTheDocument()
      expect(screen.getByText('Theme 2')).toBeInTheDocument()
    })

    test('switching between multiple custom themes works correctly', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create and test multiple themes
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

        // Close edit form
        const closeButton = screen.getAllByTitle('Close editor')[0]
        fireEvent.click(closeButton)
      }

      await createTheme('Custom A')
      await createTheme('Custom B')

      // Switch between themes
      const themeA = screen.getByText('Custom A').closest('.theme-item')
      const themeB = screen.getByText('Custom B').closest('.theme-item')

      const themeAButton = themeA?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement
      const themeBButton = themeB?.querySelector('[class*="theme-name-button"]') as HTMLButtonElement

      fireEvent.click(themeAButton)
      expect(themeA).toHaveClass('active')

      fireEvent.click(themeBButton)
      expect(themeB).toHaveClass('active')

      fireEvent.click(themeAButton)
      expect(themeA).toHaveClass('active')
    })
  })

  describe('Theme List Ordering', () => {
    test('built-in themes appear first, custom themes sorted alphabetically', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create themes in non-alphabetical order
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

      await createTheme('Zebra')
      await createTheme('Alpha')
      await createTheme('Beta')

      // Get all theme items
      const themeItems = screen.getAllByRole('button').filter((btn) => {
        return ['default', 'dark', 'forest', 'neutral', 'Zebra', 'Alpha', 'Beta'].includes(btn.textContent || '')
      })

      // Verify order: built-in themes first (default, dark, forest, neutral), then custom alphabetically
      const themeNames = themeItems.map(item => item.textContent?.trim())
      expect(themeNames.indexOf('default')).toBeLessThan(themeNames.indexOf('Alpha'))
      expect(themeNames.indexOf('dark')).toBeLessThan(themeNames.indexOf('Alpha'))
    })
  })
})
