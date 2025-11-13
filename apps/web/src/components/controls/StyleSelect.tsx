import React from 'react'
import './Select.css'

interface StyleSelectProps {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

/**
 * Generic dropdown selector for style options
 */
export const StyleSelect: React.FC<StyleSelectProps> = ({
  label,
  value,
  options,
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Preset options for common selections
 */
export const LINE_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
]

export const CURVE_OPTIONS = [
  { value: 'basis', label: 'Basis' },
  { value: 'linear', label: 'Linear' },
  { value: 'cardinal', label: 'Cardinal' },
  { value: 'monotoneX', label: 'Smooth' },
]

export const FONT_FAMILY_OPTIONS = [
  { value: 'trebuchet ms, verdana, arial, sans-serif', label: 'Trebuchet MS' },
  { value: 'arial, sans-serif', label: 'Arial' },
  { value: 'georgia, serif', label: 'Georgia' },
  { value: 'courier new, monospace', label: 'Courier' },
  { value: 'verdana, sans-serif', label: 'Verdana' },
  { value: 'times new roman, serif', label: 'Times New Roman' },
]
