import {
  Block,
  RefinanceBlockData,
  RentBlockData,
  RenovateBlockData,
} from "@/types";
import { processBuyBlockData } from "./buyBlock";
import { calculateLoanBalanceOverTime } from "./loanBalance";
import { calculateTimeline } from "./timeline";

// Helper function to process rent block data
function processRentBlockData(
  blocks: Block[],
  purchaseDate: string,
): Array<{
  baseMonthlyRent: number;
  vacancy: number;
  management: number;
  maintenance: number;
  annualRentIncrease: number;
  annualRentIncreaseType: "$" | "%";
  rentStartMonth: number;
  rentDurationMonths: number;
}> {
  const rentBlocks = blocks.filter((block) => block.type === "rent");

  if (rentBlocks.length === 0) {
    return [];
  }

  const timeline = calculateTimeline(blocks, purchaseDate);
  const rentBlockDataArray: Array<{
    baseMonthlyRent: number;
    vacancy: number;
    management: number;
    maintenance: number;
    annualRentIncrease: number;
    annualRentIncreaseType: "$" | "%";
    rentStartMonth: number;
    rentDurationMonths: number;
  }> = [];

  rentBlocks.forEach((rentBlock) => {
    const rentData = rentBlock.data as RentBlockData;

    // Parse rent income
    const monthlyRent = parseFloat(rentData.monthlyRent) || 0;

    // Parse vacancy
    const vacancyRaw = parseFloat(rentData.vacancy) || 0;
    const vacancy =
      rentData.vacancyType === "%"
        ? (vacancyRaw / 100) * monthlyRent
        : vacancyRaw;

    // Parse management
    const managementRaw = parseFloat(rentData.management) || 0;
    const management =
      rentData.managementType === "%"
        ? (managementRaw / 100) * monthlyRent
        : managementRaw;

    // Parse maintenance
    const maintenanceRaw = parseFloat(rentData.maintenance) || 0;
    const maintenance =
      rentData.maintenanceType === "%"
        ? (maintenanceRaw / 100) * monthlyRent
        : maintenanceRaw;

    // Parse annual rent increase
    const annualRentIncreaseRaw =
      parseFloat(rentData.annualRentIncrease || "0") || 0;

    // Calculate rent duration
    const months = parseInt(rentData.timeRentedMonths) || 0;
    const years = parseInt(rentData.timeRentedYears) || 0;
    const rentDurationMonths = months + years * 12;

    // Find this specific rent block index in timeline to determine start month
    // Since TimelineEntry doesn't have an id, we match by the Nth rent block
    let rentStartMonth = 0;
    let currentRentBlockCount = 0;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].type === "rent") {
        if (currentRentBlockCount === rentBlockDataArray.length) {
          // This is the timeline entry for the current rent block
          for (let j = 0; j < i; j++) {
            const blockDuration = Math.round(
              (timeline[j].endDate.getTime() -
                timeline[j].startDate.getTime()) /
                (1000 * 60 * 60 * 24 * 30),
            );
            rentStartMonth += blockDuration;
          }
          break;
        }
        currentRentBlockCount++;
      }
    }

    rentBlockDataArray.push({
      baseMonthlyRent: monthlyRent,
      vacancy,
      management,
      maintenance,
      annualRentIncrease: annualRentIncreaseRaw,
      annualRentIncreaseType: rentData.annualRentIncreaseType,
      rentStartMonth,
      rentDurationMonths,
    });
  });

  return rentBlockDataArray;
}

// Helper function to process renovate block data
function processRenovateBlockData(
  blocks: Block[],
  purchaseDate: string,
): {
  totalRenovationCost: number;
  renovateStartMonth: number;
  renovateDurationMonths: number;
  arv: number;
} | null {
  const renovateBlock = blocks.find((block) => block.type === "renovate");

  if (!renovateBlock) {
    return null;
  }

  const renovateData = renovateBlock.data as RenovateBlockData;

  // Calculate total renovation cost from items
  let totalRenovationCost = 0;
  if (renovateData.items && Array.isArray(renovateData.items)) {
    for (const item of renovateData.items) {
      const cost = parseFloat(item.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
      totalRenovationCost += cost;
    }
  }

  // Calculate renovation duration
  const days = parseInt(renovateData.timeToRenovate.days) || 0;
  const months = parseInt(renovateData.timeToRenovate.months) || 0;
  const years = parseInt(renovateData.timeToRenovate.years) || 0;
  const renovateDurationMonths = Math.round(days / 30) + months + years * 12;

  // Extract ARV
  const arv = parseFloat(renovateData.arv?.replace(/[^0-9.]/g, "") || "0") || 0;

  // Find renovate block index in timeline to determine start month
  const timeline = calculateTimeline(blocks, purchaseDate);
  const renovateIndex = timeline.findIndex((t) => t.type === "renovate");
  let renovateStartMonth = 0;
  if (renovateIndex >= 0) {
    for (let i = 0; i < renovateIndex; i++) {
      const blockDuration = Math.round(
        (timeline[i].endDate.getTime() - timeline[i].startDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      );
      renovateStartMonth += blockDuration;
    }
  }

  return {
    totalRenovationCost,
    renovateStartMonth,
    renovateDurationMonths,
    arv,
  };
}

export interface GraphDataPoint {
  date: string;
  investedCapital: number;
  cashOnHand: number;
  equity: number;
  remainingLoanBalance: number;
  monthlyNet: number;
}

// Main calculation function for graph data
export function calculateGraphData(
  blocks: Block[],
  years: number = 30,
  cashStrategy: "profit" | "paydown" = "profit",
  idealCashHoldingBalance: number = 0,
  estimatedHomeAppreciationRate: number = 0,
  purchaseDate: string = new Date().toISOString().split("T")[0],
): GraphDataPoint[] {
  const buyBlockData = processBuyBlockData(blocks);
  const rentBlockDataArray = processRentBlockData(blocks, purchaseDate);
  const renovateBlockData = processRenovateBlockData(blocks, purchaseDate);

  if (!buyBlockData) {
    // Return static data if no buy block
    return [
      {
        date: purchaseDate.slice(0, 7),
        investedCapital: 0,
        cashOnHand: 0,
        equity: 0,
        remainingLoanBalance: 0,
        monthlyNet: 0,
      },
    ];
  }

  const {
    loanAmount,
    cost,
    downpayment,
    monthlyRate,
    loanTermYears,
    propertyTaxes,
    homeownersInsurance,
    annualHoa,
  } = buyBlockData;

  // Calculate monthly payment for loan
  let monthlyPayment = 0;
  let refinanceMonthlyPayment = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    const monthlyRateDecimal = monthlyRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    monthlyPayment =
      (loanAmount *
        monthlyRateDecimal *
        Math.pow(1 + monthlyRateDecimal, numPayments)) /
      (Math.pow(1 + monthlyRateDecimal, numPayments) - 1);
  } else if (loanAmount > 0) {
    monthlyPayment = loanAmount / (loanTermYears * 12);
  }

  // Check for refinance block
  const refinanceBlock = blocks.find((b) => b.type === "refinance") as
    | Block
    | undefined;
  const timeline = calculateTimeline(blocks, purchaseDate);
  const refinanceIndex = timeline.findIndex((t) => t.type === "refinance");

  let loanBalances: number[];
  let propertyValue = cost;
  let monthsBeforeRefinance = 0;

  if (refinanceBlock && refinanceIndex >= 0) {
    // Calculate loan balance in two phases: before and after refinance
    const refinanceData = refinanceBlock.data as RefinanceBlockData;
    const estimatedValue =
      parseFloat(
        refinanceData.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
      ) || 0;

    // Calculate months before refinance by summing durations of previous blocks
    for (let i = 0; i < refinanceIndex; i++) {
      const blockDuration = Math.round(
        (timeline[i].endDate.getTime() - timeline[i].startDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      );
      monthsBeforeRefinance += blockDuration;
    }

    // Calculate new loan amount after refinance
    let newLoanAmount: number;
    let costRaw: number;

    if (refinanceData.cashOut === false) {
      // Non-cash-out: use user-provided cost if available, otherwise use remaining balance
      costRaw =
        parseFloat(refinanceData.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
      if (costRaw > 0) {
        // User provided a specific cost amount
        if (refinanceData.costType === "%") {
          newLoanAmount = (costRaw / 100) * estimatedValue;
        } else {
          newLoanAmount = costRaw;
        }
      } else {
        // No cost provided, use remaining loan balance
        let remainingBalance = 0;
        if (monthsBeforeRefinance > 0) {
          const loanBeforeRefinance = calculateLoanBalanceOverTime(
            loanAmount,
            buyBlockData.monthlyRate,
            buyBlockData.loanTermYears,
            monthsBeforeRefinance,
          );
          remainingBalance =
            loanBeforeRefinance.balances[
              loanBeforeRefinance.balances.length - 1
            ] || 0;
        } else {
          // If refinance is at month 0, use the full loan amount
          remainingBalance = loanAmount;
        }
        // Calculate cost as percentage: (remaining balance / estimated value) * 100
        costRaw =
          estimatedValue > 0 ? (remainingBalance / estimatedValue) * 100 : 0;
        newLoanAmount = remainingBalance;
      }
    } else {
      // Cash-out: use user-provided cost, or calculate based on estimated value if empty
      costRaw =
        parseFloat(refinanceData.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
      if (costRaw > 0) {
        if (refinanceData.costType === "%") {
          newLoanAmount = (costRaw / 100) * estimatedValue;
        } else {
          newLoanAmount = costRaw;
        }
      } else {
        // If cost is empty for cash-out, use remaining loan balance
        // This ensures the loan balance doesn't increase when refinancing
        let remainingBalance = 0;
        if (monthsBeforeRefinance > 0) {
          const loanBeforeRefinance = calculateLoanBalanceOverTime(
            loanAmount,
            buyBlockData.monthlyRate,
            buyBlockData.loanTermYears,
            monthsBeforeRefinance,
          );
          remainingBalance =
            loanBeforeRefinance.balances[
              loanBeforeRefinance.balances.length - 1
            ] || 0;
        } else {
          // If refinance is at month 0, use the full loan amount
          remainingBalance = loanAmount;
        }
        newLoanAmount = remainingBalance;
      }
    }

    // Calculate interest rate and term for refinance
    // If interest rate is empty, default to original loan's interest rate
    const parsedRate = parseFloat(refinanceData.interestRate || "0");
    const newRate = parsedRate > 0 ? parsedRate : buyBlockData.monthlyRate;
    const newTerm =
      refinanceData.loanTerm === "custom"
        ? parseInt(refinanceData.customLoanTerm) || 30
        : parseInt(refinanceData.loanTerm) || 30;

    // Calculate refinance monthly payment
    if (newLoanAmount > 0 && newRate > 0) {
      const monthlyRateDecimal = newRate / 100 / 12;
      const numPayments = newTerm * 12;
      refinanceMonthlyPayment =
        (newLoanAmount *
          monthlyRateDecimal *
          Math.pow(1 + monthlyRateDecimal, numPayments)) /
        (Math.pow(1 + monthlyRateDecimal, numPayments) - 1);
    } else if (newLoanAmount > 0) {
      refinanceMonthlyPayment = newLoanAmount / (newTerm * 12);
    }

    const loanBeforeRefinance = calculateLoanBalanceOverTime(
      loanAmount,
      buyBlockData.monthlyRate,
      buyBlockData.loanTermYears,
      monthsBeforeRefinance,
    );

    // Calculate loan balance after refinance
    const remainingMonths = years * 12 - monthsBeforeRefinance;
    const loanAfterRefinance = calculateLoanBalanceOverTime(
      newLoanAmount,
      newRate,
      newTerm,
      remainingMonths,
    );

    // Merge the two balance arrays
    // loanBeforeRefinance.balances has monthsBeforeRefinance entries
    // loanAfterRefinance.balances has remainingMonths entries starting from the new loan amount
    loanBalances = [
      ...loanBeforeRefinance.balances,
      ...loanAfterRefinance.balances,
    ];

    // Update property value to estimated value after refinance
    propertyValue = estimatedValue;
  } else {
    // No refinance, calculate loan balance normally
    const loanData = calculateLoanBalanceOverTime(
      loanAmount,
      buyBlockData.monthlyRate,
      buyBlockData.loanTermYears,
      years * 12, // Use the requested years instead of default loan term
    );
    loanBalances = loanData.balances;
  }

  // Generate data for the specified number of years
  const graphData = [];
  const currentDate = new Date(purchaseDate); // Start from purchase date
  const maxMonths = years * 12; // Convert years to months

  // Calculate cash on hand over time
  let currentCashOnHand = 0; // Starting cash on hand
  let currentInvestedCapital = downpayment; // Starting invested capital

  for (let i = 0; i < Math.min(loanBalances.length, maxMonths); i++) {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1,
    );
    const dateStr = monthDate.toISOString().slice(0, 7); // YYYY-MM format

    // Apply home appreciation to property value
    if (i > 0 && estimatedHomeAppreciationRate > 0) {
      const monthlyAppreciationRate = estimatedHomeAppreciationRate / 100 / 12;
      propertyValue *= 1 + monthlyAppreciationRate;
    }

    // Update property value to ARV after renovation completes
    if (
      renovateBlockData &&
      renovateBlockData.arv > 0 &&
      i ===
        renovateBlockData.renovateStartMonth +
          renovateBlockData.renovateDurationMonths
    ) {
      propertyValue = renovateBlockData.arv;
    }

    // Calculate cash flow for this month
    let monthlyCashFlow = 0;
    let monthlyNet = 0; // Rental income - expenses - mortgage

    // Calculate fixed monthly expenses
    const monthlyPropertyTaxes = propertyTaxes / 12;
    const monthlyHomeownersInsurance = homeownersInsurance / 12;
    const monthlyHoa = annualHoa / 12;
    const monthlyFixedExpenses =
      monthlyPropertyTaxes + monthlyHomeownersInsurance + monthlyHoa;

    // Check if loan is paid off
    const loanPaidOff = loanBalances[i] === 0;

    if (loanPaidOff) {
      // After loan is paid off, only deduct ongoing expenses
      monthlyCashFlow = -monthlyFixedExpenses;
    } else {
      // Before loan is paid off, deduct monthly payment and fixed expenses
      monthlyCashFlow = -monthlyPayment - monthlyFixedExpenses;

      // Use refinance monthly payment after refinance point
      if (refinanceBlock && refinanceIndex >= 0 && i >= monthsBeforeRefinance) {
        monthlyCashFlow = -refinanceMonthlyPayment - monthlyFixedExpenses;

        // Handle closing costs and cash-out at the refinance point
        const refinanceData = refinanceBlock.data as RefinanceBlockData;
        if (i === monthsBeforeRefinance) {
          const closingCostsRaw =
            parseFloat(
              refinanceData.closingCosts?.replace(/[^0-9.]/g, "") || "0",
            ) || 0;
          let closingCostsAmount = 0;
          const refinanceEstimatedValue =
            parseFloat(
              refinanceData.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
            ) || 0;
          if (refinanceData.closingCostsType === "%") {
            closingCostsAmount =
              (closingCostsRaw / 100) * refinanceEstimatedValue;
          } else {
            closingCostsAmount = closingCostsRaw;
          }
          monthlyCashFlow -= closingCostsAmount;

          // For cash-out refinancing, add the difference between new loan amount and remaining balance to cash on hand
          if (refinanceData.cashOut === true) {
            let remainingBalance = 0;
            if (monthsBeforeRefinance > 0) {
              const loanBeforeRefinance = calculateLoanBalanceOverTime(
                loanAmount,
                buyBlockData.monthlyRate,
                buyBlockData.loanTermYears,
                monthsBeforeRefinance,
              );
              remainingBalance =
                loanBeforeRefinance.balances[
                  loanBeforeRefinance.balances.length - 1
                ] || 0;
            } else {
              remainingBalance = loanAmount;
            }

            // Calculate new loan amount
            let newLoanAmount: number;
            const costRaw =
              parseFloat(refinanceData.cost?.replace(/[^0-9.]/g, "") || "0") ||
              0;
            if (costRaw > 0) {
              if (refinanceData.costType === "%") {
                newLoanAmount = (costRaw / 100) * refinanceEstimatedValue;
              } else {
                newLoanAmount = costRaw;
              }
            } else {
              newLoanAmount = remainingBalance;
            }

            // Add cash-out amount to cash on hand
            const cashOutAmount = newLoanAmount - remainingBalance;
            if (cashOutAmount > 0) {
              monthlyCashFlow += cashOutAmount;
            }
          }
        }
      }
    }

    // Add rent income if within any rent period
    for (const rentBlockData of rentBlockDataArray) {
      if (
        i >= rentBlockData.rentStartMonth &&
        i < rentBlockData.rentStartMonth + rentBlockData.rentDurationMonths
      ) {
        // Calculate current rent with annual increase
        const monthsIntoRent = i - rentBlockData.rentStartMonth;
        const yearsIntoRent = Math.floor(monthsIntoRent / 12);

        let currentRent = rentBlockData.baseMonthlyRent;

        // Apply annual rent increase
        if (rentBlockData.annualRentIncrease > 0) {
          for (let year = 0; year < yearsIntoRent; year++) {
            if (rentBlockData.annualRentIncreaseType === "%") {
              currentRent *= 1 + rentBlockData.annualRentIncrease / 100;
            } else {
              currentRent += rentBlockData.annualRentIncrease;
            }
          }
        }

        // Calculate net cash flow with current rent
        const netCashFlow =
          currentRent -
          rentBlockData.vacancy -
          rentBlockData.management -
          rentBlockData.maintenance;
        monthlyCashFlow += netCashFlow;
      }
    }

    // Apply renovation costs during renovation period
    if (renovateBlockData && i >= renovateBlockData.renovateStartMonth) {
      // If duration is 0, apply full cost at start month
      if (renovateBlockData.renovateDurationMonths === 0) {
        if (i === renovateBlockData.renovateStartMonth) {
          monthlyCashFlow -= renovateBlockData.totalRenovationCost;
        }
      } else if (
        i <
        renovateBlockData.renovateStartMonth +
          renovateBlockData.renovateDurationMonths
      ) {
        // Spread renovation cost evenly over the renovation period
        const monthlyRenovationCost =
          renovateBlockData.totalRenovationCost /
          renovateBlockData.renovateDurationMonths;
        monthlyCashFlow -= monthlyRenovationCost;
      }
    }

    // Update cash on hand
    currentCashOnHand += monthlyCashFlow;

    // If cash on hand would go negative, add the negative amount to invested capital
    if (currentCashOnHand < 0) {
      currentInvestedCapital += Math.abs(currentCashOnHand);
      currentCashOnHand = 0;
    }

    // Track paydown amount for monthly net calculation
    let paydownAmount = 0;

    // Apply paydown loan strategy if selected
    if (cashStrategy === "paydown" && !loanPaidOff) {
      const excessCash = currentCashOnHand - idealCashHoldingBalance;
      if (excessCash > 0 && loanBalances[i] > 0) {
        // Apply excess cash to loan principal
        paydownAmount = Math.min(excessCash, loanBalances[i]);
        currentCashOnHand -= paydownAmount;
        loanBalances[i] -= paydownAmount;
        // Update all future loan balances to reflect the paydown
        for (let j = i + 1; j < loanBalances.length; j++) {
          if (loanBalances[j] > 0) {
            loanBalances[j] = Math.max(0, loanBalances[j] - paydownAmount);
          }
        }
      }
    }

    // Update monthly net to include cash on hand accumulation and loan principal paydown
    // Monthly net represents the total cash flow that goes to either cash on hand or loan principal
    // If monthlyCashFlow is positive, that cash goes to cash on hand or loan principal
    // If monthlyCashFlow is negative, that represents cash that had to be added from invested capital
    if (rentBlockDataArray.length > 0) {
      monthlyNet = monthlyCashFlow;
    }

    const cashOnHand = currentCashOnHand;
    const investedCapital = currentInvestedCapital;
    const equity = propertyValue - loanBalances[i]; // Equity = property value - remaining loan balance

    graphData.push({
      date: dateStr,
      investedCapital,
      cashOnHand,
      equity,
      remainingLoanBalance: loanBalances[i],
      monthlyNet,
    });
  }

  return graphData;
}
