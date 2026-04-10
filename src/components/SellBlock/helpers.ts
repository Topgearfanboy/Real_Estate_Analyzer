import type { SellBlockData } from "../../types";

export function handleClosingCostsTypeChange(
  data: SellBlockData,
  onChange: (data: SellBlockData) => void,
  newType: "$" | "%",
) {
  const sellPriceNum = parseFloat(data.sellPrice.replace(/[^0-9.]/g, "")) || 0;
  const closingCostsNum = parseFloat(data.closingCosts) || 0;

  let convertedClosingCosts: string;

  if (data.closingCostsType === "%" && newType === "$") {
    // Converting from % to $: closingCosts % of sell price
    convertedClosingCosts =
      sellPriceNum > 0
        ? Math.round((closingCostsNum / 100) * sellPriceNum).toString()
        : data.closingCosts;
  } else if (data.closingCostsType === "$" && newType === "%") {
    // Converting from $ to %: (closingCosts / sell price) * 100
    convertedClosingCosts =
      sellPriceNum > 0
        ? ((closingCostsNum / sellPriceNum) * 100).toFixed(2)
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
