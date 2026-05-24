import { Block, BuyBlockData } from "@/types";

export interface ProcessedBuyBlockData {
  loanAmount: number;
  monthlyRate: number;
  loanTermYears: number;
  cost: number;
  downpayment: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  annualHoa: number;
}

// Helper function to extract and process BuyBlock data
export function processBuyBlockData(
  blocks: Block[],
): ProcessedBuyBlockData | null {
  const buyBlock = blocks.find((block) => block.type === "buy");

  if (!buyBlock || !("cost" in buyBlock.data)) {
    return null;
  }

  const buyData = buyBlock.data as BuyBlockData;

  // Parse cost
  const cost = parseFloat(buyData.cost.replace(/[^0-9.]/g, "")) || 0;

  // Parse downpayment
  const downpaymentRaw =
    parseFloat(buyData.downpayment.replace(/[^0-9.]/g, "")) || 0;
  const downpayment =
    buyData.downpaymentType === "%"
      ? (downpaymentRaw / 100) * cost
      : downpaymentRaw;

  // Calculate loan amount
  const loanAmount = cost - downpayment;

  // Parse interest rate and loan term
  const annualRate = parseFloat(buyData.interestRate) || 0;
  let loanTermYears: number;
  if (buyData.loanTerm === "custom") {
    loanTermYears = parseInt(buyData.customLoanTerm) || 30;
  } else {
    loanTermYears = parseInt(buyData.loanTerm) || 30;
  }

  // Parse ongoing expenses
  const propertyTaxesRaw =
    parseFloat(buyData.propertyTaxes?.replace(/[^0-9.]/g, "") || "0") || 0;
  const propertyTaxes =
    buyData.propertyTaxesType === "%"
      ? (propertyTaxesRaw / 100) * cost
      : propertyTaxesRaw;

  const homeownersInsuranceRaw =
    parseFloat(buyData.homeownersInsurance?.replace(/[^0-9.]/g, "") || "0") ||
    0;
  const homeownersInsurance =
    buyData.homeownersInsuranceType === "%"
      ? (homeownersInsuranceRaw / 100) * cost
      : homeownersInsuranceRaw;

  const annualHoaRaw =
    parseFloat(buyData.annualHoa?.replace(/[^0-9.]/g, "") || "0") || 0;
  const annualHoa = annualHoaRaw; // HOA is typically already annual

  return {
    loanAmount,
    monthlyRate: annualRate,
    loanTermYears,
    cost,
    downpayment,
    propertyTaxes,
    homeownersInsurance,
    annualHoa,
  };
}
