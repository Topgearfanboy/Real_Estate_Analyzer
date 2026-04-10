import type { SellBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { CurrencyOrPercentageField } from "../uiComponents/fieldTypes/CurrencyOrPercentageField";
import { handleClosingCostsTypeChange } from "./helpers";

interface SellBlockProps {
  data: SellBlockData;
  onChange: (data: SellBlockData) => void;
}

export function SellBlock({ data, onChange }: SellBlockProps) {
  const updateField = <K extends keyof SellBlockData>(
    field: K,
    value: SellBlockData[K],
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Sell Price"
          value={data.sellPrice}
          onChange={(value) => updateField("sellPrice", value)}
        />

        {/* Time to Sell - Months */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Time to Sell (Months)
          </label>
          <select
            value={data.timeToSellMonths}
            onChange={(e) => updateField("timeToSellMonths", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg"
          >
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i} value={i.toString()}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {/* Closing Costs */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Closing Costs
          </label>
          <CurrencyOrPercentageField
            value={data.closingCosts}
            type={data.closingCostsType}
            onChange={(value) => updateField("closingCosts", value)}
            onTypeChange={(type) =>
              handleClosingCostsTypeChange(data, onChange, type)
            }
          />
        </div>
      </div>
    </div>
  );
}
