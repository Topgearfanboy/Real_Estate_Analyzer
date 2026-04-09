import type { BuyBlockData } from "../../types";

export function handleDownpaymentTypeChange(
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) {
  const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;
  const downpaymentNum = parseFloat(data.downpayment) || 0;

  let convertedDownpayment: string;

  if (data.downpaymentType === "%" && newType === "$") {
    // Converting from % to $: downpayment % of cost
    convertedDownpayment =
      costNum > 0
        ? Math.round((downpaymentNum / 100) * costNum).toString()
        : data.downpayment;
  } else if (data.downpaymentType === "$" && newType === "%") {
    // Converting from $ to %: (downpayment / cost) * 100
    convertedDownpayment =
      costNum > 0
        ? ((downpaymentNum / costNum) * 100).toFixed(2)
        : data.downpayment;
  } else {
    convertedDownpayment = data.downpayment;
  }

  onChange({
    ...data,
    downpaymentType: newType,
    downpayment: convertedDownpayment,
  });
}

export function handleClosingCostsTypeChange(
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) {
  const costNum = parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;
  const closingCostsNum = parseFloat(data.closingCosts) || 0;

  let convertedClosingCosts: string;

  if (data.closingCostsType === "%" && newType === "$") {
    // Converting from % to $: closingCosts % of cost
    convertedClosingCosts =
      costNum > 0
        ? Math.round((closingCostsNum / 100) * costNum).toString()
        : data.closingCosts;
  } else if (data.closingCostsType === "$" && newType === "%") {
    // Converting from $ to %: (closingCosts / cost) * 100
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
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
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
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
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
