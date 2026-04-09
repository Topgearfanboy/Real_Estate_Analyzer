import type {
  BuyBlockData,
  RenovateBlockData,
  RefinanceBlockData,
  Block,
  BlockType,
} from "./types";

export const defaultBuyData = (): BuyBlockData => ({
  cost: "225000",
  interestRate: "6",
  downpayment: "20",
  downpaymentType: "%",
  closingCosts: "3",
  closingCostsType: "%",
  propertyTaxes: "1",
  propertyTaxesType: "%",
  homeownersInsurance: "740",
  homeownersInsuranceType: "$",
  loanTerm: "30",
  customLoanTerm: "",
  interestOnlyOption: false,
  loanAnalysis: {
    incomeNeeded: "",
    maxLoanBasedOnArv: "",
    initialCash: "",
    savedForRenovation: "",
    minimumCashForProject: "",
  },
});

export const defaultRenovateData = (): RenovateBlockData => ({
  items: [],
  timeToRenovate: {
    days: "",
    months: "",
    years: "",
  },
  monthlyCostToOwn: {
    utilities: {
      county: "",
      electricity: "",
      networking: "",
    },
    deferredInterestPrincipalOption: "",
  },
});

export const defaultRefinanceData = (): RefinanceBlockData => ({
  cashOut: false,
  estimatedValue: "",
  remainingEquityAmount: "",
  remainingEquityPercent: "",
});

export const createBlock = (type: BlockType): Block => {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let data: BuyBlockData | RenovateBlockData | RefinanceBlockData;
  switch (type) {
    case "buy":
      data = defaultBuyData();
      break;
    case "renovate":
      data = defaultRenovateData();
      break;
    case "refinance":
      data = defaultRefinanceData();
      break;
    default:
      data = defaultBuyData();
  }

  return { id, type, data };
};
