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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${fullWidth ? "w-full" : ""} px-3 ${inputClasses} border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
      />
    </div>
  );
}
