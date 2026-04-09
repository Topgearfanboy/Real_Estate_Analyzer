import type { RefinanceBlockData } from "../../types";

export const updateField = <K extends keyof RefinanceBlockData>(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  field: K,
  value: RefinanceBlockData[K]
) => {
  onChange({ ...data, [field]: value });
};

// Calculation helpers for analysis
export const parseCurrencyValue = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
};

export const calculateLoanAmount = (
  estimatedValue: string,
  remainingEquityAmount: string
): number => {
  const valueNum = parseCurrencyValue(estimatedValue);
  const equityAmountNum = parseCurrencyValue(remainingEquityAmount);
  return valueNum - equityAmountNum;
};

export const formatCurrencyDisplay = (value: number): string => {
  return value > 0 ? `$${value.toLocaleString()}` : "-";
};

export const formatPercentageDisplay = (value: string): string => {
  const percentNum = parseFloat(value) || 0;
  return percentNum > 0 ? `${percentNum.toFixed(2)}%` : "-";
};
