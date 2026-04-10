export type BlockType = "buy" | "renovate" | "refinance" | "rent" | "sell";

export interface LoanAnalysis {
  incomeNeeded: string;
  maxLoanBasedOnArv: string;
  initialCash: string;
  savedForRenovation: string;
  minimumCashForProject: string;
}

export interface Utilities {
  county: string;
  electricity: string;
  networking: string;
}

export interface MonthlyCostToOwn {
  utilities: Utilities;
  deferredInterestPrincipalOption: string;
}

export interface BuyBlockData {
  cost: string;
  interestRate: string;
  downpayment: string;
  downpaymentType: "$" | "%";
  closingCosts: string;
  closingCostsType: "$" | "%";
  propertyTaxes: string;
  propertyTaxesType: "$" | "%";
  homeownersInsurance: string;
  homeownersInsuranceType: "$" | "%";
  loanTerm: string;
  customLoanTerm: string;
  interestOnlyOption: boolean;
  loanAnalysis: LoanAnalysis;
}

export interface RenovationItem {
  item: string;
  cost: string;
}

export interface RenovateBlockData {
  items: RenovationItem[];
  timeToRenovate: {
    days: string;
    months: string;
    years: string;
  };
  monthlyCostToOwn: MonthlyCostToOwn;
}

export interface RefinanceBlockData {
  cashOut: boolean;
  estimatedValue: string;
  remainingEquityAmount: string;
  remainingEquityPercent: string;
}

export interface RentBlockData {
  monthlyRent: string;
  timeRentedMonths: string;
  timeRentedYears: string;
  vacancy: string;
  vacancyType: "$" | "%";
  management: string;
  managementType: "$" | "%";
  maintenance: string;
  maintenanceType: "$" | "%";
}

export interface SellBlockData {
  sellPrice: string;
  timeToSellMonths: string;
  closingCosts: string;
  closingCostsType: "$" | "%";
}

export interface Block {
  id: string;
  type: BlockType;
  data:
    | BuyBlockData
    | RenovateBlockData
    | RefinanceBlockData
    | RentBlockData
    | SellBlockData;
}
