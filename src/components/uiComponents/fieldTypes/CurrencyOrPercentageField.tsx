import { CurrencyField } from "./CurrencyField";
import { PercentageField } from "./PercentageField";
import { CurrencyTypeSelect } from "../CurrencyTypeSelect";

interface CurrencyOrPercentageFieldProps {
  value: string;
  type: "$" | "%";
  onChange: (value: string) => void;
  onTypeChange: (type: "$" | "%") => void;
  width?: string;
}

export function CurrencyOrPercentageField({
  value,
  type,
  onChange,
  onTypeChange,
  width = "w-24",
}: CurrencyOrPercentageFieldProps) {
  return (
    <div className="flex border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary justify-between">
      {type === "$" ? (
        <div className={width}>
          <CurrencyField
            value={value}
            onChange={onChange}
            fullWidth={true}
            variant="combined"
          />
        </div>
      ) : (
        <div className={width}>
          <PercentageField
            value={value}
            onChange={onChange}
            fullWidth={true}
            variant="combined"
          />
        </div>
      )}
      <div className="border-l border-border pr-3">
        <CurrencyTypeSelect
          value={type}
          onChange={onTypeChange}
          variant="combined"
        />
      </div>
    </div>
  );
}
