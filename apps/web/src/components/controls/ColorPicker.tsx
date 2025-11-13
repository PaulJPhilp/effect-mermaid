import React from 'react'
import './ColorPicker.css'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Color picker input for selecting colors
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
    <div className="color-picker-container">
      <label className="color-label">{label}</label>
      <div className="color-picker-wrapper">
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
          className="color-input"
          title={label}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          placeholder="#000000"
          className="color-text-input"
          maxLength={7}
        />
      </div>
    </div>
  )
}
