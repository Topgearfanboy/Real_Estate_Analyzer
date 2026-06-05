import { useState, useCallback } from "react";

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  size = "md",
  fullWidth = true,
}: TextFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused ? inputValue : value;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setInputValue(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onChange(inputValue);
  }, [inputValue, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const labelClasses = size === "sm" ? "text-xs" : "text-sm";
  const inputClasses = size === "sm" ? "py-1.5" : "py-2";

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          className={`block ${labelClasses} font-medium text-text-muted mb-1`}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${fullWidth ? "w-full" : ""} px-3 ${inputClasses} border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
      />
    </div>
  );
}
