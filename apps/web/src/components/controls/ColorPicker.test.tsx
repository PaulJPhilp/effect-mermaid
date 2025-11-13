import { test, expect, describe, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker Component', () => {
  test('renders with label', () => {
    render(
      <ColorPicker
        label="Test Color"
        value="#000000"
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Test Color')).toBeInTheDocument()
  })

  test('displays color input and text input', () => {
    render(
      <ColorPicker
        label="Color"
        value="#ff0000"
        onChange={vi.fn()}
      />
    )

    const colorInput = document.querySelector('input[type="color"]')
    const textInput = document.querySelector('input[type="text"]')

    expect(colorInput).toBeInTheDocument()
    expect(textInput).toBeInTheDocument()
  })

  test('updates on color input change', () => {
    const onChange = vi.fn()

    render(
      <ColorPicker
        label="Color"
        value="#000000"
        onChange={onChange}
      />
    )

    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })

    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  test('updates on valid hex text input', () => {
    const onChange = vi.fn()

    render(
      <ColorPicker
        label="Color"
        value="#000000"
        onChange={onChange}
      />
    )

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement
    fireEvent.change(textInput, { target: { value: '#00ff00' } })

    expect(onChange).toHaveBeenCalledWith('#00ff00')
  })

  test('does not update on invalid hex text input', () => {
    const onChange = vi.fn()

    render(
      <ColorPicker
        label="Color"
        value="#000000"
        onChange={onChange}
      />
    )

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement

    // Clear previous calls
    onChange.mockClear()

    // Try invalid hex
    fireEvent.change(textInput, { target: { value: 'invalid' } })
    expect(onChange).not.toHaveBeenCalled()

    // Try incomplete hex
    fireEvent.change(textInput, { target: { value: '#fff' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  test('limits text input to 7 characters', () => {
    render(
      <ColorPicker
        label="Color"
        value="#000000"
        onChange={vi.fn()}
      />
    )

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement
    expect(textInput.maxLength).toBe(7)
  })

  test('displays placeholder for text input', () => {
    render(
      <ColorPicker
        label="Color"
        value="#000000"
        onChange={vi.fn()}
      />
    )

    const textInput = document.querySelector('input[type="text"]') as HTMLInputElement
    expect(textInput.placeholder).toBe('#000000')
  })
})
