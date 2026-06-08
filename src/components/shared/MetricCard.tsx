"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number | null;
  format?: "percentage" | "currency" | "duration" | "text";
  tooltip?: {
    description: string;
    formula: string;
  };
}

const metricTooltips: Record<string, { description: string; formula: string }> =
  {
    ROI: {
      description:
        "Return on Investment - the total profit as a percentage of your initial investment.",
      formula: "(Total Profit / Initial Investment) × 100",
    },
    "Annualized ROI": {
      description:
        "ROI adjusted to an annual percentage rate, accounting for the time period held.",
      formula: "((1 + ROI/100)^(1/Years Held) - 1) × 100",
    },
    "Cash on Cash Return": {
      description:
        "Annual cash flow generated relative to the cash invested, based on the last 12 months of stabilized cash flow.",
      formula: "(Last 12 Months Avg Cash Flow × 12 / Initial Investment) × 100",
    },
    "Cap Rate": {
      description:
        "Capitalization Rate - the annual return on the property based on net operating income.",
      formula: "(NOI / Initial Property Value) × 100",
    },
    NOI: {
      description:
        "Net Operating Income - annual rental income minus operating expenses, excluding debt service. Calculated from the last 12 months.",
      formula: "Stabilized Annual Cash Flow + Annual Mortgage Payments",
    },
    "Net Present Value": {
      description:
        "The present value of all future cash flows discounted at 5% annual rate, plus final equity and cash on hand, minus initial investment.",
      formula:
        "Σ(Monthly Cash Flow / (1.05/12)^t) + Final Equity PV + Final Cash PV - Initial Investment",
    },
    "Time to Pay Off": {
      description:
        "The number of months until the loan is completely paid off.",
      formula: "Month when Remaining Loan Balance ≤ $0",
    },
    "Total Profit": {
      description:
        "The total profit from the investment including equity appreciation and all rental cash flow.",
      formula:
        "Final Equity + Sum of All Monthly Cash Flows - Initial Investment",
    },
  };

export function MetricCard({
  label,
  value,
  format = "text",
  tooltip,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipData = tooltip || metricTooltips[label];

  let displayValue: string | number = value ?? "--";

  if (value !== null && value !== undefined) {
    if (format === "percentage") {
      displayValue = `${Number(value).toFixed(2)}%`;
    } else if (format === "currency") {
      displayValue = `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else if (format === "duration") {
      const months = Number(value);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (years > 0 && remainingMonths > 0) {
        displayValue = `${years}y ${remainingMonths}m`;
      } else if (years > 0) {
        displayValue = `${years}y`;
      } else {
        displayValue = `${remainingMonths}m`;
      }
    }
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-1">
        <p className="text-xs text-text-muted uppercase tracking-wide">
          {label}
        </p>
        {tooltipData && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-text-muted hover:text-primary transition-colors shrink-0"
              aria-label={`Help for ${label}`}
            >
              <HelpCircle size={14} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 bottom-6 w-56 bg-white text-text text-xs rounded-lg p-3 shadow-lg z-50 border border-border">
                <p className="mb-2">{tooltipData.description}</p>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-text font-mono text-xs">
                    {tooltipData.formula}
                  </p>
                </div>
                <div className="absolute left-2 -bottom-1 w-2 h-2 bg-white border-r border-b border-border transform rotate-45"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-text">{displayValue}</p>
    </div>
  );
}
