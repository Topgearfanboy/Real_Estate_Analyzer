import {
  Block,
  BuyBlockData,
  ProjectSettings,
  RefinanceBlockData,
} from "@/types";
import { calculateTimeline } from "./timeline";
import { getLoanInfo } from "./loanInfo";
import { getLoanOverlapMonths } from "./loanOverlap";
import { calculateGraphData, GraphDataPoint } from "./graph";
import { calculateLoanBalanceOverTime } from "./loanBalance";

export interface BuildDataResult {
  graphData: GraphDataPoint[];
  monthlyPayment: number;
  loanOverlapMonthsMap: Record<number, number>;
  debug: {
    blocks: Block[];
    calculatedRefinancePercentage: string | null;
  };
  meta: {
    requestId: string;
    timestamp: number;
  };
}

export async function calculateBuildData(
  blocks: Block[],
  projectSettings: ProjectSettings,
): Promise<BuildDataResult> {
  // Calculate timeline
  const timeline = calculateTimeline(blocks, projectSettings.purchaseDate);

  // Calculate loan info
  const { monthlyPayment, loanEndDate, loanStartIndex } = getLoanInfo(
    blocks,
    timeline,
  );

  // Calculate loan overlap months for each renovate block
  const loanOverlapMonthsMap: Record<number, number> = {};
  blocks.forEach((block, index) => {
    if (block.type === "renovate") {
      loanOverlapMonthsMap[index] = getLoanOverlapMonths(
        index,
        timeline,
        loanStartIndex,
        loanEndDate,
      );
    }
  });

  // Calculate graph data based on blocks and years
  const graphData = calculateGraphData(
    blocks,
    projectSettings.years,
    projectSettings.cashStrategy,
    projectSettings.idealCashHoldingBalance,
    projectSettings.estimatedHomeAppreciationRate,
    projectSettings.purchaseDate,
  );

  const result: BuildDataResult = {
    graphData,
    monthlyPayment,
    loanOverlapMonthsMap,
    debug: {
      blocks,
      calculatedRefinancePercentage: null,
    },
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
    },
  };

  // Calculate and add refinance percentage for non-cash-out
  const refinanceBlock = blocks.find((b) => b.type === "refinance");
  if (
    refinanceBlock &&
    refinanceBlock.data &&
    !(refinanceBlock.data as RefinanceBlockData).cashOut
  ) {
    const buyBlock = blocks.find((b) => b.type === "buy");
    if (buyBlock && buyBlock.data) {
      const buyData = buyBlock.data as BuyBlockData;
      const cost =
        parseFloat(buyData.cost?.replace(/[^0-9.]/g, "") || "0") || 0;
      const downpaymentRaw =
        parseFloat(buyData.downpayment?.replace(/[^0-9.]/g, "") || "0") || 0;
      const downpayment =
        buyData.downpaymentType === "%"
          ? (downpaymentRaw / 100) * cost
          : downpaymentRaw;
      const loanAmount = cost - downpayment;
      const annualRate = parseFloat(buyData.interestRate) || 0;
      const loanTermYears = parseInt(buyData.loanTerm) || 30;

      const refinanceIndex = timeline.findIndex((t) => t.type === "refinance");

      let monthsBeforeRefinance = 0;
      if (refinanceIndex >= 0) {
        for (let i = 0; i < refinanceIndex; i++) {
          const blockDuration = Math.round(
            (timeline[i].endDate.getTime() - timeline[i].startDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30),
          );
          monthsBeforeRefinance += blockDuration;
        }
      }

      const loanBeforeRefinance = calculateLoanBalanceOverTime(
        loanAmount,
        annualRate,
        loanTermYears,
        monthsBeforeRefinance,
      );
      const remainingBalance =
        loanBeforeRefinance.balances[loanBeforeRefinance.balances.length - 1] ||
        0;

      const refinanceData = refinanceBlock.data as RefinanceBlockData;
      const estimatedValue =
        parseFloat(
          refinanceData.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
        ) || 0;
      const calculatedPercentage =
        estimatedValue > 0
          ? ((remainingBalance / estimatedValue) * 100).toFixed(2)
          : "0";
      result.debug.calculatedRefinancePercentage = calculatedPercentage;

      // Set the financed amount (cost) in the refinance block data to the remaining balance
      refinanceData.cost = remainingBalance.toFixed(2);
      refinanceData.costType = "$";
    }
  }

  return result;
}
