import { useState, useEffect } from "react";
import { Label, Input } from "@/components/ui";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorInput = ({ label, value, onChange }: ColorInputProps) => {
  const [inputValue, setInputValue] = useState(value);

  // Update inputValue when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Normalize color to hex format
  const normalizeColor = (color: string): string => {
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map((x) => parseInt(x));
        return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      }
    }
    return "#000000";
  };

  const hexValue = normalizeColor(inputValue);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="color-input">{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          className="h-10 w-12 cursor-pointer rounded-md border border-input"
          title="Click to pick color"
          aria-label={`Color picker for ${label}`}
        />
        <Input
          id="color-input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          placeholder="#000000"
          maxLength={7}
          autoComplete="off"
          className="flex-1"
        />
      </div>
    </div>
  );
};
