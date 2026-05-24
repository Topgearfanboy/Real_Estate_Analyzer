import {
  Block,
  BuyBlockData,
  RefinanceBlockData,
  FinancingBlock,
} from "@/types";
import { TimelineEntry } from "./timeline";

export interface LoanInfo {
  monthlyPayment: number;
  loanEndDate: Date | null;
  loanStartIndex: number;
}

// Calculate monthly payment from the most recent loan block (buy or refinance)
export function getLoanInfo(
  blocks: Block[],
  timeline: TimelineEntry[],
): LoanInfo {
  const buyBlock = blocks.find((b) => b.type === "buy");
  const refinanceBlock = blocks.find((b) => b.type === "refinance");

  // Use refinance if available, otherwise use buy
  const loanBlock = refinanceBlock || buyBlock;

  if (!loanBlock)
    return { monthlyPayment: 0, loanEndDate: null, loanStartIndex: -1 };

  const financingData = loanBlock.data as FinancingBlock;
  let cost = 0;
  let loanAmount = 0;
  let rate = 0;
  let term = 30;
  let interestOnly = false;
  let loanStartIndex = -1;
  let loanDurationMonths = 0;
  let monthlyPayment = 0;

  // Calculate loan amount based on block type
  if (loanBlock.type === "buy") {
    const buyData = loanBlock.data as BuyBlockData;
    cost = parseFloat(buyData.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
    const downpaymentRaw =
      parseFloat(buyData.downpayment?.replace(/[^0-9.]/g, "") || "0") || 0;
    const downpayment =
      buyData.downpaymentType === "%"
        ? (downpaymentRaw / 100) * cost
        : downpaymentRaw;
    loanAmount = cost - downpayment;
  } else {
    const refinanceData = loanBlock.data as RefinanceBlockData;
    const estimatedValue =
      parseFloat(
        refinanceData.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
      ) || 0;
    const costRaw =
      parseFloat(refinanceData.cost?.replace(/[^0-9.]/g, "") || "0") || 0;

    // Use estimated value as the cost base for tax/insurance calculations
    cost = estimatedValue;

    // Calculate loan amount based on cost type
    if (refinanceData.costType === "%") {
      loanAmount = (costRaw / 100) * estimatedValue;
    } else {
      loanAmount = costRaw;
    }
  }

  // Use common financing fields
  rate = parseFloat(financingData.interestRate) || 0;
  term =
    financingData.loanTerm === "custom"
      ? parseInt(financingData.customLoanTerm) || 30
      : parseInt(financingData.loanTerm) || 30;
  interestOnly = financingData.interestOnlyOption;
  loanDurationMonths = term * 12;

  // Calculate mortgage payment (principal + interest)
  let mortgagePayment = 0;
  if (loanAmount > 0 && rate > 0) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    if (interestOnly) {
      mortgagePayment = loanAmount * monthlyRate;
    } else {
      mortgagePayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
  } else if (loanAmount > 0) {
    mortgagePayment = loanAmount / (term * 12);
  }

  // Calculate monthly property taxes
  const propertyTaxesNum = parseFloat(financingData.propertyTaxes) || 0;
  const monthlyPropertyTaxes =
    financingData.propertyTaxesType === "%"
      ? ((propertyTaxesNum / 100) * cost) / 12
      : propertyTaxesNum / 12;

  // Calculate monthly homeowners insurance
  const insuranceNum = parseFloat(financingData.homeownersInsurance) || 0;
  const monthlyInsurance =
    financingData.homeownersInsuranceType === "%"
      ? ((insuranceNum / 100) * cost) / 12
      : insuranceNum / 12;

  // Calculate monthly HOA
  const annualHoaNum =
    parseFloat(financingData.annualHoa?.replace(/[^0-9.]/g, "") || "0") || 0;
  const monthlyHoa = annualHoaNum / 12;

  // Total monthly payment includes mortgage + taxes + insurance + HOA
  monthlyPayment =
    mortgagePayment + monthlyPropertyTaxes + monthlyInsurance + monthlyHoa;

  // Find loan block index in timeline
  loanStartIndex = timeline.findIndex((t) => t.type === loanBlock.type);

  // Calculate loan end date
  let loanEndDate: Date | null = null;
  if (loanStartIndex >= 0) {
    loanEndDate = new Date(timeline[loanStartIndex].startDate);
    loanEndDate.setMonth(loanEndDate.getMonth() + loanDurationMonths);
  }

  return { monthlyPayment, loanEndDate, loanStartIndex };
}
