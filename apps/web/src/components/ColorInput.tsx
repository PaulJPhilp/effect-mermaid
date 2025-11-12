import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import "react-colorful";
import "../styles/ColorInput.css";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorInput = ({ label, value, onChange }: ColorInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="color-input-wrapper">
      <label>{label}</label>
      <div className="color-input-container">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          className="color-button"
          title="Click to pick color"
          aria-label={`Color picker for ${label}`}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // onChange already fired, just close the popover if open
              e.currentTarget.blur();
            }
          }}
          placeholder="#000000"
          className="color-text-input"
          maxLength={7}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
