// Shared interfaces for loan-related functions
// Functions have been moved to separate files:
// - calculateLoanBalanceOverTime -> loanBalance.ts
// - processBuyBlockData -> buyBlock.ts
// - getLoanInfo -> loanInfo.ts
// - getLoanOverlapMonths -> loanOverlap.ts

export interface LoanBalanceData {
  balances: number[];
  monthsToPayoff: number;
}

export interface ProcessedBuyBlockData {
  loanAmount: number;
  monthlyRate: number;
  loanTermYears: number;
  cost: number;
  downpayment: number;
}
