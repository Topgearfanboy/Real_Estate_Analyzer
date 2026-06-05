import { useState } from "react";
import type { RenovateBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import {
  addItem,
  removeItem,
  updateItem,
  updateUtilities,
  updateTimeToRenovate,
  updateMonthlyCost,
  updateArv,
  calculateTotalCost,
  calculateTotalDays,
  calculateTotalRenovationCost,
} from "./helpers";

interface RenovateBlockProps {
  data: RenovateBlockData;
  onChange: (data: RenovateBlockData) => void;
  monthlyPayment?: number;
  loanOverlapMonths?: number;
}

export function RenovateBlock({
  data,
  onChange,
  monthlyPayment,
  loanOverlapMonths,
}: RenovateBlockProps) {
  const [monthlyCostExpanded, setMonthlyCostExpanded] = useState(false);
  const [renovationSummaryExpanded, setRenovationSummaryExpanded] =
    useState(false);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text-muted">
            Renovation Items
          </label>
          <button
            onClick={() => addItem(data, onChange)}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item.item}
                onChange={(e) =>
                  updateItem(data, onChange, index, "item", e.target.value)
                }
                placeholder="Item name"
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                inputMode="numeric"
                value={item.cost}
                onChange={(e) =>
                  updateItem(
                    data,
                    onChange,
                    index,
                    "cost",
                    e.target.value.replace(/[^0-9.]/g, ""),
                  )
                }
                placeholder="$0"
                className="w-20 px-2 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={() => removeItem(data, onChange, index)}
                className="px-3 py-2 text-danger hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
          {data.items.length === 0 && (
            <p className="text-sm text-text-muted italic">No items added yet</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Time To Renovate
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Days</label>
            <select
              value={data.timeToRenovate.days}
              onChange={(e) =>
                updateTimeToRenovate(data, onChange, "days", e.target.value)
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">0</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Months</label>
            <select
              value={data.timeToRenovate.months}
              onChange={(e) =>
                updateTimeToRenovate(data, onChange, "months", e.target.value)
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">0</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Years</label>
            <select
              value={data.timeToRenovate.years}
              onChange={(e) =>
                updateTimeToRenovate(data, onChange, "years", e.target.value)
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">0</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          After Repair Value (ARV)
        </label>
        <CurrencyField
          value={data.arv}
          onChange={(value) => updateArv(data, onChange, value)}
          placeholder="$0"
        />
      </div>

      <CollapsibleSection
        title="Monthly Cost To Own"
        expanded={monthlyCostExpanded}
        onToggle={() => setMonthlyCostExpanded(!monthlyCostExpanded)}
      >
        <div className="bg-white rounded-lg p-3 space-y-3">
          <h5 className="text-sm font-medium text-text-muted">Utilities</h5>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyField
              label="County"
              value={data.monthlyCostToOwn.utilities.county}
              onChange={(value) =>
                updateUtilities(data, onChange, "county", value)
              }
              size="sm"
            />
            <CurrencyField
              label="Electricity"
              value={data.monthlyCostToOwn.utilities.electricity}
              onChange={(value) =>
                updateUtilities(data, onChange, "electricity", value)
              }
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="deferInterestPayments"
            checked={data.monthlyCostToOwn.deferInterestPayments}
            onChange={(e) =>
              updateMonthlyCost(
                data,
                onChange,
                "deferInterestPayments",
                e.target.checked,
              )
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <label htmlFor="deferInterestPayments" className="text-sm text-text">
            Defer Interest Payments
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Renovation Summary"
        expanded={renovationSummaryExpanded}
        onToggle={() =>
          setRenovationSummaryExpanded(!renovationSummaryExpanded)
        }
      >
        <div className="space-y-2">
          {(() => {
            const totalCost = calculateTotalCost(data.items);
            const totalRenovationCost = calculateTotalRenovationCost(
              data.items,
              data.monthlyCostToOwn.utilities,
              data.timeToRenovate,
              monthlyPayment,
              loanOverlapMonths,
            );
            const totalDays = calculateTotalDays(data.timeToRenovate);

            return (
              <>
                <AnalysisItem
                  label="Renovation Items Cost"
                  value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : "-"}
                />
                <AnalysisItem
                  label="Utilities During Renovation"
                  value={
                    totalRenovationCost > totalCost
                      ? `$${(totalRenovationCost - totalCost).toLocaleString()}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Total Renovation Cost"
                  value={
                    totalRenovationCost > 0
                      ? `$${totalRenovationCost.toLocaleString()}`
                      : "-"
                  }
                  highlight
                />
                <AnalysisItem
                  label="Estimated Timeline"
                  value={
                    totalDays > 0 ? `${Math.round(totalDays / 30)} months` : "-"
                  }
                />
              </>
            );
          })()}
        </div>
      </CollapsibleSection>
    </div>
  );
}
