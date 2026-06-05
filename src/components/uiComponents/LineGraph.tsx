"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

interface LineGraphProps {
  data: GraphDataPoint[];
  selectedYears?: number;
  onYearsChange?: (years: number) => void;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  data,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  data?: GraphDataPoint[];
}) => {
  if (active && payload && payload.length && label && data) {
    // Calculate years and months since beginning (use first data point as start)
    const startDate = new Date(data[0].date + "-01");
    const currentDate = new Date(label + "-01");
    const monthsDiff =
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth());
    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;

    const timeSinceStart =
      years > 0
        ? `${years} year${years !== 1 ? "s" : ""}${months > 0 ? `, ${months} month${months !== 1 ? "s" : ""}` : ""}`
        : `${months} month${months !== 1 ? "s" : ""}`;

    // Find monthlyNet from data
    const dataPoint = data.find((d) => d.date === label);
    const monthlyNet = dataPoint?.monthlyNet || 0;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">
          {label} ({timeSinceStart})
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Monthly Net: ${Number(monthlyNet).toLocaleString()}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LineGraph({
  data,
  selectedYears = 30,
  onYearsChange,
}: LineGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-border p-4 mt-6 flex items-center justify-center">
        <p className="text-text-muted">No data available</p>
      </div>
    );
  }

  const yearOptions = [1, 5, 10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-border p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Financial Analysis</h3>
        {onYearsChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="years-select" className="text-sm text-text-muted">
              Years:
            </label>
            <select
              id="years-select"
              value={selectedYears}
              onChange={(e) => onYearsChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year} year{year !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip data={data} />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="investedCapital"
            name="Invested Capital"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cashOnHand"
            name="Cash on Hand"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="remainingLoanBalance"
            name="Remaining Loan Balance"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
