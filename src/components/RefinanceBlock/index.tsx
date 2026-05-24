import { useState } from "react";
import type { RefinanceBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { PercentageField } from "../uiComponents/fieldTypes/PercentageField";
import { CurrencyOrPercentageField } from "../uiComponents/fieldTypes/CurrencyOrPercentageField";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import { SegmentedProgressBar } from "../uiComponents/SegmentedProgressBar";
import { ButtonGroup } from "../uiComponents/ButtonGroup";
import {
  updateField,
  handleCostTypeChange,
  handleClosingCostsTypeChange,
  handlePropertyTaxesTypeChange,
  handleHomeownersInsuranceTypeChange,
} from "./helpers";

interface RefinanceBlockProps {
  data: RefinanceBlockData;
  onChange: (data: RefinanceBlockData) => void;
}

export function RefinanceBlock({ data, onChange }: RefinanceBlockProps) {
  const [remainingEquityExpanded, setRemainingEquityExpanded] = useState(false);
  const [refinanceSummaryExpanded, setRefinanceSummaryExpanded] =
    useState(false);

  // Use data.cost directly for display
  const displayPercentage = data.cost;

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

      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Estimated Value"
          value={data.estimatedValue}
          onChange={(value) =>
            updateField(data, onChange, "estimatedValue", value)
          }
          data-testid="refinance-estimated-value"
        />

        <PercentageField
          label="Interest Rate"
          value={data.interestRate}
          onChange={(value) =>
            updateField(data, onChange, "interestRate", value)
          }
          data-testid="refinance-interest-rate"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Financed Amount
          </label>
          <CurrencyOrPercentageField
            key={displayPercentage}
            value={displayPercentage}
            type={data.costType}
            onChange={(value) => updateField(data, onChange, "cost", value)}
            onTypeChange={(type) => handleCostTypeChange(data, onChange, type)}
            disabled={!data.cashOut}
            data-testid="refinance-financed-amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Closing Costs
          </label>
          <CurrencyOrPercentageField
            value={data.closingCosts}
            type={data.closingCostsType}
            onChange={(value) =>
              updateField(data, onChange, "closingCosts", value)
            }
            onTypeChange={(type) =>
              handleClosingCostsTypeChange(data, onChange, type)
            }
          />
        </div>
      </div>

      <ButtonGroup
        label="Loan Term"
        options={[
          { value: "30", label: "30" },
          { value: "20", label: "20" },
          { value: "15", label: "15" },
          { value: "10", label: "10" },
          { value: "custom", label: "Custom" },
        ]}
        value={data.loanTerm}
        onChange={(value) => updateField(data, onChange, "loanTerm", value)}
      />
      {data.loanTerm === "custom" && (
        <input
          type="text"
          inputMode="numeric"
          value={data.customLoanTerm}
          onChange={(e) =>
            updateField(
              data,
              onChange,
              "customLoanTerm",
              e.target.value.replace(/[^0-9]/g, ""),
            )
          }
          placeholder="Enter years"
          className="mt-2 w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Property Taxes (Annual)
          </label>
          <CurrencyOrPercentageField
            value={data.propertyTaxes}
            type={data.propertyTaxesType}
            onChange={(value) =>
              updateField(data, onChange, "propertyTaxes", value)
            }
            onTypeChange={(type) =>
              handlePropertyTaxesTypeChange(data, onChange, type)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Insurance (Annual)
          </label>
          <CurrencyOrPercentageField
            value={data.homeownersInsurance}
            type={data.homeownersInsuranceType}
            onChange={(value) =>
              updateField(data, onChange, "homeownersInsurance", value)
            }
            onTypeChange={(type) =>
              handleHomeownersInsuranceTypeChange(data, onChange, type)
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="interestOnly"
          checked={data.interestOnlyOption}
          onChange={(e) =>
            updateField(data, onChange, "interestOnlyOption", e.target.checked)
          }
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
        />
        <label htmlFor="interestOnly" className="text-sm text-text">
          Interest Only Loan
        </label>
      </div>

      {/* Refinance Summary - with always-visible monthly payment */}
      {(() => {
        // Parse values
        const estimatedValueNum =
          parseFloat(data.estimatedValue.replace(/[^0-9.]/g, "")) || 0;
        const costNum =
          parseFloat(displayPercentage.replace(/[^0-9.]/g, "")) || 0;
        const loanAmount =
          data.costType === "%" ? (costNum / 100) * estimatedValueNum : costNum;
        const closingCostsNum =
          data.closingCostsType === "%"
            ? (parseFloat(data.closingCosts) / 100) * loanAmount
            : parseFloat(data.closingCosts) || 0;
        const totalCashNeeded = closingCostsNum;

        // Calculate monthly payment using the same formula as BuyBlock
        const interestRateNum = parseFloat(data.interestRate) || 0;
        const monthlyRate = interestRateNum / 100 / 12;
        const loanTermMonths =
          parseInt(
            data.loanTerm === "custom" ? data.customLoanTerm : data.loanTerm,
          ) || 30;
        const numberOfPayments = loanTermMonths * 12;

        let monthlyPayment = 0;
        if (data.interestOnlyOption) {
          monthlyPayment = loanAmount * monthlyRate;
        } else if (monthlyRate === 0) {
          monthlyPayment = loanAmount / numberOfPayments;
        } else {
          monthlyPayment =
            (loanAmount *
              (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }

        // Calculate monthly property taxes
        const propertyTaxesNum = parseFloat(data.propertyTaxes) || 0;
        const monthlyPropertyTaxes =
          data.propertyTaxesType === "%"
            ? ((propertyTaxesNum / 100) * costNum) / 12
            : propertyTaxesNum / 12;

        // Calculate monthly homeowners insurance
        const insuranceNum = parseFloat(data.homeownersInsurance) || 0;
        const monthlyInsurance =
          data.homeownersInsuranceType === "%"
            ? ((insuranceNum / 100) * costNum) / 12
            : insuranceNum / 12;

        const totalMonthlyPayment =
          monthlyPayment + monthlyPropertyTaxes + monthlyInsurance;

        return (
          <div className="bg-bg rounded-lg p-4 space-y-3">
            <button
              type="button"
              onClick={() =>
                setRefinanceSummaryExpanded(!refinanceSummaryExpanded)
              }
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold text-text">Refinance Summary</h4>
              <svg
                className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                  refinanceSummaryExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Monthly Payment - Always Visible */}
            <div>
              <AnalysisItem
                label="Monthly Payment"
                value={
                  totalMonthlyPayment > 0
                    ? `$${totalMonthlyPayment.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}`
                    : "-"
                }
                highlight
                noBorder
              />
              <SegmentedProgressBar
                segments={[
                  {
                    value: monthlyPayment,
                    color: "bg-blue-500",
                    label: "Loan",
                  },
                  {
                    value: monthlyPropertyTaxes,
                    color: "bg-emerald-500",
                    label: "Tax",
                  },
                  {
                    value: monthlyInsurance,
                    color: "bg-amber-500",
                    label: "Insurance",
                  },
                ]}
                total={totalMonthlyPayment}
              />
            </div>

            {/* Collapsible Details */}
            {refinanceSummaryExpanded && (
              <div className="space-y-2 pt-2 border-t border-border">
                <AnalysisItem
                  label="Purchase Price"
                  value={
                    costNum > 0
                      ? `$${costNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Loan Amount"
                  value={
                    loanAmount > 0
                      ? `$${loanAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Closing Costs"
                  value={
                    closingCostsNum > 0
                      ? `$${closingCostsNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Total Cash Needed"
                  value={
                    totalCashNeeded > 0
                      ? `$${totalCashNeeded.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                  highlight
                />
              </div>
            )}
          </div>
        );
      })()}

      <CollapsibleSection
        title="Remaining Equity"
        expanded={remainingEquityExpanded}
        onToggle={() => setRemainingEquityExpanded(!remainingEquityExpanded)}
      >
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
      </CollapsibleSection>
    </div>
  );
}
