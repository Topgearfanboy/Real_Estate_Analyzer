import { NextRequest, NextResponse } from "next/server";
import { Block, BuyBlockData } from "@/types";

// Helper function to calculate remaining loan balance over time
function calculateLoanBalanceOverTime(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number,
  months?: number,
): { balances: number[]; monthsToPayoff: number } {
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

// Helper function to extract and process BuyBlock data
function processBuyBlockData(blocks: Block[]): {
  loanAmount: number;
  monthlyRate: number;
  loanTermYears: number;
  cost: number;
  downpayment: number;
} | null {
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
  const loanTermYears = parseInt(buyData.loanTerm) || 30;

  return {
    loanAmount,
    monthlyRate: annualRate,
    loanTermYears,
    cost,
    downpayment,
  };
}

// Main calculation function for graph data
function calculateGraphData(blocks: Block[]): {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
}[] {
  const buyBlockData = processBuyBlockData(blocks);

  if (!buyBlockData) {
    // Return static data if no buy block
    return [
      {
        date: "2024-01",
        investedCapital: 0,
        cashOnHand: 0,
        equity: 0,
        remainingLoanBalance: 0,
      },
    ];
  }

  const { loanAmount, cost, downpayment } = buyBlockData;

  // Calculate loan balance until paid off
  const loanData = calculateLoanBalanceOverTime(
    loanAmount,
    buyBlockData.monthlyRate,
    buyBlockData.loanTermYears,
  );

  // Generate data until loan is paid off
  const graphData = [];
  const currentDate = new Date(2024, 0, 1); // Start from Jan 2024

  for (let i = 0; i < loanData.balances.length; i++) {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1,
    );
    const dateStr = monthDate.toISOString().slice(0, 7); // YYYY-MM format

    // Static values for other fields (to be replaced by other block logic later)
    const investedCapital = downpayment + i * 500; // Simple growth model
    const cashOnHand = Math.max(10000 - i * 800, 2000); // Decreasing cash
    const equity = cost - loanData.balances[i]; // Equity = property value - remaining loan balance

    graphData.push({
      date: dateStr,
      investedCapital,
      cashOnHand,
      equity,
      remainingLoanBalance: loanData.balances[i],
    });
  }

  return graphData;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const blocks: Block[] = body.blocksJson ? JSON.parse(body.blocksJson) : [];

  // Calculate graph data based on blocks
  const graphData = calculateGraphData(blocks);

  const response = {
    graphData: graphData,
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
    },
  };
  console.log("Updating blocks:", response);
  return NextResponse.json(response, { status: 200 });
}
