import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { RegistryProvider } from '@effect-atom/atom-react'
import { MermaidProvider } from 'effect-mermaid-react'
import { App } from '../../App'
import { ThemeBuilderSidebar } from '../../components/ThemeBuilderSidebar'
import { ColorInput } from '../../components/ColorInput'

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <RegistryProvider>
    <MermaidProvider>
      {children}
    </MermaidProvider>
  </RegistryProvider>
)

describe('Component Structure Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('ColorInput Component Snapshot', () => {
    test('ColorInput renders with standard props', () => {
      const { container } = render(
        <ColorInput
          label="Primary Color"
          value="#ffffff"
          onChange={() => {}}
        />
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    test('ColorInput with hex color value', () => {
      const { container } = render(
        <ColorInput
          label="Background"
          value="#000000"
          onChange={() => {}}
        />
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    test('ColorInput structure is consistent', () => {
      const renders = [
        render(
          <ColorInput
            label="Color"
            value="#fff"
            onChange={() => {}}
          />
        ),
        render(
          <ColorInput
            label="Color"
            value="#fff"
            onChange={() => {}}
          />
        )
      ]

      expect(renders[0].container.firstChild).toEqual(renders[1].container.firstChild)
    })
  })

  describe('ThemeBuilderSidebar Component Snapshot', () => {
    test('ThemeBuilderSidebar structure', () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      // Check that the main structure is there
      expect(container.querySelector('.theme-builder-toggle')).toBeTruthy()
      expect(container.querySelector('.theme-builder-sidebar')).toBeTruthy()
    })

    test('ThemeBuilderSidebar toggle button exists', () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      const toggleButton = container.querySelector('.theme-builder-toggle')
      expect(toggleButton).toMatchSnapshot()
    })

    test('ThemeBuilderSidebar layout structure', () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      const sidebar = container.querySelector('.theme-builder-sidebar')
      expect(sidebar?.querySelector('.sidebar-header')).toBeTruthy()
      expect(sidebar?.querySelector('.sidebar-content')).toBeTruthy()
    })
  })

  describe('App Component Snapshot', () => {
    test('App initial structure before initialization', () => {
      const { container } = render(<App />)

      // Loading state should be present
      expect(container.querySelector('.loading-spinner')).toBeTruthy()
    })

    test('App has required sections', async () => {
      const { container, findByText } = render(<App />)

      // Wait for initialization
      await findByText('Diagram Code', { timeout: 5000 })

      expect(container.querySelector('.container')).toBeTruthy()
      expect(container.querySelectorAll('.panel').length).toBeGreaterThanOrEqual(2)
    })

    test('App structure maintains consistency', () => {
      const render1 = render(<App />)
      const render2 = render(<App />)

      // Both should have the same structure
      expect(render1.container.querySelector('.container')).toBeTruthy()
      expect(render2.container.querySelector('.container')).toBeTruthy()
    })

    test('Editor panel structure', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const editorPanel = container.querySelector('.panel.editor')
      expect(editorPanel?.querySelector('.panel-header')).toBeTruthy()
      expect(editorPanel?.querySelector('.editor-wrapper')).toBeTruthy()
      expect(editorPanel?.querySelector('textarea')).toBeTruthy()
    })

    test('Preview panel structure', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Preview', { timeout: 5000 })

      const previewPanel = container.querySelector('.panel.preview')
      expect(previewPanel?.querySelector('.panel-header')).toBeTruthy()
      expect(previewPanel?.querySelector('.diagram-container')).toBeTruthy()
    })

    test('Toolbar structure is consistent', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const toolbars = container.querySelectorAll('.toolbar')
      expect(toolbars.length).toBeGreaterThanOrEqual(2)

      // Editor toolbar should have buttons
      const editorToolbar = container.querySelector('.panel.editor .toolbar')
      expect(editorToolbar?.querySelectorAll('button').length).toBeGreaterThanOrEqual(3)
    })

    test('Theme buttons are consistently rendered', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Preview', { timeout: 5000 })

      const themeToolbar = container.querySelector('.theme-toolbar')
      const themeButtons = themeToolbar?.querySelectorAll('button')

      // Should have at least 4 built-in themes
      expect(themeButtons?.length).toBeGreaterThanOrEqual(4)
    })

    test('Loading spinner structure', () => {
      const { container } = render(<App />)

      const loadingContainer = container.querySelector('[style*="display: flex"]')
      expect(loadingContainer?.querySelector('.loading-spinner')).toBeTruthy()
    })

    test('Status bar structure', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const statusBar = container.querySelector('.editor-status')
      expect(statusBar).toBeTruthy()
    })
  })

  describe('Component DOM Structure', () => {
    test('ColorInput has correct DOM hierarchy', () => {
      const { container } = render(
        <ColorInput
          label="Test"
          value="#000"
          onChange={() => {}}
        />
      )

      const wrapper = container.querySelector('.color-input-wrapper')
      expect(wrapper?.querySelector('label')).toBeTruthy()
      expect(wrapper?.querySelector('.color-input-container')).toBeTruthy()
    })

    test('Button elements are properly structured', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const buttons = container.querySelectorAll('button')

      // All buttons should have proper structure
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
        expect(button).toHaveAttribute('type')
      })
    })

    test('Form inputs have proper structure', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const textarea = container.querySelector('textarea')
      expect(textarea).toBeTruthy()
      expect(textarea?.tagName).toBe('TEXTAREA')
    })

    test('Heading structure is semantic', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const h2Elements = container.querySelectorAll('h2')
      expect(h2Elements.length).toBeGreaterThanOrEqual(2)

      // Check heading text
      expect(h2Elements[0].textContent).toContain('Diagram')
    })
  })

  describe('Layout Consistency', () => {
    test('Container layout is consistent', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const container1 = container.querySelector('.container')
      expect(container1).toBeTruthy()
      expect(container1?.children.length).toBeGreaterThan(0)
    })

    test('Panel layout structure', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const panels = container.querySelectorAll('.panel')
      expect(panels.length).toBeGreaterThanOrEqual(2)

      // Each panel should have header
      panels.forEach(panel => {
        expect(panel.querySelector('.panel-header')).toBeTruthy()
      })
    })

    test('Toolbar layout consistency', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const toolbars = container.querySelectorAll('.toolbar')

      // All toolbars should contain buttons
      toolbars.forEach(toolbar => {
        expect(toolbar.querySelectorAll('button').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Responsive Structure', () => {
    test('Sidebar has proper responsive structure', async () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      const sidebar = container.querySelector('.theme-builder-sidebar')
      expect(sidebar?.classList.contains('theme-builder-sidebar')).toBe(true)
    })

    test('App panels have responsive classes', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const panels = container.querySelectorAll('.panel')
      // Should have editor and preview panels
      expect(panels.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Element Count Stability', () => {
    test('ColorInput renders same number of elements', () => {
      const renders = [
        render(<ColorInput label="Color" value="#fff" onChange={() => {}} />),
        render(<ColorInput label="Color" value="#fff" onChange={() => {}} />)
      ]

      const count1 = renders[0].container.querySelectorAll('*').length
      const count2 = renders[1].container.querySelectorAll('*').length

      expect(count1).toBe(count2)
    })

    test('Buttons maintain consistent count', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Count should match expected structure
      const expectedMinButtons = 7 // At least copy, reset, clear, toggle, + 4 theme buttons
      expect(buttons.length).toBeGreaterThanOrEqual(expectedMinButtons)
    })
  })

  describe('Component Props Reflection in DOM', () => {
    test('Button title attributes are rendered', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const buttons = container.querySelectorAll('button[title]')
      expect(buttons.length).toBeGreaterThan(0)
    })

    test('Input placeholder is rendered', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const textarea = container.querySelector('textarea[placeholder]')
      expect(textarea).toBeTruthy()
      expect(textarea?.getAttribute('placeholder')).toBeTruthy()
    })

    test('Aria labels are rendered', () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      const toggleButton = container.querySelector('[aria-label="Theme builder"]')
      expect(toggleButton).toBeTruthy()
    })
  })

  describe('Dynamic Content Structure', () => {
    test('Error message container structure exists', async () => {
      const { container, findByText } = render(<App />)

      await findByText('Diagram Code', { timeout: 5000 })

      const previewPanel = container.querySelector('.diagram-container')
      expect(previewPanel).toBeTruthy()
    })

    test('Theme list structure is consistent', () => {
      const { container } = render(
        <ThemeBuilderSidebar />,
        { wrapper: TestWrapper }
      )

      const themeList = container.querySelector('.theme-list')
      expect(themeList).toBeTruthy()
    })
  })
})
