interface CurrencyTypeSelectProps {
  value: "$" | "%";
  onChange: (value: "$" | "%") => void;
  variant?: "default" | "combined";
}

export function CurrencyTypeSelect({
  value,
  onChange,
  variant = "default",
}: CurrencyTypeSelectProps) {
  const isCombined = variant === "combined";
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as "$" | "%")}
      className={`pl-3 pr-1 py-2 bg-white shrink-0 focus:outline-none justify-between${
        isCombined
          ? "border-0 h-full"
          : "border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      }`}
    >
      <option value="$">$</option>
      <option value="%">%</option>
    </select>
  );
}
