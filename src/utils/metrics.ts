export interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

export interface MetricsResult {
  roi: number;
  cashOnCashReturn: number;
  timeToPayOffLoan: number | null;
  totalProfit: number;
  netPresentValue: number;
  annualizedRoi: number;
  capRate: number;
  netOperatingIncome: number;
  totalRoi: number;
}

export function calculateKeyMetrics(
  graphData: GraphDataPoint[],
  discountRate: number = 0.05,
): MetricsResult {
  if (!graphData || graphData.length === 0) {
    return {
      roi: 0,
      cashOnCashReturn: 0,
      timeToPayOffLoan: null,
      totalProfit: 0,
      netPresentValue: 0,
      annualizedRoi: 0,
      capRate: 0,
      netOperatingIncome: 0,
      totalRoi: 0,
    };
  }

  const firstPoint = graphData[0];
  const lastPoint = graphData[graphData.length - 1];

  // Total Investment (initial invested capital)
  const totalInvestment = firstPoint.investedCapital;

  // Total Profit: Final equity + accumulated rental cash flow - initial investment
  // Sum all monthly net cash flows (includes rental income minus expenses)
  const totalRentalCashFlow = graphData.reduce(
    (sum, point) => sum + point.monthlyNet,
    0,
  );
  const totalProfit = lastPoint.equity + totalRentalCashFlow - totalInvestment;

  // ROI: (Total Profit / Total Investment) * 100
  const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  // Cash on Cash Return: (Average Annual Cash Flow / Total Cash Invested) * 100
  // Calculate average monthly cash flow from the first year (12 months)
  const firstYearMonths = graphData.slice(0, Math.min(12, graphData.length));
  const totalFirstYearCashFlow = firstYearMonths.reduce(
    (sum, point) => sum + point.monthlyNet,
    0,
  );
  const averageMonthlyCashFlow =
    totalFirstYearCashFlow / firstYearMonths.length;
  const annualCashFlow = averageMonthlyCashFlow * 12;
  const cashOnCashReturn =
    totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  // Time to Pay Off Loan: Find the month when loan balance reaches 0
  let timeToPayOffLoan: number | null = null;
  for (let i = 0; i < graphData.length; i++) {
    if (graphData[i].remainingLoanBalance <= 0) {
      timeToPayOffLoan = i; // months
      break;
    }
  }

  // Net Present Value (NPV): Sum of discounted cash flows
  // NPV = Σ (Cash Flow / (1 + r)^t) - Initial Investment
  let npv = -totalInvestment;
  const monthlyDiscountRate = discountRate / 12;
  for (let i = 0; i < graphData.length; i++) {
    const cashFlow = graphData[i].monthlyNet;
    const discountedCashFlow = cashFlow / Math.pow(1 + monthlyDiscountRate, i);
    npv += discountedCashFlow;
  }

  // Add final equity and cash on hand (discounted to present value)
  const finalMonths = graphData.length;
  const finalEquityPV =
    lastPoint.equity / Math.pow(1 + monthlyDiscountRate, finalMonths);
  const finalCashOnHandPV =
    lastPoint.cashOnHand / Math.pow(1 + monthlyDiscountRate, finalMonths);
  npv += finalEquityPV + finalCashOnHandPV;

  // Annualized ROI: ROI adjusted for the time period (years)
  const yearsHeld = graphData.length / 12;
  const annualizedRoi =
    yearsHeld > 0 && totalInvestment > 0
      ? (Math.pow(1 + roi / 100, 1 / yearsHeld) - 1) * 100
      : 0;

  // Net Operating Income (NOI): Annual rental income minus operating expenses
  // Using the average monthly net cash flow from the first year
  const averageMonthlyNet = totalFirstYearCashFlow / firstYearMonths.length;
  const netOperatingIncome = averageMonthlyNet * 12;

  // Cap Rate: (NOI / Property Value) * 100
  // Using the initial property value (equity + loan balance at start)
  const initialPropertyValue =
    firstPoint.equity + firstPoint.remainingLoanBalance;
  const capRate =
    initialPropertyValue > 0
      ? (netOperatingIncome / initialPropertyValue) * 100
      : 0;

  // Total ROI: Same as ROI (already calculated)
  const totalRoi = roi;

  return {
    roi,
    cashOnCashReturn,
    timeToPayOffLoan,
    totalProfit,
    netPresentValue: npv,
    annualizedRoi,
    capRate,
    netOperatingIncome,
    totalRoi,
  };
}
