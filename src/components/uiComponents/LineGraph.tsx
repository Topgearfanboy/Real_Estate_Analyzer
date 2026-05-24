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
}

interface LineGraphProps {
  data: GraphDataPoint[];
  selectedYears?: number;
  onYearsChange?: (years: number) => void;
}

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

  const yearOptions = [1, 5, 10, 15, 20, 25, 30];

  return (
    <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-border p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Cost Analysis</h3>
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
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value, name) => [
              `$${Number(value).toLocaleString()}`,
              name,
            ]}
          />
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
