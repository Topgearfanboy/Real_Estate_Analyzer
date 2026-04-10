import type { RefinanceBlockData } from "../../types";

export const updateField = <K extends keyof RefinanceBlockData>(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  field: K,
  value: RefinanceBlockData[K],
) => {
  onChange({ ...data, [field]: value });
};

export function handleCostTypeChange(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) {
  const estimatedValueNum =
    parseFloat(data.estimatedValue.replace(/[^0-9.]/g, "")) || 0;
  const costNum = parseFloat(data.cost) || 0;

  let convertedCost: string;

  if (data.costType === "%" && newType === "$") {
    convertedCost =
      estimatedValueNum > 0
        ? Math.round((costNum / 100) * estimatedValueNum).toString()
        : data.cost;
  } else if (data.costType === "$" && newType === "%") {
    convertedCost =
      estimatedValueNum > 0
        ? ((costNum / estimatedValueNum) * 100).toFixed(2)
        : data.cost;
  } else {
    convertedCost = data.cost;
  }

  onChange({
    ...data,
    costType: newType,
    cost: convertedCost,
  });
}

export function handleClosingCostsTypeChange(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) {
  const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;
  const closingCostsNum = parseFloat(data.closingCosts) || 0;

  let convertedClosingCosts: string;

  if (data.closingCostsType === "%" && newType === "$") {
    convertedClosingCosts =
      costNum > 0
        ? Math.round((closingCostsNum / 100) * costNum).toString()
        : data.closingCosts;
  } else if (data.closingCostsType === "$" && newType === "%") {
    convertedClosingCosts =
      costNum > 0
        ? ((closingCostsNum / costNum) * 100).toFixed(2)
        : data.closingCosts;
  } else {
    convertedClosingCosts = data.closingCosts;
  }

  onChange({
    ...data,
    closingCostsType: newType,
    closingCosts: convertedClosingCosts,
  });
}

export function handlePropertyTaxesTypeChange(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) {
  const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;
  const propertyTaxesNum = parseFloat(data.propertyTaxes) || 0;

  let convertedPropertyTaxes: string;

  if (data.propertyTaxesType === "%" && newType === "$") {
    convertedPropertyTaxes =
      costNum > 0
        ? Math.round((propertyTaxesNum / 100) * costNum).toString()
        : data.propertyTaxes;
  } else if (data.propertyTaxesType === "$" && newType === "%") {
    convertedPropertyTaxes =
      costNum > 0
        ? ((propertyTaxesNum / costNum) * 100).toFixed(2)
        : data.propertyTaxes;
  } else {
    convertedPropertyTaxes = data.propertyTaxes;
  }

  onChange({
    ...data,
    propertyTaxesType: newType,
    propertyTaxes: convertedPropertyTaxes,
  });
}

export function handleHomeownersInsuranceTypeChange(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) {
  const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;
  const insuranceNum = parseFloat(data.homeownersInsurance) || 0;

  let convertedInsurance: string;

  if (data.homeownersInsuranceType === "%" && newType === "$") {
    convertedInsurance =
      costNum > 0
        ? Math.round((insuranceNum / 100) * costNum).toString()
        : data.homeownersInsurance;
  } else if (data.homeownersInsuranceType === "$" && newType === "%") {
    convertedInsurance =
      costNum > 0
        ? ((insuranceNum / costNum) * 100).toFixed(2)
        : data.homeownersInsurance;
  } else {
    convertedInsurance = data.homeownersInsurance;
  }

  onChange({
    ...data,
    homeownersInsuranceType: newType,
    homeownersInsurance: convertedInsurance,
  });
}

// Calculation helpers for analysis
export const parseCurrencyValue = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
};

export const calculateLoanAmount = (
  estimatedValue: string,
  remainingEquityAmount: string,
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
