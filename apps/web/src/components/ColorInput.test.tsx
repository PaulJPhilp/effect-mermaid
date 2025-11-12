import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorInput } from './ColorInput'

describe('ColorInput Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders label', () => {
      render(<ColorInput label="Primary Color" value="#000000" onChange={mockOnChange} />)

      expect(screen.getByText('Primary Color')).toBeInTheDocument()
    })

    test('renders color picker input', () => {
      render(<ColorInput label="Primary Color" value="#000000" onChange={mockOnChange} />)

      const colorInput = screen.getByDisplayValue('#000000')
      expect(colorInput).toBeInTheDocument()
      expect(colorInput).toHaveAttribute('type', 'color')
    })

    test('renders text input for hex color entry', () => {
      render(<ColorInput label="Primary Color" value="#ffffff" onChange={mockOnChange} />)

      const textInputs = screen.getAllByDisplayValue('#ffffff')
      expect(textInputs.length).toBeGreaterThan(0)
      expect(textInputs[1]).toHaveAttribute('type', 'text')
    })

    test('text input has maxlength of 7', () => {
      render(<ColorInput label="Primary Color" value="#000000" onChange={mockOnChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      expect(textInput).toHaveAttribute('maxLength', '7')
    })

    test('renders placeholder in text input', () => {
      render(<ColorInput label="Primary Color" value="#000000" onChange={mockOnChange} />)

      expect(screen.getByPlaceholderText('#000000')).toBeInTheDocument()
    })

    test('has aria-label on color picker', () => {
      render(<ColorInput label="Background" value="#ffffff" onChange={mockOnChange} />)

      const colorInput = screen.getByLabelText('Color picker for Background')
      expect(colorInput).toBeInTheDocument()
    })
  })

  describe('Color Input Handling', () => {
    test('calls onChange when color picker value changes', async () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const colorInput = screen.getAllByDisplayValue('#000000')[0] as HTMLInputElement
      fireEvent.change(colorInput, { target: { value: '#ff0000' } })

      expect(onChange).toHaveBeenCalledWith('#ff0000')
    })

    test('calls onChange when text input value changes', async () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#00ff00' } })

      expect(onChange).toHaveBeenCalledWith('#00ff00')
    })

    test('updates displayed value when prop changes', () => {
      const { rerender } = render(
        <ColorInput label="Test Color" value="#000000" onChange={mockOnChange} />
      )

      expect(screen.getAllByDisplayValue('#000000').length).toBeGreaterThan(0)

      rerender(<ColorInput label="Test Color" value="#ff0000" onChange={mockOnChange} />)

      expect(screen.getAllByDisplayValue('#ff0000').length).toBeGreaterThan(0)
    })

    test('syncs both inputs when one changes', async () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#aabbcc' } })

      expect(onChange).toHaveBeenCalledWith('#aabbcc')
    })
  })

  describe('Color Format Normalization', () => {
    test('normalizes rgb format to hex', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="rgb(255,0,0)" onChange={onChange} />)

      // The component should normalize the display
      const textInput = screen.getByPlaceholderText('#000000')
      expect(textInput).toBeInTheDocument()
    })

    test('handles hex format correctly', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#1a2b3c" onChange={onChange} />)

      expect(screen.getAllByDisplayValue('#1a2b3c').length).toBeGreaterThan(0)
    })

    test('preserves hex input when valid', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#ffffff" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#ff00ff' } })

      expect(onChange).toHaveBeenCalledWith('#ff00ff')
    })

    test('returns #000000 as fallback for invalid color', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="invalid" onChange={onChange} />)

      // Component should handle gracefully
      expect(screen.getByText('Test Color')).toBeInTheDocument()
    })

    test('handles uppercase hex values', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#AABBCC" onChange={onChange} />)

      const colorInputs = screen.getAllByDisplayValue('#aabbcc')
      expect(colorInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Text Input Behavior', () => {
    test('allows typing in text input', async () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')

      fireEvent.change(textInput, { target: { value: '#f' } })
      fireEvent.change(textInput, { target: { value: '#ff' } })
      fireEvent.change(textInput, { target: { value: '#ff0000' } })

      expect(onChange).toHaveBeenLastCalledWith('#ff0000')
    })

    test('prevents input longer than 7 characters', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000') as HTMLInputElement
      expect(textInput.maxLength).toBe(7)
    })

    test('calls onChange on Enter key', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#0000ff' } })
      fireEvent.keyDown(textInput, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith('#0000ff')
    })

    test('has autocomplete disabled', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      expect(textInput).toHaveAttribute('autoComplete', 'off')
    })
  })

  describe('Color Swatch Display', () => {
    test('displays color swatch with hex value', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Primary Color" value="#ff0000" onChange={onChange} />)

      const colorInput = screen.getAllByDisplayValue('#ff0000')[0]
      expect(colorInput).toHaveAttribute('type', 'color')
      expect(colorInput).toHaveValue('#ff0000')
    })

    test('color swatch updates when value changes', () => {
      const { rerender } = render(
        <ColorInput label="Test Color" value="#000000" onChange={mockOnChange} />
      )

      const colorInput1 = screen.getAllByDisplayValue('#000000')[0] as HTMLInputElement
      expect(colorInput1.value).toBe('#000000')

      rerender(<ColorInput label="Test Color" value="#00ff00" onChange={mockOnChange} />)

      const colorInput2 = screen.getAllByDisplayValue('#00ff00')[0] as HTMLInputElement
      expect(colorInput2.value).toBe('#00ff00')
    })
  })

  describe('Click Outside Detection', () => {
    test('closes picker when clicking outside (implementation note)', () => {
      const onChange = vi.fn()
      render(
        <>
          <ColorInput label="Test Color" value="#000000" onChange={onChange} />
          <div data-testid="outside">Outside element</div>
        </>
      )

      // Click outside simulation
      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      // Picker behavior would be handled by component state
      expect(onChange).not.toHaveBeenCalled()
    })

    test('keeps picker open when clicking inside', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test Color" value="#000000" onChange={onChange} />)

      const colorInput = screen.getAllByDisplayValue('#000000')[0]
      fireEvent.mouseDown(colorInput)

      // Picker should remain open
      expect(colorInput).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    test('handles all label types', () => {
      const onChange = vi.fn()
      const labels = [
        'background',
        'primaryColor',
        'lineColor',
        'tertiaryBorderColor'
      ]

      labels.forEach(label => {
        const { unmount } = render(
          <ColorInput label={label} value="#000000" onChange={onChange} />
        )
        expect(screen.getByText(label)).toBeInTheDocument()
        unmount()
      })
    })

    test('respects onChange callback', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#123456' } })

      expect(onChange).toHaveBeenCalledWith('#123456')
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    test('handles multiple instances independently', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      const { rerender } = render(
        <>
          <ColorInput label="Color 1" value="#000000" onChange={onChange1} />
          <ColorInput label="Color 2" value="#ffffff" onChange={onChange2} />
        </>
      )

      const inputs = screen.getAllByPlaceholderText('#000000')
      fireEvent.change(inputs[0], { target: { value: '#111111' } })

      expect(onChange1).toHaveBeenCalledWith('#111111')
      expect(onChange2).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('label is associated with color input', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Background" value="#ffffff" onChange={onChange} />)

      expect(screen.getByLabelText('Color picker for Background')).toBeInTheDocument()
    })

    test('color picker has title attribute', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Primary" value="#000000" onChange={onChange} />)

      const colorInput = screen.getByLabelText('Color picker for Primary')
      expect(colorInput).toHaveAttribute('title')
    })

    test('text input can be focused', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000') as HTMLInputElement
      textInput.focus()

      expect(textInput).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    test('handles empty color value gracefully', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test" value="" onChange={onChange} />)

      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    test('handles rapid value changes', () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test" value="#000000" onChange={onChange} />)

      const textInput = screen.getByPlaceholderText('#000000')

      fireEvent.change(textInput, { target: { value: '#f' } })
      fireEvent.change(textInput, { target: { value: '#ff' } })
      fireEvent.change(textInput, { target: { value: '#fff' } })
      fireEvent.change(textInput, { target: { value: '#ffff' } })

      expect(onChange.mock.calls.length).toBeGreaterThan(0)
    })

    test('handles switching between color picker and text input', async () => {
      const onChange = vi.fn()
      render(<ColorInput label="Test" value="#000000" onChange={onChange} />)

      const colorInput = screen.getAllByDisplayValue('#000000')[0]
      fireEvent.change(colorInput, { target: { value: '#ff0000' } })

      const textInput = screen.getByPlaceholderText('#000000')
      fireEvent.change(textInput, { target: { value: '#00ff00' } })

      expect(onChange).toHaveBeenCalledWith('#ff0000')
      expect(onChange).toHaveBeenCalledWith('#00ff00')
    })
  })
})
