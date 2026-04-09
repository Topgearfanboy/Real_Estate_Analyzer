import type { RefinanceBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { PercentageField } from "../uiComponents/fieldTypes/PercentageField";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import {
  updateField,
  calculateLoanAmount,
  parseCurrencyValue,
  formatCurrencyDisplay,
  formatPercentageDisplay,
} from "./helpers";

interface RefinanceBlockProps {
  data: RefinanceBlockData;
  onChange: (data: RefinanceBlockData) => void;
}

export function RefinanceBlock({ data, onChange }: RefinanceBlockProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Refinance Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cashOut"
              checked={!data.cashOut}
              onChange={() => updateField(data, onChange, "cashOut", false)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <span className="text-sm">Non Cash-out</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cashOut"
              checked={data.cashOut}
              onChange={() => updateField(data, onChange, "cashOut", true)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <span className="text-sm">Cash Out</span>
          </label>
        </div>
      </div>

      <CurrencyField
        label="Estimated Value"
        value={data.estimatedValue}
        onChange={(value) =>
          updateField(data, onChange, "estimatedValue", value)
        }
      />

      <div className="bg-bg rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-text">Remaining Equity</h4>
        <div className="grid grid-cols-2 gap-3">
          <CurrencyField
            label="Amount ($)"
            value={data.remainingEquityAmount}
            onChange={(value) =>
              updateField(data, onChange, "remainingEquityAmount", value)
            }
            size="sm"
          />
          <PercentageField
            label="Percentage (%)"
            value={data.remainingEquityPercent}
            onChange={(value) =>
              updateField(data, onChange, "remainingEquityPercent", value)
            }
            size="sm"
          />
        </div>
      </div>

      <div className="bg-bg rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-text">Refinance Summary</h4>
        <div className="space-y-2">
          {(() => {
            const valueNum = parseCurrencyValue(data.estimatedValue);
            const equityAmountNum = parseCurrencyValue(
              data.remainingEquityAmount,
            );
            const loanAmount = calculateLoanAmount(
              data.estimatedValue,
              data.remainingEquityAmount,
            );

            return (
              <>
                <AnalysisItem
                  label="Estimated Property Value"
                  value={formatCurrencyDisplay(valueNum)}
                />
                <AnalysisItem
                  label="New Loan Amount"
                  value={formatCurrencyDisplay(loanAmount)}
                />
                <AnalysisItem
                  label="Remaining Equity"
                  value={formatCurrencyDisplay(equityAmountNum)}
                />
                <AnalysisItem
                  label="Equity Percentage"
                  value={formatPercentageDisplay(data.remainingEquityPercent)}
                />
                <AnalysisItem
                  label="Refinance Type"
                  value={data.cashOut ? "Cash Out" : "Rate & Term"}
                  highlight
                />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
