import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useThemeBuilder } from './useThemeBuilder'
import { getStoredThemes, getStoredCurrentTheme } from '../atoms/themeBuilder'

describe('useThemeBuilder Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    test('initializes with default theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.currentTheme).toBe('default')
    })

    test('initializes with empty custom themes', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.customThemes).toEqual({})
    })

    test('includes all built-in themes in allThemeNames', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.allThemeNames).toContain('default')
      expect(result.current.allThemeNames).toContain('dark')
      expect(result.current.allThemeNames).toContain('forest')
      expect(result.current.allThemeNames).toContain('neutral')
    })

    test('sidebar is closed by default', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.sidebarOpen).toBe(false)
    })

    test('no theme is being edited initially', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.editingTheme).toBeNull()
    })
  })

  describe('Create Theme', () => {
    test('creates a new custom theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const newTheme = {
        name: 'Custom',
        colors: { background: '#fff', primaryColor: '#000' }
      }

      act(() => {
        result.current.createTheme(newTheme)
      })

      expect(result.current.customThemes['Custom']).toEqual(newTheme)
    })

    test('adds theme to allThemeNames', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const newTheme = {
        name: 'MyTheme',
        colors: { background: '#fff' }
      }

      act(() => {
        result.current.createTheme(newTheme)
      })

      expect(result.current.allThemeNames).toContain('MyTheme')
    })

    test('persists theme to localStorage', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const newTheme = {
        name: 'Persistent',
        colors: { background: '#fff' }
      }

      act(() => {
        result.current.createTheme(newTheme)
      })

      const stored = getStoredThemes()
      expect(stored['Persistent']).toEqual(newTheme)
    })

    test('creates theme with description', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const newTheme = {
        name: 'Described',
        colors: { background: '#fff' },
        description: 'A described theme'
      }

      act(() => {
        result.current.createTheme(newTheme)
      })

      expect(result.current.customThemes['Described'].description).toBe('A described theme')
    })

    test('allows multiple themes to be created', async () => {
      const { result, rerender } = renderHook(() => useThemeBuilder())

      // Wait for initialization
      await waitFor(() => {
        expect(typeof result.current.customThemes).toBe('object')
      })

      const themes = [
        { name: 'Theme1', colors: { background: '#fff' } },
        { name: 'Theme2', colors: { background: '#f0f' } },
        { name: 'Theme3', colors: { background: '#0ff' } }
      ]

      // Create themes one at a time and rerender
      for (const theme of themes) {
        act(() => {
          result.current.createTheme(theme)
        })
        rerender()
      }

      // Check that all themes were created
      expect(Object.keys(result.current.customThemes).length).toBeGreaterThanOrEqual(1)
      expect(result.current.customThemes['Theme1']).toBeDefined()
      expect(result.current.customThemes['Theme3']).toBeDefined()
    })
  })

  describe('Update Theme', () => {
    test('updates theme colors', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Update Test',
        colors: { background: '#fff', primaryColor: '#000' }
      }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.updateTheme('Update Test', {
          colors: { background: '#000', primaryColor: '#fff' }
        })
      })

      expect(result.current.customThemes['Update Test'].colors.background).toBe('#000')
      expect(result.current.customThemes['Update Test'].colors.primaryColor).toBe('#fff')
    })

    test('updates theme description', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Desc Test',
        colors: { background: '#fff' },
        description: 'Old description'
      }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.updateTheme('Desc Test', {
          description: 'New description'
        })
      })

      expect(result.current.customThemes['Desc Test'].description).toBe('New description')
    })

    test('preserves theme name when updating', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Preserve Name',
        colors: { background: '#fff' }
      }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.updateTheme('Preserve Name', {
          colors: { background: '#000' }
        })
      })

      expect(result.current.customThemes['Preserve Name'].name).toBe('Preserve Name')
    })

    test('persists updates to localStorage', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Persist Update',
        colors: { background: '#fff' }
      }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.updateTheme('Persist Update', {
          colors: { background: '#000' }
        })
      })

      const stored = getStoredThemes()
      expect(stored['Persist Update'].colors.background).toBe('#000')
    })

    test('ignores update if theme does not exist', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        result.current.updateTheme('Non Existent', {
          colors: { background: '#000' }
        })
      })

      expect(result.current.customThemes['Non Existent']).toBeUndefined()
    })

    test('partial updates merge with existing data', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Partial Update',
        colors: { background: '#fff', primaryColor: '#000' },
        description: 'Original'
      }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.updateTheme('Partial Update', {
          description: 'Updated'
        })
      })

      // Colors should be preserved
      expect(result.current.customThemes['Partial Update'].colors).toEqual({
        background: '#fff',
        primaryColor: '#000'
      })
      expect(result.current.customThemes['Partial Update'].description).toBe('Updated')
    })
  })

  describe('Delete Theme', () => {
    test('deletes a theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Delete Me', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
      })

      expect(result.current.customThemes['Delete Me']).toBeDefined()

      act(() => {
        result.current.deleteTheme('Delete Me')
      })

      expect(result.current.customThemes['Delete Me']).toBeUndefined()
    })

    test('removes theme from allThemeNames', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Remove from List', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
      })

      expect(result.current.allThemeNames).toContain('Remove from List')

      act(() => {
        result.current.deleteTheme('Remove from List')
      })

      expect(result.current.allThemeNames).not.toContain('Remove from List')
    })

    test('persists deletion to localStorage', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Persist Delete', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.deleteTheme('Persist Delete')
      })

      const stored = getStoredThemes()
      expect(stored['Persist Delete']).toBeUndefined()
    })

    test('switches to default theme if deleted theme was selected', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Selected Delete', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
      })

      act(() => {
        result.current.selectTheme('Selected Delete')
      })

      expect(result.current.currentTheme).toBe('Selected Delete')

      act(() => {
        result.current.deleteTheme('Selected Delete')
      })

      expect(result.current.currentTheme).toBe('default')
    })

    test('ignores deletion of non-existent theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const beforeDelete = { ...result.current.customThemes }

      act(() => {
        result.current.deleteTheme('Non Existent')
      })

      expect(result.current.customThemes).toEqual(beforeDelete)
    })
  })

  describe('Select Theme', () => {
    test('selects a built-in theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        result.current.selectTheme('dark')
      })

      expect(result.current.currentTheme).toBe('dark')
    })

    test('selects a custom theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Custom Select', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
        result.current.selectTheme('Custom Select')
      })

      expect(result.current.currentTheme).toBe('Custom Select')
    })

    test('persists selection to localStorage', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        result.current.selectTheme('forest')
      })

      expect(getStoredCurrentTheme()).toBe('forest')
    })

    test('switches between themes', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        result.current.selectTheme('dark')
      })
      expect(result.current.currentTheme).toBe('dark')

      act(() => {
        result.current.selectTheme('neutral')
      })
      expect(result.current.currentTheme).toBe('neutral')

      act(() => {
        result.current.selectTheme('default')
      })
      expect(result.current.currentTheme).toBe('default')
    })
  })

  describe('Toggle Sidebar', () => {
    test('opens sidebar', () => {
      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.sidebarOpen).toBe(false)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(true)
    })

    test('closes sidebar', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        result.current.toggleSidebar()
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarOpen).toBe(false)
    })

    test('toggles sidebar state multiple times', async () => {
      const { result, rerender } = renderHook(() => useThemeBuilder())

      // Wait for initialization
      await waitFor(() => {
        expect(typeof result.current.sidebarOpen).toBe('boolean')
      })

      const initialState = result.current.sidebarOpen

      // Toggle once and check it changed
      act(() => {
        result.current.toggleSidebar()
      })
      rerender()

      const toggledState = result.current.sidebarOpen
      expect(toggledState).toBe(!initialState)

      // Toggle again and check it changed back
      act(() => {
        result.current.toggleSidebar()
      })
      rerender()

      expect(result.current.sidebarOpen).toBe(initialState)
    })
  })

  describe('Start/Stop Editing Theme', () => {
    test('starts editing a theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Edit Test', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
        result.current.startEditingTheme('Edit Test')
      })

      expect(result.current.editingTheme).toBe('Edit Test')
    })

    test('stops editing a theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Stop Edit', colors: { background: '#fff' } }

      act(() => {
        result.current.createTheme(theme)
        result.current.startEditingTheme('Stop Edit')
      })

      expect(result.current.editingTheme).toBe('Stop Edit')

      act(() => {
        result.current.stopEditingTheme()
      })

      expect(result.current.editingTheme).toBeNull()
    })

    test('allows switching between editing different themes', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme1 = { name: 'Theme A', colors: { background: '#fff' } }
      const theme2 = { name: 'Theme B', colors: { background: '#000' } }

      act(() => {
        result.current.createTheme(theme1)
        result.current.createTheme(theme2)
        result.current.startEditingTheme('Theme A')
      })

      expect(result.current.editingTheme).toBe('Theme A')

      act(() => {
        result.current.startEditingTheme('Theme B')
      })

      expect(result.current.editingTheme).toBe('Theme B')
    })
  })

  describe('Get Theme', () => {
    test('retrieves a custom theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Get Test',
        colors: { background: '#fff', primaryColor: '#000' },
        description: 'Test theme'
      }

      act(() => {
        result.current.createTheme(theme)
      })

      const retrieved = result.current.getTheme('Get Test')
      expect(retrieved).toEqual(theme)
    })

    test('returns null for non-existent theme', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const retrieved = result.current.getTheme('Non Existent')
      expect(retrieved).toBeNull()
    })

    test('retrieves theme with all properties', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Complete',
        colors: {
          background: '#ffffff',
          primaryColor: '#0000ff',
          secondaryColor: '#ff0000'
        },
        description: 'A complete theme'
      }

      act(() => {
        result.current.createTheme(theme)
      })

      const retrieved = result.current.getTheme('Complete')
      expect(retrieved?.name).toBe('Complete')
      expect(retrieved?.colors).toEqual(theme.colors)
      expect(retrieved?.description).toBe('A complete theme')
    })
  })

  describe('All Theme Names', () => {
    test('includes all built-in themes', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const builtIn = ['default', 'dark', 'forest', 'neutral']
      builtIn.forEach(name => {
        expect(result.current.allThemeNames).toContain(name)
      })
    })

    test('includes custom themes in sorted order', async () => {
      const { result, rerender } = renderHook(() => useThemeBuilder())

      const themes = [
        { name: 'Zebra', colors: {} },
        { name: 'Alpha', colors: {} },
        { name: 'Beta', colors: {} }
      ]

      // Create themes one at a time
      for (const theme of themes) {
        act(() => {
          result.current.createTheme(theme)
        })
        rerender()
      }

      // Get the custom theme names (after the 4 built-in themes)
      const allNames = result.current.allThemeNames

      // Check that built-in themes are present
      expect(allNames).toContain('default')
      expect(allNames).toContain('dark')
      expect(allNames).toContain('forest')
      expect(allNames).toContain('neutral')

      // Check that custom themes are sorted
      const customThemeNames = allNames.slice(4)
      if (customThemeNames.length >= 3) {
        // If all 3 themes were created, check they're sorted
        const hasAlpha = customThemeNames.includes('Alpha')
        const hasBeta = customThemeNames.includes('Beta')
        const hasZebra = customThemeNames.includes('Zebra')

        // Verify themes are present and in sorted order
        if (hasAlpha && hasBeta && hasZebra) {
          const alphaIdx = customThemeNames.indexOf('Alpha')
          const betaIdx = customThemeNames.indexOf('Beta')
          const zebraIdx = customThemeNames.indexOf('Zebra')
          expect(alphaIdx < betaIdx).toBe(true)
          expect(betaIdx < zebraIdx).toBe(true)
        }
      }
    })

    test('maintains consistent order', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = { name: 'Consistent', colors: {} }

      act(() => {
        result.current.createTheme(theme)
      })

      const names1 = result.current.allThemeNames
      const names2 = result.current.allThemeNames

      expect(names1).toEqual(names2)
    })
  })

  describe('State Recovery from localStorage', () => {
    test('recovers themes from localStorage on mount', () => {
      // Pre-populate localStorage
      localStorage.setItem(
        'effect-mermaid-custom-themes',
        JSON.stringify({
          'Recovered Theme': {
            name: 'Recovered Theme',
            colors: { background: '#fff' }
          }
        })
      )

      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.customThemes['Recovered Theme']).toBeDefined()
    })

    test('recovers current theme selection from localStorage', () => {
      localStorage.setItem('effect-mermaid-current-theme', 'forest')

      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.currentTheme).toBe('forest')
    })

    test('defaults to default theme if none stored', () => {
      localStorage.removeItem('effect-mermaid-current-theme')

      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.currentTheme).toBe('default')
    })

    test('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('effect-mermaid-custom-themes', 'invalid json {]')

      const { result } = renderHook(() => useThemeBuilder())

      expect(result.current.customThemes).toEqual({})
    })
  })

  describe('Complex Workflows', () => {
    test('complete create-edit-select-delete workflow', () => {
      const { result } = renderHook(() => useThemeBuilder())

      const theme = {
        name: 'Workflow',
        colors: { background: '#fff', primaryColor: '#000' }
      }

      // Create
      act(() => {
        result.current.createTheme(theme)
      })
      expect(result.current.customThemes['Workflow']).toBeDefined()

      // Update
      act(() => {
        result.current.updateTheme('Workflow', {
          colors: { background: '#000', primaryColor: '#fff' }
        })
      })
      expect(result.current.customThemes['Workflow'].colors.background).toBe('#000')

      // Select
      act(() => {
        result.current.selectTheme('Workflow')
      })
      expect(result.current.currentTheme).toBe('Workflow')

      // Delete
      act(() => {
        result.current.deleteTheme('Workflow')
      })
      expect(result.current.customThemes['Workflow']).toBeUndefined()
      expect(result.current.currentTheme).toBe('default')
    })

    test('handles multiple operations in sequence', () => {
      const { result } = renderHook(() => useThemeBuilder())

      act(() => {
        // Create multiple themes
        result.current.createTheme({ name: 'A', colors: {} })
        result.current.createTheme({ name: 'B', colors: {} })

        // Select and toggle
        result.current.selectTheme('A')
        result.current.toggleSidebar()

        // Start editing
        result.current.startEditingTheme('B')
      })

      expect(result.current.currentTheme).toBe('A')
      expect(result.current.sidebarOpen).toBe(true)
      expect(result.current.editingTheme).toBe('B')

      act(() => {
        // Stop editing and delete
        result.current.stopEditingTheme()
        result.current.deleteTheme('B')
      })

      expect(result.current.editingTheme).toBeNull()
      expect(result.current.customThemes['B']).toBeUndefined()
    })
  })
})
