import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
  suffix?: string;
  error?: string;
}

export function FormInput({
  label,
  prefix,
  suffix,
  error,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-text-muted whitespace-nowrap">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {prefix}
          </span>
        )}
        <input
          {...props}
          className={`${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-8" : "pr-3"} py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? "border-danger focus:ring-danger" : ""
          } ${className || ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
