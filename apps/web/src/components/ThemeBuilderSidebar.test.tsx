import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistryProvider } from '@effect-atom/atom-react'
import { MermaidProvider } from 'effect-mermaid-react'
import { ThemeBuilderSidebar } from './ThemeBuilderSidebar'
import { useThemeBuilder } from '../hooks/useThemeBuilder'

// Mock the Mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (id: string, code: string) => ({
      svg: '<svg>Mock Diagram</svg>'
    })),
    themes: {}
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <RegistryProvider>
    <MermaidProvider>
      {children}
    </MermaidProvider>
  </RegistryProvider>
)

describe('ThemeBuilderSidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Sidebar Toggle', () => {
    test('renders toggle button', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveTextContent('🎨')
    })

    test('sidebar is hidden by default', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })

    test('toggles sidebar open when button clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).toHaveClass('open')
    })

    test('toggles sidebar closed when open', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')

      // Open
      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveTitle('Close theme builder')

      // Close
      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveTitle('Open theme builder')
    })

    test('closes sidebar when close button clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const closeButton = screen.getByTitle('Close')
      fireEvent.click(closeButton)

      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })

    test('closes sidebar when overlay clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const overlay = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')?.nextElementSibling
      if (overlay) {
        fireEvent.click(overlay)
      }

      // Sidebar should be closed
      const sidebar = screen.getByText('Theme Builder').closest('.theme-builder-sidebar')
      expect(sidebar).not.toHaveClass('open')
    })
  })

  describe('Built-in Themes Display', () => {
    test('displays all built-in themes', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      expect(screen.getByText('default')).toBeInTheDocument()
      expect(screen.getByText('dark')).toBeInTheDocument()
      expect(screen.getByText('forest')).toBeInTheDocument()
      expect(screen.getByText('neutral')).toBeInTheDocument()
    })

    test('marks built-in themes with badge', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const badges = screen.getAllByText('Built-in')
      expect(badges.length).toBe(4) // 4 built-in themes
    })

    test('built-in themes cannot be edited', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Find the default theme item
      const defaultThemeItem = screen.getByText('default').closest('.theme-item')
      expect(defaultThemeItem).toBeInTheDocument()

      // Should not have edit/delete buttons
      const editButton = defaultThemeItem?.querySelector('[aria-label="Edit default"]')
      const deleteButton = defaultThemeItem?.querySelector('[aria-label="Delete default"]')

      expect(editButton).not.toBeInTheDocument()
      expect(deleteButton).not.toBeInTheDocument()
    })

    test('theme items show theme name', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const themeNames = ['default', 'dark', 'forest', 'neutral']
      themeNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })
  })

  describe('Create Theme', () => {
    test('shows "New Theme" button when not editing', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      expect(newThemeButton).toBeInTheDocument()
    })

    test('shows theme creation form when button clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      expect(input).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    test('creates theme when form submitted', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'My Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Theme should be created and listed
      await waitFor(() => {
        expect(screen.getByText('My Theme')).toBeInTheDocument()
      })
    })

    test('disables create button when name is empty', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton).toBeDisabled()
    })

    test('disables create button when name is only whitespace', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: '   ' } })

      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton).toBeDisabled()
    })

    test('trims whitespace from theme name', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: '  My Theme  ' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('My Theme')).toBeInTheDocument()
      })
    })

    test('clears form after creating theme', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'My Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('My Theme')).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByPlaceholderText('Theme name')).not.toBeInTheDocument()
    })
  })

  describe('Edit Theme', () => {
    test('opens theme editor when edit button clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click edit button
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit Test Theme')
        fireEvent.click(editButton)
      })

      expect(screen.getByText(/Editing: Test Theme/)).toBeInTheDocument()
    })

    test('shows color inputs in edit mode', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click edit button
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit Test Theme')
        fireEvent.click(editButton)
      })

      expect(screen.getByText('Colors')).toBeInTheDocument()
    })

    test('closes editor when cancel clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click edit button
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit Test Theme')
        fireEvent.click(editButton)
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      // Should be back to theme list
      expect(screen.getByText('+ New Theme')).toBeInTheDocument()
    })

    test('closes editor when close button clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click edit button
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit Test Theme')
        fireEvent.click(editButton)
      })

      const closeButtons = screen.getAllByTitle('Close editor')
      fireEvent.click(closeButtons[0])

      // Should be back to theme list
      expect(screen.getByText('+ New Theme')).toBeInTheDocument()
    })
  })

  describe('Delete Theme', () => {
    test('shows delete button for custom themes', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      await waitFor(() => {
        const deleteButton = screen.getByLabelText('Delete Test Theme')
        expect(deleteButton).toBeInTheDocument()
      })
    })

    test('shows delete confirmation dialog', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click delete button
      await waitFor(() => {
        const deleteButton = screen.getByLabelText('Delete Test Theme')
        fireEvent.click(deleteButton)
      })

      expect(screen.getByText('Delete "Test Theme"?')).toBeInTheDocument()
    })

    test('deletes theme when confirmed', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click delete button
      await waitFor(() => {
        const deleteButton = screen.getByLabelText('Delete Test Theme')
        fireEvent.click(deleteButton)
      })

      const confirmDeleteButton = screen.getByText('Delete')
      fireEvent.click(confirmDeleteButton)

      // Theme should be removed
      await waitFor(() => {
        expect(screen.queryByText('Test Theme')).not.toBeInTheDocument()
      })
    })

    test('cancels delete when confirmation cancelled', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      // Create a theme first
      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      const createButton = screen.getByText('Create')
      fireEvent.click(createButton)

      // Click delete button
      await waitFor(() => {
        const deleteButton = screen.getByLabelText('Delete Test Theme')
        fireEvent.click(deleteButton)
      })

      const cancelButton = screen.getAllByText('Cancel')[0]
      fireEvent.click(cancelButton)

      // Theme should still exist
      expect(screen.getByText('Test Theme')).toBeInTheDocument()
    })
  })

  describe('Theme Selection', () => {
    test('marks default theme as active on load', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const defaultThemeItem = screen.getByText('default').closest('.theme-item')
      expect(defaultThemeItem).toHaveClass('active')
    })

    test('switches active theme when clicked', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const darkThemeButton = screen.getByTitle('Switch to dark')
      fireEvent.click(darkThemeButton)

      const darkThemeItem = screen.getByText('dark').closest('.theme-item')
      expect(darkThemeItem).toHaveClass('active')
    })
  })

  describe('Keyboard Interactions', () => {
    test('creates theme on Enter key in new theme form', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Test Theme')).toBeInTheDocument()
      })
    })

    test('cancels theme creation on Escape key', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name')
      fireEvent.change(input, { target: { value: 'Test Theme' } })

      fireEvent.keyDown(input, { key: 'Escape' })

      expect(screen.queryByPlaceholderText('Theme name')).not.toBeInTheDocument()
      expect(screen.getByText('+ New Theme')).toBeInTheDocument()
    })

    test('input autofocuses when form appears', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const newThemeButton = screen.getByText('+ New Theme')
      fireEvent.click(newThemeButton)

      const input = screen.getByPlaceholderText('Theme name') as HTMLInputElement
      expect(input).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    test('toggle button has aria-label', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      expect(toggleButton).toHaveAttribute('aria-label', 'Theme builder')
    })

    test('theme name buttons are clickable', async () => {
      render(<ThemeBuilderSidebar />, { wrapper: TestWrapper })

      const toggleButton = screen.getByTitle('Open theme builder')
      fireEvent.click(toggleButton)

      const themeButtons = screen.getAllByText(/default|dark|forest|neutral/)
      expect(themeButtons.length).toBeGreaterThan(0)
    })
  })
})
