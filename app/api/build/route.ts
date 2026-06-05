import { NextRequest, NextResponse } from "next/server";
import { Block, ProjectSettings } from "@/types";
import { calculateTimeline } from "./helpers/timeline";
import { getLoanInfo } from "./helpers/loanInfo";
import { getLoanOverlapMonths } from "./helpers/loanOverlap";
import { calculateGraphData } from "./helpers/graph";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const blocks: Block[] = body.blocksJson ? JSON.parse(body.blocksJson) : [];
    const projectSettings: ProjectSettings = body.projectSettings || {
      years: 30,
      cashStrategy: "profit",
      idealCashHoldingBalance: 0,
      estimatedHomeAppreciationRate: 0,
      purchaseDate: new Date().toISOString().split("T")[0],
    };

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

    const response = {
      graphData: graphData,
      monthlyPayment,
      loanOverlapMonthsMap,
      debug: {
        blocks: blocks,
        calculatedRefinancePercentage: null as string | null,
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
      !(refinanceBlock.data as any).cashOut
    ) {
      const buyBlock = blocks.find((b) => b.type === "buy");
      if (buyBlock && buyBlock.data) {
        const buyData = buyBlock.data as any;
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

        // Calculate remaining balance at refinance point
        const { calculateLoanBalanceOverTime } =
          await import("./helpers/loanBalance");
        const { calculateTimeline } = await import("./helpers/timeline");
        const timeline = calculateTimeline(
          blocks,
          projectSettings.purchaseDate,
        );
        const refinanceIndex = timeline.findIndex(
          (t) => t.type === "refinance",
        );

        let monthsBeforeRefinance = 0;
        if (refinanceIndex >= 0) {
          for (let i = 0; i < refinanceIndex; i++) {
            const blockDuration = Math.round(
              (timeline[i].endDate.getTime() -
                timeline[i].startDate.getTime()) /
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
          loanBeforeRefinance.balances[
            loanBeforeRefinance.balances.length - 1
          ] || 0;

        const refinanceData = refinanceBlock.data as any;
        const estimatedValue =
          parseFloat(
            refinanceData.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
          ) || 0;
        const calculatedPercentage =
          estimatedValue > 0
            ? ((remainingBalance / estimatedValue) * 100).toFixed(2)
            : "0";
        response.debug.calculatedRefinancePercentage = calculatedPercentage;

        // Set the financed amount (cost) in the refinance block data to the remaining balance
        refinanceData.cost = remainingBalance.toFixed(2);
        refinanceData.costType = "$";
      }
    }

    console.log("Updating blocks:", response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/build:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
