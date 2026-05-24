export interface LoanBalanceData {
  balances: number[];
  monthsToPayoff: number;
}

// Helper function to calculate remaining loan balance over time
export function calculateLoanBalanceOverTime(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number,
  months?: number,
): LoanBalanceData {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  const balances: number[] = [];

  let currentBalance = loanAmount;
  let monthsToPayoff = 0;

  // Calculate until loan is paid off or reaches term limit
  const maxMonths = months || totalPayments;

  for (let month = 0; month < maxMonths; month++) {
    if (currentBalance <= 0) {
      balances.push(0);
      continue;
    }

    // Calculate monthly payment
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      monthlyPayment = loanAmount / totalPayments;
    }

    // Calculate interest and principal for this month
    const monthlyInterest = currentBalance * monthlyRate;
    const monthlyPrincipal = Math.min(
      monthlyPayment - monthlyInterest,
      currentBalance,
    );

    // Update balance
    currentBalance = Math.max(0, currentBalance - monthlyPrincipal);
    balances.push(Math.round(currentBalance));

    // Track when loan is paid off
    if (currentBalance > 0) {
      monthsToPayoff = month + 1;
    }
  }

  return { balances, monthsToPayoff };
}
