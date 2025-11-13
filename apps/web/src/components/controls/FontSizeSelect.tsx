import React from 'react'
import './Select.css'

interface FontSizeSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
}

const FONT_SIZES = [
  '10px',
  '11px',
  '12px',
  '13px',
  '14px',
  '15px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '28px',
  '32px',
]

/**
 * Dropdown selector for font sizes
 */
export const FontSizeSelect: React.FC<FontSizeSelectProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="select-container">
      <label className="select-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-input"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  )
}
