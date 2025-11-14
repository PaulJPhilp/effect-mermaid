import React from 'react'
import { Label, Input } from '@/components/ui'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Color picker input for selecting colors
 * Uses native HTML5 color picker + hex text input
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = React.useState(value)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    // Only update parent if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="color-picker">{label}</Label>
      <div className="flex gap-2">
        <input
          id="color-picker"
          type="color"
          value={value}
          onChange={handleColorChange}
          className="h-10 w-12 cursor-pointer rounded-md border border-input"
          title={label}
        />
        <Input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          placeholder="#000000"
          maxLength={7}
          className="flex-1"
        />
      </div>
    </div>
  )
}
