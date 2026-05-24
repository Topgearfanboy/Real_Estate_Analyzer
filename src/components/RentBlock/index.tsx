import type { RentBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { CurrencyOrPercentageField } from "../uiComponents/fieldTypes/CurrencyOrPercentageField";
import {
  handleVacancyTypeChange,
  handleManagementTypeChange,
  handleMaintenanceTypeChange,
  handleAnnualRentIncreaseTypeChange,
} from "./helpers";

interface RentBlockProps {
  data: RentBlockData;
  onChange: (data: RentBlockData) => void;
}

export function RentBlock({ data, onChange }: RentBlockProps) {
  const updateField = <K extends keyof RentBlockData>(
    field: K,
    value: RentBlockData[K],
  ) => {
    const updatedData = { ...data, [field]: value };

    // Calculate durationMonths when time fields change
    if (field === "timeRentedMonths" || field === "timeRentedYears") {
      const months = parseInt(updatedData.timeRentedMonths) || 0;
      const years = parseInt(updatedData.timeRentedYears) || 0;
      updatedData.durationMonths = months + years * 12;
    }

    onChange(updatedData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Monthly Rent"
          value={data.monthlyRent}
          onChange={(value) => updateField("monthlyRent", value)}
        />

        {/* Time Rented - Months and Years */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Months
            </label>
            <select
              value={data.timeRentedMonths}
              onChange={(e) => updateField("timeRentedMonths", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i.toString()}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Years
            </label>
            <select
              value={data.timeRentedYears}
              onChange={(e) => updateField("timeRentedYears", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i} value={i.toString()}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vacancy */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Vacancy
          </label>
          <CurrencyOrPercentageField
            value={data.vacancy}
            type={data.vacancyType}
            onChange={(value) => updateField("vacancy", value)}
            onTypeChange={(type) =>
              handleVacancyTypeChange(data, onChange, type)
            }
          />
        </div>

        {/* Management */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Management
          </label>
          <CurrencyOrPercentageField
            value={data.management}
            type={data.managementType}
            onChange={(value) => updateField("management", value)}
            onTypeChange={(type) =>
              handleManagementTypeChange(data, onChange, type)
            }
          />
        </div>

        {/* Maintenance */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Maintenance
          </label>
          <CurrencyOrPercentageField
            value={data.maintenance}
            type={data.maintenanceType}
            onChange={(value) => updateField("maintenance", value)}
            onTypeChange={(type) =>
              handleMaintenanceTypeChange(data, onChange, type)
            }
          />
        </div>

        {/* Annual Rent Increase */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Annual Rent Increase
          </label>
          <CurrencyOrPercentageField
            value={data.annualRentIncrease || "0"}
            type={data.annualRentIncreaseType || "%"}
            onChange={(value) => updateField("annualRentIncrease", value)}
            onTypeChange={(type) =>
              handleAnnualRentIncreaseTypeChange(data, onChange, type)
            }
          />
        </div>
      </div>
    </div>
  );
}
