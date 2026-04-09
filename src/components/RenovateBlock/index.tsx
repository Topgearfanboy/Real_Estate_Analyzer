import type { RenovateBlockData } from "../../types";
import { TextField } from "../uiComponents/fieldTypes/TextField";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import {
  addItem,
  removeItem,
  updateItem,
  updateUtilities,
  updateTimeToRenovate,
  updateMonthlyCost,
  calculateTotalCost,
  calculateTotalDays,
  calculateAverageCostPerItem,
} from "./helpers";

interface RenovateBlockProps {
  data: RenovateBlockData;
  onChange: (data: RenovateBlockData) => void;
}

export function RenovateBlock({ data, onChange }: RenovateBlockProps) {
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
              <CurrencyField
                value={item.cost}
                onChange={(value) =>
                  updateItem(data, onChange, index, "cost", value)
                }
                fullWidth={false}
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

      <div className="bg-bg rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-text">Monthly Cost To Own</h4>

        <div className="bg-white rounded-lg p-3 space-y-3">
          <h5 className="text-sm font-medium text-text-muted">Utilities</h5>
          <div className="grid grid-cols-3 gap-3">
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
            <CurrencyField
              label="Networking?"
              value={data.monthlyCostToOwn.utilities.networking}
              onChange={(value) =>
                updateUtilities(data, onChange, "networking", value)
              }
              size="sm"
            />
          </div>
        </div>

        <TextField
          label="Deferred Interest/Principal Option"
          value={data.monthlyCostToOwn.deferredInterestPrincipalOption}
          onChange={(value) =>
            updateMonthlyCost(
              data,
              onChange,
              "deferredInterestPrincipalOption",
              value,
            )
          }
          placeholder="e.g., Deferred 6 months"
        />
      </div>

      <div className="bg-bg rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-text">Renovation Summary</h4>
        <div className="space-y-2">
          {(() => {
            const totalCost = calculateTotalCost(data.items);
            const itemCount = data.items.length;
            const totalDays = calculateTotalDays(data.timeToRenovate);

            return (
              <>
                <AnalysisItem
                  label="Total Renovation Items"
                  value={itemCount.toString()}
                />
                <AnalysisItem
                  label="Total Renovation Cost"
                  value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : "-"}
                />
                <AnalysisItem
                  label="Estimated Timeline"
                  value={
                    totalDays > 0 ? `${Math.round(totalDays / 30)} months` : "-"
                  }
                />
                <AnalysisItem
                  label="Avg Cost Per Item"
                  value={calculateAverageCostPerItem(totalCost, itemCount)}
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
