import { test, expect, describe, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NumberSlider } from './NumberSlider'

describe('NumberSlider Component', () => {
  test('renders with label', () => {
    render(
      <NumberSlider
        label="Test Slider"
        value={10}
        min={0}
        max={100}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Test Slider')).toBeInTheDocument()
  })

  test('displays current value', () => {
    render(
      <NumberSlider
        label="Size"
        value={42}
        min={0}
        max={100}
        onChange={vi.fn()}
      />
    )

    // The value should be displayed in the slider
    const valueDisplay = screen.getByText(/42/)
    expect(valueDisplay).toBeInTheDocument()
  })

  test('displays unit if provided', () => {
    render(
      <NumberSlider
        label="Size"
        value={50}
        min={0}
        max={100}
        unit="px"
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText(/50px/)).toBeInTheDocument()
  })

  test('calls onChange when slider is moved', () => {
    const onChange = vi.fn()

    render(
      <NumberSlider
        label="Size"
        value={50}
        min={0}
        max={100}
        onChange={onChange}
      />
    )

    const slider = document.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '75' } })

    expect(onChange).toHaveBeenCalledWith(75)
  })

  test('respects min and max constraints', () => {
    render(
      <NumberSlider
        label="Size"
        value={50}
        min={10}
        max={90}
        onChange={vi.fn()}
      />
    )

    const slider = document.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider.min).toBe('10')
    expect(slider.max).toBe('90')
  })

  test('respects step size if provided', () => {
    render(
      <NumberSlider
        label="Size"
        value={50}
        min={0}
        max={100}
        step={5}
        onChange={vi.fn()}
      />
    )

    const slider = document.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider.step).toBe('5')
  })

  test('handles decimal values with step', () => {
    const onChange = vi.fn()

    render(
      <NumberSlider
        label="Width"
        value={2.5}
        min={0}
        max={10}
        step={0.5}
        onChange={onChange}
      />
    )

    const slider = document.querySelector('input[type="range"]') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '3.5' } })

    expect(onChange).toHaveBeenCalled()
  })

  test('displays value without unit when no unit provided', () => {
    render(
      <NumberSlider
        label="Count"
        value={42}
        min={0}
        max={100}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText(/42($|\s)/)).toBeInTheDocument()
  })
})
