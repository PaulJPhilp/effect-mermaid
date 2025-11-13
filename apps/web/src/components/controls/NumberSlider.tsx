import React from 'react'
import './NumberSlider.css'

interface NumberSliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

/**
 * Reusable slider component for numeric values
 */
export const NumberSlider: React.FC<NumberSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}) => {
  return (
    <div className="number-slider-container">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
      />
    </div>
  )
}
