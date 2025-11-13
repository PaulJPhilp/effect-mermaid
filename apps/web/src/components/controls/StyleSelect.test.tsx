import { test, expect, describe, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StyleSelect } from './StyleSelect'

describe('StyleSelect Component', () => {
  const mockOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' }
  ]

  test('renders with label', () => {
    render(
      <StyleSelect
        label="Line Style"
        value="solid"
        options={mockOptions}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Line Style')).toBeInTheDocument()
  })

  test('renders all options', () => {
    render(
      <StyleSelect
        label="Line Style"
        value="solid"
        options={mockOptions}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Solid')).toBeInTheDocument()
    expect(screen.getByText('Dashed')).toBeInTheDocument()
    expect(screen.getByText('Dotted')).toBeInTheDocument()
  })

  test('selects the correct option initially', () => {
    render(
      <StyleSelect
        label="Line Style"
        value="dashed"
        options={mockOptions}
        onChange={vi.fn()}
      />
    )

    const select = document.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('dashed')
  })

  test('calls onChange when option is selected', () => {
    const onChange = vi.fn()

    render(
      <StyleSelect
        label="Line Style"
        value="solid"
        options={mockOptions}
        onChange={onChange}
      />
    )

    const select = document.querySelector('select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'dotted' } })

    expect(onChange).toHaveBeenCalledWith('dotted')
  })

  test('handles empty options array', () => {
    render(
      <StyleSelect
        label="Empty Select"
        value=""
        options={[]}
        onChange={vi.fn()}
      />
    )

    const select = document.querySelector('select') as HTMLSelectElement
    expect(select.children.length).toBe(0)
  })

  test('handles single option', () => {
    const singleOption = [{ value: 'only', label: 'Only Option' }]

    render(
      <StyleSelect
        label="Single"
        value="only"
        options={singleOption}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Only Option')).toBeInTheDocument()
  })

  test('updates when value prop changes', () => {
    const { rerender } = render(
      <StyleSelect
        label="Line Style"
        value="solid"
        options={mockOptions}
        onChange={vi.fn()}
      />
    )

    let select = document.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('solid')

    rerender(
      <StyleSelect
        label="Line Style"
        value="dashed"
        options={mockOptions}
        onChange={vi.fn()}
      />
    )

    select = document.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('dashed')
  })
})
