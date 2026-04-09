import { useState, useCallback } from "react";

interface CurrencyFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  variant?: "default" | "combined";
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function CurrencyField({
  label,
  value,
  onChange,
  placeholder = "$0",
  size = "md",
  fullWidth = true,
  variant = "default",
}: CurrencyFieldProps) {
  const isCombined = variant === "combined";
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Derive display value from inputValue
  const displayValue = isFocused
    ? inputValue.replace(/[^0-9.]/g, "")
    : (() => {
        const num = parseFloat(inputValue.replace(/[^0-9.]/g, ""));
        return !isNaN(num) && inputValue ? formatCurrency(num) : placeholder;
      })();

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setInputValue(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const rawValue = inputValue.replace(/[^0-9.]/g, "");
    onChange(rawValue);
  }, [inputValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^0-9.,]/g, "");
      setInputValue(cleaned);

      const rawValue = cleaned.replace(/[^0-9.]/g, "");
      onChange(rawValue);
    },
    [onChange],
  );

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
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${fullWidth ? "w-full" : ""} ${isCombined ? "pl-3 pr-1" : "px-3"} ${inputClasses} focus:outline-none ${
          isCombined
            ? "border-0 h-full"
            : "border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        }`}
      />
    </div>
  );
}
