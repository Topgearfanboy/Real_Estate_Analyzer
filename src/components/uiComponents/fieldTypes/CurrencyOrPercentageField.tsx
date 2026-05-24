import { CurrencyField } from "./CurrencyField";
import { PercentageField } from "./PercentageField";
import { CurrencyTypeSelect } from "../CurrencyTypeSelect";

interface CurrencyOrPercentageFieldProps {
  value: string;
  type: "$" | "%";
  onChange: (value: string) => void;
  onTypeChange: (type: "$" | "%") => void;
  width?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export function CurrencyOrPercentageField({
  value,
  type,
  onChange,
  onTypeChange,
  width = "w-24",
  disabled = false,
  "data-testid": dataTestId,
}: CurrencyOrPercentageFieldProps) {
  if (disabled) {
    return (
      <div
        className="flex border border-border rounded-lg overflow-hidden bg-bg-muted justify-between pointer-events-none opacity-60"
        data-testid={dataTestId}
      >
        {type === "$" ? (
          <div className={width}>
            <CurrencyField
              value={value}
              onChange={() => {}}
              fullWidth={true}
              variant="combined"
              data-testid={dataTestId}
            />
          </div>
        ) : (
          <div className={width}>
            <PercentageField
              value={value}
              onChange={() => {}}
              fullWidth={true}
              variant="combined"
              data-testid={dataTestId}
            />
          </div>
        )}
        <div className="border-l border-border pr-3">
          <CurrencyTypeSelect
            value={type}
            onChange={() => {}}
            variant="combined"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary justify-between"
      data-testid={dataTestId}
    >
      {type === "$" ? (
        <div className={width}>
          <CurrencyField
            value={value}
            onChange={onChange}
            fullWidth={true}
            variant="combined"
            data-testid={dataTestId}
          />
        </div>
      ) : (
        <div className={width}>
          <PercentageField
            value={value}
            onChange={onChange}
            fullWidth={true}
            variant="combined"
            data-testid={dataTestId}
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
