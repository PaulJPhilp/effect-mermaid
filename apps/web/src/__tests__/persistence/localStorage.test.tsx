import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../../App'
import { persistCustomThemes, persistCurrentTheme, getStoredThemes, getStoredCurrentTheme } from '../../atoms/themeBuilder'

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

describe('localStorage Persistence Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Direct Persistence Functions', () => {
    test('persistCustomThemes saves themes to localStorage', () => {
      const themes = {
        'my-theme': {
          name: 'my-theme',
          colors: { background: '#ffffff', primaryColor: '#000000' },
          description: 'My custom theme'
        }
      }

      persistCustomThemes(themes)

      const stored = localStorage.getItem('effect-mermaid-custom-themes')
      expect(stored).toBeDefined()
      expect(JSON.parse(stored!)).toEqual(themes)
    })

    test('persistCurrentTheme saves current theme to localStorage', () => {
      persistCurrentTheme('dark')

      const stored = localStorage.getItem('effect-mermaid-current-theme')
      expect(stored).toBe('dark')
    })

    test('getStoredThemes returns empty object when no themes stored', () => {
      const themes = getStoredThemes()
      expect(themes).toEqual({})
    })

    test('getStoredThemes retrieves stored themes', () => {
      const originalThemes = {
        'theme1': {
          name: 'theme1',
          colors: { background: '#fff' },
          description: 'Theme 1'
        }
      }

      persistCustomThemes(originalThemes)
      const retrieved = getStoredThemes()

      expect(retrieved).toEqual(originalThemes)
    })

    test('getStoredCurrentTheme returns default when no theme stored', () => {
      const theme = getStoredCurrentTheme()
      expect(theme).toBe('default')
    })

    test('getStoredCurrentTheme retrieves stored theme', () => {
      persistCurrentTheme('forest')
      const retrieved = getStoredCurrentTheme()

      expect(retrieved).toBe('forest')
    })

    test('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('effect-mermaid-custom-themes', 'invalid json {]')

      const themes = getStoredThemes()
      expect(themes).toEqual({})
    })

    test('handles missing localStorage gracefully', () => {
      localStorage.removeItem('effect-mermaid-custom-themes')
      localStorage.removeItem('effect-mermaid-current-theme')

      const themes = getStoredThemes()
      const theme = getStoredCurrentTheme()

      expect(themes).toEqual({})
      expect(theme).toBe('default')
    })
  })

  describe('Theme Persistence Through UI', () => {
    test('created custom theme persists after page reload simulation', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Create a theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Persisted Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Persisted Theme')).toBeInTheDocument()
      })

      // Verify it's in localStorage
      const stored = getStoredThemes()
      expect(stored['Persisted Theme']).toBeDefined()
      expect(stored['Persisted Theme'].name).toBe('Persisted Theme')

      // Unmount and remount (simulating page reload)
      unmount()

      // Re-render app
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      // Theme should still exist
      expect(screen.getByText('Persisted Theme')).toBeInTheDocument()
    })

    test('selected theme persists after page reload simulation', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Switch theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      expect(darkButton).toHaveClass('btn-active')

      // Verify it's in localStorage
      expect(getStoredCurrentTheme()).toBe('dark')

      // Unmount and remount
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Dark theme should still be selected
      const darkButton2 = screen.getByTitle('Switch to dark theme')
      expect(darkButton2).toHaveClass('btn-active')
    })

    test('multiple custom themes persist correctly', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create multiple themes
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

      await createTheme('Theme A')
      await createTheme('Theme B')
      await createTheme('Theme C')

      // Verify all are in localStorage
      const stored = getStoredThemes()
      expect(Object.keys(stored).length).toBeGreaterThanOrEqual(3)
      expect(stored['Theme A']).toBeDefined()
      expect(stored['Theme B']).toBeDefined()
      expect(stored['Theme C']).toBeDefined()

      // Unmount and remount
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      // All themes should still exist
      expect(screen.getByText('Theme A')).toBeInTheDocument()
      expect(screen.getByText('Theme B')).toBeInTheDocument()
      expect(screen.getByText('Theme C')).toBeInTheDocument()
    })
  })

  describe('Theme Updates and Persistence', () => {
    test('updated theme colors persist', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Color Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Color Theme')).toBeInTheDocument()
      })

      // Verify initial state in localStorage
      let stored = getStoredThemes()
      const initialColor = stored['Color Theme'].colors.background

      // Save without changes
      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      // Verify in localStorage
      stored = getStoredThemes()
      expect(stored['Color Theme']).toBeDefined()
      expect(stored['Color Theme'].colors.background).toBe(initialColor)

      // Unmount and remount
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      // Theme should still exist with same colors
      const restored = getStoredThemes()
      expect(restored['Color Theme'].colors.background).toBe(initialColor)
    })

    test('deleted theme is removed from localStorage', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create theme
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'To Delete' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('To Delete')).toBeInTheDocument()
      })

      // Verify in localStorage
      let stored = getStoredThemes()
      expect(stored['To Delete']).toBeDefined()

      // Delete the theme
      const deleteButton = screen.getByLabelText('Delete To Delete')
      fireEvent.click(deleteButton)

      const confirmDelete = screen.getByText('Delete')
      fireEvent.click(confirmDelete)

      await waitFor(() => {
        expect(screen.queryByText('To Delete')).not.toBeInTheDocument()
      })

      // Verify deleted from localStorage
      stored = getStoredThemes()
      expect(stored['To Delete']).toBeUndefined()

      // Unmount and remount
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      const toggleButton2 = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton2)

      // Theme should still be gone
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument()
    })
  })

  describe('localStorage Failure Handling', () => {
    test('app continues when localStorage write fails', () => {
      // Mock localStorage.setItem to throw
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const consoleSpy = vi.spyOn(console, 'warn')

      try {
        persistCustomThemes({ 'theme': { name: 'theme', colors: {} } })
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to persist custom themes:',
          expect.any(Error)
        )
      } finally {
        setItemSpy.mockRestore()
        consoleSpy.mockRestore()
      }
    })

    test('app continues when localStorage read fails', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      try {
        const themes = getStoredThemes()
        expect(themes).toEqual({})
      } finally {
        getItemSpy.mockRestore()
      }
    })
  })

  describe('localStorage Data Structure', () => {
    test('stored themes have correct structure', () => {
      const theme = {
        'my-theme': {
          name: 'my-theme',
          colors: {
            background: '#ffffff',
            primaryColor: '#000000',
            secondaryColor: '#cccccc'
          },
          description: 'My custom theme'
        }
      }

      persistCustomThemes(theme)

      const stored = localStorage.getItem('effect-mermaid-custom-themes')
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(parsed['my-theme']).toBeDefined()
      expect(parsed['my-theme'].name).toBe('my-theme')
      expect(parsed['my-theme'].colors).toBeDefined()
      expect(parsed['my-theme'].description).toBe('My custom theme')
    })

    test('stored theme keys match localStorage keys', () => {
      const themes = {
        'alpha': { name: 'alpha', colors: {} },
        'beta': { name: 'beta', colors: {} }
      }

      persistCustomThemes(themes)

      const retrieved = getStoredThemes()
      expect(Object.keys(retrieved).sort()).toEqual(['alpha', 'beta'])
    })
  })

  describe('localStorage with Built-in Themes', () => {
    test('built-in themes are not stored in localStorage', async () => {
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Switch to built-in theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Verify stored current theme
      const stored = getStoredCurrentTheme()
      expect(stored).toBe('dark')

      // Built-in themes should not be in custom themes
      const customThemes = getStoredThemes()
      expect(customThemes['dark']).toBeUndefined()
      expect(customThemes['default']).toBeUndefined()
    })

    test('switching to built-in after custom theme works', async () => {
      const { unmount } = render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Create custom theme
      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Custom' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Custom')).toBeInTheDocument()
      })

      // Switch to built-in theme
      const darkButton = screen.getByTitle('Switch to dark theme')
      fireEvent.click(darkButton)

      // Verify in localStorage
      expect(getStoredCurrentTheme()).toBe('dark')

      // Unmount and remount
      unmount()
      render(<App />)

      await waitFor(() => {
        expect(screen.queryByText('Initializing Mermaid...')).not.toBeInTheDocument()
      }, { timeout: 5000 })

      // Dark theme should be selected
      const darkButton2 = screen.getByTitle('Switch to dark theme')
      expect(darkButton2).toHaveClass('btn-active')
    })
  })
})
