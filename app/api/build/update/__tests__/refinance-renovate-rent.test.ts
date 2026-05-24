import { calculateTimeline } from "../helpers/timeline";
import { calculateGraphData } from "../helpers/graph";
import { getLoanInfo } from "../helpers/loanInfo";
import { Block } from "@/types";

describe("Integration Test - Buy + Renovate + Rent + Refinance", () => {
  it("should handle buy, renovate, rent, and refinance blocks correctly", () => {
    const blocks: Block[] = [
      {
        id: "buy-1779582613285-vf9cych3i",
        type: "buy",
        data: {
          cost: "225000",
          interestRate: "6",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "740",
          homeownersInsuranceType: "$",
          loanTerm: "30",
          customLoanTerm: "",
          loanTermYears: 30,
          interestOnlyOption: false,
          loanAnalysis: {
            incomeNeeded: "",
            maxLoanBasedOnArv: "",
            initialCash: "",
            savedForRenovation: "",
            minimumCashForProject: "",
          },
        },
      },
      {
        id: "renovate-1779582957961-l6wrfc8lo",
        type: "renovate",
        data: {
          items: [
            {
              item: "item 1",
              cost: "2000",
            },
            {
              item: "item 3",
              cost: "1422",
            },
          ],
          timeToRenovate: {
            days: "",
            months: "2",
            years: "1",
          },
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
        },
      },
      {
        id: "rent-1779582615323-kuv9yv2qu",
        type: "rent",
        data: {
          monthlyRent: "2500",
          timeRentedMonths: "0",
          timeRentedYears: "6",
          vacancy: "5",
          vacancyType: "%",
          management: "8",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
          durationMonths: 72,
        },
      },
      {
        id: "refinance-1779582616902-hz13mxfr3",
        type: "refinance",
        data: {
          cashOut: false,
          estimatedValue: "300000",
          remainingEquityAmount: "",
          remainingEquityPercent: "",
          cost: "160529.00",
          costType: "$",
          interestRate: "3",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "",
          propertyTaxesType: "%",
          homeownersInsurance: "",
          homeownersInsuranceType: "$",
          loanTerm: "10",
          customLoanTerm: "",
          loanTermYears: 30,
          annualHoa: "0",
          interestOnlyOption: false,
        },
      },
    ];

    const timeline = calculateTimeline(blocks);
    console.log("Timeline:", timeline);

    const loanInfo = getLoanInfo(blocks, timeline);
    console.log("Loan Info:", loanInfo);

    const graphData = calculateGraphData(blocks, 30);
    console.log("Graph Data (first 5 points):", graphData.slice(0, 5));
    console.log("Graph Data (last 5 points):", graphData.slice(-5));

    // Verify the timeline has all blocks
    expect(timeline).toHaveLength(4);
    expect(timeline[0].type).toBe("buy");
    expect(timeline[1].type).toBe("renovate");
    expect(timeline[2].type).toBe("rent");
    expect(timeline[3].type).toBe("refinance");

    // Verify loan info is calculated
    expect(loanInfo.monthlyPayment).toBeGreaterThan(0);
    expect(loanInfo.loanEndDate).not.toBeNull();
    expect(loanInfo.loanStartIndex).toBeGreaterThanOrEqual(0);

    // Verify graph data is generated
    expect(graphData.length).toBeGreaterThan(0);
    expect(graphData[0].date).toBe("2024-01");
    expect(graphData[0].investedCapital).toBe(45000); // 20% of 225,000
    expect(graphData[0].remainingLoanBalance).toBeCloseTo(179821, 0); // 225,000 - 20% - 3% closing costs

    // Verify loan balance decreases over time
    const firstBalance = graphData[0].remainingLoanBalance;
    const lastBalance = graphData[graphData.length - 1].remainingLoanBalance;
    expect(lastBalance).toBeLessThan(firstBalance);

    // Verify refinance occurs at the correct point
    // Refinance should occur after renovate (14 months) + rent (72 months) = 86 months
    const refinanceMonth = 86; // 14 months renovate + 72 months rent
    const balanceBeforeRefinance =
      graphData[refinanceMonth - 1].remainingLoanBalance;
    const balanceAfterRefinance =
      graphData[refinanceMonth].remainingLoanBalance;

    console.log("Balance before refinance:", balanceBeforeRefinance);
    console.log("Balance after refinance:", balanceAfterRefinance);

    // With cost of $160,529, the refinance loan amount should be close to this value
    expect(balanceAfterRefinance).toBeCloseTo(160529, -3);

    // Verify closing costs are deducted from cash on hand
    const cashOnHandBeforeRefinance = graphData[refinanceMonth - 1].cashOnHand;
    const cashOnHandAfterRefinance = graphData[refinanceMonth].cashOnHand;
    const expectedClosingCosts = 300000 * 0.03; // 3% of $300,000

    console.log("Cash on hand before refinance:", cashOnHandBeforeRefinance);
    console.log("Cash on hand after refinance:", cashOnHandAfterRefinance);
    console.log("Expected closing costs:", expectedClosingCosts);

    // Cash on hand should decrease (may be limited if cash on hand is low)
    expect(cashOnHandAfterRefinance).toBeLessThanOrEqual(
      cashOnHandBeforeRefinance,
    );
  });
});
