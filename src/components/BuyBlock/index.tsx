import { useState } from "react";
import type { BuyBlockData } from "../../types";
import { TextField } from "../uiComponents/fieldTypes/TextField";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { PercentageField } from "../uiComponents/fieldTypes/PercentageField";
import { CurrencyOrPercentageField } from "../uiComponents/fieldTypes/CurrencyOrPercentageField";
import { ButtonGroup } from "../uiComponents/ButtonGroup";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import { SegmentedProgressBar } from "../uiComponents/SegmentedProgressBar";
import {
  handleDownpaymentTypeChange,
  handleClosingCostsTypeChange,
  handlePropertyTaxesTypeChange,
  handleHomeownersInsuranceTypeChange,
} from "./helpers";

interface BuyBlockProps {
  data: BuyBlockData;
  onChange: (data: BuyBlockData) => void;
}

export function BuyBlock({ data, onChange }: BuyBlockProps) {
  const [projectPlanningExpanded, setProjectPlanningExpanded] = useState(false);
  const [purchaseSummaryExpanded, setPurchaseSummaryExpanded] = useState(false);

  const updateField = <K extends keyof BuyBlockData>(
    field: K,
    value: BuyBlockData[K],
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateLoanAnalysis = <K extends keyof BuyBlockData["loanAnalysis"]>(
    field: K,
    value: BuyBlockData["loanAnalysis"][K],
  ) => {
    onChange({
      ...data,
      loanAnalysis: { ...data.loanAnalysis, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Cost"
          value={data.cost}
          onChange={(value) => updateField("cost", value)}
        />
        <PercentageField
          label="Interest Rate"
          value={data.interestRate}
          onChange={(value) => updateField("interestRate", value)}
        />
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Downpayment
          </label>
          <CurrencyOrPercentageField
            value={data.downpayment}
            type={data.downpaymentType}
            onChange={(value) => updateField("downpayment", value)}
            onTypeChange={(type) =>
              handleDownpaymentTypeChange(data, onChange, type)
            }
          />
        </div>

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

      <ButtonGroup
        label="Loan Term"
        value={data.loanTerm}
        onChange={(value) => {
          onChange({
            ...data,
            loanTerm: value,
            customLoanTerm: value === "custom" ? data.customLoanTerm : value,
          });
        }}
        options={[
          { value: "10", label: "10" },
          { value: "15", label: "15" },
          { value: "30", label: "30" },
          { value: "custom", label: "Custom" },
        ]}
      />

      {data.loanTerm === "custom" && (
        <TextField
          label="Years"
          value={data.customLoanTerm}
          onChange={(value) => updateField("customLoanTerm", value)}
          placeholder="e.g., 20"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="max-w-[200px] w-full">
          <label className="block text-sm font-medium text-text-muted mb-1">
            Property Taxes
          </label>
          <CurrencyOrPercentageField
            value={data.propertyTaxes}
            type={data.propertyTaxesType}
            onChange={(value) => updateField("propertyTaxes", value)}
            onTypeChange={(type) =>
              handlePropertyTaxesTypeChange(data, onChange, type)
            }
          />
        </div>

        <CurrencyField
          label="HOA (Annual)"
          value={data.annualHoa}
          onChange={(value) => updateField("annualHoa", value)}
        />

        <div className="max-w-[200px] w-full">
          <label className="block text-sm font-medium text-text-muted mb-1">
            Insurance (Annual)
          </label>
          <CurrencyOrPercentageField
            value={data.homeownersInsurance}
            type={data.homeownersInsuranceType}
            onChange={(value) => updateField("homeownersInsurance", value)}
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
          onChange={(e) => updateField("interestOnlyOption", e.target.checked)}
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
        />
        <label htmlFor="interestOnly" className="text-sm font-medium">
          Interest Only Option
        </label>
      </div>

      {/* Purchase Summary with always-visible Monthly Payment */}
      {(() => {
        const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;

        // Calculate downpayment in dollars based on type
        const downpaymentRaw =
          parseFloat(data.downpayment.replace(/[^0-9.]/g, "")) || 0;
        const downpaymentNum =
          data.downpaymentType === "%"
            ? (downpaymentRaw / 100) * costNum
            : downpaymentRaw;

        // Calculate closing costs in dollars based on type
        const closingRaw =
          parseFloat(data.closingCosts.replace(/[^0-9.]/g, "")) || 0;
        const closingNum =
          data.closingCostsType === "%"
            ? (closingRaw / 100) * costNum
            : closingRaw;

        const loanAmount = costNum - downpaymentNum;
        const totalCashNeeded = downpaymentNum + closingNum;

        // Calculate monthly payment using mortgage formula
        const rateNum = parseFloat(data.interestRate) || 0;
        const termYears = parseInt(data.loanTerm) || 30;
        const monthlyRate = rateNum / 100 / 12;
        const numPayments = termYears * 12;
        let monthlyPayment = 0;
        if (loanAmount > 0 && rateNum > 0) {
          if (data.interestOnlyOption) {
            monthlyPayment = loanAmount * monthlyRate;
          } else {
            monthlyPayment =
              (loanAmount *
                monthlyRate *
                Math.pow(1 + monthlyRate, numPayments)) /
              (Math.pow(1 + monthlyRate, numPayments) - 1);
          }
        } else if (loanAmount > 0) {
          monthlyPayment = loanAmount / numPayments;
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

        // Calculate monthly HOA
        const annualHoaNum =
          parseFloat(data.annualHoa.replace(/[^0-9.]/g, "")) || 0;
        const monthlyHoa = annualHoaNum / 12;

        const totalMonthlyPayment =
          monthlyPayment + monthlyPropertyTaxes + monthlyInsurance + monthlyHoa;

        return (
          <div className="bg-bg rounded-lg p-4 space-y-3">
            <button
              type="button"
              onClick={() =>
                setPurchaseSummaryExpanded(!purchaseSummaryExpanded)
              }
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold text-text">Purchase Summary</h4>
              <svg
                className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                  purchaseSummaryExpanded ? "rotate-180" : ""
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
                  {
                    value: monthlyHoa,
                    color: "bg-purple-500",
                    label: "HOA",
                  },
                ]}
                total={totalMonthlyPayment}
              />
            </div>

            {/* Collapsible Details */}
            {purchaseSummaryExpanded && (
              <div className="space-y-2">
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
                  label="Down Payment"
                  value={
                    downpaymentNum > 0
                      ? `$${downpaymentNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Closing Costs"
                  value={
                    closingNum > 0
                      ? `$${closingNum.toLocaleString("en-US", {
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
        title="Project Planning"
        expanded={projectPlanningExpanded}
        onToggle={() => setProjectPlanningExpanded(!projectPlanningExpanded)}
      >
        <div className="grid grid-cols-2 gap-3">
          <CurrencyField
            label="Income Needed"
            value={data.loanAnalysis.incomeNeeded}
            onChange={(value) => updateLoanAnalysis("incomeNeeded", value)}
            size="sm"
          />
          <CurrencyField
            label="Max Loan Based on ARV"
            value={data.loanAnalysis.maxLoanBasedOnArv}
            onChange={(value) => updateLoanAnalysis("maxLoanBasedOnArv", value)}
            size="sm"
          />
          <CurrencyField
            label="Initial Cash"
            value={data.loanAnalysis.initialCash}
            onChange={(value) => updateLoanAnalysis("initialCash", value)}
            size="sm"
          />
          <CurrencyField
            label="Saved For Renovation"
            value={data.loanAnalysis.savedForRenovation}
            onChange={(value) =>
              updateLoanAnalysis("savedForRenovation", value)
            }
            size="sm"
          />
          <div className="col-span-2">
            <CurrencyField
              label="Minimum Cash For Project"
              value={data.loanAnalysis.minimumCashForProject}
              onChange={(value) =>
                updateLoanAnalysis("minimumCashForProject", value)
              }
              size="sm"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
