export type BlockType = "buy" | "renovate" | "refinance" | "rent" | "sell";

// Base interface for blocks with time-based properties
export interface TimeBasedBlock {
  startDate?: string; // ISO date string when this block starts
  endDate?: string; // ISO date string when this block ends
  durationMonths?: number; // Duration in months (0 for instant blocks like refinance)
}

// Base interface for financing blocks (buy and refinance)
export interface FinancingBlock extends TimeBasedBlock {
  loanTermYears: number;
  loanStartDate?: string;
  monthlyPayment?: number;
  cost: string;
  interestRate: string;
  closingCosts: string;
  closingCostsType: "$" | "%";
  propertyTaxes: string;
  propertyTaxesType: "$" | "%";
  annualHoa: string;
  homeownersInsurance: string;
  homeownersInsuranceType: "$" | "%";
  loanTerm: string;
  customLoanTerm: string;
  interestOnlyOption: boolean;
}

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
}

export interface MonthlyCostToOwn {
  utilities: Utilities;
  deferInterestPayments: boolean;
}

export interface BuyBlockData extends FinancingBlock {
  downpayment: string;
  downpaymentType: "$" | "%";
  loanAnalysis: LoanAnalysis;
}

export interface RenovationItem {
  item: string;
  cost: string;
}

export interface RenovateBlockData extends TimeBasedBlock {
  items: RenovationItem[];
  timeToRenovate: {
    days: string;
    months: string;
    years: string;
  };
  monthlyCostToOwn: MonthlyCostToOwn;
  arv: string;
}

export interface RefinanceBlockData extends FinancingBlock {
  cashOut: boolean;
  estimatedValue: string;
  remainingEquityAmount: string;
  remainingEquityPercent: string;
  costType: "$" | "%";
}

export interface RentBlockData extends TimeBasedBlock {
  monthlyRent: string;
  timeRentedMonths: string;
  timeRentedYears: string;
  vacancy: string;
  vacancyType: "$" | "%";
  management: string;
  managementType: "$" | "%";
  maintenance: string;
  maintenanceType: "$" | "%";
  annualRentIncrease: string;
  annualRentIncreaseType: "$" | "%";
}

export interface SellBlockData extends TimeBasedBlock {
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

export interface ProjectSettings {
  years: number;
  cashStrategy: "profit" | "paydown";
  idealCashHoldingBalance: number;
  estimatedHomeAppreciationRate: number;
  purchaseDate: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  blocks: Block[];
  projectSettings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}
