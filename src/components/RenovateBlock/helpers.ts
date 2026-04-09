import type { RenovateBlockData, RenovationItem } from "../../types";

export const addItem = (
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void
) => {
  onChange({
    ...data,
    items: [...data.items, { item: "", cost: "" }],
  });
};

export const removeItem = (
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void,
  index: number
) => {
  const newItems = data.items.filter((_, i) => i !== index);
  onChange({ ...data, items: newItems });
};

export const updateItem = (
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void,
  index: number,
  field: keyof RenovationItem,
  value: string
) => {
  const newItems = data.items.map((item, i) =>
    i === index ? { ...item, [field]: value } : item
  );
  onChange({ ...data, items: newItems });
};

export const updateMonthlyCost = <
  K extends keyof RenovateBlockData["monthlyCostToOwn"],
>(
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void,
  field: K,
  value: RenovateBlockData["monthlyCostToOwn"][K]
) => {
  onChange({
    ...data,
    monthlyCostToOwn: { ...data.monthlyCostToOwn, [field]: value },
  });
};

export const updateUtilities = <
  K extends keyof RenovateBlockData["monthlyCostToOwn"]["utilities"],
>(
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void,
  field: K,
  value: RenovateBlockData["monthlyCostToOwn"]["utilities"][K]
) => {
  onChange({
    ...data,
    monthlyCostToOwn: {
      ...data.monthlyCostToOwn,
      utilities: { ...data.monthlyCostToOwn.utilities, [field]: value },
    },
  });
};

export const updateTimeToRenovate = (
  data: RenovateBlockData,
  onChange: (data: RenovateBlockData) => void,
  field: "days" | "months" | "years",
  value: string
) => {
  onChange({
    ...data,
    timeToRenovate: { ...data.timeToRenovate, [field]: value },
  });
};

// Calculation helpers for analysis
export const calculateTotalCost = (items: RenovationItem[]): number => {
  return items.reduce((sum, item) => {
    return sum + (parseFloat(item.cost.replace(/[^0-9.]/g, "")) || 0);
  }, 0);
};

export const calculateTotalDays = (timeToRenovate: {
  days: string;
  months: string;
  years: string;
}): number => {
  const days = parseInt(timeToRenovate.days) || 0;
  const months = parseInt(timeToRenovate.months) || 0;
  const years = parseInt(timeToRenovate.years) || 0;
  return days + months * 30 + years * 365;
};

export const calculateAverageCostPerItem = (
  totalCost: number,
  itemCount: number
): string => {
  if (itemCount > 0 && totalCost > 0) {
    return `$${Math.round(totalCost / itemCount).toLocaleString()}`;
  }
  return "-";
};
