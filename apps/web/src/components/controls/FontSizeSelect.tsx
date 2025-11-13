import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@/components/ui'

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
 * Uses ShadCn Select component built on Radix UI
 */
export const FontSizeSelect: React.FC<FontSizeSelectProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="font-size-select">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="font-size-select" className="w-full">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
